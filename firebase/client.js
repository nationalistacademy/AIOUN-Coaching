/*
 * AIOU Coaching Firebase client module (non-LMS only).
 * Loads Firebase's modular Web SDK from Google's CDN. Requires firebase/config.js
 * to be copied from config.example.js and filled with the real project settings.
 * Never use this module to authorize staff/admin actions; enforce those on the server
 * with custom claims and Security Rules.
 */
const SDK = "https://www.gstatic.com/firebasejs/12.5.0";
const config = window.AIOU_FIREBASE_CONFIG || {};
const required = ["apiKey", "authDomain", "projectId", "appId"];
const missing = required.filter((key) => !config[key]);

let sdkPromise;
async function sdk() {
  if (missing.length) {
    throw new Error("Firebase is not configured. Copy firebase/config.example.js to firebase/config.js and enter the real Web App config.");
  }
  if (!sdkPromise) {
    sdkPromise = Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-firestore.js`),
      import(`${SDK}/firebase-storage.js`),
      import(`${SDK}/firebase-messaging.js`)
    ]).then(([app, auth, firestore, storage, messaging]) => {
      const instance = app.getApps().length ? app.getApp() : app.initializeApp(config);
      return {
        app: instance,
        auth: auth.getAuth(instance),
        firestore: { ...firestore },
        storage: { ...storage },
        messaging: { ...messaging }
      };
    });
  }
  return sdkPromise;
}

export async function getCurrentUser() {
  const s = await sdk();
  return s.auth.onAuthStateChanged ? new Promise((resolve, reject) => {
    const stop = s.auth.onAuthStateChanged((user) => { stop(); resolve(user); }, reject);
  }) : null;
}

export async function signUp(email, password, displayName) {
  const s = await sdk();
  const credential = await s.auth.createUserWithEmailAndPassword(s.auth, email.trim(), password);
  if (displayName?.trim()) {
    await s.auth.updateProfile(credential.user, { displayName: displayName.trim() });
  }
  await s.firestore.setDoc(s.firestore.doc(s.firestore.getFirestore(s.app), "users", credential.user.uid), {
    displayName: displayName?.trim() || "",
    email: credential.user.email || email.trim(),
    createdAt: s.firestore.serverTimestamp(),
    updatedAt: s.firestore.serverTimestamp()
  }, { merge: false });
  return credential.user;
}

export async function signIn(email, password) {
  const s = await sdk();
  return (await s.auth.signInWithEmailAndPassword(s.auth, email.trim(), password)).user;
}

export async function signOut() {
  const s = await sdk();
  return s.auth.signOut(s.auth);
}

export async function sendPasswordReset(email) {
  const s = await sdk();
  return s.auth.sendPasswordResetEmail(s.auth, email.trim());
}

export async function readOwnProfile() {
  const s = await sdk();
  const user = s.auth.getAuth(s.app).currentUser;
  if (!user) throw new Error("Please sign in first.");
  const ref = s.firestore.doc(s.firestore.getFirestore(s.app), "users", user.uid);
  const snap = await s.firestore.getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listOwnNotifications(limitCount = 20) {
  const s = await sdk();
  const user = s.auth.getAuth(s.app).currentUser;
  if (!user) throw new Error("Please sign in first.");
  const db = s.firestore.getFirestore(s.app);
  const q = s.firestore.query(
    s.firestore.collection(db, "users", user.uid, "notifications"),
    s.firestore.orderBy("createdAt", "desc"),
    s.firestore.limit(Math.max(1, Math.min(Number(limitCount) || 20, 50)))
  );
  const result = await s.firestore.getDocs(q);
  return result.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function uploadOwnFile(file, onProgress = () => {}) {
  const s = await sdk();
  const user = s.auth.getAuth(s.app).currentUser;
  if (!user) throw new Error("Please sign in first.");
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Maximum file size is 10 MB.");
  const allowed = /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))|image\/(png|jpeg|webp)|text\/plain)$/i;
  if (!allowed.test(file.type)) throw new Error("File type not allowed. Use PDF, Office document, PNG/JPEG/WebP, or plain text.");
  const path = `users/${user.uid}/uploads/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100)}`;
  const ref = s.storage.ref(s.storage.getStorage(s.app), path);
  const task = s.storage.uploadBytesResumable(ref, file, { contentType: file.type });
  return new Promise((resolve, reject) => {
    task.on("state_changed",
      (snapshot) => onProgress(snapshot.bytesTransferred / Math.max(snapshot.totalBytes, 1)),
      reject,
      async () => {
        try {
          const url = await s.storage.getDownloadURL(task.snapshot.ref);
          resolve({ path, url, name: file.name, size: file.size, contentType: file.type });
        } catch (error) { reject(error); }
      }
    );
  });
}

export async function enablePushNotifications() {
  const s = await sdk();
  const user = s.auth.getAuth(s.app).currentUser;
  if (!user) throw new Error("Please sign in before enabling notifications.");
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    throw new Error("This browser does not support web push notifications.");
  }
  if (!config.vapidKey) throw new Error("Add the Firebase Cloud Messaging Web Push certificate key as vapidKey in firebase/config.js.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const registration = await navigator.serviceWorker.register("./firebase/messaging-sw.js", { scope: "./firebase/" });
  const messaging = s.messaging.getMessaging(s.app);
  const token = await s.messaging.getToken(messaging, { vapidKey: config.vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Firebase did not return a push token.");
  const db = s.firestore.getFirestore(s.app);
  const tokenId = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((bytes) =>
    Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("")
  );
  await s.firestore.setDoc(s.firestore.doc(db, "users", user.uid, "pushTokens", tokenId), {
    token, platform: "web", updatedAt: s.firestore.serverTimestamp()
  }, { merge: true });
  return true;
}

export async function onForegroundMessage(callback) {
  const s = await sdk();
  const messaging = s.messaging.getMessaging(s.app);
  return s.messaging.onMessage(messaging, callback);
}

export async function firebaseStatus() {
  if (missing.length) return { configured: false, missing };
  try {
    const s = await sdk();
    return { configured: true, authenticated: !!s.auth.getAuth(s.app).currentUser };
  } catch (error) {
    return { configured: false, error: error.message };
  }
}
