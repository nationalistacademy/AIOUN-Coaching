/*
 * AIOU Coaching Firebase client module (non-LMS PWA).
 * Requires firebase/config.js to be copied from config.example.js and filled
 * with the real Firebase Web App settings. Never authorize admin actions here.
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
      import(SDK + "/firebase-app.js"),
      import(SDK + "/firebase-auth.js"),
      import(SDK + "/firebase-firestore.js"),
      import(SDK + "/firebase-storage.js"),
      import(SDK + "/firebase-messaging.js"),
      import(SDK + "/firebase-functions.js")
    ]).then(([appApi, authApi, firestore, storage, messaging, functionsApi]) => {
      const app = appApi.getApps().length ? appApi.getApp() : appApi.initializeApp(config);
      return { app, authApi, auth: authApi.getAuth(app), firestore, storage, messaging, functionsApi };
    });
  }
  return sdkPromise;
}

export async function getCurrentUser() {
  const s = await sdk();
  return new Promise((resolve, reject) => {
    let stop = () => {};
    stop = s.authApi.onAuthStateChanged(s.auth, (user) => { stop(); resolve(user); }, (error) => { stop(); reject(error); });
  });
}

export async function signUp(email, password, displayName) {
  const s = await sdk();
  const credential = await s.authApi.createUserWithEmailAndPassword(s.auth, email.trim(), password);
  const name = displayName?.trim() || "";
  if (name) await s.authApi.updateProfile(credential.user, { displayName: name });
  const db = s.firestore.getFirestore(s.app);
  await s.firestore.setDoc(s.firestore.doc(db, "users", credential.user.uid), {
    displayName: name, email: credential.user.email || email.trim(),
    createdAt: s.firestore.serverTimestamp(), updatedAt: s.firestore.serverTimestamp()
  }, { merge: false });
  return credential.user;
}
export async function signIn(email, password) {
  const s = await sdk();
  return (await s.authApi.signInWithEmailAndPassword(s.auth, email.trim(), password)).user;
}
export async function signOut() {
  const s = await sdk();
  return s.authApi.signOut(s.auth);
}
export async function sendPasswordReset(email) {
  const s = await sdk();
  return s.authApi.sendPasswordResetEmail(s.auth, email.trim());
}
export async function readOwnProfile() {
  const s = await sdk(), user = s.auth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  const snap = await s.firestore.getDoc(s.firestore.doc(s.firestore.getFirestore(s.app), "users", user.uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function listOwnNotifications(limitCount = 20) {
  const s = await sdk(), user = s.auth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  const db = s.firestore.getFirestore(s.app);
  const q = s.firestore.query(s.firestore.collection(db, "users", user.uid, "notifications"),
    s.firestore.orderBy("createdAt", "desc"), s.firestore.limit(Math.max(1, Math.min(Number(limitCount) || 20, 50))));
  const result = await s.firestore.getDocs(q);
  return result.docs.map((item) => ({ id: item.id, ...item.data() }));
}
export async function uploadOwnFile(file, onProgress = () => {}) {
  const s = await sdk(), user = s.auth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");
  if (file.size >= 10 * 1024 * 1024) throw new Error("Maximum file size is 10 MB.");
  const allowed = /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))|image\/(png|jpeg|webp)|text\/plain)$/i;
  if (!allowed.test(file.type)) throw new Error("File type not allowed. Use PDF, Office document, PNG/JPEG/WebP, or plain text.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "upload";
  const path = "users/" + user.uid + "/uploads/" + crypto.randomUUID() + "-" + safeName;
  const storageRef = s.storage.ref(s.storage.getStorage(s.app), path);
  const task = s.storage.uploadBytesResumable(storageRef, file, { contentType: file.type });
  return new Promise((resolve, reject) => {
    task.on("state_changed",
      (snapshot) => onProgress(snapshot.bytesTransferred / Math.max(snapshot.totalBytes, 1)),
      reject,
      () => resolve({ path, name: file.name, size: file.size, contentType: file.type, ref: task.snapshot.ref })
    );
  });
}
export async function getOwnFileDownloadUrl(storageRef) {
  const s = await sdk();
  return s.storage.getDownloadURL(storageRef);
}
export async function enablePushNotifications() {
  const s = await sdk(), user = s.auth.currentUser;
  if (!user) throw new Error("Please sign in before enabling notifications.");
  if (!("serviceWorker" in navigator) || !("Notification" in window)) throw new Error("This browser does not support web push notifications.");
  if (!config.vapidKey) throw new Error("Add the Firebase Cloud Messaging Web Push certificate key as vapidKey in firebase/config.js.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const registration = await navigator.serviceWorker.register("./messaging-sw.js", { scope: "./" });
  const messaging = s.messaging.getMessaging(s.app);
  const token = await s.messaging.getToken(messaging, { vapidKey: config.vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Firebase did not return a push token.");
  const db = s.firestore.getFirestore(s.app);
  const tokenId = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((bytes) =>
    Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join(""));
  await s.firestore.setDoc(s.firestore.doc(db, "users", user.uid, "pushTokens", tokenId), {
    token, platform: "web", updatedAt: s.firestore.serverTimestamp()
  }, { merge: true });
  return true;
}
export async function onForegroundMessage(callback) {
  const s = await sdk();
  return s.messaging.onMessage(s.messaging.getMessaging(s.app), callback);
}
export async function firebaseStatus() {
  if (missing.length) return { configured: false, missing };
  try { const s = await sdk(); return { configured: true, authenticated: !!s.auth.currentUser }; }
  catch (error) { return { configured: false, error: error.message }; }
}

export async function isTrustedAdmin() {
  const s = await sdk(), user = s.auth.currentUser;
  if (!user) return false;
  const result = await s.authApi.getIdTokenResult(user, true);
  return result.claims.admin === true;
}
export async function sendUserNotification(targetUid, title, body, url = "../") {
  const s = await sdk();
  const callable = s.functionsApi.httpsCallable(s.functionsApi.getFunctions(s.app), "sendUserNotification");
  return (await callable({ targetUid, title, body, url })).data;
}
