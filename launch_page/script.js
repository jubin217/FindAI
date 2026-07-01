(function() {
  // 1. DOM Elements & Constants
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  const animationSection = document.querySelector('.animation-section');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  const TOTAL_FRAMES = 240;
  const frames = [];
  let loadedCount = 0;

  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  // Disable scroll on body & html while loading
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  // 2. High-DPI Canvas Setup for Robot scroll frames (Pure Black)
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    updateFrame();
  }

  function updateLoadingProgress() {
    loadedCount++;
    const percent = Math.min(Math.floor((loadedCount / TOTAL_FRAMES) * 100), 100);
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';

    if (loadedCount >= TOTAL_FRAMES) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        
        // Calibrate canvas size, WebGL, and reveals
        resizeCanvas();
        initWebGLBackground();
        initScrollReveals();
      }, 500);
    }
  }

  // Preload frames from robot_frames
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const frameNum = String(i).padStart(3, '0');
    const preImg = new Image();
    preImg.onload = updateLoadingProgress;
    preImg.onerror = updateLoadingProgress; // fallback
    preImg.src = `robot_frames/ezgif-frame-${frameNum}.jpg`;
    frames.push(preImg);
  }

  function updateFrame() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxAnimScroll = animationSection.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / maxAnimScroll, 0), 1);
    
    const frameIdx = Math.floor(progress * (TOTAL_FRAMES - 1));
    const activeFrame = frames[frameIdx];

    if (activeFrame && activeFrame.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const imgWidth = activeFrame.naturalWidth || activeFrame.width;
      const imgHeight = activeFrame.naturalHeight || activeFrame.height;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(activeFrame, drawX, drawY, drawWidth, drawHeight);
    }
  }

  // 3. Modern Interactive WebGL 3D Background (Three.js Shaded Shapes + Spotlight)
  let scene, camera, renderer;
  let mainTorusKnot, pointLight;
  const floatingShapes = [];
  let targetLightX = 0;
  let targetLightY = 0;
  let currentLightX = 0;
  let currentLightY = 0;

  function initWebGLBackground() {
    const bgContainer = document.getElementById('webgl-bg');
    if (!bgContainer || typeof THREE === 'undefined') return;

    // Create scene, camera, and transparent WebGL renderer
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(65, bgContainer.clientWidth / bgContainer.clientHeight, 1, 1000);
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(bgContainer.clientWidth, bgContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgContainer.appendChild(renderer.domElement);

    // Dynamic 3D lighting: ambient purple backdrop + hover point light
    const ambientLight = new THREE.AmbientLight('#1d113b', 1.5);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight('#6366f1', 4, 500);
    pointLight.position.set(0, 0, 120);
    scene.add(pointLight);

    // Central Core: Glowing metallic 3D Torus Knot
    const torusGeom = new THREE.TorusKnotGeometry(16, 5, 120, 16);
    const torusMat = new THREE.MeshStandardMaterial({
      color: '#a855f7',
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true
    });
    mainTorusKnot = new THREE.Mesh(torusGeom, torusMat);
    mainTorusKnot.position.set(0, 0, 0);
    scene.add(mainTorusKnot);

    // Floating 3D Geometric mesh elements with glossy glass/metallic material
    const geometries = [
      new THREE.TorusGeometry(10, 3, 16, 100),
      new THREE.BoxGeometry(15, 15, 15),
      new THREE.ConeGeometry(10, 20, 4),
      new THREE.OctahedronGeometry(12)
    ];

    for (let i = 0; i < 6; i++) {
      const geom = geometries[i % geometries.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? '#6366f1' : '#a855f7',
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe: i % 3 === 0
      });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Position them throughout the landing space
      mesh.position.set(
        (Math.random() - 0.5) * 350,
        (Math.random() - 0.5) * 350 - 50,
        (Math.random() - 0.5) * 120 - 40
      );
      
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      
      floatingShapes.push({
        mesh: mesh,
        rotSpeedX: 0.004 + Math.random() * 0.006,
        rotSpeedY: 0.004 + Math.random() * 0.006,
        parallaxFactor: 0.15 + Math.random() * 0.25
      });
    }

    animateWebGL();
  }

  function animateWebGL() {
    requestAnimationFrame(animateWebGL);

    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Rotate main core torus based on scroll and time
    if (mainTorusKnot) {
      mainTorusKnot.rotation.y = Date.now() * 0.00025 + scrollTop * 0.0005;
      mainTorusKnot.rotation.x = Date.now() * 0.00015 + scrollTop * 0.0003;
      
      // Pulsate scale slightly
      const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
      mainTorusKnot.scale.set(scale, scale, scale);
    }

    // Rotate and animate floating background mesh objects
    floatingShapes.forEach(item => {
      item.mesh.rotation.x += item.rotSpeedX;
      item.mesh.rotation.y += item.rotSpeedY;
      
      // Vertical scroll 3D parallax
      item.mesh.position.y += (scrollTop * 0.05 * item.parallaxFactor - item.mesh.position.y) * 0.05;
    });

    // Smooth light coordinate interpolation (specular lighting highlights)
    currentLightX += (targetLightX - currentLightX) * 0.05;
    currentLightY += (targetLightY - currentLightY) * 0.05;
    
    if (pointLight) {
      pointLight.position.x = currentLightX;
      pointLight.position.y = currentLightY;
    }

    renderer.render(scene, camera);
  }

  // Track cursor position for WebGL lighting effects
  window.addEventListener('mousemove', (e) => {
    // Map mouse position to 3D space coordinates
    targetLightX = (e.clientX - window.innerWidth / 2) * 0.5;
    targetLightY = -(e.clientY - window.innerHeight / 2) * 0.5;
  });

  // Handle WebGL resizing
  function resizeWebGL() {
    const bgContainer = document.getElementById('webgl-bg');
    if (!bgContainer || !renderer) return;

    camera.aspect = bgContainer.clientWidth / bgContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(bgContainer.clientWidth, bgContainer.clientHeight);
  }

  // 4. Scroll Entry Animations (Intersection Observer for 3D card/timeline reveals)
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.card-3d, .timeline-step, .coming-soon-left, .coming-soon-right');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // 5. Interactive 3D Mouse Tilt on Cards
  const cards = document.querySelectorAll('.card-3d, .coming-soon-left, .coming-soon-right');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      card.classList.add('is-hovered');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate rotation angles (-15 to 15 degrees)
      const rotateY = ((x / width) - 0.5) * 25;
      const rotateX = -((y / height) - 0.5) * 25;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(40px)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovered');
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });

  // 6. Countdown Timer
  const daysVal = document.getElementById('days');
  const hoursVal = document.getElementById('hours');
  const minutesVal = document.getElementById('minutes');
  const secondsVal = document.getElementById('seconds');

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14); // 14 days countdown

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysVal) daysVal.textContent = String(d).padStart(2, '0');
    if (hoursVal) hoursVal.textContent = String(h).padStart(2, '0');
    if (minutesVal) minutesVal.textContent = String(m).padStart(2, '0');
    if (secondsVal) secondsVal.textContent = String(s).padStart(2, '0');
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  // 7. Waitlist Signups Form submit transition
  const waitlistForm = document.getElementById('waitlist-form');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email-input');
      const emailValue = emailInput.value;

      if (emailValue) {
        const contentBlock = waitlistForm.parentElement;
        contentBlock.innerHTML = `
          <div class="badge" style="background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); color: #86efac;">
            Successfully Registered
          </div>
          <h2 class="main-title" style="font-size: 2.2rem; margin-top: 1rem;">YOU'RE ON THE LIST</h2>
          <p class="desc" style="margin-bottom: 0;">We've locked in early access details for <strong>${emailValue}</strong>. Expect your invite key soon.</p>
        `;
      }
    });
  }

  // 8. Scroll events
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Hide scroll indicator on scroll down
    if (scrollIndicator) {
      if (scrollTop > 50) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.visibility = 'hidden';
        scrollIndicator.style.transition = 'opacity 0.4s, visibility 0.4s';
      } else {
        scrollIndicator.style.opacity = '0.8';
        scrollIndicator.style.visibility = 'visible';
      }
    }

    requestAnimationFrame(() => {
      updateFrame();
    });
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    resizeWebGL();
  });
})();
