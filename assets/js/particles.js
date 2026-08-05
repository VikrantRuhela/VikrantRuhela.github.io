class Subtle3DParticleSphere {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.particles = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Core parameters for the 3D sphere state
    this.baseRadius = 250; 
    this.radius = this.baseRadius;
    this.focalLength = 380;
    this.maxParticles = 460; // Optimal density for both structured sphere and ambient background states
    
    // Eased morph factor (0 = Sphere, 1 = Background)
    this.morphFactor = 0;
    
    // Tilt angles for parallax effect
    this.tiltX = 0;
    this.tiltY = 0;

    this.isActive = true;
    this.animationId = null;

    this.init();
    this.registerEvents();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.radius = Math.min(this.baseRadius, window.innerWidth * 0.28);
    
    // Redistribute background particles within the new dimensions
    if (this.particles.length > 0) {
      this.particles.forEach(p => {
        if (p.xBg > this.canvas.width) p.xBg = Math.random() * this.canvas.width;
        if (p.yBg > this.canvas.height) p.yBg = Math.random() * this.canvas.height;
      });
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      // 1. Sphere State Setup (Fibonacci sphere distribution)
      const phi = Math.acos(1 - 2 * (i + 0.5) / this.maxParticles);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      // 2. Background State Setup (Drifting background coordinates)
      const xBg = Math.random() * this.canvas.width;
      const yBg = Math.random() * this.canvas.height;

      this.particles.push({
        // Unit vectors for sphere
        nx: nx,
        ny: ny,
        nz: nz,
        rx: nx,
        ry: ny,
        rz: nz,
        
        // Coordinates and speed for ambient background drift
        xBg: xBg,
        yBg: yBg,
        vxBg: (Math.random() - 0.5) * 0.12,
        vyBg: -(Math.random() * 0.22 + 0.08),
        offsetX: 0,
        offsetY: 0,

        baseSize: Math.random() * 1.1 + 0.7, // 0.7px to 1.8px
        baseOpacity: Math.random() * 0.35 + 0.35
      });
    }
  }

  registerEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Handle tab visibility changes to reduce CPU load
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
      } else {
        this.isActive = true;
        this.animate();
      }
    });
  }

  update() {
    const time = performance.now() * 0.0008;

    // 1. Update morph factor based on scroll coordinates (morphs over 350px of scroll)
    const hero = document.getElementById('hero');
    if (hero) {
      const targetMorph = Math.min(1, Math.max(0, window.scrollY / 350));
      this.morphFactor += (targetMorph - this.morphFactor) * 0.08;
    } else {
      // Subpages without a hero are locked in the background state
      this.morphFactor = 1;
    }

    // 2. Update background drift positions with mouse repulsion interaction
    const repulsionRadius = 110;
    this.particles.forEach(p => {
      p.xBg += p.vxBg;
      p.yBg += p.vyBg;

      // Wrap around screen boundaries
      if (p.yBg < -10) {
        p.yBg = this.canvas.height + 10;
        p.xBg = Math.random() * this.canvas.width;
        p.offsetX = 0;
        p.offsetY = 0;
      }
      if (p.xBg < -10) {
        p.xBg = this.canvas.width + 10;
      } else if (p.xBg > this.canvas.width + 10) {
        p.xBg = -10;
      }

      // Parallax mouse push physics for background state
      if (this.mouse.x !== -100) {
        const dx = p.xBg - this.mouse.x;
        const dy = p.yBg - this.mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < repulsionRadius) {
          const force = (repulsionRadius - dist) / repulsionRadius;
          const targetOffsetX = (dx / dist) * force * 35; // gentle 35px nudge
          const targetOffsetY = (dy / dist) * force * 35;

          p.offsetX += (targetOffsetX - p.offsetX) * 0.12;
          p.offsetY += (targetOffsetY - p.offsetY) * 0.12;
        } else {
          p.offsetX += (0 - p.offsetX) * 0.08;
          p.offsetY += (0 - p.offsetY) * 0.08;
        }
      } else {
        p.offsetX += (0 - p.offsetX) * 0.08;
        p.offsetY += (0 - p.offsetY) * 0.08;
      }
    });

    // 3. Update 3D rotating sphere positions (only if active)
    if (this.morphFactor < 0.99 && hero) {
      const rxSpeed = 0.001;
      const rySpeed = 0.0016;
      const rzSpeed = 0.0006;

      const cx = Math.cos(rxSpeed), sx = Math.sin(rxSpeed);
      const cy = Math.cos(rySpeed), sy = Math.sin(rySpeed);
      const cz = Math.cos(rzSpeed), sz = Math.sin(rzSpeed);

      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const targetTiltY = (this.mouse.x - centerX) * 0.0004;
      const targetTiltX = -(this.mouse.y - centerY) * 0.0004;

      this.tiltX += (targetTiltX - this.tiltX) * 0.06;
      this.tiltY += (targetTiltY - this.tiltY) * 0.06;

      this.particles.forEach(p => {
        // Rotate unit vectors in 3D
        let y1 = p.ry * cx - p.rz * sx;
        let z1 = p.ry * sx + p.rz * cx;

        let x2 = p.rx * cy + z1 * sy;
        let z2 = -p.rx * sy + z1 * cy;

        let x3 = x2 * cz - y1 * sz;
        let y3 = x2 * sz + y1 * cz;

        p.rx = x3;
        p.ry = y3;
        p.rz = z2;

        // Wave harmonics displacement
        const lat = Math.acos(p.rz);
        const lon = Math.atan2(p.ry, p.rx);
        const wave = Math.sin(5 * lon + time * 1.5) * Math.cos(5 * lat + time * 1.5);
        const disp = wave * 16; 

        p.currentRadius = this.radius + disp;
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const hero = document.getElementById('hero');
    const useSphere = (this.morphFactor < 0.99) && hero;

    let centerX = 0, centerY = 0;
    let cosTX = 1, sinTX = 0;
    let cosTY = 1, sinTY = 0;

    if (useSphere) {
      const rect = hero.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;

      cosTX = Math.cos(this.tiltX);
      sinTX = Math.sin(this.tiltX);
      cosTY = Math.cos(this.tiltY);
      sinTY = Math.sin(this.tiltY);
    }

    // Process interpolation between states
    const renderList = this.particles.map(p => {
      let xSphScreen = 0;
      let ySphScreen = 0;
      let opacitySph = 0;
      let sizeSph = 0;
      let zSph = 0;

      if (useSphere) {
        // Cartesian coordinates from rotated unit vectors
        let x = p.rx * p.currentRadius;
        let y = p.ry * p.currentRadius;
        let z = p.rz * p.currentRadius;

        // Apply mouse tilt rotations
        let yT = y * cosTX - z * sinTX;
        let zT = y * sinTX + z * cosTX;

        let xT = x * cosTY + zT * sinTY;
        let zFinal = -x * sinTY + zT * cosTY;

        // 3D Perspective Projection
        const scale = this.focalLength / (this.focalLength - zFinal);
        xSphScreen = centerX + xT * scale;
        ySphScreen = centerY + yT * scale;
        sizeSph = p.baseSize * scale;

        const zNorm = (zFinal + this.radius) / (2 * this.radius);
        opacitySph = p.baseOpacity * (0.2 + 0.8 * zNorm) * 0.85;
        zSph = zFinal;
      }

      // Background State values
      const xBgScreen = p.xBg + (p.offsetX || 0);
      const yBgScreen = p.yBg + (p.offsetY || 0);
      const sizeBg = p.baseSize * 0.95; 
      const opacityBg = p.baseOpacity * 0.85; // Ambient brightness

      let xFinal, yFinal, sizeFinal, opacityFinal;

      if (!useSphere) {
        xFinal = xBgScreen;
        yFinal = yBgScreen;
        sizeFinal = sizeBg;
        opacityFinal = opacityBg;
      } else {
        const m = this.morphFactor;
        xFinal = xSphScreen + (xBgScreen - xSphScreen) * m;
        yFinal = ySphScreen + (yBgScreen - ySphScreen) * m;
        sizeFinal = sizeSph + (sizeBg - sizeSph) * m;
        opacityFinal = opacitySph + (opacityBg - opacitySph) * m;
      }

      return {
        x: xFinal,
        y: yFinal,
        z: useSphere ? zSph : 0,
        size: sizeFinal,
        opacity: opacityFinal
      };
    });

    // Sort by Z coordinate when sphere state is active
    if (useSphere) {
      renderList.sort((a, b) => a.z - b.z);
    }

    renderList.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.fill();
    });
  }

  animate() {
    if (!this.isActive) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const isTouchOnly = window.matchMedia('(hover: none)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchOnly || prefersReducedMotion) {
    return;
  }

  let canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);
  }

  new Subtle3DParticleSphere(canvas);
});
