# AIOU Workshop Reminder tool

File: `tools/aiou-workshop-reminder.html`

## What it does

- Links students to AIOU's official Workshop Information, Face-to-Face schedule and AAGHI LMS.
- Lets a student paste schedule text they copied from a public AIOU schedule or their own authenticated AAGHI LMS session.
- Attempts to parse a course code, date and a 12-hour time range from pasted text; all parsed values must be checked against the official student schedule.
- Saves confirmed event details locally in that browser.
- Creates a pre-filled Google Calendar event link. The student must be signed in and click Save in Google Calendar.
- Exports an `.ics` calendar file containing a DISPLAY alarm; calendar apps may handle alarms differently.

## Important limitation: student-specific schedules

AIOU's public Workshop Information page publishes schedule links and embeds a student schedule lookup. AIOU's FAQ instructs students to check AAGHI LMS and the public workshop page. The actual student's schedule may require their Registration Number / Student ID or AAGHI LMS login, and online workshop join links can be per day/course.

This static browser tool does not bypass AIOU authentication, scrape private student records, store student IDs/passwords, or claim that public batch-date summaries are a student's exact appointment. Students must copy their own confirmed workshop date/time and meeting details from AAGHI LMS. The tool does not send this data to a server.

Official sources:
- https://www.aiou.edu.pk/workshop-information
- https://www.aiou.edu.pk/workshop-info
- https://www.aiou.edu.pk/workshopftf
- https://aaghi.aiou.edu.pk/
- https://aiou.edu.pk/frequently-asked-questions-faqs

## Reminder behavior

- Google Calendar link pre-fills title, date/time, timezone `Asia/Karachi`, description, mode and meeting link. Student saves the event in their own calendar. Google Calendar's reminder behavior follows the user's calendar defaults; the pre-filled URL cannot reliably force custom notification settings.
- The `.ics` export contains a VALARM using the selected lead time. Actual notification delivery depends on the student's calendar application and notification settings.
- A saved item in the tool is only local browser storage; it does not send push notifications or SMS.

## QA cases

1. Save a workshop with title/date/start and no end time: one-hour duration is used for calendar export.
2. Save with an explicit end time: end must be after start.
3. Try invalid or non-HTTP(S) meeting URL: it is omitted from event links.
4. Add to Google Calendar: link must include event title, Asia/Karachi timezone, start/end and details.
5. Download ICS: file must contain DTSTART/DTEND, VALARM, and correct lead minutes.
6. Refresh page: locally saved events remain available in the same browser.
7. Delete event: it disappears from local browser list.
8. Paste a sample schedule: parser is only a convenience and user must verify all values before saving.
