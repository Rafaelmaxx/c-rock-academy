(function () {
  'use strict';

  // --- STATE ---
  const state = {
    carouselIndex: 0,
    carouselTotal: 4,
    carouselAutoPlay: true,
    carouselTimer: null,
    carouselLikes: [142, 98, 116, 184],
    carouselLiked: [false, false, false, false],
    carouselSaved: false,
    depositCount: 38,
    depositSubmitted: false,
    lastDepositReceipt: null
  };

  const slideCaptions = [
    {
      tag: 'ROPE CLIMBING & ARCHITECTURE',
      caption: 'Exploring tall, light-filled top-rope and lead climbing walls inspired by the Blue Ridge Mountains right here in Charlottesville. #CRockCville #CharlottesvilleClimbing #ExploreTheClimb'
    },
    {
      tag: 'COMMUNITY FIRST',
      caption: 'More than a gym—a welcoming third space where experienced climbers and first-timers connect, share beta, and build lasting friendships. #CvilleCommunity #ClimbTogether #CRock'
    },
    {
      tag: 'BEGINNER FRIENDLY & INSTRUCTION',
      caption: 'Never climbed before? Our proposed instruction programs, auto-belays, and introductory clinics are designed to make rope climbing accessible to everyone. #LearnToClimb #CharlottesvilleVA'
    },
    {
      tag: 'SOCIAL LOUNGE & IN-HOUSE CAFE',
      caption: 'Grab an espresso after a session, catch up on remote work, or hang out with friends overlooking the climbing floor. Tell us in our survey if an in-house cafe matters to you! #ClimbAndCoffee'
    }
  ];

  // --- HELPER: TOAST NOTIFICATION ---
  let toastTimeout = null;
  function showToast(message, type) {
    const toast = document.getElementById('app-toast');
    const toastText = document.getElementById('app-toast-text');
    const toastIcon = document.getElementById('app-toast-icon');
    if (!toast || !toastText || !toastIcon) return;

    toastText.textContent = message;
    if (type === 'error') {
      toast.className = 'fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-red-300 bg-red-950 text-white transition-all duration-300 toast-enter sm:max-w-md';
      toastIcon.textContent = '⚠️';
    } else if (type === 'gold') {
      toast.className = 'fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-[#D6E164] bg-[#15452F] text-[#FFEEDF] transition-all duration-300 toast-enter sm:max-w-md';
      toastIcon.textContent = '⛰️';
    } else {
      toast.className = 'fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/40 bg-[#15452F] text-white transition-all duration-300 toast-enter sm:max-w-md';
      toastIcon.textContent = '✓';
    }

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-hidden');
    }, 3800);
  }

  // --- HELPER: SMOOTH SCROLL ---
  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'section-why') {
      const fallback = document.getElementById('section-vision');
      if (fallback) fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- GSAP SCROLL & ENTRANCE ANIMATIONS ---
  let animationsInitialized = false;
  function initAnimations() {
    if (animationsInitialized) return;
    if (typeof gsap === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    animationsInitialized = true;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // 1. Hero Entrance Timeline (targets wrappers without CSS transition-all, clears props after finish)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('#section-hero header',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, clearProps: 'transform,opacity' }
      )
      .fromTo('#section-hero h1',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, clearProps: 'transform,opacity' },
        '-=0.3'
      )
      .fromTo('#section-hero h1 + div',
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, clearProps: 'transform,opacity' },
        '-=0.4'
      )
      .fromTo('#hero-cta-wrap',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.6)', clearProps: 'transform,opacity' },
        '-=0.3'
      );

    if (typeof ScrollTrigger === 'undefined') return;

    // 2. Hero Parallax Scrub
    const heroImg = document.getElementById('hero-bg-img');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: '#section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // Helper: Check if element is currently visible in viewport
    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
    }

    // Helper: Repeating Scroll Reveal that works reliably on F5 mid-page reloads
    function repeatReveal(selector, hiddenVars, easeStr, staggerVal) {
      const els = gsap.utils.toArray(selector);
      if (!els.length) return;

      const visibleVars = {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.72,
        ease: easeStr || 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform'
      };

      if (staggerVal) {
        // Initialize hidden only for elements not currently visible on screen
        els.forEach(function (el) {
          if (!isInViewport(el)) {
            gsap.set(el, hiddenVars);
          } else {
            gsap.fromTo(el, hiddenVars, visibleVars);
          }
        });

        ScrollTrigger.batch(els, {
          start: 'top 90%',
          end: 'bottom 5%',
          onEnter: function (batch) {
            gsap.fromTo(batch, hiddenVars, Object.assign({}, visibleVars, { stagger: staggerVal }));
          },
          onEnterBack: function (batch) {
            gsap.fromTo(batch, hiddenVars, Object.assign({}, visibleVars, { stagger: staggerVal }));
          },
          onLeave: function (batch) {
            gsap.set(batch, hiddenVars);
          },
          onLeaveBack: function (batch) {
            gsap.set(batch, hiddenVars);
          }
        });
      } else {
        els.forEach(function (el) {
          if (!isInViewport(el)) {
            gsap.set(el, hiddenVars);
          } else {
            gsap.fromTo(el, hiddenVars, visibleVars);
          }

          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            end: 'bottom 5%',
            onEnter: function () {
              gsap.fromTo(el, hiddenVars, visibleVars);
            },
            onEnterBack: function () {
              gsap.fromTo(el, hiddenVars, visibleVars);
            },
            onLeave: function () {
              gsap.set(el, hiddenVars);
            },
            onLeaveBack: function () {
              gsap.set(el, hiddenVars);
            }
          });
        });
      }
    }

    // 3. Apply dramatic repeating scroll animations across all sections
    repeatReveal('.gsap-fade-up', { y: 42, opacity: 0 }, 'power3.out', 0);
    repeatReveal('.gsap-scale-up', { y: 44, scale: 0.94, opacity: 0 }, 'power3.out', 0);
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    repeatReveal('.gsap-slide-left', isDesktop ? { x: -46, opacity: 0 } : { y: 36, opacity: 0 }, 'power3.out', 0);
    repeatReveal('.gsap-slide-right', isDesktop ? { x: 46, opacity: 0 } : { y: 36, opacity: 0 }, 'power3.out', 0);

    repeatReveal('.gsap-vision-card', { y: 48, scale: 0.92, opacity: 0 }, 'back.out(1.3)', 0.08);
    repeatReveal('.gsap-step-card', { y: 46, scale: 0.92, opacity: 0 }, 'back.out(1.3)', 0.12);
    repeatReveal('.gsap-founder-photo', { y: 44, scale: 0.92, opacity: 0 }, 'back.out(1.3)', 0.12);

    // Refresh ScrollTrigger after Tailwind CDN / images settle
    setTimeout(function () {
      ScrollTrigger.refresh();
    }, 250);
  }

  // --- BACK TO TOP VISIBILITY ---
  function handleScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const bttBtn = document.getElementById('back-to-top-btn');
    if (bttBtn) {
      if (scrollTop > 420) {
        bttBtn.classList.remove('btt-hidden');
        bttBtn.classList.add('btt-visible');
      } else {
        bttBtn.classList.remove('btt-visible');
        bttBtn.classList.add('btt-hidden');
      }
    }
  }

  // --- INSTAGRAM CAROUSEL LOGIC ---
  function renderCarousel() {
    const track = document.getElementById('ig-carousel-track');
    const counterBadge = document.getElementById('ig-slide-counter');
    const captionEl = document.getElementById('ig-caption-text');
    const tagEl = document.getElementById('ig-caption-tag');
    const likesCountEl = document.getElementById('ig-likes-count');
    const likeBtn = document.getElementById('ig-like-btn');
    const likeSvg = document.getElementById('ig-like-svg');
    const autoPlayLabel = document.getElementById('ig-autoplay-label');
    const autoPlayDot = document.getElementById('ig-autoplay-dot');

    if (!track) return;
    track.style.transform = 'translateX(-' + (state.carouselIndex * 100) + '%)';

    if (counterBadge) {
      counterBadge.textContent = (state.carouselIndex + 1) + ' / ' + state.carouselTotal;
    }

    const item = slideCaptions[state.carouselIndex];
    if (captionEl && item) captionEl.textContent = item.caption;
    if (tagEl && item) tagEl.textContent = item.tag;

    const liked = state.carouselLiked[state.carouselIndex];
    const likes = state.carouselLikes[state.carouselIndex];
    if (likesCountEl) {
      likesCountEl.textContent = likes.toLocaleString() + ' climbers interested';
    }
    if (likeSvg && likeBtn) {
      if (liked) {
        likeSvg.setAttribute('fill', '#ef4444');
        likeSvg.setAttribute('stroke', '#ef4444');
      } else {
        likeSvg.setAttribute('fill', 'none');
        likeSvg.setAttribute('stroke', 'currentColor');
      }
    }

    for (let i = 0; i < state.carouselTotal; i++) {
      const dot = document.getElementById('ig-dot-' + i);
      if (dot) {
        if (i === state.carouselIndex) {
          dot.className = 'w-6 h-2 rounded-full bg-[#D6E164] transition-all duration-300';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-[#15452F]/25 hover:bg-[#15452F]/50 transition-all duration-300';
        }
      }
    }

    if (autoPlayLabel && autoPlayDot) {
      if (state.carouselAutoPlay) {
        autoPlayLabel.textContent = 'Auto-scroll: ON';
        autoPlayDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      } else {
        autoPlayLabel.textContent = 'Auto-scroll: PAUSED';
        autoPlayDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      }
    }
  }

  function triggerHeartBurst() {
    const overlay = document.getElementById('ig-heart-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden', 'ig-heart-burst');
    void overlay.offsetWidth;
    overlay.classList.add('ig-heart-burst');
    setTimeout(function () {
      overlay.classList.add('hidden');
      overlay.classList.remove('ig-heart-burst');
    }, 820);
  }

  function toggleCurrentSlideLike(forceLike) {
    const idx = state.carouselIndex;
    const likeBtn = document.getElementById('ig-like-btn');
    if (forceLike && state.carouselLiked[idx]) {
      triggerHeartBurst();
      return;
    }
    state.carouselLiked[idx] = forceLike ? true : !state.carouselLiked[idx];
    state.carouselLikes[idx] += state.carouselLiked[idx] ? 1 : -1;
    if (likeBtn) {
      likeBtn.classList.remove('animate-heart');
      void likeBtn.offsetWidth;
      likeBtn.classList.add('animate-heart');
    }
    if (state.carouselLiked[idx]) triggerHeartBurst();
    renderCarousel();
  }

  function nextSlide() {
    state.carouselIndex = (state.carouselIndex + 1) % state.carouselTotal;
    renderCarousel();
  }

  function prevSlide() {
    state.carouselIndex = (state.carouselIndex - 1 + state.carouselTotal) % state.carouselTotal;
    renderCarousel();
  }

  function startCarouselTimer() {
    stopCarouselTimer();
    if (state.carouselAutoPlay) {
      state.carouselTimer = setInterval(nextSlide, 4200);
    }
  }

  function stopCarouselTimer() {
    if (state.carouselTimer) {
      clearInterval(state.carouselTimer);
      state.carouselTimer = null;
    }
  }

  // --- PHOTO LIGHTBOX MODAL ---
  function openLightbox(src, loc, caption) {
    const modal = document.getElementById('photo-lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    const locEl = document.getElementById('lightbox-loc');
    const capEl = document.getElementById('lightbox-caption');
    if (!modal || !imgEl) return;
    imgEl.src = src;
    if (locEl) locEl.textContent = loc || '';
    if (capEl) capEl.textContent = caption || '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(modal.querySelector('.relative'), { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });
    }
  }

  function closeLightbox() {
    const modal = document.getElementById('photo-lightbox-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  // --- STRIPE DEPOSIT MODAL SIMULATION ---
  function openStripeModal() {
    const modal = document.getElementById('stripe-deposit-modal');
    const formStep = document.getElementById('stripe-modal-form-step');
    const receiptStep = document.getElementById('stripe-modal-receipt-step');
    if (!modal) return;

    if (state.depositSubmitted && state.lastDepositReceipt) {
      if (formStep) formStep.classList.add('hidden');
      if (receiptStep) receiptStep.classList.remove('hidden');
    } else {
      if (formStep) formStep.classList.remove('hidden');
      if (receiptStep) receiptStep.classList.add('hidden');
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(modal.querySelector('.relative'), { y: 24, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });
    }
  }

  function closeStripeModal() {
    const modal = document.getElementById('stripe-deposit-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function handleStripeDepositSubmit(e) {
    if (e) e.preventDefault();
    const nameEl = document.getElementById('stripe-name');
    const emailEl = document.getElementById('stripe-email');
    const zipEl = document.getElementById('stripe-zip');
    const agreeEl = document.getElementById('stripe-refund-agree');
    const errEl = document.getElementById('stripe-modal-error');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const zip = zipEl ? zipEl.value.trim() : '';
    const agreed = agreeEl ? agreeEl.checked : false;

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{5}$/.test(zip)) {
      if (errEl) {
        errEl.textContent = 'Please provide your full name, a valid email address, and a 5-digit US ZIP code.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (!agreed) {
      if (errEl) {
        errEl.textContent = 'Please confirm that you understand the $50 deposit is optional and 100% refundable.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (errEl) errEl.classList.add('hidden');

    const receiptId = 'CRK-' + Math.floor(100000 + Math.random() * 900000);
    state.depositSubmitted = true;
    state.depositCount += 1;
    state.lastDepositReceipt = {
      id: receiptId,
      name: name,
      email: email,
      zip: zip,
      amount: '$50.00 USD (Refundable Founding-Support Deposit)',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const receiptCodeEl = document.getElementById('receipt-id-code');
    const receiptNameEl = document.getElementById('receipt-holder-name');
    const receiptEmailEl = document.getElementById('receipt-holder-email');
    if (receiptCodeEl) receiptCodeEl.textContent = receiptId;
    if (receiptNameEl) receiptNameEl.textContent = name;
    if (receiptEmailEl) receiptEmailEl.textContent = email;

    const formStep = document.getElementById('stripe-modal-form-step');
    const receiptStep = document.getElementById('stripe-modal-receipt-step');
    if (formStep) formStep.classList.add('hidden');
    if (receiptStep) receiptStep.classList.remove('hidden');

    const depositBtnText = document.getElementById('open-stripe-modal-btn-text');
    if (depositBtnText) {
      depositBtnText.textContent = 'View Your $50 Founding Support Receipt (' + receiptId + ')';
    }

    showToast('Founding-support deposit reservation (' + receiptId + ') confirmed!', 'gold');
  }

  // --- COPY EMAIL HELPER ---
  function copyContactEmail() {
    const email = 'support@c-rock-climbing.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (err) {
      // fallback
    }
    showToast('Copied contact email: ' + email, 'gold');
  }

  // --- INITIALIZATION ---
  window.addEventListener('load', function () {
    initAnimations();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener('DOMContentLoaded', function () {
    initAnimations();
    handleScrollUI();
    window.addEventListener('scroll', handleScrollUI, { passive: true });

    const bttBtn = document.getElementById('back-to-top-btn');
    if (bttBtn) {
      bttBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    if (mobileMenuBtn && mobileMenuPanel) {
      mobileMenuBtn.addEventListener('click', function () {
        mobileMenuPanel.classList.toggle('hidden');
      });
    }

    document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const target = btn.getAttribute('data-scroll-to');
        if (target) {
          if (btn.tagName === 'A') e.preventDefault();
          scrollToSection(target);
          if (mobileMenuPanel && !mobileMenuPanel.classList.contains('hidden')) {
            mobileMenuPanel.classList.add('hidden');
          }
        }
      });
    });

    const prevBtn = document.getElementById('ig-prev-btn');
    const nextBtn = document.getElementById('ig-next-btn');
    const autoPlayBtn = document.getElementById('ig-autoplay-btn');
    const likeBtn = document.getElementById('ig-like-btn');
    const saveBtn = document.getElementById('ig-save-btn');
    const carouselViewport = document.getElementById('ig-carousel-viewport');
    const carouselTrack = document.getElementById('ig-carousel-track');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        startCarouselTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        startCarouselTimer();
      });
    }
    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', function () {
        state.carouselAutoPlay = !state.carouselAutoPlay;
        if (state.carouselAutoPlay) {
          startCarouselTimer();
        } else {
          stopCarouselTimer();
        }
        renderCarousel();
      });
    }

    for (let i = 0; i < state.carouselTotal; i++) {
      const dot = document.getElementById('ig-dot-' + i);
      if (dot) {
        dot.addEventListener('click', function () {
          state.carouselIndex = i;
          renderCarousel();
          startCarouselTimer();
        });
      }
    }

    if (likeBtn) {
      likeBtn.addEventListener('click', function () {
        toggleCurrentSlideLike(false);
      });
    }

    if (carouselTrack) {
      carouselTrack.addEventListener('dblclick', function () {
        toggleCurrentSlideLike(true);
      });

      let touchStartX = 0;
      carouselTrack.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches.length) {
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });
      carouselTrack.addEventListener('touchend', function (e) {
        if (e.changedTouches && e.changedTouches.length) {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) nextSlide();
            else prevSlide();
            startCarouselTimer();
          }
        }
      }, { passive: true });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        state.carouselSaved = !state.carouselSaved;
        const svg = saveBtn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', state.carouselSaved ? '#15452F' : 'none');
        }
        showToast(state.carouselSaved ? 'Saved C-Rock concept post to your collection.' : 'Removed from saved posts.', 'gold');
      });
    }

    if (carouselViewport) {
      carouselViewport.addEventListener('mouseenter', function () {
        stopCarouselTimer();
      });
      carouselViewport.addEventListener('mouseleave', function () {
        if (state.carouselAutoPlay) startCarouselTimer();
      });
    }

    renderCarousel();
    startCarouselTimer();

    document.querySelectorAll('.founder-photo-card').forEach(function (card) {
      card.addEventListener('click', function () {
        const src = card.getAttribute('data-lightbox-img');
        const loc = card.getAttribute('data-lightbox-loc');
        const cap = card.getAttribute('data-lightbox-caption');
        if (src) openLightbox(src, loc, cap);
      });
    });

    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLightbox();
        closeStripeModal();
      }
    });

    const openStripeBtn = document.getElementById('open-stripe-modal-btn');
    const closeStripeBtn = document.getElementById('close-stripe-modal-btn');
    const stripeBackdrop = document.getElementById('stripe-modal-backdrop');
    const stripeForm = document.getElementById('stripe-deposit-form');
    const receiptToSurveyBtn = document.getElementById('receipt-to-survey-btn');
    const copyEmailBtns = document.querySelectorAll('.copy-contact-email-btn');

    if (openStripeBtn) openStripeBtn.addEventListener('click', openStripeModal);
    if (closeStripeBtn) closeStripeBtn.addEventListener('click', closeStripeModal);
    if (stripeBackdrop) stripeBackdrop.addEventListener('click', closeStripeModal);
    if (stripeForm) stripeForm.addEventListener('submit', handleStripeDepositSubmit);
    if (receiptToSurveyBtn) {
      receiptToSurveyBtn.addEventListener('click', function () {
        closeStripeModal();
        scrollToSection('section-survey');
      });
    }

    copyEmailBtns.forEach(function (btn) {
      btn.addEventListener('click', copyContactEmail);
    });

    const surveyIframe = document.getElementById('google-survey-iframe');
    if (surveyIframe) {
      let iframeLoadCount = 0;
      surveyIframe.addEventListener('load', function () {
        iframeLoadCount += 1;
        if (iframeLoadCount > 1) {
          surveyIframe.style.height = '520px';
          scrollToSection('section-survey');
        }
      });
    }
  });
})();