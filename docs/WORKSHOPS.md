# AIOU Workshop Planner data engine

The browser tool uses a small dependency-free JavaScript engine at `src/tools/workshop-planner/ics.js`.

## Import format

The supported portal-paste format is four tab-separated columns:

`course/title<TAB>course-code|group|batch<TAB>start date-time<TAB>end date-time`

Date examples: `2026-11-12`, `12/11/2026` (DD/MM/YYYY), `12 November 2026`, or `Nov 12, 2026`.
Time examples: `10:30 AM`, `3:40 PM`, or `15:40`. Start and end must be on the same date, and end must be later than start.

## Behaviour and safeguards

- Validates calendar dates and time values rather than relying on browser date parsing.
- Reports malformed rows and skips exact duplicate imports.
- Groups sessions by course code, group and batch; identical course titles in different groups do not merge.
- Sorts sessions chronologically and marks the second-last session as a **quiz-check reminder**, not as a confirmed quiz date. Students must verify quiz availability in AAGHI LMS.
- Converts Pakistan Standard Time (UTC+5) to UTC for calendar export.
- Limits calendar alarm values to positive whole minutes (maximum 30 days).
- Does not require, store, or transmit student IDs or AAGHI credentials.

The supplied regression fixture contains 42 rows across seven course groups. Its June–August 2026 dates are historical as of 31 October 2026; they are test data, not a current timetable. Calendar notifications depend on each student's calendar app settings. Some calendar providers ignore imported VALARM notifications; users should verify reminder settings after import.
