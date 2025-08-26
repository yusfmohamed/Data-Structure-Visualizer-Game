(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const enqueueBtn = document.getElementById('enqueueBtn');
  const dequeueBtn = document.getElementById('dequeueBtn');
  const backBtn = document.getElementById('backBtn');
  const valueInput = document.getElementById('valueInput');

  const pushSound = document.getElementById('pushSound');
  const menuSound = document.getElementById('menuSound');

  const queue = [];
  const maxSize = 8;

  let animating = false;
  let animType = null;
  let animFrame = 0;
  let tempValue = "";

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawQueue();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawQueue() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const slotSize = canvas.width / (maxSize + 2);
    const startX = (canvas.width - (slotSize + 10) * maxSize) / 2;
    const startY = canvas.height / 2 - slotSize / 2;

    // Draw slots
    for (let i = 0; i < maxSize; i++) {
      ctx.strokeStyle = '#cba6f7';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX + i * (slotSize + 10), startY, slotSize, slotSize);
    }

    // Draw labels
    if (queue.length > 0) {
      ctx.fillStyle = "#f38ba8";
      ctx.font = `${Math.floor(slotSize/5)}px 'Press Start 2P'`;
      ctx.textAlign = "center";
      ctx.fillText("FRONT", startX + slotSize/2, startY - 15);

      ctx.fillStyle = "#89b4fa";
      ctx.fillText("REAR", startX + (queue.length - 1) * (slotSize+10) + slotSize/2, startY - 15);
    }

    // Draw elements
    ctx.fillStyle = '#89b4fa';
    ctx.font = `${Math.floor(slotSize/4)}px 'Press Start 2P'`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < queue.length; i++) {
      let x = startX + i * (slotSize + 10) + slotSize / 2;
      let y = startY + slotSize / 2;

      if (animating) {
        if (animType === "enqueue" && i === queue.length - 1) {
          y = startY - slotSize + animFrame * 5;
          if (y >= startY + slotSize / 2) animating = false;
        } else if (animType === "dequeue" && i === 0) {
          x = startX + slotSize / 2 - animFrame * 8;
          ctx.globalAlpha = Math.max(1 - animFrame * 0.05, 0);
          if (x < -50) {
            animating = false;
            ctx.globalAlpha = 1;
          }
        }
      }

      ctx.fillText(queue[i], x, y);
      ctx.globalAlpha = 1;
    }
  }

  function animate(type) {
    animType = type;
    animFrame = 0;
    animating = true;

    const interval = setInterval(() => {
      animFrame++;
      drawQueue();
      if (!animating) clearInterval(interval);
    }, 30);
  }

  function onEnqueue() {
    const value = valueInput.value.trim();
    if (!value || animating) return;

    if (queue.length < maxSize) {
      queue.push(value);
      pushSound.currentTime = 0;
      pushSound.play().catch(() => {});
      valueInput.value = '';
      animate("enqueue");
    }
    updateUI();
    drawQueue();
  }

  function onDequeue() {
    if (queue.length > 0 && !animating) {
      tempValue = queue.shift();
      pushSound.currentTime = 0;
      pushSound.play().catch(() => {});
      animate("dequeue");
    }
    updateUI();
    drawQueue();
  }

  function onBack() {
    menuSound.currentTime = 0;
    menuSound.play().catch(() => {});
    setTimeout(() => {
      window.location.href = "../screens/menu.html";
    }, 200);
  }

  function updateUI() {
    dequeueBtn.disabled = queue.length === 0;
    enqueueBtn.disabled = queue.length >= maxSize;
  }

  enqueueBtn.addEventListener('click', onEnqueue);
  dequeueBtn.addEventListener('click', onDequeue);
  backBtn.addEventListener('click', onBack);

  valueInput.addEventListener('keypress', e => {
    if (e.key === "Enter") onEnqueue();
  });

  drawQueue();
  updateUI();
})();
