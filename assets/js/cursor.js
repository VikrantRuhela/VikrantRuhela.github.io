document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  
  if (!cursor) return;

  // Completely hide and ignore the trailing follower element if present
  if (follower) {
    follower.style.display = 'none';
  }

  // 1. Device Compatibility and Accessibility checks
  // Disable only on touch-only mobile/tablet devices (no hover support) or if reduced motion is preferred
  const isTouchOnly = window.matchMedia('(hover: none)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchOnly || prefersReducedMotion) {
    document.documentElement.classList.remove('has-custom-cursor');
    cursor.style.display = 'none';
    return;
  }

  // Active custom cursor flag
  document.documentElement.classList.add('has-custom-cursor');

  // Read saved preference from localStorage
  const savedState = localStorage.getItem('custom-cursor-disabled');
  if (savedState === 'true') {
    document.documentElement.classList.add('custom-cursor-disabled');
  }

  // ESC key toggles custom cursor
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const isDisabled = document.documentElement.classList.toggle('custom-cursor-disabled');
      localStorage.setItem('custom-cursor-disabled', isDisabled ? 'true' : 'false');
    }
  });

  // Track text selection to restore native I-beam cursor
  let isSelecting = false;
  document.addEventListener('mousedown', (e) => {
    const target = e.target;
    if (target && target.closest('p, span, li, h1, h2, h3, h4, h5, h6')) {
      isSelecting = true;
    }
  });
  document.addEventListener('mouseup', () => {
    isSelecting = false;
    document.documentElement.classList.remove('text-selecting');
  });
  window.addEventListener('mousemove', () => {
    if (isSelecting) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        document.documentElement.classList.add('text-selecting');
      }
    }
  });

  // Dynamically inject the premium geometric SVG arrow and follower-text container
  cursor.innerHTML = `
    <svg class="custom-cursor-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 3L11.5 20L14.5 13L21.5 10L4.5 3Z" />
    </svg>
    <span class="follower-text"></span>
  `;

  const followerText = cursor.querySelector('.follower-text');

  // 2. Coordinates tracking
  let mouseX = -100, mouseY = -100;
  let isHidden = true;
  let activeMagBtn = null;

  // Helper to purge class states
  const resetHoverClasses = () => {
    cursor.classList.remove('hover-link', 'hover-btn', 'hover-card', 'hover-image', 'hover-carousel-left', 'hover-carousel-right', 'text-mode');
    followerText.textContent = '';
  };

  // Mouse movement coordinates updates and dynamic state updates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isHidden) {
      cursor.style.opacity = '1';
      isHidden = false;
    }

    // Instantly translate custom cursor tip to pointer position (zero lag)
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    // Ambient parallax lighting background shift
    const bgX = (mouseX / window.innerWidth) - 0.5;
    const bgY = (mouseY / window.innerHeight) - 0.5;
    document.documentElement.style.setProperty('--bg-x', bgX);
    document.documentElement.style.setProperty('--bg-y', bgY);

    // Track targets dynamically under cursor
    const target = e.target;
    if (!target) return;

    resetHoverClasses();

    // 2.1 Carousel split arrows interaction
    const carousel = target.closest('.carousel-container');
    if (carousel) {
      const rect = carousel.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      
      if (relativeX < 0.5) {
        cursor.classList.add('hover-carousel-left');
        followerText.textContent = '←';
      } else {
        cursor.classList.add('hover-carousel-right');
        followerText.textContent = '→';
      }
    }

    // 2.2 Magnetic buttons pull calculation
    const magBtn = target.closest('.magnetic-target, .btn, .search-toggle-btn');
    if (magBtn) {
      if (activeMagBtn && activeMagBtn !== magBtn) {
        activeMagBtn.style.transform = '';
      }
      activeMagBtn = magBtn;

      const rect = magBtn.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;
      
      const dx = e.clientX - midX;
      const dy = e.clientY - midY;
      const dist = Math.hypot(dx, dy);

      if (dist < 75) {
        const transX = dx * 0.18;
        const transY = dy * 0.18;
        magBtn.style.transform = `translate3d(${transX}px, ${transY}px, 0) scale(1.02)`;
      } else {
        magBtn.style.transform = '';
      }
    } else {
      if (activeMagBtn) {
        activeMagBtn.style.transform = '';
        activeMagBtn = null;
      }
    }

    // 2.3 Set hover/text states
    const interactiveLink = target.closest('a, [data-cursor="link"]');
    const actionButton = target.closest('button, .btn, .search-toggle-btn, .carousel-btn, .color-option');
    const editableField = target.closest('input, textarea, [contenteditable]');

    if (interactiveLink) {
      cursor.classList.add('hover-link');
    } else if (actionButton) {
      cursor.classList.add('hover-btn');
    } else if (editableField) {
      cursor.classList.add('text-mode');
    }
  });

  // Hide custom cursor elements on mouse leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isHidden = true;
    if (activeMagBtn) {
      activeMagBtn.style.transform = '';
      activeMagBtn = null;
    }
  });

  // Re-verify layouts on mouseout boundaries
  document.addEventListener('mouseout', (e) => {
    resetHoverClasses();
  });
});
