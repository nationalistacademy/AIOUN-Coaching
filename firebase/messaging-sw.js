/* Firebase Cloud Messaging background worker for the non-LMS PWA.
 * Its /firebase/ scope does not replace the root offline service worker.
 */
importScripts("https://www.gstatic.com/firebasejs/12.5.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging-compat.js");
importScripts("./config.js");

const cfg = self.AIOU_FIREBASE_CONFIG || {};
if (cfg.apiKey && cfg.projectId && cfg.appId && cfg.messagingSenderId) {
  firebase.initializeApp(cfg);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "AIOU Coaching";
    const options = {
      body: payload.notification?.body || "You have a new update.",
      icon: "../icon.svg",
      badge: "../icon.svg",
      data: { url: payload.data?.url || payload.fcmOptions?.link || "../" }
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.url || "../";
  const target = new URL(raw, self.location.href);
  if (target.origin !== self.location.origin) return;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        client.navigate(target.href);
        return client.focus();
      }
    }
    return self.clients.openWindow(target.href);
  }));
});
