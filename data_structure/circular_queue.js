(() => {
  // ======== Audio ========
  const pushSound = new Audio("../sfx/push_button.mp3");
  const backButtonSound = new Audio("../sfx/menu_button.mp3");

  // ======== DOM ========
  const canvas = document.getElementById("queue-canvas");
  const ctx = canvas.getContext("2d");
  const infoBar = document.getElementById("info-bar");

  const valueInput = document.getElementById("value-input");
  const enqueueBtn = document.getElementById("enqueue-btn");
  const dequeueBtn = document.getElementById("dequeue-btn");
  const resetBtn = document.getElementById("reset-btn");
  const randomBtn = document.getElementById("random-btn");
  const speedRange = document.getElementById("speed-range");
  const speedLabel = document.getElementById("speed-label");
  const backBtn = document.getElementById("back-button");

  // ======== Queue State ========
  const MAX_SIZE = 8;
  const queue = new Array(MAX_SIZE).fill(null);
  let front = -1;
  let rear = -1;
  let animationSpeed = 0.5; // seconds

  // ======== Draw Settings ========
  const centerX = 350; // canvas width / 2
  const centerY = 180; // canvas height / 2
  const radius = 120;
  const nodeRadius = 26;

  const colors = {
    boundary: "#cba6f7",
    nodeEmpty: "#2a3043",
    nodeFilled: "#f38ba8",
    nodeFront: "#a6e3a1",
    nodeRear: "#fab387",
    nodeText: "#0b0f1a",
    text: "#ffffff",
  };

  // ======== Helpers ========
  const isEmpty = () => front === -1;
  const isFull = () => ((rear + 1) % MAX_SIZE) === front;

  function updateInfo() {
    const status = isEmpty()
      ? "Empty"
      : isFull()
      ? "Full"
      : "Available";
    infoBar.textContent = `Front: ${front} | Rear: ${rear} | Status: ${status}`;
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawQueue() {
    clearCanvas();

    // Outer circle (boundary)
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.boundary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Nodes
    for (let i = 0; i < MAX_SIZE; i++) {
      const angle = (2 * Math.PI * i) / MAX_SIZE - Math.PI / 2;
      const nodeX = centerX + (radius - nodeRadius) * Math.cos(angle);
      const nodeY = centerY + (radius - nodeRadius) * Math.sin(angle);

      // Determine node color
      let fill = queue[i] === null ? colors.nodeEmpty : colors.nodeFilled;
      if (i === front && i === rear && front !== -1) fill = colors.boundary;
      else if (i === front && front !== -1) fill = colors.nodeFront;
      else if (i === rear && rear !== -1) fill = colors.nodeRear;

      // Node circle
      ctx.beginPath();
      ctx.fillStyle = fill;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Index text
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px Minecraft, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`[${i}]`, nodeX, nodeY + nodeRadius + 6);

      // Value text
      if (queue[i] !== null) {
        ctx.fillStyle = colors.nodeText;
        ctx.font = "bold 14px Minecraft, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(String(queue[i]), nodeX, nodeY);
      }
    }

    // Front/Rear labels
    if (front !== -1) {
      const fa = (2 * Math.PI * front) / MAX_SIZE - Math.PI / 2;
      const fx = centerX + (radius + 18) * Math.cos(fa);
      const fy = centerY + (radius + 18) * Math.sin(fa);
      labelText("FRONT", fx, fy, colors.nodeFront);
    }
    if (rear !== -1) {
      const ra = (2 * Math.PI * rear) / MAX_SIZE - Math.PI / 2;
      const rx = centerX + (radius + 18) * Math.cos(ra);
      const ry = centerY + (radius + 18) * Math.sin(ra);
      labelText("REAR", rx, ry, colors.nodeRear);
    }

    updateInfo();
  }

  function labelText(text, x, y, color) {
    ctx.save();
    ctx.font = "bold 12px Minecraft, sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function flashOverlay(color) {
    const start = performance.now();
    const duration = animationSpeed * 300; // ms

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const alpha = 0.35 * (1 - t);
      clearCanvas();
      drawQueue();
      ctx.save();
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function hexToRgba(hex, a = 1) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return `rgba(255,255,255,${a})`;
    const [_, r, g, b] = m;
    return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${a})`;
  }

  // ======== Ops ========
  function enqueue() {
    const val = valueInput.value.trim();
    if (!val || isFull()) return; // skip if empty or full
    if (isEmpty()) {
      front = 0;
      rear = 0;
    } else {
      rear = (rear + 1) % MAX_SIZE;
    }
    queue[rear] = val;
    valueInput.value = "";
    flashOverlay(colors.nodeRear);
    drawQueue();
  }

  function dequeue() {
    if (isEmpty()) return; // skip if empty
    if (front === rear) {
      queue[front] = null;
      front = -1;
      rear = -1;
    } else {
      queue[front] = null;
      front = (front + 1) % MAX_SIZE;
    }
    flashOverlay(colors.nodeFront);
    drawQueue();
  }

  function reset() {
    for (let i = 0; i < MAX_SIZE; i++) queue[i] = null;
    front = -1;
    rear = -1;
    drawQueue();
  }

  function randomFill() {
    reset();
    const n = Math.floor(Math.random() * (MAX_SIZE - 3)) + 3; // 3..MAX-1
    front = 0;
    rear = -1;
    for (let i = 0; i < n; i++) {
      rear = (rear + 1) % MAX_SIZE;
      queue[rear] = Math.floor(Math.random() * 99) + 1;
    }
    drawQueue();
  }

  // ======== Events ========
  enqueueBtn.addEventListener("click", () => { pushSound.currentTime = 0; pushSound.play(); enqueue(); });
  dequeueBtn.addEventListener("click", () => { pushSound.currentTime = 0; pushSound.play(); dequeue(); });
  resetBtn.addEventListener("click",   () => { pushSound.currentTime = 0; pushSound.play(); reset(); });
  randomBtn.addEventListener("click",  () => { pushSound.currentTime = 0; pushSound.play(); randomFill(); });

  speedRange.addEventListener("input", (e) => {
    animationSpeed = Number(e.target.value);
    speedLabel.textContent = `${animationSpeed.toFixed(1)}s`;
  });

  // ===== Back Button Navigation with Sound =====
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      backButtonSound.currentTime = 0;
      backButtonSound.play();
      setTimeout(() => {
        window.location.href = "../screens/menu.html";
      }, 200); // delay to let sound play
    });
  }

  // ===== Button Panel Vertical Position Adjustment =====
  const buttonPanel = document.getElementById("button-panel");
  if (buttonPanel) {
    buttonPanel.style.position = "absolute";
    buttonPanel.style.left = "50%";
    buttonPanel.style.top = "50%";
    buttonPanel.style.transform = "translate(-50%, -50%)";
    const yOffset = 40; // adjust as needed
    buttonPanel.style.top = `calc(50% + ${yOffset}px)`;
  }

  // Enter to enqueue
  valueInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      pushSound.currentTime = 0; pushSound.play();
      enqueue();
    }
  });

  // Initial draw
  drawQueue();
})();
