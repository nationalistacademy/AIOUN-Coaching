# AIOU Workshop Planner

The `index.html` page restores the original orange Taleemwaly workshop planner from `workshop/workshop-planner.html` on the repository's main branch.

## Included features
- Student ID / course-code lookup interface (requires published workshop and roster data).
- Paste AIOU schedule and parse class rows.
- Quick builder for daily, weekdays, weekly, or selected-day schedules.
- Configurable reminders and quiz reminder from the second-last class by default.
- Calendar `.ics` export, Google Calendar event links, WhatsApp message and copy actions.
- Responsive orange theme, suitable for mobile and desktop.

## Publish path
`https://nationalistacademy.github.io/AIOUN-Coaching/workshop/`

The page is self-contained. Student ID lookup needs published `PUB.items` / roster data; the standalone planner currently ships with an empty public dataset. Students can still use schedule paste and Quick Builder without that data.

Verify workshop dates and times against the official AIOU portal before importing reminders. Do not commit private roster CSVs, names, or phone numbers.
