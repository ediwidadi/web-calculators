
// assets/js/components/FunFactsCard.js

window.FunFactsCard = {
  props: ['result', 'funFacts', 'birthDate'],

  // gunakan template dari index.html
  template: '#fun-facts-card-template',

  data() {
    return {
      liveTimeline: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      nextBirthday: null,
      timerId: null,
      lang: APP_CONFIG.LANG,
      showBirthdayPopup: false,
      popupClosing: false, // untuk animasi keluar
      _confettiAnimationFrame: null,
      _confettiResizeHandler: null
    };
  },

  computed: {
    isID() {
      return this.lang === 'id';
    },

    // FUN FACTS dihitung di sini
    funFactsComputed() {
      if (!this.result) {
        return {
          breaths: 0,
          heartBeats: 0,
          laughs: 0,
          sleepYears: 0,
          hairLengthMeters: 0,
          nailLengthMeters: 0
        };
      }

      const totalDays = this.result.totalDays || 0;
      const ageYears = this.result.years || 0;
      const totalMonthsApprox =
        typeof this.result.totalMonthsApprox === 'number'
          ? this.result.totalMonthsApprox
          : ageYears * 12;

      // 1. Nafas (15.8 kali / menit)
      const breathsPerMinute = 15.8;
      const breathsPerDay = breathsPerMinute * 60 * 24;
      const breaths = Math.round(totalDays * breathsPerDay);

      // 2. Detak jantung (70 bpm)
      const heartBeatsPerMinute = 70;
      const heartBeatsPerDay = heartBeatsPerMinute * 60 * 24;
      const heartBeats = Math.round(totalDays * heartBeatsPerDay);

      // 3. Tertawa (17 kali / hari)
      const laughsPerDay = 17;
      const laughs = Math.round(totalDays * laughsPerDay);

      // 4. Waktu tidur (8 jam / hari)
      const sleepHoursPerDay = 8;
      const totalSleepHours = totalDays * sleepHoursPerDay;
      const sleepYears = totalSleepHours / 24 / 365.25;

      // 5. Panjang rambut (1 cm / bulan)
      const hairGrowthCmPerMonth = 1.0;
      const hairLengthMeters = (totalMonthsApprox * hairGrowthCmPerMonth) / 100;

      // 6. Panjang kuku (0.1 mm / hari)
      const nailGrowthMmPerDay = 0.1;
      const nailLengthMeters = (totalDays * nailGrowthMmPerDay) / 1000;

      return {
        breaths,
        heartBeats,
        laughs,
        sleepYears,
        hairLengthMeters,
        nailLengthMeters
      };
    }
  },

  mounted() {
    this.startLiveTimeline();
    this.computeNextBirthday();
    this.checkBirthdayToday();
    window.addEventListener('app-language-changed', this.onLangChanged);
    window.addEventListener('language-changed', this.onLangChanged);
  },

  beforeUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.stopConfetti();
    window.removeEventListener('app-language-changed', this.onLangChanged);
    window.removeEventListener('language-changed', this.onLangChanged);
  },

  watch: {
    birthDate() {
      this.startLiveTimeline();
      this.computeNextBirthday();
      this.checkBirthdayToday();
    }
  },

  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    },

    // ===== POPUP & CONFETTI =====
    checkBirthdayToday() {
      if (!this.birthDate) {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
        this.stopConfetti();
        return;
      }

      const b = new Date(this.birthDate);
      if (isNaN(b)) {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
        this.stopConfetti();
        return;
      }

      const now = new Date();
      const isBirthday =
        b.getDate() === now.getDate() &&
        b.getMonth() === now.getMonth();

      if (isBirthday) {
        this.popupClosing = false;
        this.showBirthdayPopup = true;
        this.$nextTick(() => {
          this.startConfetti();
        });
      } else {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
        this.stopConfetti();
      }
    },

    closeBirthdayPopup() {
      if (this.popupClosing) return;

      this.popupClosing = true;
      this.stopConfetti();

      setTimeout(() => {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
      }, 350);
    },

    startConfetti() {
      const canvas = this.$refs.confettiCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      this._confettiResizeHandler = resize;

      const colors = ['#f43f5e', '#f97316', '#22c55e', '#3b82f6', '#a855f7'];
      const confettiCount = 140;
      const pieces = [];

      for (let i = 0; i < confettiCount; i++) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          w: Math.random() * 8 + 4,
          h: Math.random() * 8 + 4,
          dy: Math.random() * 2 + 1.5,
          dx: Math.random() * 1 - 0.5,
          tilt: Math.random() * 2 * Math.PI,
          dTilt: Math.random() * 0.05 + 0.02,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
          p.y += p.dy;
          p.x += p.dx;
          p.tilt += p.dTilt;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.tilt);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        this._confettiAnimationFrame = requestAnimationFrame(draw);
      };

      draw();
    },

    stopConfetti() {
      if (this._confettiAnimationFrame) {
        cancelAnimationFrame(this._confettiAnimationFrame);
        this._confettiAnimationFrame = null;
      }

      const canvas = this.$refs.confettiCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      if (this._confettiResizeHandler) {
        window.removeEventListener('resize', this._confettiResizeHandler);
        this._confettiResizeHandler = null;
      }
    },

    // ===== GROWING TIMELINE (REAL TIME) =====
    startLiveTimeline() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (!this.birthDate) return;

      const birth = new Date(this.birthDate);
      if (isNaN(birth)) return;

      const update = () => {
        const now = new Date();
        const diffMs = now - birth;
        if (diffMs < 0) return;

        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        this.liveTimeline = {
          days: totalDays,
          hours: totalHours,
          minutes: totalMinutes,
          seconds: totalSeconds
        };
      };

      update();
      this.timerId = setInterval(update, 1000);
    },

    // ===== NEXT BIRTHDAY =====
    computeNextBirthday() {
      if (!this.birthDate) {
        this.nextBirthday = null;
        return;
      }

      const birth = new Date(this.birthDate);
      if (isNaN(birth)) {
        this.nextBirthday = null;
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let year = today.getFullYear();
      const month = birth.getMonth();
      const day = birth.getDate();

      let next = new Date(year, month, day);
      if (next <= today) {
        next = new Date(year + 1, month, day);
      }

      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      const nextUTC = Date.UTC(next.getFullYear(), next.getMonth(), next.getDate());
      const daysLeft = Math.max(0, Math.round((nextUTC - todayUTC) / MS_PER_DAY));

      const hoursLeft = daysLeft * 24;
      const minutesLeft = hoursLeft * 60;
      const secondsLeft = minutesLeft * 60;

      let monthsLeft =
        (next.getFullYear() - today.getFullYear()) * 12 +
        (next.getMonth() - today.getMonth());
      let daysPart = next.getDate() - today.getDate();

      if (daysPart < 0) {
        monthsLeft -= 1;
        const prevMonth = new Date(next.getFullYear(), next.getMonth(), 0);
        daysPart += prevMonth.getDate();
      }

      this.nextBirthday = {
        date: next,
        monthsLeft,
        daysLeft,
        daysPart,
        hoursLeft,
        minutesLeft,
        secondsLeft
      };
    },

    // ===== FORMAT & BAHASA =====
    formatInteger(value) {
      if (typeof value !== 'number') return value;
      return value.toLocaleString(APP_CONFIG.LOCALE);
    },

    formatDecimal(value, fractionDigits = 1) {
      if (typeof value !== 'number') return value;
      return value.toLocaleString(APP_CONFIG.LOCALE, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      });
    },

    formatFullDate(value) {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date)) return '-';

      return date.toLocaleDateString(APP_CONFIG.LOCALE, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    onLangChanged(e) {
      this.lang = (e && e.detail && e.detail.lang) || APP_CONFIG.LANG;
      this.$forceUpdate();
    }
  }
};