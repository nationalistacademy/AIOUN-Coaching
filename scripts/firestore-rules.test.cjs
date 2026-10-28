const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc } = require('firebase/firestore');

const projectId = 'demo-aioucoaching';
const courseId = 'course-a';
const lessonId = 'lesson-a';
const quizId = 'quiz-a';
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
  });
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'courses', courseId), { title: 'Course A', published: true });
    await setDoc(doc(db, 'courses', 'draft-course'), { title: 'Draft', published: false });
    await setDoc(doc(db, 'lessons', lessonId), { courseId, title: 'Lesson A', published: true });
    await setDoc(doc(db, 'quizzes', quizId), {
      courseId, title: 'Quiz A', published: true,
      questions: [{ question: '2+2?', options: ['3', '4'], points: 1 }]
    });
    await setDoc(doc(db, 'quizAnswerKeys', quizId), {
      courseId, answers: [{ correctIndex: 1, points: 1 }]
    });
    await setDoc(doc(db, 'enrollments', 'student-a_course-a'), {
      uid: 'student-a', courseId, status: 'active'
    });
    await setDoc(doc(db, 'enrollments', 'student-b_course-a'), {
      uid: 'student-b', courseId, status: 'active'
    });
    await setDoc(doc(db, 'quizAttempts', 'attempt-a'), {
      uid: 'student-a', quizId, courseId, score: 1
    });
    await setDoc(doc(db, 'progress', 'student-a_lesson-a'), {
      uid: 'student-a', courseId, lessonId, completed: true
    });
  });
});

after(async () => { if (env) await env.cleanup(); });

test('published course metadata is readable but draft courses are staff-only', async () => {
  const studentDb = env.authenticatedContext('student-a').firestore();
  await assertSucceeds(getDoc(doc(studentDb, 'courses', courseId)));
  await assertFails(getDoc(doc(studentDb, 'courses', 'draft-course')));
});

test('active enrolled student can read lesson and quiz metadata', async () => {
  const studentDb = env.authenticatedContext('student-a').firestore();
  await assertSucceeds(getDoc(doc(studentDb, 'lessons', lessonId)));
  await assertSucceeds(getDoc(doc(studentDb, 'quizzes', quizId)));
});

test('non-enrolled student cannot read protected lesson or quiz', async () => {
  const studentDb = env.authenticatedContext('student-c').firestore();
  await assertFails(getDoc(doc(studentDb, 'lessons', lessonId)));
  await assertFails(getDoc(doc(studentDb, 'quizzes', quizId)));
});

test('students cannot read answer keys or forge quiz attempts and progress', async () => {
  const studentDb = env.authenticatedContext('student-a').firestore();
  await assertFails(getDoc(doc(studentDb, 'quizAnswerKeys', quizId)));
  await assertFails(setDoc(doc(studentDb, 'quizAttempts', 'forged'), {
    uid: 'student-a', quizId, courseId, score: 999999
  }));
  await assertFails(setDoc(doc(studentDb, 'progress', 'student-a_lesson-b'), {
    uid: 'student-a', courseId, lessonId: 'lesson-b', completed: true
  }));
  await assertFails(setDoc(doc(studentDb, 'enrollments', 'student-a_draft-course'), {
    uid: 'student-a', courseId: 'draft-course', status: 'active'
  }));
});

test('student can read only their own enrollment, attempt and progress', async () => {
  const studentDb = env.authenticatedContext('student-a').firestore();
  await assertSucceeds(getDoc(doc(studentDb, 'enrollments', 'student-a_course-a')));
  await assertFails(getDoc(doc(studentDb, 'enrollments', 'student-b_course-a')));
  await assertSucceeds(getDoc(doc(studentDb, 'quizAttempts', 'attempt-a')));
  await assertFails(getDoc(doc(studentDb, 'quizAttempts', 'attempt-b')));
  await assertSucceeds(getDoc(doc(studentDb, 'progress', 'student-a_lesson-a')));
  await assertFails(getDoc(doc(studentDb, 'progress', 'student-b_lesson-a')));
});

test('trusted staff can create course and enrollment but still cannot directly read answer keys', async () => {
  const staffDb = env.authenticatedContext('staff-user', { admin: true }).firestore();
  await assertSucceeds(setDoc(doc(staffDb, 'courses', 'staff-created'), {
    title: 'Staff course', published: false
  }));
  await assertSucceeds(setDoc(doc(staffDb, 'enrollments', 'student-c_course-a'), {
    uid: 'student-c', courseId, status: 'active'
  }));
  await assertFails(getDoc(doc(staffDb, 'quizAnswerKeys', quizId)));
});
