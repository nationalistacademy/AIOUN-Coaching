# AIOU Workshop tools

This folder contains the standalone Workshop Planner published with the AIOU Coaching static site.

## Files
- `index.html` — responsive workshop details form that generates an `.ics` calendar event locally in the browser.
- No API key, backend, account connection, or student database is required.

## Publish path
The repository's GitHub Pages workflow copies repository files into the Pages artifact, so this page is published at:

`https://nationalistacademy.github.io/AIOUN-Coaching/workshop/`

## Safety and limitations
- Students must verify the date, time, course and venue against the official AIOU CMS or notice.
- The page does not scrape AIOU, read student accounts, or automatically write to Google Calendar.
- The generated calendar file is imported by the student into Google Calendar, Apple Calendar or Outlook.
- Do not add API keys, service-account credentials, or private student data to this folder.
