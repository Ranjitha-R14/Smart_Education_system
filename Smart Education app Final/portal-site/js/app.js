/* =====================================================================
   Smart Education Portal — js/app.js  (shared by every page)
   ---------------------------------------------------------------------
   Demo mode: all data lives in the browser (localStorage), so what a
   student submits really shows up on the faculty side, and what faculty
   posts really shows up for students. Open a student tab and a faculty
   tab side by side and they update each other live.
   Later: replace loadData/saveData with Supabase calls (see later-supabase/).
   ===================================================================== */

/* ---------- 1. SETTINGS — edit here ---------- */
const REQUIRED_ATTENDANCE = 85;          // % needed. VTU requires 85% per course to be eligible for the SEE.
const CLASS_NAME = "ECE 5th Sem A";
const FACULTY_SUBJECT = "Digital Signal Processing";
const STORE_KEY = "sep-data-v4";          // change the version to force fresh demo data
const CLASSES_IN_SEMESTER = 70;           // classes planned this semester (edit to match your timetable)
const SESSION_KEY = "sep-session";
const PASSWORD_KEY = "sep-passwords";    // passwords changed in this browser (demo only)

/* Demo logins. Passwords are visible in the browser, so this is for demo only. */
const ACCOUNTS = [
  { role: "faculty", id: "meera@college.edu",  password: "faculty123", name: "Prof. Meera",       subject: "Digital Signal Processing" },
  { role: "faculty", id: "ramesh@college.edu", password: "faculty123", name: "Dr. Ramesh Kumar",  subject: "Computer Networks" },
  // Prof. Lakshmi is the class counselor: only this account can open the Counseling inbox.
  { role: "faculty", id: "lakshmi@college.edu",password: "faculty123", name: "Prof. Lakshmi",     subject: "Microcontrollers", counselor: true },
  { role: "student", id: "21EC001", password: "student123", name: "Ananya" },
  { role: "student", id: "21EC002", password: "student123", name: "Bhavya" },
  { role: "student", id: "21EC003", password: "student123", name: "Chaitra" },
  { role: "student", id: "21EC004", password: "student123", name: "Divya" },
  { role: "student", id: "21EC005", password: "student123", name: "Esha" },
  { role: "student", id: "21EC006", password: "student123", name: "Fathima" }
];

/* Fixed topic lists stop "Z transform" and "z-transform" being counted as two topics. */
const SUBJECTS = {
  "Digital Signal Processing": ["DFT", "FFT", "Z-transform", "Filters", "Sampling theorem", "Convolution"],
  "Computer Networks": ["OSI model", "TCP vs UDP", "IP addressing & subnetting", "Routing algorithms"],
  "Microcontrollers": ["8051 architecture", "Timers & counters", "Interrupts", "Serial communication"],
  "Digital Electronics": ["K-maps", "Flip-flops", "Counters", "Multiplexers"],
  "Engineering Mathematics": ["Laplace transform", "Fourier series", "Probability", "Linear algebra"]
};

/* ---------- 2. DEMO DATA (used the first time, or after "Reset demo data") ---------- */
function seedData() {
  const day = (offset) => { const d = new Date(); d.setDate(d.getDate() - offset); return d.toISOString(); };
  const doubts = [];
  const addDoubts = (topic, count, notes) => {
    for (let i = 0; i < count; i++) {
      doubts.push({ id: "d" + topic + i, subject: FACULTY_SUBJECT, topic: topic,
                    text: notes[i] || "", date: day(i % 5) });
    }
  };
  addDoubts("Z-transform", 12, ["How do we find the ROC from the pole positions?",
                                "Inverse Z-transform using partial fractions was too fast.",
                                "Why is ROC always outside the outermost pole for right-sided signals?"]);
  addDoubts("DFT", 7, ["Difference between DFT and DTFT is not clear."]);
  addDoubts("Filters", 5, ["Bilinear transformation frequency warping."]);
  addDoubts("FFT", 3, []);

  return {
    students: [
      { reg: "21EC001", name: "Ananya",    attended: 47, total: 50 },
      { reg: "21EC002", name: "Bhavya",  attended: 41, total: 50 },
      { reg: "21EC003", name: "Chaitra",  attended: 44, total: 50 },
      { reg: "21EC004", name: "Divya",   attended: 28, total: 50 },
      { reg: "21EC005", name: "Esha",  attended: 42, total: 50 },
      { reg: "21EC006", name: "Fathima", attended: 46, total: 50 }
    ],
    doubts: doubts,
    retaught: [],
    announcements: [
      { id: 1, title: "Hackathon registration open till Friday",
        message: "Department-level hackathon registrations are open. Teams of 2 to 4 students can register.",
        category: "Event", link: "https://gsssietw.ac.in/", eventDate: "2026-10-16", date: day(0) },  // TODO: replace the link with your real registration form
      { id: 2, title: "DSP Unit 3 notes uploaded",
        message: "Digital filter design and FFT algorithms study material is now available with the class representative.",
        category: "Notes", link: "", date: day(1) }
    ],
    events: [
      { id: 101, title: "Tech Symposium 2026", date: "2026-10-20",
        details: "Technical presentations, coding competitions and workshops.", link: "https://gsssietw.ac.in/" },  // TODO: real registration links
      { id: 102, title: "Project Expo", date: "2026-10-25",
        details: "Showcase your innovative projects to industry judges.", link: "https://gsssietw.ac.in/" },
      { id: 103, title: "Placement Training", date: "2026-10-30",
        details: "Aptitude, group discussion and interview preparation.", link: "https://gsssietw.ac.in/" }
    ],
    counseling: [],
    accreditation: [
      { id: 1, title: "FDP on AI in Education", year: 2024, type: "FDP", criterion: "Criterion 6 - Faculty Development" },
      { id: 2, title: "IEEE Research Paper on Signal Processing", year: 2023, type: "Research Paper", criterion: "Criterion 3 - Research" },
      { id: 3, title: "IoT Workshop", year: 2022, type: "Workshop", criterion: "Criterion 6 - Faculty Development" }
    ]
  };
}

/* ---------- 3. DATA STORE ---------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage blocked or corrupt: fall through to fresh data */ }
  const fresh = seedData();
  saveData(fresh);
  return fresh;
}

function saveData(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
  catch (e) { console.warn("Could not save data", e); }
}

/* Load, change, save in one step:  updateData(d => d.doubts.push(x)) */
function updateData(change) {
  const data = loadData();
  change(data);
  saveData(data);
  return data;
}

function resetData() {
  try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(PASSWORD_KEY); } catch (e) {}
  return loadData();
}

/* Re-run a render function when another tab changes the data. */
function onDataChange(callback) {
  window.addEventListener("storage", (e) => { if (e.key === STORE_KEY) callback(); });
}

/* ---------- 4. LOGIN / SESSION ---------- */
function login(role, id, password) {
  const clean = String(id || "").trim().toLowerCase();
  const found = ACCOUNTS.find(a => a.role === role && a.id.toLowerCase() === clean && currentPasswordFor(a) === password);
  if (!found) return null;
  const session = { role: found.role, id: found.id, name: found.name, subject: found.subject || "", counselor: !!found.counselor };
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
  return session;
}

/* Passwords changed by users are kept as overrides; everyone else still uses the default in ACCOUNTS. */
function passwordOverrides() {
  try { return JSON.parse(localStorage.getItem(PASSWORD_KEY)) || {}; } catch (e) { return {}; }
}
function currentPasswordFor(account) {
  const o = passwordOverrides();
  const key = account.id.toLowerCase();
  return Object.prototype.hasOwnProperty.call(o, key) ? o[key] : account.password;
}

/* Rules for a new password. Returns an error message, or "" if it is fine. */
function passwordProblem(pw) {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Use both letters and numbers.";
  return "";
}

/* Change the password of the logged-in user. Returns { ok, message }.
   Demo only: the new password is saved in this browser. The real version uses Supabase Auth. */
function changePassword(user, oldPw, newPw, confirmPw) {
  const account = user && ACCOUNTS.find(a => a.role === user.role && a.id === user.id);
  if (!account) return { ok: false, message: "Please log in again." };
  if (currentPasswordFor(account) !== oldPw) return { ok: false, message: "Your current password is not correct." };
  const problem = passwordProblem(newPw);
  if (problem) return { ok: false, message: problem };
  if (newPw === oldPw) return { ok: false, message: "The new password must be different from the current one." };
  if (newPw !== confirmPw) return { ok: false, message: "The two new passwords do not match." };
  try {
    const o = passwordOverrides();
    o[account.id.toLowerCase()] = newPw;
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(o));
  } catch (e) { return { ok: false, message: "Could not save the new password in this browser." }; }
  return { ok: true, message: "Password changed. Use the new password next time you log in." };
}

function currentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
}

/* Put at the top of every protected page. Sends visitors without the right login back. */
function requireRole(role) {
  const user = currentUser();
  if (!user || user.role !== role) {
    location.replace("../login.html?role=" + role);
    return null;
  }
  return user;
}

function logout() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  location.href = "../index.html";
}

/* ---------- 5. ATTENDANCE MATHS ---------- */
function attendancePct(s) {
  return s.total ? (s.attended / s.total) * 100 : 100;
}

/* Classes in a row you must attend to reach the requirement. */
function classesNeeded(s) {
  const r = REQUIRED_ATTENDANCE / 100;
  if (attendancePct(s) >= REQUIRED_ATTENDANCE) return 0;
  return Math.ceil((r * s.total - s.attended) / (1 - r) - 1e-9);
}

/* Classes you could miss and still stay at or above the requirement. */
function classesCanMiss(s) {
  const r = REQUIRED_ATTENDANCE / 100;
  return Math.max(0, Math.floor(s.attended / r - s.total + 1e-9));
}

/* Classes still to come this semester (planning estimate). */
function classesLeft(s) {
  return Math.max(0, CLASSES_IN_SEMESTER - s.total);
}

/* Can attendance alone still reach the requirement before the semester ends? */
function canRecover(s) {
  return classesNeeded(s) <= classesLeft(s);
}

/* Best possible percentage if the student attends every remaining class. */
function bestPossiblePct(s) {
  const end = Math.max(CLASSES_IN_SEMESTER, s.total);
  return end ? ((s.attended + classesLeft(s)) / end) * 100 : 100;
}

/* "danger" below requirement, "warn" within 5% above it, "ok" otherwise */
function attendanceLevel(s) {
  const p = attendancePct(s);
  if (p < REQUIRED_ATTENDANCE) return "danger";
  if (p < REQUIRED_ATTENDANCE + 5) return "warn";
  return "ok";
}

/* ---------- 6. SMALL HELPERS ---------- */
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Only allow real web links, never javascript: links */
function safeUrl(url) {
  return /^https?:\/\//i.test(String(url || "").trim()) ? String(url).trim() : "";
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d)) return escapeHTML(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function newId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* Shared top bar + nav for student pages. active = "dashboard" | "attendance" | ... */
function renderStudentShell(user, active) {
  const links = [
    ["dashboard", "dashboard.html", "Dashboard"],
    ["attendance", "attendance.html", "Attendance"],
    ["events", "events.html", "Events"],
    ["doubts", "doubts.html", "Ask a doubt"],
    ["counseling", "counseling.html", "Counselor"],
    ["password", "password.html", "Password"]
  ];
  document.getElementById("shell").innerHTML = `
    <header class="topbar">
      <a class="brand" href="dashboard.html">Smart Education Portal</a>
      <div class="topbar-right">
        <span class="who">${escapeHTML(user.name)} (${escapeHTML(user.id)})</span>
        <button type="button" class="logout-btn" onclick="logout()">Log out</button>
      </div>
    </header>
    <nav class="tabs" aria-label="Student pages">
      ${links.map(([key, href, label]) =>
        `<a href="${href}"${key === active ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>`;
}

function myRecord(user) {
  return loadData().students.find(s => s.reg === user.id) || { reg: user.id, name: user.name, attended: 0, total: 0 };
}
