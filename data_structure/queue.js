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

  function drawQueue() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw queue slots
    const slotWidth = 80;
    const slotHeight = 80;
    const startX = (canvas.width - (slotWidth + 10) * maxSize) / 2;
    const startY = canvas.height / 2 - slotHeight / 2;

    for (let i = 0; i < maxSize; i++) {
      ctx.strokeStyle = '#cba6f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX + i * (slotWidth + 10), startY, slotWidth, slotHeight);
    }

    // Draw elements
    ctx.fillStyle = '#89b4fa';
    ctx.font = '20px Minecraft';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < queue.length; i++) {
      const x = startX + i * (slotWidth + 10) + slotWidth / 2;
      const y = startY + slotHeight / 2;
      ctx.fillText(queue[i], x, y);
    }
  }

  function onEnqueue() {
    const value = valueInput.value.trim();
    if (!value) return;

    if (queue.length < maxSize) {
      queue.push(value);
      pushSound.currentTime = 0;
      pushSound.play().catch(() => {});
      valueInput.value = '';
    }

    updateUI();
    drawQueue();
  }

  function onDequeue() {
    if (queue.length > 0) {
      queue.shift();
    }
    updateUI();
    drawQueue();
  }

  function onBack() {
    menuSound.currentTime = 0;
    menuSound.play().catch(() => {});
    window.location.href = "../screens/menu.html"; // No alert
  }

  function updateUI() {
    dequeueBtn.disabled = queue.length === 0;
    enqueueBtn.disabled = queue.length >= maxSize;
  }

  // Initial setup
  enqueueBtn.addEventListener('click', onEnqueue);
  dequeueBtn.addEventListener('click', onDequeue);
  backBtn.addEventListener('click', onBack);

  drawQueue();
  updateUI();
})();
