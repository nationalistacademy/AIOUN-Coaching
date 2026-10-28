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


// ---- Secure LMS callable API (Firebase replacement for browser-side Supabase RPCs) ----
function requireLmsStaff(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  if (request.auth.token.admin !== true && request.auth.token.teacher !== true) {
    throw new HttpsError("permission-denied", "Trusted teacher/admin access is required.");
  }
}
function lmsText(value, field, max = 160, required = true) {
  if (value == null && !required) return "";
  if (typeof value !== "string" || (required && !value.trim()) || value.length > max) {
    throw new HttpsError("invalid-argument", field + " is invalid (maximum " + max + " characters).");
  }
  return value.trim();
}
function lmsEnrollmentRef(uid, courseId) {
  return db.collection("enrollments").doc(uid + "_" + courseId);
}
async function requireLmsEnrollment(uid, courseId) {
  const snap = await lmsEnrollmentRef(uid, courseId).get();
  if (!snap.exists || snap.get("status") !== "active" || snap.get("uid") !== uid || snap.get("courseId") !== courseId) {
    throw new HttpsError("permission-denied", "An active enrollment is required for this course.");
  }
}
function boundedLmsQuestions(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100) {
    throw new HttpsError("invalid-argument", "A quiz must contain between 1 and 100 questions.");
  }
  return input.map((q, i) => {
    const question = lmsText(q?.question, "Question " + (i + 1), 2000);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8) {
      throw new HttpsError("invalid-argument", "Each question must contain 2 to 8 options.");
    }
    const options = q.options.map((o) => lmsText(o, "Option", 500));
    if (new Set(options).size !== options.length) {
      throw new HttpsError("invalid-argument", "Duplicate options are not allowed.");
    }
    const correctIndex = q.correctIndex;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      throw new HttpsError("invalid-argument", "Each question needs a valid correctIndex.");
    }
    const points = q.points == null ? 1 : q.points;
    if (!Number.isInteger(points) || points < 1 || points > 100) {
      throw new HttpsError("invalid-argument", "Question points must be an integer from 1 to 100.");
    }
    return { question, options, correctIndex, points };
  });
}

exports.createLmsCourse = onCall(async (request) => {
  requireLmsStaff(request);
  const title = lmsText(request.data?.title, "title", 160);
  const description = lmsText(request.data?.description || "", "description", 4000, false);
  const published = request.data?.published === true;
  const ref = db.collection("courses").doc();
  await ref.set({ title, description, published, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.auth.uid });
  return { courseId: ref.id };
});

exports.createLmsLesson = onCall(async (request) => {
  requireLmsStaff(request);
  const courseId = lmsText(request.data?.courseId, "courseId", 128);
  const course = await db.collection("courses").doc(courseId).get();
  if (!course.exists) throw new HttpsError("not-found", "Course not found.");
  const title = lmsText(request.data?.title, "title", 160);
  const content = lmsText(request.data?.content || "", "content", 20000, false);
  const videoUrl = lmsText(request.data?.videoUrl || "", "videoUrl", 1000, false);
  if (videoUrl && (!/^https:\/\//i.test(videoUrl) || !URL.canParse(videoUrl))) {
    throw new HttpsError("invalid-argument", "Video URL must use HTTPS.");
  }
  const ref = db.collection("lessons").doc();
  await ref.set({ courseId, title, content, videoUrl, published: request.data?.published === true, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.auth.uid });
  return { lessonId: ref.id };
});

exports.createLmsQuiz = onCall(async (request) => {
  requireLmsStaff(request);
  const courseId = lmsText(request.data?.courseId, "courseId", 128);
  const course = await db.collection("courses").doc(courseId).get();
  if (!course.exists) throw new HttpsError("not-found", "Course not found.");
  const title = lmsText(request.data?.title, "title", 160);
  const description = lmsText(request.data?.description || "", "description", 2000, false);
  const normalized = boundedLmsQuestions(request.data?.questions);
  const publicQuestions = normalized.map(({ question, options, points }) => ({ question, options, points }));
  const answerKey = normalized.map(({ correctIndex, points }) => ({ correctIndex, points }));
  const ref = db.collection("quizzes").doc();
  const batch = db.batch();
  batch.set(ref, { courseId, title, description, questions: publicQuestions, published: request.data?.published === true, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.auth.uid });
  batch.set(db.collection("quizAnswerKeys").doc(ref.id), { courseId, answers: answerKey, updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedBy: request.auth.uid });
  await batch.commit();
  return { quizId: ref.id, questionCount: publicQuestions.length };
});

exports.markLessonComplete = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  const lessonId = lmsText(request.data?.lessonId, "lessonId", 128);
  const lessonSnap = await db.collection("lessons").doc(lessonId).get();
  if (!lessonSnap.exists || lessonSnap.get("published") !== true) throw new HttpsError("not-found", "Published lesson not found.");
  const lesson = lessonSnap.data();
  await requireLmsEnrollment(request.auth.uid, lesson.courseId);
  const progressId = request.auth.uid + "_" + lessonId;
  await db.collection("progress").doc(progressId).set({
    uid: request.auth.uid, courseId: lesson.courseId, lessonId, completed: true,
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { lessonId, completed: true };
});

exports.submitQuizAttempt = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  const uid = request.auth.uid;
  const quizId = lmsText(request.data?.quizId, "quizId", 128);
  const answers = request.data?.answers;
  if (!Array.isArray(answers) || answers.length > 100) throw new HttpsError("invalid-argument", "Answers must be an array with at most 100 entries.");
  const quizRef = db.collection("quizzes").doc(quizId);
  const quizSnap = await quizRef.get();
  if (!quizSnap.exists || quizSnap.get("published") !== true) throw new HttpsError("not-found", "Published quiz not found.");
  const quiz = quizSnap.data();
  await requireLmsEnrollment(uid, quiz.courseId);
  const keySnap = await db.collection("quizAnswerKeys").doc(quizId).get();
  if (!keySnap.exists || !Array.isArray(keySnap.get("answers"))) throw new HttpsError("failed-precondition", "Quiz grading key is not configured.");
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const keys = keySnap.get("answers");
  if (!questions.length || questions.length !== keys.length || answers.length !== questions.length) {
    throw new HttpsError("invalid-argument", "Answer count does not match the quiz.");
  }
  const seen = new Set();
  let score = 0, maxScore = 0, correctCount = 0, unansweredCount = 0;
  const savedAnswers = answers.map((answer) => {
    const i = answer?.questionIndex;
    if (!Number.isInteger(i) || i < 0 || i >= questions.length || seen.has(i)) {
      throw new HttpsError("invalid-argument", "Question indexes must be unique and in range.");
    }
    seen.add(i);
    const selectedIndex = answer.selectedIndex;
    if (selectedIndex !== null && (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= questions[i].options.length)) {
      throw new HttpsError("invalid-argument", "Selected option is invalid.");
    }
    const points = keys[i].points;
    maxScore += points;
    if (selectedIndex === null) unansweredCount += 1;
    const isCorrect = selectedIndex !== null && selectedIndex === keys[i].correctIndex;
    if (isCorrect) { score += points; correctCount += 1; }
    return { questionIndex: i, selectedIndex, isCorrect, awardedPoints: isCorrect ? points : 0 };
  });
  if (seen.size !== questions.length) throw new HttpsError("invalid-argument", "Every question must be present; unanswered questions should use selectedIndex null.");
  const attemptRef = db.collection("quizAttempts").doc();
  await attemptRef.set({
    uid, quizId, courseId: quiz.courseId, answers: savedAnswers, score, maxScore,
    percentage: maxScore ? Math.round((score / maxScore) * 10000) / 100 : 0,
    correctCount, unansweredCount, submittedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { attemptId: attemptRef.id, score, maxScore, percentage: maxScore ? Math.round((score / maxScore) * 10000) / 100 : 0, correctCount, unansweredCount };
});

exports.setLmsEnrollment = onCall(async (request) => {
  requireLmsStaff(request);
  const uid = lmsText(request.data?.uid, "uid", 128);
  const courseId = lmsText(request.data?.courseId, "courseId", 128);
  const status = request.data?.status;
  if (status !== "active" && status !== "revoked") {
    throw new HttpsError("invalid-argument", "status must be either active or revoked.");
  }
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found", "Student profile not found; the student must sign up first.");
  const courseSnap = await db.collection("courses").doc(courseId).get();
  if (!courseSnap.exists) throw new HttpsError("not-found", "Course not found.");
  await lmsEnrollmentRef(uid, courseId).set({
    uid, courseId, status, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid
  }, { merge: true });
  return { uid, courseId, status };
});
