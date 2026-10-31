# Workshops: portal se calendar tak

```
AIOU portal  ->  data/workshops-raw.txt  ->  npm test / push  ->  calendar/*.ics feeds + Workshop Planner
                 (coach paste karta hai)                         (student ID ya course code se dhoondta hai)
```

## 0. Zaroori sach
* Tool **AIOU portal se khud fetch nahi karta.** Portal student ID / region / program se khulta hai, aur browser kisi aur site (AIOU) ka data nahi kheench sakta. Is liye schedule **coach ek baar paste** karta hai; uske baad students ke liye sab khud ho jata hai.
* **Student ID se auto-lookup tab chalta hai jab aap ne roster di ho** (kaun sa student kaun sa course/group parh raha hai). Roster ke baghair student course code likh kar dhoond sakta hai.
* Reminders **calendar ke zariye** aate hain (subscribe karne par schedule badle to khud update). Phone par push message yahan se khud nahi jata — uske liye neeche **Coach reminders** page hai jahan ek click mein WhatsApp reminder khulta hai.

## 1. Schedule paste karein — `data/workshops-raw.txt`
Portal ki table copy karke paste karein (har line ek class). Namoona `data/workshops-raw.sample.txt`:

```
5402	5402|G909|16BH	Tuesday, July 7, 2026 3:40 PM	Tuesday, July 7, 2026 5:40 PM
```
| Hissa | Matlab |
|---|---|
| `5402` | course code |
| `5402|G909|16BH` | course \| **group** \| batch |
| pehli datetime / doosri datetime | class ka start / end (Pakistan time) |

* Lines kisi bhi tarteeb mein ho sakti hain (tool khud sort karta hai). Tabs ki jagah spaces ho tab bhi chalta hai. `#` se shuru lines ignore hoti hain.
* Har `code + group + batch` ka alag workshop banta hai: `c-5402-g909-16bh`. Title `5402 (G909)` aata hai.
* Agar kuch parse na ho to build ruk jata hai; kuch lines skip hon to warning aati hai.
* Naya semester: purani lines hata kar nayi paste karein.

(Hand se likhne ke liye `data/workshops.json` bhi chalta hai — `data/workshops.sample.json` dekhein. Dono saath kaam karte hain.)

## 2. Quiz rule
Har workshop ki **2nd last class** par 🧪 *Quiz option visible* badge aur alag quiz reminder lagta hai (`quizFromEnd` in `data/workshops.json`: `2` default, `1` = aakhri, `0` = band). Yeh rule aap ke bataye mutabiq hai — AIOU se verify nahi kiya.

## 3. Student ID lookup (optional) — roster
1. CSV banayen (apne computer par, **git mein nahi**): `student_id,name,phone,course_code,group` — namoona `roster.sample.csv`. Ek student ki ek se zyada rows (har course ki ek).
2. Chalayen:
   ```bash
   node scripts/roster.js roster.csv
   ```
3. Do cheezein banti hain:
   * `data/roster.hashed.json` — **commit kar sakte hain.** Sirf hash keys + (course, group). Ismein ID, naam, phone **nahi** hote.
   * `private/coach-reminders.html` — **sirf aap ke computer ke liye** (naam + phone hain; `private/` git-ignored hai). Date chunein → us din ki classes → har student ke saath **WhatsApp reminder** button (quiz wali class par quiz ka zikr).
4. Push karein. Planner mein student ID daalte hi uski workshops khud load hoti hain, aur uska **personal calendar link** (`calendar/u-<key>.ics`) milta hai.

**Privacy ki hadd:** ID ko 20,000 dafa SHA-256 se guzara jata hai taake hash se ID wapas nikalna mehnga ho, lekin 10-digit IDs ka daira chhota hai — kaafi computing se koi enrolment (course/group) pata kar sakta hai. Yeh maloomat hassas nahi, phir bhi roster ko public site par tabhi lagayen jab aap ko manzoor ho. Roster hatani ho to `data/roster.hashed.json` delete karein.

## 4. Subscribe links ke liye
`config/site.json` → `"calendarBaseUrl": "https://<username>.github.io/<repo>"`. Is ke baghair feeds ban jate hain magar planner mein *Subscribe* button nahi aata.

Students:
* **iPhone / Mac:** Subscribe dabayen.
* **Google Calendar:** Other calendars (+) → **From URL** → URL paste. Google subscribed calendars kuch ghanton baad refresh karta hai.
* Feeds mein har class ke saath **1 din pehle ka alag reminder event** (`"safe": [1440]`) hota hai, kyunke Google subscribed calendars ke andar ke alarms ignore karta hai. Quiz ka reminder alag event hai.

## 5. Planner kaise kaam karta hai
* **Student ID / Course code** tab: ID likhein → workshops khud khulti hain. Ya course code (`5402` ya `5402, 8422`) → apna group chunein.
* **Paste** tab: student apni schedule seedha paste kar sakta hai (portal wala format ya `date, time, naam`).
* **Quick builder** tab: bina portal data ke manual schedule.
* Natija: har class ka Google Calendar button, `.ics` file, WhatsApp message.

## Size
Har workshop ≈ 0.3 KB planner mein embed hota hai (7 workshops ≈ 41 KB page). Sau-ek workshops ho to page 150 KB+ ho sakta hai: Blogger **Page** mein lagayen (gadget mein nahi); build size ki warning deta hai.
