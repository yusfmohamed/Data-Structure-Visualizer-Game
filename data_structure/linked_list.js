// ===== Linked List Core =====
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }

  insert_end(data) {
    const n = new Node(data);
    if (!this.head) { this.head = n; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = n;
  }

  delete(data) {
    let cur = this.head, prev = null;
    while (cur) {
      if (cur.data === data) {
        if (prev) prev.next = cur.next;
        else this.head = cur.next;
        return true;
      }
      prev = cur;
      cur = cur.next;
    }
    return false;
  }

  to_list() {
    const out = [];
    let cur = this.head;
    while (cur) { out.push(cur.data); cur = cur.next; }
    return out;
  }

  clear() { this.head = null; }
}

// ===== UI / Audio =====
const canvas = document.getElementById('llCanvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('nodeInput');
const insertBtn = document.getElementById('insertBtn');
const deleteBtn = document.getElementById('deleteBtn');
const resetBtn  = document.getElementById('resetBtn');
const backBtn   = document.getElementById('backBtn');

const sndInsert = document.getElementById('sndInsert');
const sndDelete = document.getElementById('sndDelete');
const sndMenu   = document.getElementById('sndMenu');

function playSound(el) {
  // Clone to allow overlapping playback
  if (!el) return;
  const clone = el.cloneNode(true);
  clone.volume = 1.0;
  clone.play().catch(() => {});
}

// ===== Visuals =====
const W = canvas.width;
const H = canvas.height;

const COLORS = {
  grid: '#1A1A3A',
  node: '#4040FF',
  outline: '#00FFFF',
  shade: '#000080',
  text: '#FFFFFF',
  empty: '#444444',
  arrow: '#00FFFF'
};

const ll = new LinkedList();

let flashTimer = 0;       // time remaining for insert flash (ms)
const FLASH_DURATION = 600; // total duration

function drawGrid() {
  ctx.save();
  ctx.clearRect(0,0,W,H);
  // grid vertical
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  // grid horizontal
  for (let y = 0; y < H; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEmpty() {
  ctx.save();
  ctx.fillStyle = COLORS.empty;
  ctx.font = '24px Minecraft, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMPTY LIST', W/2, H/2);
  ctx.restore();
}

function drawList() {
  const nodes = ll.to_list();
  if (!nodes.length) { drawEmpty(); return; }

  let x = 20;
  for (let i = 0; i < nodes.length; i++) {
    const data = nodes[i];
    const isLast = i === nodes.length - 1;

    const w = 80, h = 80, y = 100;

    // Flash effect for last node on recent insert
    let fill = COLORS.node;
    if (isLast && flashTimer > 0) {
      const t = (Math.sin((1 - flashTimer / FLASH_DURATION) * Math.PI * 6) + 1) / 2; // 3 flashes
      // Interpolate between node color and bright green
      fill = mixColor(COLORS.node, '#00FF00', t);
    }

    // Node box
    ctx.save();
    roundRect(ctx, x, y, w, h, 6);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.outline;
    ctx.stroke();

    // 3D shading
    ctx.beginPath();
    ctx.moveTo(x+3, y+h-3);
    ctx.lineTo(x+w-3, y+h-3);
    ctx.strokeStyle = COLORS.shade;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x+w-3, y+3);
    ctx.lineTo(x+w-3, y+h-3);
    ctx.stroke();

    // Text
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Minecraft, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(data), x + w/2, y + h/2);
    ctx.restore();

    // Arrow to next
    if (i < nodes.length - 1) {
      const ax1 = x + w;
      const ax2 = x + w + 20;
      const ay = y + h/2;
      ctx.save();
      ctx.strokeStyle = COLORS.arrow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax1, ay);
      ctx.lineTo(ax2, ay);
      ctx.stroke();

      // arrow head
      ctx.fillStyle = COLORS.arrow;
      ctx.beginPath();
      ctx.moveTo(ax2 - 5, ay - 5);
      ctx.lineTo(ax2, ay);
      ctx.lineTo(ax2 - 5, ay + 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    x += 100;
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

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [0,0,0];
}

function rgbToHex(r,g,b) {
  const to2 = v => v.toString(16).padStart(2,'0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function mixColor(a, b, t) {
  const [ar,ag,ab] = hexToRgb(a);
  const [br,bg,bb] = hexToRgb(b);
  const r = Math.round(ar + (br-ar)*t);
  const g = Math.round(ag + (bg-ag)*t);
  const b2 = Math.round(ab + (bb-ab)*t);
  return rgbToHex(r,g,b2);
}

function render() {
  drawGrid();
  drawList();
  requestAnimationFrame(render);
}

// ===== Events =====
insertBtn.addEventListener('click', () => {
  const v = input.value.trim();
  if (!v) return;
  ll.insert_end(v);
  input.value = '';
  flashTimer = FLASH_DURATION;
  playSound(sndInsert);
});

deleteBtn.addEventListener('click', () => {
  const v = input.value.trim();
  if (!v) return;
  const ok = ll.delete(v);
  if (!ok) {
    // Browser alert to mimic messagebox; can be replaced by custom modal
    alert(`Value '${v}' not found in list.`);
  }
  playSound(sndDelete);
});

resetBtn.addEventListener('click', () => {
  ll.clear();
  playSound(sndInsert);
});

// Back button (navigate to your menu.html if present)
backBtn.addEventListener('click', () => {
  playSound(sndMenu);
  // Change this path to your actual menu route if needed:
  window.location.href = "../screens/menu.html";
});

// Reduce flash timer over time
let last = performance.now();
function tick(now) {
  const dt = now - last;
  last = now;
  if (flashTimer > 0) {
    flashTimer = Math.max(0, flashTimer - dt);
  }
  requestAnimationFrame(tick);
}

// Start loops
render();
requestAnimationFrame(tick);

// Allow pressing Enter to insert
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') insertBtn.click();
});
