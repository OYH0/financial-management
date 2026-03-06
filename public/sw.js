self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const title = data.title || 'Nova Notificação';
            const options = {
                body: data.body || 'Você tem uma nova mensagem.',
                icon: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png',
                badge: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png', // idealmente seria um ícone monocromático
                data: data.data || { url: '/' },
                vibrate: [100, 50, 100],
            };

            event.waitUntil(self.registration.showNotification(title, options));
        } catch (e) {
            console.error('Erro ao fazer parse do Push Data:', e);
            // Fallback pra texto simples
            event.waitUntil(
                self.registration.showNotification('Notificação do Gestão Financeira', {
                    body: event.data.text(),
                    icon: '/lovable-uploads/1e18cbb9-8a0a-4dea-a89a-0903ccf1e7c8.png',
                })
            );
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se a aba do app já estiver aberta, foca nela e navega
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    return client.navigate(urlToOpen);
                }
            }
            // Se nenhuma aba estiver aberta, abre uma nova
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
