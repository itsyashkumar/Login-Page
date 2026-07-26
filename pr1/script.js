const switchButtons = document.querySelectorAll('.switch-button');
const forms = document.querySelectorAll('.auth-form');
const messageBox = document.getElementById('messageBox');
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const authCard = document.querySelector('.auth-card');

let stars = [];
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false, paused: false };

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message-box';
}

function setActiveMode(mode) {
  switchButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });

  forms.forEach((form) => {
    form.classList.toggle('active-form', form.id === `${mode}Form`);
  });

  clearMessage();
}

function isStrongPassword(password) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
}

function pauseStars() {
  pointer.paused = true;
}

function resumeStars() {
  pointer.paused = false;
}

function createStars() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const count = Math.min(140, Math.max(70, Math.floor((width * height) / 14000)));

  stars = Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;

    return {
      x,
      y,
      baseX: x,
      baseY: y,
      size: Math.random() * 1.3 + 0.3,
      driftX: (Math.random() - 0.5) * 0.035,
      driftY: (Math.random() - 0.5) * 0.035,
      twinkle: Math.random() * Math.PI * 2,
      hue: 200 + Math.random() * 30
    };
  });
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createStars();
}

function animate(now = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);

  stars.forEach((star) => {
    if (!pointer.paused) {
      const dx = star.x - pointer.x;
      const dy = star.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      const influence = pointer.active ? Math.max(0, 1 - dist / 220) : 0;
      const repelX = (dx / dist) * influence * 6;
      const repelY = (dy / dist) * influence * 6;
      const returnX = (star.baseX - star.x) * 0.01;
      const returnY = (star.baseY - star.y) * 0.01;

      star.x += star.driftX + repelX + returnX;
      star.y += star.driftY + repelY + returnY;
    } else {
      star.x += star.driftX;
      star.y += star.driftY;
      star.x += (star.baseX - star.x) * 0.02;
      star.y += (star.baseY - star.y) * 0.02;
    }

    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;

    const pulse = 0.7 + 0.3 * Math.sin(now / 800 + star.twinkle);
    const opacity = 0.2 + pulse * 0.35;
    const radius = star.size * (0.8 + pulse * 0.35);

    ctx.beginPath();
    ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `hsla(${star.hue}, 100%, 80%, 0.45)`;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

switchButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveMode(button.dataset.mode);
  });
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showMessage('Please enter both username and password.', 'error');
    return;
  }

  const storedUser = localStorage.getItem('signedUpUser');
  const storedPassword = localStorage.getItem('signedUpPassword');

  if (storedUser && storedPassword && username === storedUser && password === storedPassword) {
    showMessage('You logged in successfully!', 'success');
  } else {
    showMessage('Invalid username or password.', 'error');
  }
});

document.getElementById('signupForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!username) {
    showMessage('Please enter a username.', 'error');
    return;
  }

  if (!isStrongPassword(password)) {
    showMessage('Password must be at least 8 characters, include one uppercase letter, one number, and one special character.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  localStorage.setItem('signedUpUser', username);
  localStorage.setItem('signedUpPassword', password);

  showMessage('Account created successfully! You can now log in.', 'success');
  this.reset();
  setActiveMode('login');
});

authCard.addEventListener('mouseenter', pauseStars);
authCard.addEventListener('mouseleave', resumeStars);

authCard.addEventListener('focusin', pauseStars);
authCard.addEventListener('focusout', resumeStars);

window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});
window.addEventListener('pointerleave', () => {
  pointer.active = false;
  resumeStars();
});

document.addEventListener('mouseleave', () => {
  pointer.active = false;
  resumeStars();
});

resizeCanvas();
requestAnimationFrame(animate);
setActiveMode('login');
