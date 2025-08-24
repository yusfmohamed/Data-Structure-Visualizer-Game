// Stack data structure and logic
const stack = [];
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("darkModeToggle");

  // Load from localStorage
  const currentMode = localStorage.getItem("theme") || "dark";
  if (currentMode === "light") {
    document.body.classList.add("light-mode");
    toggle.textContent = "🌙 Dark Mode";
  } else {
    document.body.classList.remove("light-mode");
    toggle.textContent = "☀️ Light Mode";
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    toggle.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
});
// Get DOM elements
const input = document.getElementById("stack-input");
const stackContainer = document.getElementById("stack-container");
const pushSound = document.getElementById("pushSound"); // sound for push/pop

// Update the visual representation of the stack
function updateStackView() {
  stackContainer.innerHTML = "";
  
  // Create elements for each item in stack
  stack.forEach((value) => {
    const element = document.createElement("div");
    element.className = "stack-element";
    element.textContent = value;
    stackContainer.appendChild(element);
  });
}

// Push operation with animation
function pushToStack() {
  const value = input.value.trim();
  
  if (value === "") {
    alert("Please enter a value to push!");
    input.focus();
    return;
  }
  
  if (stack.length >= 8) {
    alert("Stack is full! Maximum 8 elements allowed.");
    return;
  }

  // Play push sound
  pushSound.currentTime = 0;
  pushSound.play();

  // Add to stack array
  stack.push(value);
  
  // Create new element with push animation
  const element = document.createElement("div");
  element.className = "stack-element push-animation";
  element.textContent = value;
  stackContainer.appendChild(element);
  
  // Clear input and focus
  input.value = "";
  input.focus();
  
  // Remove animation class after animation completes
  setTimeout(() => {
    element.classList.remove("push-animation");
  }, 500);
}

// Pop operation with animation
function popFromStack() {
  if (stack.length === 0) {
    alert("Stack is empty! Nothing to pop.");
    return;
  }

  // Play pop sound (same as push sound)
  pushSound.currentTime = 0;
  pushSound.play();

  // Get the top element (last child)
  const topElement = stackContainer.lastElementChild;
  
  if (topElement) {
    // Add pop animation
    topElement.classList.add("pop-animation");
    
    // Remove from array and DOM after animation
    setTimeout(() => {
      const poppedValue = stack.pop();
      stackContainer.removeChild(topElement);
      console.log(`Popped: ${poppedValue}`);
    }, 400);
  }
}

// Reset stack
function resetStack() {
  if (stack.length === 0) {
    return;
  }
  
  if (confirm("Are you sure you want to clear the entire stack?")) {
    stack.length = 0;
    stackContainer.innerHTML = "";
  }
}

// Handle Enter key in input for quick push
document.addEventListener("DOMContentLoaded", () => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      pushToStack();
    }
  });
  input.focus();
});
