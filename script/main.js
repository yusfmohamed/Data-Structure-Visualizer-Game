// Sound for Start & About only
const clickSound = new Audio("../sfx/menu_button.mp3");
function playClick() {
  try {
    clickSound.currentTime = 0;
    clickSound.play();
  } catch (e) { /* ignore autoplay errors */ }
}

// Buttons
const startBtn = document.getElementById("start-btn");
const aboutBtn = document.getElementById("about-btn");
const mainExitBtn = document.getElementById("main-exit-btn");

// Modal elements
const aboutModal = document.getElementById("about-modal");
const modalClose = document.getElementById("modal-close");

// START: sound then navigate to menu
startBtn.addEventListener("click", () => {
  playClick();
  setTimeout(() => {
    window.location.href = "screens/menu.html";
  }, 300);
});

// ABOUT: sound then show modal with blur
aboutBtn.addEventListener("click", () => {
  playClick();
  setTimeout(() => {
    document.body.classList.add("modal-active");
    aboutModal.style.display = "block";
    aboutModal.setAttribute("aria-hidden", "false");
  }, 200);
});

// MAIN EXIT (in menu): navigate outside the website
mainExitBtn.addEventListener("click", () => {
  window.location.href = "https://www.google.com"; // change to your external target
});

// MODAL CLOSE (X): go to home page (index)
modalClose.addEventListener("click", () => {
  window.location.href = "index.html";
});
