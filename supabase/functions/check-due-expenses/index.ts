// Supabase Edge Function: check-due-expenses
// Sends Web Push Notifications for expenses due in the next 3 days
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
    'mailto:admin@gestao.financeira',
    vapidPublicKey,
    vapidPrivateKey
);

Deno.serve(async (_req) => {
    try {
        let payload: any = {};

        // Only try to parse JSON if it's a POST request with a body
        if (_req.method === 'POST') {
            try {
                payload = await _req.json();
                console.log("Recebido payload:", payload);
            } catch (e) {
                console.log("Nenhum payload válido detectado, executando como Cron Job");
            }
        } else {
            console.log("Requisição GET ou sem corpo, executando como Cron Job");
        }

        // 1. Encontrar despesas (se vier 1 via Trigger, pega só ela. Se for Cron, pega todas)
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        let query = supabase
            .from('despesas')
            .select('id, user_id, descricao, valor, data_vencimento')
            .or('status.eq.PENDENTE,status.is.null');

        if (payload.expense_id) {
            // Convert to string to prevent Supabase type inference from treating it as bigint
            query = query.eq('id', String(payload.expense_id));
        } else {
            query = query
                .gte('data_vencimento', today.toISOString().split('T')[0])
                .lte('data_vencimento', threeDaysFromNow.toISOString().split('T')[0]);
        }

        const { data: dueExpenses, error: expensesError } = await query;

        if (expensesError) throw expensesError;

        if (!dueExpenses || dueExpenses.length === 0) {
            return new Response(JSON.stringify({ message: 'Nenhuma despesa para notificar.' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Agrupar despesas por usuário
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
                title: payload.expense_id ? '⚠️ Despesa vencendo!' : '⚠️ Despesas prestes a vencer!',
                body: payload.expense_id
                    ? `A despesa "${expenses[0]?.descricao || ''}" no valor de R$ ${expenses[0]?.valor} está vencendo.`
                    : `Você tem ${expenses.length} despesa(s) vencendo nos próximos 3 dias.`,
                data: { url: '/despesas' }
            });

            for (const sub of subscriptions) {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    await webpush.sendNotification(pushSubscription, payloadData);
                    results.push({ endpoint: sub.endpoint.slice(0, 40) + '...', ok: true });
                } catch (err: any) {
                    results.push({ endpoint: sub.endpoint.slice(0, 40) + '...', error: err.message });
                    // Remove stale subscriptions (status 404 or 410)
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                    }
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
