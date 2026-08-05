document.addEventListener('DOMContentLoaded', () => {
  const customizer = document.querySelector('.theme-customizer');
  if (!customizer) return;

  const options = customizer.querySelectorAll('.color-option');
  
  // Retrieve saved accent theme or fallback to violet
  const savedAccent = localStorage.getItem('portfolio-accent') || 'violet';
  setAccent(savedAccent);

  options.forEach(option => {
    // Determine accent value from class suffix
    const accentClass = Array.from(option.classList).find(c => c.startsWith('color-'));
    const accent = accentClass ? accentClass.replace('color-', '') : 'violet';

    // Mark current active on load
    if (accent === savedAccent) {
      option.classList.add('active');
    }

    option.addEventListener('click', () => {
      // Deactivate all options
      options.forEach(opt => opt.classList.remove('active'));
      
      // Activate clicked option
      option.classList.add('active');
      
      // Apply theme
      setAccent(accent);
    });
  });

  function setAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('portfolio-accent', accent);
    
    // Broadcast event for custom components (like particles canvas) that need redraw or update
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { accent } }));
  }
});
