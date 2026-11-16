function openLogin() {
  $("loginUser").value = "";
  $("loginPass").value = "";
  $("loginErr").textContent = "";
  $("loginOverlay").classList.add("show");
  setTimeout(() => $("loginUser").focus(), 50);
}

function closeLogin() { $("loginOverlay").classList.remove("show"); }

function tryLogin() {
  const u = $("loginUser").value.trim();
  const p = $("loginPass").value;
  if (u === CONFIG.ADMIN_LOGIN && p === CONFIG.ADMIN_PASS) {
    isAdmin = true;
    closeLogin();
    draft = cloneState();
    clearDirty();
    toggleAdminMode();
  } else {
    $("loginErr").textContent = "Неверный логин или пароль.";
  }
}
