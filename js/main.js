// Main JavaScript for Ishbarna Kafle Portfolio
// Theme toggle, smooth scroll, scroll effects, progress bar

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const nav = document.querySelector('nav');
  const scrollProgress = document.querySelector('.scroll-progress');

  // --- Theme toggle ---
  function setTheme(theme) {
    const isDark = theme === 'dark';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    updateNavBackground();
  }

  function updateNavBackground() {
    const scrollY = window.pageYOffset;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const scrolled = scrollY > 50;

    if (scrolled) {
      nav.classList.add('scrolled');
      nav.style.background = isDark
        ? 'rgba(24, 24, 31, 0.95)'
        : 'rgba(255, 255, 255, 0.95)';
      nav.style.borderBottomColor = isDark
        ? 'rgba(42, 42, 56, 0.6)'
        : 'rgba(216, 218, 232, 0.6)';
    } else {
      nav.classList.remove('scrolled');
      nav.style.background = isDark
        ? 'rgba(9, 9, 11, 0.75)'
        : 'rgba(247, 248, 252, 0.75)';
      nav.style.borderBottomColor = 'transparent';
    }
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // --- Scroll effects ---
  const onScroll = () => {
    updateNavBackground();

    if (scrollProgress) {
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / winHeight) * 100;
      scrollProgress.style.width = `${Math.min(progress, 100)}%`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Smooth scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // --- Section fade-in animations ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.wrap, #connect').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  // --- Hero photo mouse tracking glow ---
  const heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto) {
    heroPhoto.addEventListener('mousemove', (e) => {
      const rect = heroPhoto.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroPhoto.style.setProperty('--mouse-x', `${x}%`);
      heroPhoto.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  // --- Back to top button ---
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      if (window.pageYOffset > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
