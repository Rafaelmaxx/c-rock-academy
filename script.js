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
    showFounderNotes: false,
    depositCount: 38,
    surveyCount: 164,
    depositSubmitted: false,
    lastDepositReceipt: null,
    surveyAnswers: {
      q1: '',
      q2: '',
      q3: '',
      q4: [],
      q5: '',
      q6: '',
      q7: '',
      q8: '',
      q9: '',
      q10: '',
      email: '',
      consent: false
    }
  };

  const slideCaptions = [
    {
      tag: 'ROPE CLIMBING & ARCHITECTURE',
      caption: 'Exploring tall, light-filled top-rope and lead climbing walls inspired by the Blue Ridge Mountains right here in Charlottesville. #CRockCville #CharlottesvilleClimbing #ExploreTheClimb',
      time: '2 HOURS AGO'
    },
    {
      tag: 'COMMUNITY FIRST',
      caption: 'More than a gym—a welcoming third space where experienced climbers and first-timers connect, share beta, and build lasting friendships. #CvilleCommunity #ClimbTogether #CRock',
      time: '5 HOURS AGO'
    },
    {
      tag: 'BEGINNER FRIENDLY & INSTRUCTION',
      caption: 'Never climbed before? Our proposed instruction programs, auto-belays, and introductory clinics are designed to make rope climbing accessible to everyone. #LearnToClimb #CharlottesvilleVA',
      time: '1 DAY AGO'
    },
    {
      tag: 'SOCIAL LOUNGE & IN-HOUSE CAFE',
      caption: 'Grab an espresso after a session, catch up on remote work, or hang out with friends overlooking the climbing floor. Tell us in our survey if an in-house cafe matters to you! #ClimbAndCoffee',
      time: '2 DAYS AGO'
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
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-red-300 bg-red-950 text-white transition-all duration-300 toast-enter max-w-md';
      toastIcon.textContent = '⚠️';
    } else if (type === 'gold') {
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-[#d2dd67] bg-[#15452F] text-[#FFEEDF] transition-all duration-300 toast-enter max-w-md';
      toastIcon.textContent = '⛰️';
    } else {
      toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/40 bg-[#15452F] text-white transition-all duration-300 toast-enter max-w-md';
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
    }
  }

  // --- INSTAGRAM CAROUSEL LOGIC ---
  function renderCarousel() {
    const track = document.getElementById('ig-carousel-track');
    const counterBadge = document.getElementById('ig-slide-counter');
    const captionEl = document.getElementById('ig-caption-text');
    const tagEl = document.getElementById('ig-caption-tag');
    const timeEl = document.getElementById('ig-caption-time');
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
    if (timeEl && item) timeEl.textContent = item.time;

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

    // Update pagination dots
    for (let i = 0; i < state.carouselTotal; i++) {
      const dot = document.getElementById('ig-dot-' + i);
      if (dot) {
        if (i === state.carouselIndex) {
          dot.className = 'w-6 h-2 rounded-full bg-[#d2dd67] transition-all duration-300';
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

  // --- SURVEY PROGRESS & RENDERING ---
  function calculateSurveyProgress() {
    const a = state.surveyAnswers;
    let completed = 0;
    if (a.q1) completed++;
    if (a.q2) completed++;
    if (a.q3) completed++;
    if (a.q4 && a.q4.length > 0 && a.q4.length <= 3) completed++;
    if (a.q5) completed++;
    if (a.q6) completed++;
    if (a.q7) completed++;
    if (/^\d{5}$/.test((a.q8 || '').trim())) completed++;
    if (a.q9) completed++;
    if (a.q10) completed++;
    return completed;
  }

  function updateSurveyProgressUI() {
    const completed = calculateSurveyProgress();
    const pct = Math.round((completed / 10) * 100);
    const bar = document.getElementById('survey-progress-bar');
    const text = document.getElementById('survey-progress-text');
    const pctText = document.getElementById('survey-progress-pct');

    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = completed + ' of 10 required questions completed';
    if (pctText) pctText.textContent = pct + '%';

    // Update Q4 counter badge
    const q4Counter = document.getElementById('q4-counter-badge');
    if (q4Counter) {
      const len = state.surveyAnswers.q4.length;
      q4Counter.textContent = len + ' / 3 selected';
      if (len === 3) {
        q4Counter.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#d2dd67] text-[#15452F]';
      } else if (len > 0) {
        q4Counter.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#15452F] text-white';
      } else {
        q4Counter.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFEEDF] text-[#15452F]';
      }
    }
  }

  function setupRadioCards() {
    const radioGroups = ['q1', 'q2', 'q3', 'q5', 'q6', 'q7', 'q9', 'q10'];
    radioGroups.forEach(function (qKey) {
      const cards = document.querySelectorAll('[data-radio-group="' + qKey + '"]');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          const val = card.getAttribute('data-value') || '';
          state.surveyAnswers[qKey] = val;

          // Update visual selection
          cards.forEach(function (c) {
            c.classList.remove('selected');
            const dot = c.querySelector('.radio-indicator-dot');
            if (dot) dot.classList.add('hidden');
          });
          card.classList.add('selected');
          const activeDot = card.querySelector('.radio-indicator-dot');
          if (activeDot) activeDot.classList.remove('hidden');

          // Clear error message if visible
          const errEl = document.getElementById('error-' + qKey);
          if (errEl) errEl.classList.add('hidden');

          // If Q10 changes, highlight email field when an email option is chosen
          if (qKey === 'q10') {
            const emailBox = document.getElementById('q10-email-container');
            const emailHint = document.getElementById('q10-email-hint');
            if (emailBox && emailHint) {
              if (val.indexOf('email') !== -1 || val.indexOf('deposit') !== -1) {
                emailBox.classList.add('ring-2', 'ring-[#d2dd67]');
                emailHint.textContent = 'Recommended: Enter your email below so we can send your requested C-Rock updates.';
              } else {
                emailBox.classList.remove('ring-2', 'ring-[#d2dd67]');
                emailHint.textContent = 'Optional: Leave blank if you only wish to submit anonymous survey feedback.';
              }
            }
          }

          updateSurveyProgressUI();
        });
      });
    });
  }

  function setupQ4Checkboxes() {
    const cards = document.querySelectorAll('[data-checkbox-group="q4"]');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        const val = card.getAttribute('data-value') || '';
        const idx = state.surveyAnswers.q4.indexOf(val);

        if (idx !== -1) {
          state.surveyAnswers.q4.splice(idx, 1);
          card.classList.remove('selected');
          const checkIcon = card.querySelector('.checkbox-indicator-icon');
          if (checkIcon) checkIcon.classList.add('hidden');
        } else {
          if (state.surveyAnswers.q4.length >= 3) {
            showToast('Please select up to 3 climbing options maximum.', 'error');
            return;
          }
          state.surveyAnswers.q4.push(val);
          card.classList.add('selected');
          const checkIcon = card.querySelector('.checkbox-indicator-icon');
          if (checkIcon) checkIcon.classList.remove('hidden');
        }

        const atLimit = state.surveyAnswers.q4.length >= 3;
        cards.forEach(function (c) {
          const v = c.getAttribute('data-value') || '';
          if (atLimit && state.surveyAnswers.q4.indexOf(v) === -1) {
            c.classList.add('disabled-limit');
          } else {
            c.classList.remove('disabled-limit');
          }
        });

        const errEl = document.getElementById('error-q4');
        if (errEl && state.surveyAnswers.q4.length > 0) {
          errEl.classList.add('hidden');
        }

        updateSurveyProgressUI();
      });
    });
  }

  function setupZipValidation() {
    const zipInput = document.getElementById('input-q8-zip');
    const zipStatus = document.getElementById('q8-zip-status');
    const errEl = document.getElementById('error-q8');
    const quickZipBtns = document.querySelectorAll('.quick-zip-btn');

    function validateZipValue(raw) {
      const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 5);
      if (zipInput && zipInput.value !== cleaned) {
        zipInput.value = cleaned;
      }
      state.surveyAnswers.q8 = cleaned;

      if (zipStatus) {
        if (/^\d{5}$/.test(cleaned)) {
          const isCville = ['22901', '22902', '22903', '22904', '22905', '22911', '22932', '22947', '22963'].indexOf(cleaned) !== -1;
          zipStatus.textContent = isCville
            ? '✓ Valid 5-digit US ZIP code (Charlottesville / Albemarle area)'
            : '✓ Valid 5-digit US ZIP code';
          zipStatus.className = 'text-xs font-medium text-emerald-700 mt-1.5';
          if (errEl) errEl.classList.add('hidden');
        } else if (cleaned.length > 0) {
          zipStatus.textContent = 'Enter all 5 digits (' + cleaned.length + '/5 digits entered)';
          zipStatus.className = 'text-xs font-medium text-amber-700 mt-1.5';
        } else {
          zipStatus.textContent = 'Must be a valid 5-digit US ZIP code (e.g., 22902)';
          zipStatus.className = 'text-xs text-[#687a70] mt-1.5';
        }
      }
      updateSurveyProgressUI();
    }

    if (zipInput) {
      zipInput.addEventListener('input', function (e) {
        validateZipValue(e.target.value);
      });
    }

    quickZipBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const z = btn.getAttribute('data-zip') || '';
        if (zipInput) {
          zipInput.value = z;
          validateZipValue(z);
        }
      });
    });
  }

  // --- FOUNDER NOTES TOGGLE ---
  function toggleFounderNotes() {
    state.showFounderNotes = !state.showFounderNotes;
    const notes = document.querySelectorAll('.founder-rationale-note');
    const toggleBtn = document.getElementById('toggle-founder-notes-btn');
    const toggleKnob = document.getElementById('toggle-founder-notes-knob');

    notes.forEach(function (note) {
      if (state.showFounderNotes) {
        note.classList.remove('hidden');
      } else {
        note.classList.add('hidden');
      }
    });

    if (toggleBtn && toggleKnob) {
      if (state.showFounderNotes) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-[#d2dd67] transition-colors duration-200 focus:outline-none';
        toggleKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-[#15452F] transition-transform duration-200 translate-x-6';
      } else {
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.className = 'relative inline-flex h-6 w-11 items-center rounded-full bg-[#15452F]/30 transition-colors duration-200 focus:outline-none';
        toggleKnob.className = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-1';
      }
    }
  }

  // --- SURVEY FORM SUBMISSION ---
  function handleSurveySubmit(e) {
    if (e) e.preventDefault();

    const emailInput = document.getElementById('input-q10-email');
    const consentInput = document.getElementById('input-q10-consent');
    if (emailInput) state.surveyAnswers.email = emailInput.value.trim();
    if (consentInput) state.surveyAnswers.consent = !!consentInput.checked;

    const a = state.surveyAnswers;
    let firstMissingId = null;

    function markError(qKey, containerId) {
      const err = document.getElementById('error-' + qKey);
      if (err) err.classList.remove('hidden');
      if (!firstMissingId) firstMissingId = containerId;
    }

    if (!a.q1) markError('q1', 'question-card-1');
    if (!a.q2) markError('q2', 'question-card-2');
    if (!a.q3) markError('q3', 'question-card-3');
    if (!a.q4 || a.q4.length === 0 || a.q4.length > 3) markError('q4', 'question-card-4');
    if (!a.q5) markError('q5', 'question-card-5');
    if (!a.q6) markError('q6', 'question-card-6');
    if (!a.q7) markError('q7', 'question-card-7');
    if (!/^\d{5}$/.test((a.q8 || '').trim())) markError('q8', 'question-card-8');
    if (!a.q9) markError('q9', 'question-card-9');
    if (!a.q10) markError('q10', 'question-card-10');

    const emailErr = document.getElementById('error-q10-email');
    if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
      if (emailErr) {
        emailErr.textContent = 'Please enter a valid email address (or leave it blank).';
        emailErr.classList.remove('hidden');
      }
      if (!firstMissingId) firstMissingId = 'question-card-10';
    } else if (a.email && !a.consent) {
      if (emailErr) {
        emailErr.textContent = 'Please check the box agreeing to receive email updates about C-Rock.';
        emailErr.classList.remove('hidden');
      }
      if (!firstMissingId) firstMissingId = 'question-card-10';
    } else if (emailErr) {
      emailErr.classList.add('hidden');
    }

    if (firstMissingId) {
      showToast('Please complete all required survey questions before submitting.', 'error');
      scrollToSection(firstMissingId);
      return;
    }

    try {
      localStorage.setItem('crock_survey_response', JSON.stringify(a));
    } catch (err) {
      // ignore storage errors in sandboxed iframe
    }

    state.surveyCount += 1;
    const heroSurveyStat = document.getElementById('stat-survey-count');
    if (heroSurveyStat) heroSurveyStat.textContent = state.surveyCount.toString();

    const summaryList = document.getElementById('thank-you-summary-list');
    if (summaryList) {
      const items = [
        ['Interest Level', a.q1],
        ['Climbing Experience', a.q2],
        ['Estimated Visit Frequency', a.q3],
        ['Top Climbing Priorities', a.q4.join(', ')],
        ['Preferred Access Option', a.q5],
        ['Monthly Membership Price Range', a.q6],
        ['Single Day Visit Price Range', a.q7],
        ['Home ZIP Code', a.q8],
        ['Realistic Travel Time', a.q9],
        ['Updates & Support Preference', a.q10 + (a.email ? ' (' + a.email + ')' : '')]
      ];
      summaryList.innerHTML = items.map(function (pair) {
        return '<div class="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-[#FFEEDF] last:border-b-0 text-sm">' +
          '<span class="font-medium text-[#4c5d54]">' + pair[0] + '</span>' +
          '<span class="font-semibold text-[#15452F] sm:text-right">' + pair[1] + '</span>' +
          '</div>';
      }).join('');
    }

    const formWrapper = document.getElementById('survey-form-wrapper');
    const thankYouWrapper = document.getElementById('survey-thank-you-wrapper');
    if (formWrapper && thankYouWrapper) {
      formWrapper.classList.add('hidden');
      thankYouWrapper.classList.remove('hidden');
      scrollToSection('section-survey');
    }

    showToast('Thanks for being part of the climb! Your response was recorded.', 'gold');
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

    const statDeposit = document.getElementById('stat-deposit-count');
    if (statDeposit) statDeposit.textContent = state.depositCount.toString();

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
    const email = 'hello@crockclimbing.com';
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

  // --- DOWNLOAD SURVEY RESPONSE JSON ---
  function downloadSurveyJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      project: 'C-ROCK | Charlottesville Rock Climbing',
      submittedAt: new Date().toISOString(),
      foundingDepositReserved: state.depositSubmitted,
      depositReceipt: state.lastDepositReceipt,
      surveyResponses: state.surveyAnswers
    }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'c-rock-community-survey-response.json');
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Downloaded your survey response JSON copy.', 'gold');
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    if (mobileMenuBtn && mobileMenuPanel) {
      mobileMenuBtn.addEventListener('click', function () {
        mobileMenuPanel.classList.toggle('hidden');
      });
    }

    document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.getAttribute('data-scroll-to');
        if (target) {
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
        const idx = state.carouselIndex;
        state.carouselLiked[idx] = !state.carouselLiked[idx];
        state.carouselLikes[idx] += state.carouselLiked[idx] ? 1 : -1;
        likeBtn.classList.remove('animate-heart');
        void likeBtn.offsetWidth;
        likeBtn.classList.add('animate-heart');
        renderCarousel();
      });
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

    setupRadioCards();
    setupQ4Checkboxes();
    setupZipValidation();
    updateSurveyProgressUI();

    const founderToggleBtn = document.getElementById('toggle-founder-notes-btn');
    if (founderToggleBtn) {
      founderToggleBtn.addEventListener('click', toggleFounderNotes);
    }

    const surveyForm = document.getElementById('crock-survey-form');
    if (surveyForm) {
      surveyForm.addEventListener('submit', handleSurveySubmit);
    }

    const editSurveyBtn = document.getElementById('edit-survey-response-btn');
    if (editSurveyBtn) {
      editSurveyBtn.addEventListener('click', function () {
        const formWrapper = document.getElementById('survey-form-wrapper');
        const thankYouWrapper = document.getElementById('survey-thank-you-wrapper');
        if (formWrapper && thankYouWrapper) {
          thankYouWrapper.classList.add('hidden');
          formWrapper.classList.remove('hidden');
          scrollToSection('section-survey');
        }
      });
    }

    const downloadJsonBtn = document.getElementById('download-survey-json-btn');
    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', downloadSurveyJson);
    }

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
  });
})();