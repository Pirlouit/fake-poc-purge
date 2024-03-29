// This optional code is used to register a service worker.
// register() is not called by default.

import { logToDashboard } from './utils';

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.0/8 are considered localhost for IPv4.
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

type Config = {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
    logToDashboard('load');
    if (/*process.env.NODE_ENV === "production" && */ 'serviceWorker' in navigator) {
        // The URL constructor is available in all browsers that support SW.
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets; see https://github.com/facebook/create-react-app/issues/2374
            return;
        }

        window.addEventListener('load', () => {
            logToDashboard('load');
            const swUrl = `${process.env.PUBLIC_URL}/service-worker-custom.js`;

            if (isLocalhost) {
                logToDashboard('isLocalhost', isLocalhost);
                // This is running on localhost. Let's check if a service worker still exists or not.
                checkValidServiceWorker(swUrl, config);

                // Add some additional logging to localhost, pointing developers to the
                // service worker/PWA documentation.
                navigator.serviceWorker.ready.then(
                    () => {
                        logToDashboard(
                            'This web app is being served cache-first by a service ' +
                                'worker. To learn more, visit https://cra.link/PWA',
                        );
                    },
                    (error) => {
                        console.error(error);
                    },
                );
            } else {
                // Is not localhost. Just register service worker
                registerValidSW(swUrl, config);
            }
        });
    }
}

function registerValidSW(swUrl: string, config?: Config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // At this point, the updated precached content has been fetched,
                            // but the previous service worker will still serve the older
                            // content until all client tabs are closed.
                            logToDashboard(
                                'New content is available and will be used when all ' +
                                    'tabs for this page are closed. See https://cra.link/PWA.',
                            );

                            // Execute callback
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            logToDashboard('Content is cached for offline use.');

                            // Execute callback
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error('Error during service worker registration:', error);
        });

    registerPeriodicSync();
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
    logToDashboard('swUrl', swUrl);

    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            logToDashboard('Fetch Service worker', response);

            // Ensure service worker exists, and that we really are getting a JS file.
            // const contentType = response.headers.get("content-type");
            if (
                false /* response.status === 404 || (contentType != null && contentType.indexOf("javascript") === -1)*/
            ) {
                // No service worker found. Probably a different app. Reload the page.
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                logToDashboard('Service worker found');
                // Service worker found. Proceed as normal.
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            logToDashboard('No internet connection found. App is running in offline mode.');
        });
}

// type Periodic = {periodicSync: any};
// const isPeriodicSyncEnabled = <T>(registration: T): is Periodic => {
//   return 'periodicSync' in registration;
// }

async function registerPeriodicSync() {
    logToDashboard('registerPeriodicSync');
    const registration = await navigator.serviceWorker.ready;
    // Check if periodicSync is supported
    if ('periodicSync' in registration) {
        logToDashboard('periodicSync');

        // Request permission
        const status = await navigator.permissions.query({
            // @ts-ignore
            name: 'periodic-background-sync',
        });
        if (status.state === 'granted') {
            logToDashboard('periodicSync-granted');
            try {
                // Register new sync every 24 hours
                // @ts-ignore
                await registration.periodicSync.register('update-cached-content', {
                    minInterval: /*24 * 60 * */ 20 * 1000, // 1 day
                });
                logToDashboard('Periodic background sync registered!');
            } catch (e) {
                logToDashboard(`Periodic background sync failed:\nx${e}`);
            }
        } else {
            logToDashboard('Periodic background sync is not granted.');
            logToDashboard(status.state);
        }
    } else {
        logToDashboard('Periodic background sync is not supported.');
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                logToDashboard(error.message);
            });
    }
}
