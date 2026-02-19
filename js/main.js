// xcao.me — Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- Scroll-based nav ---
  const nav = document.querySelector('.nav');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check

  // --- Smooth scroll to center cards on nav click ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      e.preventDefault();

      // Find the card inside this section and center it in the viewport
      const card = targetSection.querySelector('.card-panel');
      const el = card || targetSection;
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      const elCenter = elTop + el.offsetHeight / 2;
      const scrollTo = elCenter - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
    });
  });

  // --- Scroll-driven card fade based on proximity to viewport center ---
  const cardPanels = document.querySelectorAll('.card-panel');

  if (cardPanels.length > 0) {
    const updateCardOpacity = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      cardPanels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        const panelCenter = window.scrollY + rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - panelCenter);
        // Fade zone: fully visible within 200px of center, fully hidden beyond half viewport
        const fadeRange = window.innerHeight * 0.45;
        const opacity = Math.max(0.5, Math.min(1, 1 - (distance - 300) / fadeRange));
        const scale = 0.96 + 0.04 * opacity; // subtle scale: 0.96 → 1.0
        panel.style.opacity = opacity;
        panel.style.transform = `scale(${scale})`;
      });
    };

    window.addEventListener('scroll', updateCardOpacity, { passive: true });
    // Run on load and after a short delay for layout to settle
    updateCardOpacity();
    requestAnimationFrame(updateCardOpacity);
  }

  // --- Contact Modal ---
  const modalOverlay = document.getElementById('contact-modal');
  const openBtns = document.querySelectorAll('[data-open-contact]');
  const closeBtns = document.querySelectorAll('[data-close-contact]');
  const backdrop = document.querySelector('.modal-backdrop');

  if (modalOverlay) {
    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // --- Mobile Menu ---
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOpenBtn = document.querySelector('[data-open-mobile-menu]');
  const mobileCloseBtn = document.querySelector('[data-close-mobile-menu]');

  if (mobileMenu && mobileOpenBtn) {
    mobileOpenBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeMobileMenu = () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on backdrop click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });
  }

  // --- Form submission (prevent default) ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: Add form submission logic (e.g., Formspree, Cloudflare Workers)
      alert('Message sent! (This is a placeholder — connect to a backend.)');
    });
  }

  // --- Animate data bars on scroll ---
  const dataBars = document.querySelectorAll('.data-bar-fill');
  if (dataBars.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    dataBars.forEach(bar => {
      bar.dataset.width = bar.style.width;
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }
});
