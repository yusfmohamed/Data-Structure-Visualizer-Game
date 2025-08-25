// Stack data structure
const stack = [];
const stackContainer = document.getElementById("stack-container");
const input = document.getElementById("stack-input");
const pushSound = document.getElementById("pushSound");
const resetSound = document.getElementById("resetSound");

// Colors
const colors = ["#6a5acd", "#6BCB77", "#FF6B6B", "#FFD93D", "#4D96FF", "#FF914D"];
let colorIndex = 0;

// Push
function pushToStack() {
  const value = input.value.trim();
  if (value === "") {
    alert("Please enter a value!");
    return;
  }
  if (stack.length >= 8) {
    alert("Stack is full (max 8)!");
    return;
  }

  stack.push(value);

  const element = document.createElement("div");
  element.className = "stack-element push-animation";
  element.textContent = value;
  element.style.backgroundColor = colors[colorIndex % colors.length];
  colorIndex++;
  stackContainer.appendChild(element);

  pushSound.currentTime = 0;
  pushSound.play();

  input.value = "";
}

// Pop
function popFromStack() {
  if (stack.length === 0) {
    alert("Stack is empty!");
    return;
  }

  const topElement = stackContainer.lastElementChild;
  if (topElement) {
    topElement.classList.add("pop-animation");
    setTimeout(() => {
      stack.pop();
      topElement.remove();
    }, 400);
  }

  pushSound.currentTime = 0;
  pushSound.play();
}

// Reset
function resetStack() {
  stack.length = 0;
  stackContainer.innerHTML = "";
  colorIndex = 0;
  resetSound.currentTime = 0;
  resetSound.play();
}

// Back to Menu
function playMenuSoundAndGoBack() {
  const menuSound = document.getElementById("menuSound");
  menuSound.currentTime = 0;
  menuSound.play();
  setTimeout(() => {
    window.location.href = "../screens/menu.html";
  }, 200);
}

// Enter key = Push
document.addEventListener("DOMContentLoaded", () => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") pushToStack();
  });
});
