function openLogin() {
  $("loginUser").value = "";
  $("loginPass").value = "";
  $("loginErr").textContent = "";
  $("loginOverlay").classList.add("show");
  setTimeout(() => $("loginUser").focus(), 50);
}

function closeLogin() { $("loginOverlay").classList.remove("show"); }

async function tryLogin() {
  const u = $("loginUser").value.trim();
  const p = $("loginPass").value;
  if (u === CONFIG.ADMIN_LOGIN && p === CONFIG.ADMIN_PASS) {
    const submitBtn = $("loginSubmit");
    if (typeof initialSyncPromise !== "undefined" && initialSyncPromise) {
      if (submitBtn) submitBtn.disabled = true;
      try { await initialSyncPromise; } catch (e) { /* ignore */ }
      if (submitBtn) submitBtn.disabled = false;
    }
    isAdmin = true;
    closeLogin();
    draft = cloneState();
    clearDirty();
    startAutosaveTimer();
    toggleAdminMode();
  } else {
    $("loginErr").textContent = "Неверный логин или пароль.";
  }
}
