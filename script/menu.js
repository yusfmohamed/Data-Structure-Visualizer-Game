// Attach navigation to all menu buttons
document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target") || "";
    // Always navigate under ../screens/
    const url = target.startsWith("../screens/")
      ? target
      : `../screens/${target}`;
    window.location.href = url;
  });
});

// Keyboard accessibility
document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});
