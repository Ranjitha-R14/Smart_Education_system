# Smart Education Portal

## Install it (Windows desktop app)

1. On the website, click **Download for Windows (.zip)** (or GitHub: **Code > Download ZIP**).
2. Unzip, then double-click **Install-Windows.bat**.
3. The **Smart Education Portal** icon appears on the Desktop and Start menu. Works offline.

Phone / Mac: open the website link and click the blue **Install app** button (iPhone: Safari > Share > Add to Home Screen).

### Put it online (one time, about 3 minutes)
1. GitHub: **New repository** (public) > upload all files of this folder (`index.html` at the top level).
2. **Settings > Pages > Branch: main, folder: / (root) > Save.** Your link appears after a minute.

---



A website for students and faculty: early attendance alerts, anonymous doubts, private counseling, announcements and a one-click NAAC/NBA report.
Built for HackNext'26 (PS06 - Smart Education). Team: King of the Hunter.

## Run it

Open with a local server (not by double-clicking files), so all pages share the same data:

- VS Code: install **Live Server**, right-click `index.html` → *Open with Live Server*, or
- Terminal: `python -m http.server 8000` in this folder, then open http://localhost:8000, or
- GitHub Pages: push the folder and enable Pages on the `main` branch (only the repository owner can open Settings → Pages).

## Demo logins

| Role | Login | Password |
|---|---|---|
| Faculty | meera@college.edu (DSP), ramesh@college.edu (Computer Networks) | faculty123 |
| Faculty + class counselor | lakshmi@college.edu (Microcontrollers). Only this account sees the Counseling inbox | faculty123 |
| Student | 21EC001 … 21EC006 | student123 |

21EC002 (Bhavya, 82%), 21EC004 (Divya, 56%) and 21EC005 (Esha, 84%) start below the 85% limit, so they see the shortage alert.
Bhavya can still recover (attend the next 10 of about 20 remaining classes). Divya cannot reach 85% by attendance alone, so she is told to ask about condonation instead of being shown an impossible number.

## 3-minute demo for judges

1. Open two browser tabs side by side. Log in as **Bhavya (21EC002)** in one and **Prof. Meera** in the other.
2. Student: dashboard shows *"Attendance shortage: 82% — attend the next 10 classes"*. Open Attendance and drag the planner slider.
3. Student: *Ask a doubt* → DSP → DFT → send. Faculty tab: the DFT count goes up, with the note, and no name.
4. Faculty: *Mark as re-taught* on Z-transform. Student's doubt page shows it under "Recently re-taught".
5. Student: send a counselor message. Log in as **Prof. Lakshmi** (class counselor): red badge on Counseling → reply. Student sees the reply. Prof. Meera has no Counseling menu, which proves the message is private.
6. Faculty: *Mark today's class*, untick Bhavya, save. Her percentage drops and her alert updates.
7. Faculty: post an Event announcement with a link. It appears on the student dashboard and Events page.
8. Faculty: Accreditation → *Generate NAAC/NBA report* → Print / Save as PDF. The report includes certificates, the re-teaching log and attendance monitoring automatically.

Use **Reset demo data** (faculty sidebar) before each demo. It also puts every password back to its default.

Both roles can change their password (student: *Password* tab, faculty: *Change password* menu). Rules: at least 8 characters with letters and numbers. In the demo the new password is saved in this browser only; the Supabase version is in `later-supabase/auth.js`.

## Folder structure

```
index.html            college-style home page (add images/campus.jpg and images/logo.png)
login.html            login for both roles
css/style.css         student page styles
images/               put campus.jpg and logo.png here (optional; the site works without them)
js/app.js             shared data, login guard, attendance maths, helpers
student/              dashboard, attendance, events, doubts, counseling, password
faculty/index.html    faculty dashboard (attendance, doubts, counseling, announcements, accreditation)
later-supabase/       schema.sql (production database design) + Supabase login code (not used yet)
```

## Settings

Edit the top of `js/app.js`: `REQUIRED_ATTENDANCE` (85, the VTU rule), class name, subject, demo accounts and topic lists.

## Limits of this demo, and next steps

- Data is stored in the browser (localStorage). It is shared between tabs on one computer, not between different phones. Next step: move `loadData`/`saveData` to Supabase tables.
- Settings you should check before demo day: `CLASSES_IN_SEMESTER` (70) and the placeholder event links in `js/app.js` (they point to the college website until you add real registration forms).
- Passwords are in `js/app.js`, so anyone can read them. Next step: Supabase Auth plus Row Level Security (students read only their own attendance; the doubts table has no student column; counseling rows readable only by the sender and the counselor).
- Anonymous doubts allow one flag per topic per browser tab. With a backend, store a one-way hash per student per topic so counts can't be inflated without revealing identity.
