// Supabase Edge Function: check-due-expenses
// Sends Web Push Notifications for expenses due in the next 3 days
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// VAPID signing using native WebCrypto API (Deno-compatible)
async function importVapidPrivateKey(base64Key: string) {
    const keyBytes = Uint8Array.from(atob(base64Key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        'pkcs8',
        keyBytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    );
}

async function buildVapidToken(audience: string): Promise<string> {
    const header = { typ: 'JWT', alg: 'ES256' };
    const payload = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: 'mailto:admin@gestao.financeira'
    };

    const encode = (obj: object) =>
        btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const unsignedToken = `${encode(header)}.${encode(payload)}`;
    const privateKey = await importVapidPrivateKey(vapidPrivateKey);
    const signatureBytes = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        privateKey,
        new TextEncoder().encode(unsignedToken)
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `${unsignedToken}.${signature}`;
}

async function sendPushNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: string
): Promise<boolean> {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const vapidToken = await buildVapidToken(audience);

    const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `vapid t=${vapidToken}, k=${vapidPublicKey}`,
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            'TTL': '86400',
        },
        body: new TextEncoder().encode(payload),
    });
    return response.ok || response.status === 201;
}

Deno.serve(async (_req) => {
    try {
        // 1. Find expenses due in the next 3 days
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const { data: dueExpenses, error: expensesError } = await supabase
            .from('despesas')
            .select('id, user_id, descricao, valor, data_vencimento')
            .eq('status', 'PENDENTE')
            .gte('data_vencimento', today.toISOString().split('T')[0])
            .lte('data_vencimento', threeDaysFromNow.toISOString().split('T')[0]);

        if (expensesError) throw expensesError;

        if (!dueExpenses || dueExpenses.length === 0) {
            return new Response(JSON.stringify({ message: 'Nenhuma despesa próxima ao vencimento.' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Group expenses by user
        const userExpenses = dueExpenses.reduce((acc, expense) => {
            if (!acc[expense.user_id]) acc[expense.user_id] = [];
            acc[expense.user_id].push(expense);
            return acc;
        }, {} as Record<string, typeof dueExpenses>);

        const results = [];

        // 3. Send push to each registered device
        for (const [userId, expenses] of Object.entries(userExpenses)) {
            const { data: subscriptions } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            const payloadData = JSON.stringify({
                title: '⚠️ Despesa prestes a vencer!',
                body: `Você tem ${expenses.length} despesa(s) vencendo nos próximos 3 dias.`,
                data: { url: '/despesas' }
            });

            for (const sub of subscriptions) {
                try {
                    const ok = await sendPushNotification(sub, payloadData);
                    results.push({ endpoint: sub.endpoint.slice(0, 40) + '...', ok });
                    if (!ok) {
                        // Remove stale subscriptions (status 404 or 410)
                        await (supabase.from('push_subscriptions') as any).delete().eq('endpoint', sub.endpoint);
                    }
                } catch (err: any) {
                    results.push({ endpoint: sub.endpoint.slice(0, 40) + '...', error: err.message });
                }
            }
        }

        return new Response(JSON.stringify({ sent: results.length, results }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
