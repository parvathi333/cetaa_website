/**
 * CETAA Website Prototype Logic
 * Includes: Sticky Header, Mobile Nav, Stats Count-up, Before/After Slider, Multi-step Modal, Scroll Reveal
 */

const initAll = () => {
  const initSafe = (fn, name) => {
    try {
      fn();
    } catch (e) {
      console.error(`Failed to initialize component "${name}":`, e);
    }
  };

  initSafe(initStickyHeader, 'StickyHeader');
  initSafe(initMobileMenu, 'MobileMenu');
  initSafe(initStatsCounter, 'StatsCounter');
  initSafe(initBeforeAfterSlider, 'BeforeAfterSlider');
  initSafe(initDonationModal, 'DonationModal');
  initSafe(initScrollReveal, 'ScrollReveal');
  initSafe(initImageLoaders, 'ImageLoaders');
  initSafe(initPresidentModal, 'PresidentModal');
  initSafe(initCampusSlideshow, 'CampusSlideshow');
  initSafe(initRenovationTabs, 'RenovationTabs');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/**
 * 1. Sticky Header & Active State
 */
function initStickyHeader() {
  const header = document.querySelector('.header-wrapper');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * 2. Mobile Hamburger Menu
 */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

/**
 * 3. Stats Counter Animation using IntersectionObserver
 */
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length === 0) return;

  const countUp = (counter) => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    const speed = 150; // lower number = faster
    const increment = target / speed;
    let current = 0;

    const update = () => {
      current += increment;
      if (current < target) {
        // Format with comma if count is high and not a year
        if (target > 3000) {
          counter.innerText = Math.ceil(current).toLocaleString() + suffix;
        } else {
          counter.innerText = Math.ceil(current) + suffix;
        }
        setTimeout(update, 10);
      } else {
        if (target > 3000) {
          counter.innerText = target.toLocaleString() + suffix;
        } else {
          counter.innerText = target + suffix;
        }
      }
    };
    
    update();
  };

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

/**
 * 4. Before/After Image Comparison Slider
 */
function initBeforeAfterSlider() {
  const container = document.querySelector('.slider-container');
  const afterImage = document.querySelector('.slider-after');
  const handle = document.querySelector('.slider-handle');
  const innerImg = document.querySelector('.slider-after-inner .image-container');

  if (!container || !afterImage || !handle) return;

  let active = false;

  // Set initial dimensions on resize
  function setDimensions() {
    const width = container.offsetWidth;
    if (innerImg) {
      innerImg.style.width = width + 'px';
    }
  }
  setDimensions();
  window.addEventListener('resize', setDimensions);

  // Position function
  function slideTo(xPos) {
    const rect = container.getBoundingClientRect();
    let x = xPos - rect.left;
    const width = rect.width;

    // Constrain position
    if (x < 0) x = 0;
    if (x > width) x = width;

    // Calculate percentage
    const percent = (x / width) * 100;
    afterImage.style.width = percent + '%';
    handle.style.left = percent + '%';
  }

  // Mouse & Touch events
  container.addEventListener('mousedown', (e) => {
    active = true;
    slideTo(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    active = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!active) return;
    slideTo(e.clientX);
  });

  // Touch Events for Mobile
  container.addEventListener('touchstart', (e) => {
    active = true;
    slideTo(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    active = false;
  });

  container.addEventListener('touchmove', (e) => {
    if (!active) return;
    slideTo(e.touches[0].clientX);
  }, { passive: true });
}

/**
 * 5. Scroll Reveal
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  if (reveals.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(reveal => observer.observe(reveal));
}

/**
 * 6. Dynamic Multi-Step Donation Modal
 */
function initDonationModal() {
  const modal = document.querySelector('.modal-overlay');
  const triggerBtns = document.querySelectorAll('.trigger-donation-modal');
  const closeBtn = document.querySelector('.modal-close-btn');
  const steps = document.querySelectorAll('.modal-step');
  const dots = document.querySelectorAll('.step-dot');
  
  if (!modal || triggerBtns.length === 0) return;

  let currentStep = 1;
  let selectedTier = '';
  let selectedAmount = 0;

  // Open Modal
  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // If a specific tier amount is attached to button, pre-fill it
      const presetTier = btn.getAttribute('data-tier');
      const presetAmount = btn.getAttribute('data-amount');
      
      if (presetTier && presetAmount) {
        selectedTier = presetTier;
        selectedAmount = parseInt(presetAmount);
        selectTierCard(presetTier, presetAmount);
      }

      modal.classList.add('active');
      goToStep(1);
    });
  });

  // Close Modal
  const closeModal = () => {
    modal.classList.remove('active');
    // Reset forms
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => form.reset());
    currentStep = 1;
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Navigation Steps
  function goToStep(stepNum) {
    steps.forEach((step, idx) => {
      if (idx + 1 === stepNum) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      dot.className = 'step-dot';
      if (idx + 1 === stepNum) {
        dot.classList.add('active');
      } else if (idx + 1 < stepNum) {
        dot.classList.add('completed');
      }
    });

    currentStep = stepNum;
  }

  // Step 1: Tier Cards selection
  const tierCards = document.querySelectorAll('.tier-select-card');
  const customInput = document.getElementById('custom-donation-amount');

  function selectTierCard(tierName, amount) {
    tierCards.forEach(c => {
      if (c.getAttribute('data-tier-name') === tierName) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
    
    selectedTier = tierName;
    selectedAmount = amount;
    
    // Fill values in subsequent text labels
    document.querySelectorAll('.summary-tier-name').forEach(el => el.innerText = tierName);
    document.querySelectorAll('.summary-tier-amount').forEach(el => el.innerText = '₹' + parseInt(amount).toLocaleString('en-IN'));
  }

  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      const tier = card.getAttribute('data-tier-name');
      const amt = card.getAttribute('data-amount');
      
      if (tier === 'Custom') {
        customInput.focus();
        selectTierCard(tier, customInput.value || 5000);
      } else {
        selectTierCard(tier, amt);
      }
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      selectTierCard('Custom Support', customInput.value || 0);
    });
  }

  // Next and Back Button Hooks
  const nextStepBtns = document.querySelectorAll('.modal-next-btn');
  const prevStepBtns = document.querySelectorAll('.modal-prev-btn');

  nextStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 1) {
        if (!selectedTier || selectedAmount <= 0) {
          alert('Please choose or enter a contribution amount.');
          return;
        }
        goToStep(2);
      } else if (currentStep === 2) {
        // Validate contact details form
        const name = document.getElementById('donor-name').value.trim();
        const email = document.getElementById('donor-email').value.trim();
        
        if (!name || !email) {
          alert('Please provide your name and email address so we can register your pledge.');
          return;
        }
        goToStep(3);
      } else if (currentStep === 3) {
        // Process final step (Simulated submit)
        goToStep(4);
      }
    });
  });

  prevStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  });
}

/**
 * 7. Image Loading Animations
 */
function initImageLoaders() {
  const images = document.querySelectorAll('.image-container img');
  
  images.forEach(img => {
    // If already loaded (e.g. from cache)
    if (img.complete) {
      img.classList.add('loaded');
      if (img.parentElement) {
        img.parentElement.classList.add('has-loaded');
      }
    }
    
    // Add load event listener
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      if (img.parentElement) {
        img.parentElement.classList.add('has-loaded');
      }
    });
    
    // Handle error - log and keep fallback visible
    img.addEventListener('error', () => {
      console.warn(`Asset failed to load: ${img.src}. Falling back to CSS styling.`);
    });
  });
}

/**
 * 8. President's Message Modal Trigger
 */
function initPresidentModal() {
  const presModal = document.getElementById('president-message-modal');
  const presTrigger = document.getElementById('trigger-president-modal');
  const presClose = document.getElementById('close-president-modal');
  
  if (presModal && presTrigger && presClose) {
    presTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      presModal.classList.add('active');
    });
    
    presClose.addEventListener('click', () => {
      presModal.classList.remove('active');
    });
    
    presModal.addEventListener('click', (e) => {
      if (e.target === presModal) {
        presModal.classList.remove('active');
      }
    });
  }
}

/**
 * 9. Campus Slideshow Auto-play
 */
function initCampusSlideshow() {
  const slides = document.querySelectorAll('.campus-slide');
  const dots = document.querySelectorAll('.slide-dot');
  
  if (slides.length === 0) return;
  
  let currentIdx = 0;
  let interval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
  
  function showSlide(idx) {
    slides.forEach((slide, sIdx) => {
      if (sIdx === idx) {
        slide.style.opacity = '1';
        slide.classList.add('active');
      } else {
        slide.style.opacity = '0';
        slide.classList.remove('active');
      }
    });
    
    dots.forEach((dot, dIdx) => {
      if (dIdx === idx) {
        dot.style.background = 'var(--accent)';
        dot.style.transform = 'scale(1.2)';
      } else {
        dot.style.background = 'rgba(255, 255, 255, 0.5)';
        dot.style.transform = 'scale(1)';
      }
    });
    
    currentIdx = idx;
  }
  
  function nextSlide() {
    let nextIdx = (currentIdx + 1) % slides.length;
    showSlide(nextIdx);
  }
  
  // Set initial dot state
  showSlide(0);
  
  // Add dot click events
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      showSlide(idx);
      interval = setInterval(nextSlide, 4000);
    });
  });
}

/**
 * 10. Renovation Tabs Switcher
 */
function initRenovationTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  if (tabBtns.length === 0 || tabPanes.length === 0) return;
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      // Remove active from all buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Add active to current button
      btn.classList.add('active');
      
      // Hide all panes
      tabPanes.forEach(pane => pane.classList.remove('active'));
      // Show target pane
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}
