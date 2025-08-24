// ===== Utilities =====
function playSound(el) {
  if (!el) return;
  const a = el.cloneNode(true);
  a.volume = 1;
  a.play().catch(()=>{});
}

function $(id) { return document.getElementById(id); }

// ===== DOM refs =====
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const diskSelect = $('diskCount');
const speedSelect = $('speed');
const resetBtn = $('resetBtn');
const solveBtn = $('solveBtn');
const stepBtn = $('stepBtn');
const backBtn = $('backBtn');
const totalMovesEl = $('totalMoves');
const moveInfoEl = $('moveInfo');
const scoreVal = $('scoreVal');

const sndError = $('sndError');
const sndWin = $('sndWin');
const sndMove = $('sndMove');
const sndMenu = $('sndMenu');

// ===== Game State =====
const W = canvas.width;
const H = canvas.height;
const baseY = H - 50;
const pegHeight = 200;
const pegX = [W/4, W/2, (3*W)/4];
const pegWidth = 10;

let towers = [[],[],[]];   // top at end
let disks = [];            // stores width/height/color per disk number
let moves = [];
let currentMove = 0;
let animationInProgress = false;

let selectedDisk = null;
let selectedTower = null;

let highlightPegIndex = null;

let score = parseInt(localStorage.getItem('hanoiScore') || '0', 10);
scoreVal.textContent = score;

// ===== Drawing =====
function drawScene() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#001428';
  ctx.fillRect(0,0,W,H);

  ctx.strokeStyle = '#0b2e48';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  ctx.fillStyle = '#0be5e1';
  ctx.fillRect(100, baseY + 18, W - 200, 2);
  ctx.fillStyle = '#053244';
  ctx.fillRect(100, baseY, W - 200, 20);

  for (let i = 0; i < 3; i++) {
    const x = pegX[i];
    if (highlightPegIndex === i) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(x - (pegWidth/2 + 2), baseY - pegHeight, pegWidth + 4, pegHeight);
    }
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - pegWidth/2, baseY - pegHeight, pegWidth, pegHeight);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '12px Minecraft, monospace';

  // Draw each peg's stack from bottom to top
  for (let t = 0; t < 3; t++) {
    const stack = towers[t];
    for (let i = 0; i < stack.length; i++) {
      const diskNum = stack[i];
      const d = disks[diskNum - 1];
      const y = baseY - (i + 1) * d.height;
      const x = pegX[t];

      ctx.fillStyle = d.color;
      roundRect(ctx, x - d.width/2, y, d.width, d.height, 4);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#001018';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(diskNum), x, y + d.height/2);
    }
  }

  if (!towers[0].length && !towers[1].length && !towers[2].length) {
    ctx.fillStyle = '#5a7e8a';
    ctx.font = '24px Minecraft, monospace';
    ctx.fillText('EMPTY', W/2, H/2);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ===== Code Highlight =====
const codeLines = [...Array(7)].map((_,i)=>$('c'+i));
function clearHighlight(){ codeLines.forEach(c=>c.classList.remove('hl')); }
function highlight(line){ clearHighlight(); if(codeLines[line]) codeLines[line].classList.add('hl'); }

// ===== Setup / Reset =====
function resetGame() {
  animationInProgress = false;
  selectedDisk = null;
  selectedTower = null;
  highlightPegIndex = null;
  moves = [];
  currentMove = 0;

  const n = parseInt(diskSelect.value, 10);
  towers = [[],[],[]];

  const maxW = 180;
  const minW = 60;
  const h = 18;
  const step = n > 1 ? (maxW - minW) / (n - 1) : 0;
  const colors = ["#FF4B4B","#FFA52E","#F7F05A","#5AF76C","#4BA3FF","#7D4BFF","#D24BFF"];
  disks = [];
  for (let i=1;i<=n;i++){
    // Disk 1 should be smallest (minW), disk n should be largest (maxW)
    const width = n === 1 ? minW : minW + (i - 1) * step;
    disks.push({ width, height: h, color: colors[(i-1)%colors.length] });
  }
  
  // Start with largest disk (n) at bottom, smallest (1) at top
  for (let i = n; i >= 1; i--) {
    towers[0].push(i);
  }

  generateMoves(n, 0, 2, 1);

  totalMovesEl.textContent = `Total Moves Required: ${moves.length}`;
  moveInfoEl.textContent = `Move 0/${moves.length}`;
  clearHighlight();
  drawScene();
}

function generateMoves(n, source, target, auxiliary) {
  if (n === 1) { moves.push([source, target]); return; }
  generateMoves(n-1, source, auxiliary, target);
  moves.push([source, target]);
  generateMoves(n-1, auxiliary, target, source);
}

// ===== Interactions =====
canvas.addEventListener('click', (e)=>{
  if (animationInProgress) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;

  let peg = null;
  for (let i=0;i<3;i++){
    if (Math.abs(x - pegX[i]) < 60) { peg = i; break; }
  }
  if (peg === null) return;

  if (selectedDisk == null) {
    if (towers[peg].length > 0) {
      selectedDisk = towers[peg][towers[peg].length - 1];
      selectedTower = peg;
      highlightPegIndex = peg;
      drawScene();
    }
  } else {
    if (isValidMove(selectedDisk, peg)) {
      moveDisk(selectedTower, peg, true).then(()=>{
        if (checkWin()) onWin();
      });
    } else {
      playSound(sndError);
    }
    selectedDisk = null;
    highlightPegIndex = null;
    drawScene();
  }
});

function isValidMove(diskNum, targetPeg) {
  const stack = towers[targetPeg];
  if (stack.length === 0) return true;
  const top = stack[stack.length - 1];
  return diskNum < top;
}

function moveDisk(from, to, playMoveSnd=false) {
  return new Promise(resolve=>{
    if (towers[from].length === 0) return resolve();

    const diskNum = towers[from][towers[from].length - 1];
    const d = disks[diskNum - 1];

    animationInProgress = true;

    const startX = pegX[from];
    const startY = baseY - towers[from].length * d.height;
    const liftY = baseY - pegHeight - 10;
    const targetX = pegX[to];
    const finalY = baseY - (towers[to].length + 1) * d.height;

    const steps = 24;
    const speed = speedSelect.value;
    const stepDelay = (speed === 'slow') ? 20 : (speed === 'medium' ? 12 : 8);

    let sy = startY;
    let phase = 'lift';
    let count = 0;

    function drawMoving(xx, yy) {
      drawScene();
      ctx.fillStyle = d.color;
      roundRect(ctx, xx - d.width/2, yy, d.width, d.height, 4);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#001018';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Minecraft, monospace';
      ctx.fillText(String(diskNum), xx, yy + d.height/2);
    }

    function anim() {
      count++;
      if (phase === 'lift') {
        const dy = (sy - liftY) / steps;
        sy -= dy;
        drawMoving(startX, sy);
        if (count >= steps) { phase = 'side'; count = 0; }
        setTimeout(anim, stepDelay);
      } else if (phase === 'side') {
        const xx = startX + (targetX - startX) * (count / steps);
        drawMoving(xx, liftY);
        if (count >= steps) { phase = 'down'; count = 0; }
        setTimeout(anim, stepDelay);
      } else if (phase === 'down') {
        const yy = liftY + (finalY - liftY) * (count / steps);
        drawMoving(targetX, yy);
        if (count >= steps) {
          towers[from].pop();
          towers[to].push(diskNum);
          if (playMoveSnd) playSound(sndMove);
          animationInProgress = false;
          drawScene();
          resolve();
          return;
        }
        setTimeout(anim, stepDelay);
      }
    }
    anim();
  });
}

// ===== Control Buttons =====
resetBtn.addEventListener('click', ()=> {
  resetGame();
});

solveBtn.addEventListener('click', ()=>{
  if (animationInProgress) return;
  solveBtn.disabled = true;
  stepBtn.disabled = true;

  const speed = speedSelect.value;
  const moveDelay = (speed === 'slow') ? 700 : (speed === 'medium' ? 420 : 240);

  function next() {
    if (currentMove >= moves.length) {
      solveBtn.disabled = false;
      stepBtn.disabled = false;
      if (checkWin()) onWin();
      return;
    }
    const [from, to] = moves[currentMove];
    if (towerSize(from) === 1) highlight(2); else highlight(5);

    moveDisk(from, to, true).then(()=>{
      currentMove++;
      moveInfoEl.textContent = `Move ${currentMove}/${moves.length}`;
      setTimeout(next, moveDelay);
    });
  }
  next();
});

stepBtn.addEventListener('click', ()=>{
  if (animationInProgress) return;
  if (currentMove >= moves.length) return;
  const [from, to] = moves[currentMove];
  if (towerSize(from) === 1) highlight(2); else highlight(5);

  moveDisk(from, to, true).then(()=>{
    currentMove++;
    moveInfoEl.textContent = `Move ${currentMove}/${moves.length}`;
    if (checkWin()) onWin();
  });
});

function towerSize(idx){ return towers[idx].length; }

backBtn.addEventListener('click', ()=>{
  playSound(sndMenu);
  window.location.href = "../screens/menu.html";
});

// ===== Win / Points =====
function checkWin() {
  const n = parseInt(diskSelect.value, 10);
  return towers[2].length === n;
}

function onWin() {
  playSound(sndWin);
  const n = parseInt(diskSelect.value, 10);
  const level = n - 2;
  const gained = level * 5;

  score += gained;
  localStorage.setItem('hanoiScore', String(score));
  scoreVal.textContent = score;

  setTimeout(()=>{
    alert(`🎉 You solved Level ${level}! +${gained} points\nTotal Score: ${score}`);
  }, 50);
}

canvas.addEventListener('mousemove', ()=>{});

diskSelect.addEventListener('change', resetGame);
speedSelect.addEventListener('change', ()=>{});

resetGame();
drawScene();
