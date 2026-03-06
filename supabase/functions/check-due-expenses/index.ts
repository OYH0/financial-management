// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const vapidSubject = 'mailto:admin@seudominio.com';

webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
);

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
    try {
        // 1. Check for expenses due in the next 3 days
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
            return new Response(JSON.stringify({ message: "No due expenses found." }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Group expenses by user
        const userExpenses = dueExpenses.reduce((acc, expense) => {
            if (!acc[expense.user_id]) acc[expense.user_id] = [];
            acc[expense.user_id].push(expense);
            return acc;
        }, {} as Record<string, typeof dueExpenses>);

        const pushResults = [];

        // Send notifications to each user
        for (const [userId, expenses] of Object.entries(userExpenses)) {
            const { data: subscriptions, error: subsError } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (subsError) {
                console.error(`Error fetching subscriptions for user ${userId}:`, subsError);
                continue;
            }

            if (!subscriptions || subscriptions.length === 0) continue;

            const payload = JSON.stringify({
                title: "Lembrete de Vencimento",
                body: `Você tem ${expenses.length} despesa(s) próxima(s) ao vencimento nos próximos dias!`,
                data: {
                    url: "/despesas"
                }
            });

            for (const sub of subscriptions) {
                try {
                    // Format subscription for web-push library
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    await webpush.sendNotification(pushSubscription, payload);
                    pushResults.push({ endpoint: sub.endpoint, success: true });
                } catch (err: any) {
                    console.error(`Error sending push to ${sub.endpoint}:`, err);
                    // If subscription is invalid/expired, remove it
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                    }
                    pushResults.push({ endpoint: sub.endpoint, success: false, error: err.message });
                }
            }
        }

        return new Response(JSON.stringify({ message: "Notifications sent.", results: pushResults }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error checking due expenses:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
