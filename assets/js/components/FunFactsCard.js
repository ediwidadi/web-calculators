// assets/js/components/FunFactsCard.js

window.FunFactsCard = {
  props: {
    result: Object,
    funFacts: Object,
    birthDateObj: [Date, String]
  },

  template: '#fun-facts-card-template',

  data() {
    return {
      liveTimeline: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      timerId: null,
      lang: APP_CONFIG.LANG,
      showBirthdayPopup: false,
      popupClosing: false,
      _confettiAnimationFrame: null,
      _confettiResizeHandler: null
    };
  },

  computed: {
    isID() {
      return this.lang === 'id';
    },

    // ===== SAFE FUN FACTS =====
    facts() {
      const f = this.funFacts || {};
      return {
        breaths: Number(f.breaths) || 0,
        heartBeats: Number(f.heartBeats) || 0,
        laughs: Number(f.laughs) || 0,
        sleepYears: Number(f.sleepYears) || 0,
        hairLengthMeters: Number(f.hairLengthMeters) || 0,
        nailLengthMeters: Number(f.nailLengthMeters) || 0
      };
    },

    // ===== NEXT BIRTHDAY (KUNCI UTAMA) =====
    nextBirthday() {
      if (!this.birthDateObj) return null;

      const birth = new Date(this.birthDateObj);
      if (isNaN(birth)) return null;

      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      let next = new Date(
        today.getFullYear(),
        birth.getMonth(),
        birth.getDate()
      );

      if (next <= today) {
        next = new Date(
          today.getFullYear() + 1,
          birth.getMonth(),
          birth.getDate()
        );
      }

      const MS = 86400000;
      const daysLeft = Math.round(
        (Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) -
         Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / MS
      );

      let monthsLeft =
        (next.getFullYear() - today.getFullYear()) * 12 +
        (next.getMonth() - today.getMonth());

      let daysPart = next.getDate() - today.getDate();
      if (daysPart < 0) {
        monthsLeft -= 1;
        daysPart += new Date(
          next.getFullYear(),
          next.getMonth(),
          0
        ).getDate();
      }

      return {
        date: next,
        monthsLeft,
        daysPart,
        daysLeft,
        hoursLeft: daysLeft * 24,
        minutesLeft: daysLeft * 24 * 60,
        secondsLeft: daysLeft * 24 * 60 * 60
      };
    }
  },

  mounted() {
    this.startLiveTimeline();
    this.checkBirthdayToday();
    window.addEventListener('app-language-changed', this.onLangChanged);
  },

  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId);
    this.stopConfetti();
    window.removeEventListener('app-language-changed', this.onLangChanged);
  },

  watch: {
    birthDateObj() {
      this.startLiveTimeline();
      this.checkBirthdayToday();
    }
  },

  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    },

    // ===== LIVE TIMELINE =====
    startLiveTimeline() {
      if (this.timerId) clearInterval(this.timerId);
      if (!this.birthDateObj) return;

      const birth = new Date(this.birthDateObj);
      if (isNaN(birth)) return;

      const update = () => {
        const diff = Date.now() - birth.getTime();
        if (diff < 0) return;

        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);

        this.liveTimeline = {
          days: d,
          hours: h,
          minutes: m,
          seconds: s
        };
      };

      update();
      this.timerId = setInterval(update, 1000);
    },

    // ===== BIRTHDAY POPUP =====
    checkBirthdayToday() {
      if (!this.birthDateObj) return this.closeBirthdayPopup(true);

      const b = new Date(this.birthDateObj);
      if (isNaN(b)) return this.closeBirthdayPopup(true);

      const now = new Date();
      const isBirthday =
        b.getDate() === now.getDate() &&
        b.getMonth() === now.getMonth();

      if (isBirthday) {
        this.popupClosing = false;
        this.showBirthdayPopup = true;
        this.$nextTick(() => this.startConfetti());
      } else {
        this.closeBirthdayPopup(true);
      }
    },

    closeBirthdayPopup(force = false) {
      if (force) {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
        this.stopConfetti();
        return;
      }

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
      const pieces = Array.from({ length: 140 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        dy: Math.random() * 2 + 1.5,
        dx: Math.random() * 1 - 0.5,
        tilt: Math.random() * Math.PI * 2,
        dTilt: Math.random() * 0.05 + 0.02,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));

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
      if (this._confettiResizeHandler) {
        window.removeEventListener('resize', this._confettiResizeHandler);
        this._confettiResizeHandler = null;
      }
    },

    formatInteger(v) {
      return typeof v === 'number'
        ? v.toLocaleString(APP_CONFIG.LOCALE)
        : v;
    },

    formatDecimal(v, d = 1) {
      return typeof v === 'number'
        ? v.toLocaleString(APP_CONFIG.LOCALE, {
            minimumFractionDigits: d,
            maximumFractionDigits: d
          })
        : v;
    },

    formatFullDate(v) {
      const d = v instanceof Date ? v : new Date(v);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString(APP_CONFIG.LOCALE, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    onLangChanged(e) {
      this.lang = (e && e.detail && e.detail.lang) || APP_CONFIG.LANG;
    }
  }
};