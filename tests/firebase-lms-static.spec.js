const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('Firebase LMS is separate from the legacy Supabase implementation', () => {
  const app = fs.readFileSync(path.join(root, 'firebase-lms/index.html'), 'utf8');
  expect(app).not.toMatch(/supabase-js|AIOU_SUPABASE|createClient\(/i);
  expect(app).toContain('firebase-auth-compat.js');
  expect(app).toContain('submitQuizAttempt');
  expect(app).toContain('markLessonComplete');
  expect(app).toContain('setLmsEnrollment');
  expect(app).toContain('noindex,nofollow,noarchive');
});

test('Firebase LMS keeps grading keys on the trusted server side', () => {
  const app = fs.readFileSync(path.join(root, 'firebase-lms/index.html'), 'utf8');
  const functions = fs.readFileSync(path.join(root, 'functions/index.js'), 'utf8');
  const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  expect(app).toContain('correctIndex');
  expect(functions).toContain('quizAnswerKeys');
  expect(functions).toContain('exports.submitQuizAttempt');
  expect(functions).toContain('exports.createLmsQuiz');
  expect(functions).toContain('request.auth.token.teacher !== true');
  expect(rules).toMatch(/match \/quizAnswerKeys\/\{quizId\}[\s\S]*?allow read, write: if false;/);
  expect(rules).toMatch(/match \/quizAttempts\/\{attemptId\}[\s\S]*?allow create, update, delete: if false;/);
  expect(rules).toMatch(/match \/progress\/\{progressId\}[\s\S]*?allow create, update, delete: if false;/);
});

test('Firebase Hosting targets only the isolated LMS directory and sends no-store security headers', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));
  expect(config.hosting.public).toBe('firebase-lms');
  const headers = config.hosting.headers[0].headers;
  expect(headers.find(h => h.key === 'Cache-Control').value).toBe('no-store');
  expect(headers.find(h => h.key === 'X-Content-Type-Options').value).toBe('nosniff');
  expect(JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8')).projects.default).toBe('aioucoaching');
});
