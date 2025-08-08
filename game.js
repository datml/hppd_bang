const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = true;
let paused = false;
let score = 0;
let speed = 3;
let cakesToNextWish = 2; // Số bánh cần hứng để hiện lời chúc

const plate = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 60,
  width: 100,
  height: 20,
  speed: 8
};

let cakes = [];
const wishes = [
  "🌟 Tuổi mới thật rực rỡ và nhiều niềm vui!",
  "🎓 Học hành tấn tới, mọi việc như ý!",
  "💖 Mỗi ngày đều có người yêu thương bên cạnh!",
  "🎉 Một năm sinh nhật đầy kỷ niệm đẹp!"
];

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function createCake() {
  const cakeTypes = ['🎂', '🍰', '🧁', '🍪'];
  return {
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 40,
    type: cakeTypes[Math.floor(Math.random() * cakeTypes.length)],
    speed: speed + Math.random() * 2
  };
}

function drawPlate() {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(plate.x + 5, plate.y + 5, plate.width, plate.height);
  const grad = ctx.createLinearGradient(plate.x, plate.y, plate.x, plate.y + plate.height);
  grad.addColorStop(0, "#ff9800");
  grad.addColorStop(1, "#f57c00");
  ctx.fillStyle = grad;
  ctx.fillRect(plate.x, plate.y, plate.width, plate.height);
  ctx.strokeStyle = "#e65100";
  ctx.lineWidth = 3;
  ctx.strokeRect(plate.x, plate.y, plate.width, plate.height);
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(plate.x + plate.width, plate.y + 5, 15, 10);
}

function drawCakes() {
  cakes.forEach(cake => {
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.fillText(cake.type, cake.x + cake.width / 2, cake.y + cake.height - 5);
    ctx.fillStyle = "rgba(255,215,0,0.8)";
    ctx.beginPath();
    ctx.arc(cake.x + cake.width - 5, cake.y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBackground() {
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 3; i++) {
    const cloudX = (Date.now() * 0.01 + i * 250) % (canvas.width + 100);
    drawCloud(cloudX, 50 + i * 30);
  }
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
  ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function updatePlate() {
  if (paused) {
    // Nếu game đang pause, ấn phím CÁCH sẽ tiếp tục game
    if (keys[' ']) {  // Phím cách
      paused = false;
      document.getElementById("wishBox").style.display = "none";
    }
    return;
  }
  
  if (keys['a'] || keys['arrowleft']) plate.x = Math.max(0, plate.x - plate.speed);
  if (keys['d'] || keys['arrowright']) plate.x = Math.min(canvas.width - plate.width, plate.x + plate.speed);
}

function updateCakes() {
  if (paused) return;
  
  cakes.forEach(cake => cake.y += cake.speed);
  cakes = cakes.filter(cake => cake.y < canvas.height + 50);
  cakes.forEach((cake, i) => {
    if (cake.x < plate.x + plate.width &&
        cake.x + cake.width > plate.x &&
        cake.y < plate.y + plate.height &&
        cake.y + cake.height > plate.y) {
      score++;
      document.getElementById('score').textContent = score;
      cakes.splice(i, 1);
      playEatSound();
      speed += 0.5;
      
      // Kiểm tra nếu đã hứng đủ bánh để hiện lời chúc
      if (score % cakesToNextWish === 0) {
        showWish(Math.floor(score / cakesToNextWish) - 1);
        paused = true;
      }
      
      if (score >= wishes.length * cakesToNextWish) {
        celebrate();
        gameRunning = false;
      }
    }
  });
  if (Math.random() < 0.02) cakes.push(createCake());
}

function showWish(idx) {
  if (idx < wishes.length) {
    const popup = document.getElementById("popupWish");
    const overlay = document.getElementById("wishOverlay");
    
    popup.innerHTML = wishes[idx] + '<div class="continue-hint">Nhấn PHÍM CÁCH để tiếp tục</div>';
    popup.style.display = "block";
    overlay.style.display = "block";
    
    // Tạm dừng game
    paused = true;
    
    // Xử lý khi ấn phím CÁCH để tiếp tục
    const continueHandler = (e) => {
      if (e.key === ' ') {  // Chỉ kiểm tra phím cách
        popup.style.display = "none";
        overlay.style.display = "none";
        paused = false;
        document.removeEventListener('keydown', continueHandler);
      }
    };
    
    document.addEventListener('keydown', continueHandler);
  }
}

function celebrate() {
  
  document.getElementById("wishBox").style.display = "none";
  document.getElementById("celebration").style.display = "flex";
  document.getElementById("restartBtn").style.display = "inline-block";
  launchConfetti();
}

function launchConfetti() {
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const conf = document.createElement("div");
      conf.className = "confetti-piece";
      const colors = ["#f06292", "#ba68c8", "#4dd0e1", "#81c784", "#ffd54f", "#ff8a65"];
      const shapes = ["🎈", "🎉", "⭐", "💖", "🌸"];
      if (Math.random() > 0.5) {
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.borderRadius = "50%";
      } else {
        conf.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
        conf.style.fontSize = "20px";
      }
      conf.style.left = `${Math.random() * window.innerWidth}px`;
      conf.style.top = `-20px`;
      conf.style.animation = `confetti ${Math.random() * 3 + 2}s linear forwards`;
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 5000);
    }, i * 50);
  }
}

function gameLoop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  updatePlate();
  updateCakes();
  drawPlate();
  drawCakes();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameRunning = true;
  paused = false;
  score = 0;
  speed = 3;
  cakes = [];
  plate.x = canvas.width / 2 - 50;
  document.getElementById('score').textContent = '0';
    document.getElementById("popupWish").style.display = "none";
  document.getElementById("wishOverlay").style.display = "none";
 
  document.getElementById("celebration").style.display = "none";
  document.getElementById("restartBtn").style.display = "none";
  document.body.style.background = "linear-gradient(135deg, #fce4ec, #f8bbd9)";
  document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
  gameLoop();
}

function playEatSound() {
  const s = document.getElementById("eatSound");
  s.currentTime = 0;
  s.play().catch(() => {});
}

function toggleMusic() {
  const m = document.getElementById("bgMusic");
  const b = document.getElementById("toggleMusicBtn");
  if (m.paused) {
    m.play().catch(() => {});
    b.textContent = "🎵 Tắt nhạc";
  } else {
    m.pause();
    b.textContent = "🎵 Bật nhạc";
  }
}

window.onload = () => {
  document.getElementById("totalCakes").textContent = wishes.length * cakesToNextWish;
  const m = document.getElementById("bgMusic");
  m.volume = 0.3;
  m.play().catch(err => console.log("Auto-play blocked."));
  gameLoop();
};
