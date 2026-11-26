# School Result Manager

Standalone, browser-based school result report builder.

## Features
- Student add, edit and delete with unique roll-number checks
- Configurable maximum marks and passing percentage
- Automatic percentage, pass/fail, class average and summary
- School name, exam/session, logo, table color and watermark
- CSV import/export
- Local browser auto-save
- Responsive student register and print / Save as PDF report

## Run
Open `index.html` in a modern browser. No build step or backend is required.

## Privacy
Student records and uploaded logo are stored in the browser's localStorage on that device. They are not sent to a server. Avoid using shared/public computers for real student records. Export CSV for backup and clear local data when finished.

## CSV format
`GR,Name,Father,Roll,Marks,Papers`

## Notes
- Sample records are fictitious demonstration data.
- Print / Save PDF uses the browser print dialog. Select "Save as PDF".
- This is a report-preparation aid, not an official examination authority system. Verify all data before issuing results.
