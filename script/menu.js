// Load click sound
const clickSound = new Audio("../sfx/menu_button.mp3");

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play().catch(err => {
    console.warn("Audio play failed:", err);
  });
}

// Attach navigation + sound to all menu buttons
document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    playClick(); // play sound first
    const target = btn.getAttribute("data-target") || "";

    // Always navigate under ../screens/
    const url = target.startsWith("../screens/")
      ? target
      : `../screens/${target}`;

    // Add slight delay so sound plays before navigating
    setTimeout(() => {
      window.location.href = url;
    }, 200);
  });

  // Keyboard accessibility
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

// Back link (⟵ Back) also with sound
const backLink = document.querySelector(".menu-link");
if (backLink) {
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    playClick();
    setTimeout(() => {
      window.location.href = backLink.href;
    }, 200);
  });
}
