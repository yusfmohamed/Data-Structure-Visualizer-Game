// Add click sound effect to buttons
const buttons = document.querySelectorAll(".menu-btn");
const clickSound = new Audio("assets/music/menu_button.mp3");

// Play sound when any button is clicked
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play();
  });
});

// Navigate to menu.html when Start is clicked
document.getElementById("start-btn").addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = "screens/menu.html";
  }, 300); // small delay to let sound play
});
