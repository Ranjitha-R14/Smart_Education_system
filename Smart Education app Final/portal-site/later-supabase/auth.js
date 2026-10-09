// ============ auth.js — Supabase version of the guard (NOT USED IN THE DEMO YET) ============
// When you move to Supabase, these replace login()/requireRole()/logout() in js/app.js.
// Paths below match the new folder layout (student/, faculty/).

async function redirectByRole() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();

  if (profile && profile.role === "student") location.href = "student/dashboard.html";
  else if (profile && (profile.role === "faculty" || profile.role === "hod" || profile.role === "counselor"))
    location.href = "faculty/index.html";
  else location.href = "index.html"; // unknown role: do not let them in
}

// Call at the top of every protected page:  await requireRoleSB(["student"])
async function requireRoleSB(allowed) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { location.href = "../login.html"; return null; }
  const { data: profile } = await sb.from("profiles")
    .select("role, name, reg_no, class_name").eq("id", user.id).single();
  if (!profile || !allowed.includes(profile.role)) { location.href = "../login.html"; return null; }
  return profile;
}

async function logoutSB() {
  await sb.auth.signOut();
  location.href = "../index.html";
}
// IMPORTANT: page guards only hide pages. Real protection comes from Row Level Security
// policies on every table (students read only their own attendance, doubts table has
// no student id column, counseling rows readable only by sender + counselor).

// Change password with Supabase Auth (replaces changePassword() in js/app.js).
// Signing in again with the old password proves the person at the keyboard knows it.
async function changePasswordSB(oldPw, newPw) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, message: "Please log in again." };
  const { error: wrong } = await sb.auth.signInWithPassword({ email: user.email, password: oldPw });
  if (wrong) return { ok: false, message: "Your current password is not correct." };
  const { error } = await sb.auth.updateUser({ password: newPw });
  return error ? { ok: false, message: error.message } : { ok: true, message: "Password changed." };
}
// Forgotten password: sb.auth.resetPasswordForEmail(email) sends a reset link by email.
