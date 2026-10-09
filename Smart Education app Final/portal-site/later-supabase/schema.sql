-- =====================================================================
-- Smart Education Portal — production database design (PostgreSQL / Supabase)
-- The prototype keeps these same tables in browser localStorage.
-- Run this in Supabase → SQL Editor to create the real database.
-- =====================================================================

-- 1. PROFILES: one row per user. id links to Supabase's built-in login table (auth.users).
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('student', 'faculty', 'counselor', 'hod')),
  name        text not null,
  reg_no      text unique,              -- students only (USN)
  class_name  text,
  subject     text                      -- faculty only
);

-- 2. ATTENDANCE: one row per student per class held.
--    (The prototype stores only totals; storing each class lets us show history and fix mistakes.)
create table attendance (
  id          bigint generated always as identity primary key,
  student_id  uuid not null references profiles(id),
  subject     text not null,
  class_date  date not null,
  present     boolean not null,
  marked_by   uuid references profiles(id),
  unique (student_id, subject, class_date)          -- cannot mark the same class twice
);

-- 3. DOUBTS: anonymous. Deliberately NO student column, so a doubt can never be traced back.
create table doubts (
  id          bigint generated always as identity primary key,
  subject     text not null,
  topic       text not null,
  note        text check (char_length(note) <= 500),
  created_at  timestamptz not null default now()
);

-- 4. RETAUGHT: log of topics faculty re-taught (evidence for NAAC Criterion 2).
create table retaught (
  id          bigint generated always as identity primary key,
  subject     text not null,
  topic       text not null,
  doubt_count int  not null,
  faculty_id  uuid references profiles(id),
  retaught_on timestamptz not null default now()
);

-- 5. COUNSELING: private, so it DOES record who wrote it.
create table counseling (
  id           bigint generated always as identity primary key,
  student_id   uuid not null references profiles(id),
  about        text not null,
  message      text not null,
  reply        text,
  replied_by   uuid references profiles(id),
  created_at   timestamptz not null default now(),
  replied_at   timestamptz
);

-- 6. ANNOUNCEMENTS and 7. EVENTS
create table announcements (
  id          bigint generated always as identity primary key,
  title       text not null,
  message     text not null,
  category    text not null check (category in ('Event', 'Notes', 'Exam', 'General')),
  link        text,
  event_date  date,
  posted_by   uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create table events (
  id          bigint generated always as identity primary key,
  title       text not null,
  details     text,
  event_date  date not null,
  link        text
);

-- 8. ACCREDITATION records for the NAAC/NBA report
create table accreditation (
  id          bigint generated always as identity primary key,
  faculty_id  uuid references profiles(id),
  title       text not null,
  year        int  not null,
  type        text not null,
  criterion   text not null
);

-- =====================================================================
-- ROW LEVEL SECURITY: the database itself decides who may read what.
-- Even if someone edits the JavaScript, these rules still apply.
-- =====================================================================
alter table profiles      enable row level security;
alter table attendance    enable row level security;
alter table doubts        enable row level security;
alter table counseling    enable row level security;
alter table announcements enable row level security;

-- helper: role of the logged-in user
create function my_role() returns text language sql stable security definer as
$$ select role from profiles where id = auth.uid() $$;

create policy "see own profile, staff see all" on profiles for select
  using (id = auth.uid() or my_role() in ('faculty', 'counselor', 'hod'));

create policy "student sees only own attendance" on attendance for select
  using (student_id = auth.uid() or my_role() in ('faculty', 'hod'));
create policy "only faculty mark attendance" on attendance for insert
  with check (my_role() = 'faculty');

create policy "any student can add a doubt" on doubts for insert
  with check (my_role() = 'student');
create policy "only staff read doubts" on doubts for select
  using (my_role() in ('faculty', 'hod'));

create policy "student writes own message" on counseling for insert
  with check (student_id = auth.uid());
-- Private by design: only the sender and the counselor can read a message.
-- Ordinary faculty and HODs are deliberately NOT included.
create policy "student sees own messages, counselor sees all" on counseling for select
  using (student_id = auth.uid() or my_role() = 'counselor');
create policy "only counselor replies" on counseling for update
  using (my_role() = 'counselor');

create policy "everyone logged in reads announcements" on announcements for select
  using (auth.uid() is not null);
create policy "only faculty post announcements" on announcements for insert
  with check (my_role() in ('faculty', 'hod'));

-- Example query: students below 85% in a subject
-- select p.reg_no, p.name,
--        round(100.0 * count(*) filter (where a.present) / count(*), 1) as pct
-- from attendance a join profiles p on p.id = a.student_id
-- where a.subject = 'Digital Signal Processing'
-- group by p.reg_no, p.name
-- having 100.0 * count(*) filter (where a.present) / count(*) < 85
-- order by pct;
