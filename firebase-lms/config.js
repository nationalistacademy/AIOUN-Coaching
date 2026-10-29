/* Firebase web configuration for the AIOU Coaching project.
 * The deploy workflow injects the public Web API key from the Actions variable
 * AIOU_FIREBASE_API_KEY. Enforce access with Firebase Security Rules.
 * Never place service-account credentials or private keys in this file.
 */
window.AIOU_FIREBASE_CONFIG = Object.freeze({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "aioucoaching.firebaseapp.com",
  databaseURL: "https://aioucoaching-default-rtdb.firebaseio.com",
  projectId: "aioucoaching",
  storageBucket: "aioucoaching.firebasestorage.app",
  messagingSenderId: "974474959349",
  appId: "1:974474959349:web:b61f429c04b9cb332e28bc",
  measurementId: "G-D8KQJEMM5E"
});
