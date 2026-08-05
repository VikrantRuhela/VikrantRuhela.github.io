class PremiumCarousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.carousel-track');
    this.slides = Array.from(container.querySelectorAll('.carousel-slide'));
    this.prevBtn = container.querySelector('.carousel-btn-prev');
    this.nextBtn = container.querySelector('.carousel-btn-next');
    this.dotsContainer = container.querySelector('.carousel-dots');
    
    if (!this.track || !this.slides.length) return;

    this.currentIndex = 0;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.isDragging = false;
    this.animationId = null;
    this.dots = [];

    this.init();
  }

  init() {
    this.setupDots();
    this.registerEvents();
    this.updateParallax(0); // Initial position
    this.updateButtons();
  }

  setupDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = ''; // Clear placeholders
    this.slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Slide ${idx + 1}`);
      dot.setAttribute('role', 'button');
      dot.tabIndex = 0;
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);

      dot.addEventListener('click', () => this.goToSlide(idx));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.goToSlide(idx);
        }
      });
    });
  }

  registerEvents() {
    // Buttons click
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Make container keyboard focusable for accessibility
    this.container.tabIndex = 0;
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    // Touch events for mobile swipe
    this.container.addEventListener('touchstart', this.touchStart.bind(this), { passive: true });
    this.container.addEventListener('touchmove', this.touchMove.bind(this), { passive: true });
    this.container.addEventListener('touchend', this.touchEnd.bind(this));

    // Mouse drag events for desktop swipe
    this.container.addEventListener('mousedown', this.dragStart.bind(this));
    this.container.addEventListener('mousemove', this.dragMove.bind(this));
    this.container.addEventListener('mouseup', this.dragEnd.bind(this));
    this.container.addEventListener('mouseleave', this.dragEnd.bind(this));

    // Window resize handling
    window.addEventListener('resize', () => this.goToSlide(this.currentIndex));
  }

  // Prev / Next actions
  prev() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    } else {
      // Loop back to end
      this.goToSlide(this.slides.length - 1);
    }
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    } else {
      // Loop back to start
      this.goToSlide(0);
    }
  }

  goToSlide(index) {
    this.currentIndex = index;
    const width = this.container.offsetWidth;
    this.currentTranslate = -this.currentIndex * width;
    this.prevTranslate = this.currentTranslate;
    
    // Add transition back for snaps
    this.track.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    this.setTrackPosition(this.currentTranslate);
    this.updateParallax(this.currentTranslate);
    
    // Update dots active classes
    this.dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });

    this.updateButtons();
  }

  updateButtons() {
    // Toggle aria attributes or states
    this.prevBtn?.setAttribute('aria-label', `Previous slide, current slide is ${this.currentIndex + 1}`);
    this.nextBtn?.setAttribute('aria-label', `Next slide, current slide is ${this.currentIndex + 1}`);
  }

  setTrackPosition(position) {
    this.track.style.transform = `translate3d(${position}px, 0, 0)`;
  }

  // Update inner slide images translation offset dynamically to achieve premium parallax depth
  updateParallax(position) {
    const width = this.container.offsetWidth || 1; // avoid divide by zero
    
    this.slides.forEach((slide, idx) => {
      const img = slide.querySelector('img');
      if (!img) return;

      // Calculate how far the slide is from the active center viewport
      // If position is -800 (slide 1 center on 800px width), and slide idx is 1,
      // its relative displacement is 0. If slide idx is 0, its relative displacement is -1.
      const slidePosition = idx * width;
      const displacement = (slidePosition + position) / width; // -1 to 1 for adjacent slides

      // Set parallax translation (e.g. translate opposite to slide movement)
      const parallaxPercent = displacement * 15; // Move up to 15% opposite
      img.style.setProperty('--parallax-offset', `${parallaxPercent}%`);
    });
  }

  // Touch Swipe & Mouse Drag Logic
  touchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.track.style.transition = 'none'; // Disable transition during drag
  }

  touchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
    
    this.setTrackPosition(this.currentTranslate);
    this.updateParallax(this.currentTranslate);
  }

  touchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const width = this.container.offsetWidth;
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    // Snap threshold: if moved more than 20% of width, slide!
    if (movedBy < -width * 0.2 && this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    } else if (movedBy > width * 0.2 && this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    } else {
      this.goToSlide(this.currentIndex);
    }
  }

  dragStart(e) {
    e.preventDefault();
    this.startX = e.clientX;
    this.isDragging = true;
    this.track.style.transition = 'none';
    this.container.style.cursor = 'grabbing';
  }

  dragMove(e) {
    if (!this.isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;
    
    this.setTrackPosition(this.currentTranslate);
    this.updateParallax(this.currentTranslate);
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.container.style.cursor = '';
    
    const width = this.container.offsetWidth;
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    if (movedBy < -width * 0.2 && this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    } else if (movedBy > width * 0.2 && this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    } else {
      this.goToSlide(this.currentIndex);
    }
  }
}

// Export internally or attach to window
window.PremiumCarousel = PremiumCarousel;
