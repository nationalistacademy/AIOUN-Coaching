/* Firebase Cloud Messaging background worker for the non-LMS PWA.
 * This is deliberately scoped to /firebase/ so it does not replace the app's
 * root service worker or alter its offline cache.
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
      data: { url: payload.fcmOptions?.link || payload.data?.url || "../" }
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "../", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
