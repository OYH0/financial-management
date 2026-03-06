/// <reference lib="WebWorker" />
import { precacheAndRoute } from 'workbox-precaching';

// Required line for injectManifest to inject the cache manifest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST || []);

// Handle incoming Push events from the Supabase backend
self.addEventListener('push', (event) => {
    const e = event as PushEvent;
    if (e.data) {
        try {
            const data = e.data.json();
            const title = data.title || 'Gestão Financeira';
            const options = {
                body: data.body || 'Você tem uma notificação.',
                icon: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png',
                badge: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png',
                data: data.data || { url: '/' },
                requireInteraction: true,
            };
            e.waitUntil(self.registration.showNotification(title, options));
        } catch {
            e.waitUntil(
                self.registration.showNotification('Gestão Financeira', {
                    body: e.data!.text(),
                    icon: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png',
                })
            );
        }
    }
});

// When user clicks the notification, open the app
self.addEventListener('notificationclick', (event) => {
    const e = event as NotificationEvent;
    e.notification.close();
    const urlToOpen = e.notification.data?.url || '/';

    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if ('focus' in client) {
                    (client as WindowClient).focus();
                    return (client as WindowClient).navigate(urlToOpen);
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
