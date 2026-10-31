# AIOU Workshop Planner data engine

Accepts the AIOU four-column tab-separated export: `course<TAB>course|group|batch<TAB>start datetime<TAB>end datetime`.

- Validates each row and reports malformed rows instead of silently guessing.
- Groups sessions by course/group/batch and sorts them chronologically.
- Marks the second-last class as a quiz-check reminder only; students must verify actual quiz availability in AAGHI LMS.
- Converts Pakistan Standard Time (UTC+5) to UTC for calendar exports.
- Does not require, store, or transmit student IDs.

The supplied regression fixture contains 42 rows across seven course groups. Its June–August 2026 dates are historical as of 31 October 2026; they are test data, not a current timetable. Calendar notifications depend on each student's calendar app settings.
