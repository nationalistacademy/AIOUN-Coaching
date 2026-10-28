/* Public Firebase Web App configuration for AIOU Coaching's non-LMS PWA.
 * Firebase client config is browser-visible by design. Never add Admin SDK keys here.
 * FCM push remains disabled until the project's Web Push certificate VAPID key is supplied.
 */
self.AIOU_FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyAB9dY0-6C5z2SJt_HPIcoknUjphNiYmM4",
  authDomain: "aioucoaching.firebaseapp.com",
  databaseURL: "https://aioucoaching-default-rtdb.firebaseio.com",
  projectId: "aioucoaching",
  storageBucket: "aioucoaching.firebasestorage.app",
  messagingSenderId: "974474959349",
  appId: "1:974474959349:web:b61f429c04b9cb332e28bc",
  measurementId: "G-D8KQJEMM5E",
  vapidKey: ""
});
