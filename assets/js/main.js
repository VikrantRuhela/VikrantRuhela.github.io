document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Loading Screen Fade Out
  const loader = document.querySelector('.loading-screen');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
      }, 500); // 500ms soft delay for visual transition
    });
    
    // Safety fallback
    setTimeout(() => {
      loader.classList.add('fade-out');
    }, 2000);
  }

  // 2. Scroll-aware Header Blur & Scroll Progress Indicator
  const header = document.querySelector('header');
  const progressBar = document.querySelector('.scroll-progress-bar');

  const onScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Navbar scrolled blurred style state
    if (scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll progress calculations
    if (progressBar && docHeight > 0) {
      const scrollPct = (scrollY / docHeight) * 100;
      progressBar.style.width = `${scrollPct}%`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run immediately in case user loads page already scrolled

  // 3. Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navLinksList = document.querySelector('.nav-links');

  if (navToggle && navLinksList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      navLinksList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is clicked
    navLinksList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Scroll Reveal Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 5. Active Navbar Link Tracker on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const scrollActiveTracker = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120; // offset header height
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);

      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          targetLink.classList.add('active');
        }
      }
    });
  };
  window.addEventListener('scroll', scrollActiveTracker, { passive: true });

  // 6. Initialize Premium Parallax Carousels for each Product
  const carousels = document.querySelectorAll('.carousel-container');
  carousels.forEach(carouselContainer => {
    if (window.PremiumCarousel) {
      new window.PremiumCarousel(carouselContainer);
    }
  });

  // 7. Hero Showcase Auto Mockup Loop
  const showcaseImages = document.querySelectorAll('.showcase-img');
  if (showcaseImages.length > 1) {
    let activeIndex = 0;
    
    setInterval(() => {
      showcaseImages[activeIndex].classList.remove('active');
      activeIndex = (activeIndex + 1) % showcaseImages.length;
      showcaseImages[activeIndex].classList.add('active');
    }, 4500); // Cross-fade mockups every 4.5 seconds
  }

  // 8. Dynamic Website link loader
  const webLink = document.getElementById('website-link');
  if (webLink) {
    webLink.href = window.location.origin + window.location.pathname;
    const webVal = webLink.querySelector('.dev-contact-val');
    if (webVal) {
      webVal.textContent = window.location.hostname || 'deskaestheticx.github.io';
    }
  }
});
