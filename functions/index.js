const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

function requireAdmin(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  if (request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Only a trusted administrator can send notifications.");
  }
}

function boundedString(value, max, field) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new HttpsError("invalid-argument", field + " is required and must be at most " + max + " characters.");
  }
  return value.trim();
}

function safeRelativeUrl(value) {
  if (value == null || value === "") return "../";
  if (typeof value !== "string" || value.length > 300 || /^(?:[a-z]+:|\/\/)/i.test(value)) {
    throw new HttpsError("invalid-argument", "url must be a relative in-app path.");
  }
  return value;
}

/**
 * Trusted sender for the non-LMS study-tools app.
 * Caller must have the admin custom claim set by a trusted Admin SDK process.
 * Never grant that claim from client code or a profile document.
 */
exports.sendUserNotification = onCall(async (request) => {
  requireAdmin(request);
  const targetUid = boundedString(request.data?.targetUid, 128, "targetUid");
  const title = boundedString(request.data?.title, 120, "title");
  const body = boundedString(request.data?.body, 500, "body");
  const url = safeRelativeUrl(request.data?.url);
  const userRef = db.collection("users").doc(targetUid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError("not-found", "Target user was not found.");

  const notificationRef = userRef.collection("notifications").doc();
  await notificationRef.set({
    title, body, url, isRead: false, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: request.auth.uid
  });

  const tokenSnap = await userRef.collection("pushTokens").get();
  const tokenDocs = tokenSnap.docs.filter((doc) => typeof doc.get("token") === "string" && doc.get("token").length > 0);
  let sent = 0, failed = 0, removed = 0;
  for (let offset = 0; offset < tokenDocs.length; offset += 500) {
    const batch = tokenDocs.slice(offset, offset + 500);
    if (!batch.length) continue;
    const response = await messaging.sendEachForMulticast({
      tokens: batch.map((doc) => doc.get("token")),
      notification: { title, body },
      data: { url },
      webpush: { notification: { title, body }, fcmOptions: {} }
    });
    sent += response.successCount;
    failed += response.failureCount;
    const deletions = [];
    response.responses.forEach((result, index) => {
      const code = result.error?.code || "";
      if (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token")) {
        deletions.push(batch[index].ref.delete());
        removed += 1;
      }
    });
    if (deletions.length) await Promise.all(deletions);
  }
  logger.info("AIOU Coaching notification processed", { targetUid, sent, failed, removed });
  return { notificationId: notificationRef.id, pushTokensFound: tokenDocs.length, sent, failed, removed };
});
