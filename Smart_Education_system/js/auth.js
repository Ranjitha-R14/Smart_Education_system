// ============ auth.js — the guard ============
// After login: send the user to the right side based on role
async function redirectByRole() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile && profile.role === "student")       location.href = "student/dashboard.html";
  else if (profile && profile.role === "counselor") location.href = "counselor/inbox.html";
  else                                              location.href = "faculty/dashboard.html"; // faculty + HOD
}

// Call at the top of every protected page:  await requireRole(["student"])
async function requireRole(allowed) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { location.href = "../index.html"; return null; }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, reg_no, class_name")
    .eq("id", user.id)
    .single();

  if (!profile || !allowed.includes(profile.role)) {
    location.href = "../index.html";
    return null;
  }
  return profile;
}

// Logout button (works on any element with class "logout-btn")
function attachLogout() {
  document.querySelectorAll(".logout-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      location.href = "../index.html";
    })
  );
}