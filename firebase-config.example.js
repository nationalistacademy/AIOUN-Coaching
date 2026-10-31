/*
 * AIOU Coaching Firebase Web App configuration template.
 * Copy these values from Firebase Console > Project settings > Your apps > Web app.
 * Do not place service-account JSON, Admin SDK private keys, or Cloudflare API tokens here.
 *
 * This file intentionally contains empty placeholders and does not connect to Firebase
 * until all required values are filled and the Firebase SDK is loaded.
 */
(function () {
  'use strict';
  window.AIOU_FIREBASE_CONFIG = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
    messagingSenderId: '',
    storageBucket: ''
  };
  // Initializes only the Firebase app if the compat SDK has already been loaded.
  // This does NOT enable Auth, Firestore, Storage, FCM, or database permissions.
  var cfg = window.AIOU_FIREBASE_CONFIG;
  if (!window.firebase || !cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) return;
  try {
    if (!window.firebase.apps.length) window.firebase.initializeApp(cfg);
  } catch (error) {
    console.error('AIOU Coaching Firebase initialization failed. Check web app config.', error);
  }
})();
