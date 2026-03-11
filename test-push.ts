import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import fs from 'fs';

const env: Record<string, string> = {};

const supabaseUrl = 'https://jkrwxxnhutxpsxkddbym.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprcnd4eG5odXR4cHN4a2RkYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDYxMjIsImV4cCI6MjA2NDQ4MjEyMn0.OUwW3uDeSt4LspWOncdGcX_euW7kzSm7zFy9d7HAk3s";

const vapidPublicKey = 'BFHIlA-oCqcEeQz1vmCXCWVWvdg5CSmCjc8s_FQG1XpzvO3ihzfIIqtW9TM2YXXKfSmZwCrWxELUMNRjj5X5EgU';
const vapidPrivateKey = 'FnuaZrfkfuy5CIvzYwdhLCuZoCNNks-TBI97uWfuJAw';

const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
    'mailto:admin@gestao.financeira',
    vapidPublicKey,
    vapidPrivateKey
);

async function testPush() {
    console.log("-> Buscando inscrições...");
    const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*');

    if (subError) {
        console.error("Erro ao buscar subscriptions:", subError);
        return;
    }

    if (!subscriptions || subscriptions.length === 0) {
        console.log("Nenhum dispositivo registrado encontrado ('push_subscriptions' está vazio). O backend não tem para quem enviar.");
        return;
    }

    console.log(`-> Encontrados ${subscriptions.length} dispositivos registrados.`);

    const payloadData = JSON.stringify({
        title: '🔔 Notificação Via Backend!',
        body: `As notificações do Gestão Financeira agora estão criptografadas e chegam corretamente!`,
        data: { url: '/despesas' }
    });

    console.log("-> Enviando push notification para os dispositivos...");
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, payloadData);
            console.log(`✅ Sucesso ao enviar para: ${sub.endpoint.slice(0, 40)}...`);
        } catch (err: any) {
            console.log(`❌ Falha ao enviar para: ${sub.endpoint.slice(0, 40)}... | Erro:`, err.message);
        }
    }
}

testPush();
