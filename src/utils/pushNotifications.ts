export const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

// VAPID Public Key precisa vir das variáveis de ambiente na produção
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFHIlA-oCqcEeQz1vmCXCWVWvdg5CSmCjc8s_FQG1XpzvO3ihzfIIqtW9TM2YXXKfSmZwCrWxELUMNRjj5X5EgU';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const registerPushNotifications = async (userId: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.error('Push notifications não são suportadas neste navegador.');
        return false;
    }

    try {
        // 1. Pedir permissão ao usuário (Browser nativo)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Permissão para notificações foi negada.');
            toast.error('Permissão para notificações negada.');
            return false;
        }

        // 2. Registrar/Obter Service Worker
        const registration = await navigator.serviceWorker.ready;

        // 3. Inscrever o dispositivo no serviço de Push do navegador
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 4. Extrair as chaves do objeto de inscrição
        const subscriptionJson = subscription.toJSON();
        const endpoint = subscriptionJson.endpoint;
        const p256dh = subscriptionJson.keys?.p256dh;
        const auth = subscriptionJson.keys?.auth;

        if (!endpoint || !p256dh || !auth) {
            throw new Error('Falha ao extrair chaves de suporte ao Push (VAPID).');
        }

        // 5. Salvar/Atualizar a inscrição no Supabase `push_subscriptions`
        const { error } = await (supabase.from('push_subscriptions' as any) as any).upsert(
            {
                user_id: userId,
                endpoint: endpoint,
                p256dh: p256dh,
                auth: auth
            },
            { onConflict: 'endpoint' } // Evita duplicatas do mesmo navegador
        );

        if (error) {
            console.error('Erro ao salvar inscrição no Supabase:', error);
            toast.error('Erro ao ativar notificações no servidor.');
            return false;
        }

        toast.success('Notificações ativadas neste dispositivo com sucesso!');
        return true;

    } catch (error: any) {
        console.error('Erro na configuração de Push:', error);

        // Se o erro for de chave inválida e já existir uma inscrição, tentar limpar
        if (error.name === 'InvalidAccessError') {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    console.log('Inscrição antiga removida. Tente ativar as notificações novamente.');
                    toast.error('A chave de notificação mudou. Por favor, clique em ativar novamente.');
                    return false;
                }
            } catch (e) {
                console.error('Erro ao tentar limpar a inscrição antiga', e);
            }
        }

        toast.error('Ocorreu um erro ao configurar as notificações.');
        return false;
    }
};

export const unregisterPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Remover do Supabase primeiro
            const { error } = await (supabase.from('push_subscriptions' as any) as any)
                .delete()
                .eq('endpoint', subscription.endpoint);

            if (error) console.error('Aviso: Erro ao remover inscrição do servidor', error);

            // Desinscrever localmente
            await subscription.unsubscribe();
            toast.info('Notificações desativadas para este dispositivo.');
        }
        return true;
    } catch (error) {
        console.error('Erro ao desativar Push:', error);
        return false;
    }
};
