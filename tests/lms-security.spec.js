const { test, expect } = require('@playwright/test');

const cfg = {
  url: process.env.LMS_TEST_SUPABASE_URL,
  key: process.env.LMS_TEST_SUPABASE_ANON_KEY,
  studentAEmail: process.env.LMS_TEST_STUDENT_A_EMAIL,
  studentAPassword: process.env.LMS_TEST_STUDENT_A_PASSWORD,
  studentBEmail: process.env.LMS_TEST_STUDENT_B_EMAIL,
  studentBPassword: process.env.LMS_TEST_STUDENT_B_PASSWORD,
  staffEmail: process.env.LMS_TEST_STAFF_EMAIL,
  staffPassword: process.env.LMS_TEST_STAFF_PASSWORD,
  courseId: process.env.LMS_TEST_COURSE_ID,
  quizId: process.env.LMS_TEST_QUIZ_ID,
  unEnrolledCourseId: process.env.LMS_TEST_UNENROLLED_COURSE_ID
};

const missing = Object.entries(cfg).filter(([, value]) => !value).map(([key]) => key);
test.beforeAll(() => {
  test.skip(missing.length > 0, `Real-account LMS security E2E is not configured; missing: ${missing.join(', ')}`);
});

async function api(path, token, options = {}) {
  const response = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  const raw = await response.text();
  let body;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }
  return { response, body };
}

async function signIn(email, password) {
  const response = await fetch(`${cfg.url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const body = await response.json();
  expect(response.ok, `Supabase sign-in failed for configured test account (HTTP ${response.status})`).toBeTruthy();
  expect(body.access_token, 'Auth response must contain a user access token').toBeTruthy();
  return { token: body.access_token, user: body.user };
}

async function ownRows(token, table, select, filter) {
  const { response, body } = await api(`${table}?select=${select}${filter || ''}`, token);
  expect(response.ok, `Read from ${table} should be allowed for the signed-in user`).toBeTruthy();
  return body;
}

test.describe('LMS real-account RLS and score-tampering checks', () => {
  test('student A cannot read student B profile, enrollment, or quiz attempt', async () => {
    const a = await signIn(cfg.studentAEmail, cfg.studentAPassword);
    const b = await signIn(cfg.studentBEmail, cfg.studentBPassword);

    const profiles = await ownRows(a.token, 'profiles', 'id', '');
    expect(profiles.map(row => row.id)).toEqual([a.user.id]);

    const enrollments = await ownRows(a.token, 'enrollments', 'student_id,course_id,status', `&course_id=eq.${cfg.courseId}`);
    expect(enrollments.length).toBeGreaterThan(0);
    expect(enrollments.every(row => row.student_id === a.user.id)).toBeTruthy();

    const attempts = await ownRows(a.token, 'quiz_attempts', 'id,student_id,quiz_id,score', `&quiz_id=eq.${cfg.quizId}`);
    expect(attempts.length).toBeGreaterThan(0);
    expect(attempts.every(row => row.student_id === a.user.id)).toBeTruthy();

    const bProfiles = await ownRows(b.token, 'profiles', 'id', '');
    expect(bProfiles.map(row => row.id)).toEqual([b.user.id]);
    const bAttempts = await ownRows(b.token, 'quiz_attempts', 'id,student_id,quiz_id,score', `&quiz_id=eq.${cfg.quizId}`);
    expect(bAttempts.length).toBeGreaterThan(0);
    expect(bAttempts.every(row => row.student_id === b.user.id)).toBeTruthy();
    expect(attempts.some(row => bAttempts.some(other => other.id === row.id))).toBeFalsy();
  });

  test('student cannot self-enroll into a course or directly create a quiz attempt', async () => {
    const a = await signIn(cfg.studentAEmail, cfg.studentAPassword);
    const enroll = await api('enrollments', a.token, {
      method: 'POST',
      body: JSON.stringify({ student_id: a.user.id, course_id: cfg.unEnrolledCourseId, status: 'active' })
    });
    const enrollmentWasCreated = enroll.response.ok && Array.isArray(enroll.body) && enroll.body.length > 0;
    expect(enrollmentWasCreated, 'Student must not be able to create an active enrollment').toBeFalsy();

    const attempt = await api('quiz_attempts', a.token, {
      method: 'POST',
      body: JSON.stringify({ quiz_id: cfg.quizId, student_id: a.user.id, score: 999999, submitted_at: new Date().toISOString() })
    });
    const attemptWasCreated = attempt.response.ok && Array.isArray(attempt.body) && attempt.body.length > 0;
    expect(attemptWasCreated, 'Student must not be able to forge a quiz attempt or score').toBeFalsy();
  });

  test('student cannot modify an existing score or answer grading fields', async () => {
    const a = await signIn(cfg.studentAEmail, cfg.studentAPassword);
    const attempts = await ownRows(a.token, 'quiz_attempts', 'id,score,student_id', `&quiz_id=eq.${cfg.quizId}`);
    const target = attempts.find(row => row.student_id === a.user.id);
    expect(target, 'Fixture must include a quiz attempt for student A').toBeTruthy();

    const update = await api(`quiz_attempts?id=eq.${target.id}`, a.token, {
      method: 'PATCH',
      body: JSON.stringify({ score: Number(target.score) + 999999 })
    });
    const changedRows = update.response.ok && Array.isArray(update.body) ? update.body : [];
    expect(changedRows.length, 'Direct score update must be denied or affect zero rows').toBe(0);

    const after = await ownRows(a.token, 'quiz_attempts', 'id,score', `&id=eq.${target.id}`);
    expect(Number(after[0]?.score)).toBe(Number(target.score));

    const answerUpdate = await api('quiz_answers?attempt_id=eq.' + target.id, a.token, {
      method: 'PATCH',
      body: JSON.stringify({ is_correct: true, points_awarded: 999999 })
    });
    const changedAnswers = answerUpdate.response.ok && Array.isArray(answerUpdate.body) ? answerUpdate.body : [];
    expect(changedAnswers.length, 'Direct answer/grading update must be denied or affect zero rows').toBe(0);
  });

  test('staff account can see both students in the controlled test course', async () => {
    const staff = await signIn(cfg.staffEmail, cfg.staffPassword);
    expect(staff.user?.app_metadata?.role, 'Staff test account must have trusted app_metadata.role admin/teacher').toMatch(/^(admin|teacher)$/);

    const enrollments = await ownRows(staff.token, 'enrollments', 'student_id,course_id,status', `&course_id=eq.${cfg.courseId}`);
    const studentIds = new Set(enrollments.map(row => row.student_id));
    expect(studentIds.has((await signIn(cfg.studentAEmail, cfg.studentAPassword)).user.id)).toBeTruthy();
    expect(studentIds.has((await signIn(cfg.studentBEmail, cfg.studentBPassword)).user.id)).toBeTruthy();
  });
  test('incomplete quiz submission scores unanswered questions as zero and keeps full denominator', async () => {
    const a = await signIn(cfg.studentAEmail, cfg.studentAPassword);
    const questions = await api(`quiz_questions?select=id,points&quiz_id=eq.${cfg.quizId}&order=sort_order.asc`, a.token);
    expect(questions.response.ok, 'Student should be able to read published quiz questions').toBeTruthy();
    expect(questions.body.length, 'Controlled fixture must include questions').toBeGreaterThan(0);

    const expectedMax = questions.body.reduce((sum, question) => sum + Number(question.points || 0), 0);
    expect(expectedMax, 'Fixture questions must have a positive total point value').toBeGreaterThan(0);
    const submitted = await fetch(`${cfg.url.replace(/\\/$/, '')}/rest/v1/rpc/submit_quiz_attempt`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${a.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_quiz_id: cfg.quizId,
        p_answers: questions.body.map(question => ({ question_id: question.id, answer: null }))
      })
    });
    const result = await submitted.json();
    expect(submitted.ok, `Incomplete quiz submission should succeed: ${JSON.stringify(result)}`).toBeTruthy();
    const row = Array.isArray(result) ? result[0] : result;
    expect(Number(row.score)).toBe(0);
    expect(Number(row.max_score)).toBe(expectedMax);
    expect(Number(row.percentage)).toBe(0);
    expect(row.attempt_id).toBeTruthy();

    const stored = await ownRows(a.token, 'quiz_attempts', 'id,student_id,quiz_id,score,max_score,percentage', `&id=eq.${row.attempt_id}`);
    expect(stored).toHaveLength(1);
    expect(stored[0].student_id).toBe(a.user.id);
    expect(stored[0].quiz_id).toBe(cfg.quizId);
    expect(Number(stored[0].score)).toBe(0);
    expect(Number(stored[0].max_score)).toBe(expectedMax);
    expect(Number(stored[0].percentage)).toBe(0);

    const answers = await ownRows(a.token, 'quiz_answers', 'attempt_id,question_id,is_correct,points_awarded', `&attempt_id=eq.${row.attempt_id}`);
    expect(answers).toHaveLength(questions.body.length);
    expect(answers.every(answer => answer.is_correct === false && Number(answer.points_awarded) === 0)).toBeTruthy();
  });

});
