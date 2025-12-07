window.FunFactsCard = {
  props: ['result', 'funFacts', 'birthDate'],
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
      popupClosing: false, // <-- untuk animasi keluar
      _confettiAnimationFrame: null,
      _confettiResizeHandler: null
    };
  },
  computed: {
    isID() {
      return this.lang === 'id';
    },

    // Fun facts dihitung langsung di sini, berdasarkan totalDays, years, totalMonthsApprox
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
  template: `
    <section class="mt-6 bg-white rounded-xl shadow p-6 relative">

      <!-- ===== POPUP SELAMAT ULANG TAHUN + CONFETTI (card animasi) ===== -->
      <div
        v-if="showBirthdayPopup"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <!-- kanvas confetti -->
        <canvas
          ref="confettiCanvas"
          class="absolute inset-0 pointer-events-none"
        ></canvas>

        <!-- kartu popup (card) -->
        <div
          class="popup-card relative z-10 bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-center"
          :class="{ 'popup-card-closing': popupClosing }"
        >
          <button
            @click="closeBirthdayPopup"
            class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>

          <div class="text-6xl mb-2">🎉</div>

          <h3 class="text-xl font-bold text-brand mb-1">
            <template v-if="isID">Selamat Ulang Tahun!</template>
            <template v-else>Happy Birthday!</template>
          </h3>

          <p class="text-sm text-slate-600 mt-1">
            <template v-if="isID">
              Hari ini adalah hari spesialmu.  
              Semoga panjang umur, sehat selalu, dan semua mimpimu tercapai.
            </template>
            <template v-else>
              Today is your special day.  
              Wishing you good health, happiness, and success always.
            </template>
          </p>

          <button
            @click="closeBirthdayPopup"
            class="mt-5 w-full bg-brand hover:bg-brand-dark text-white py-2 rounded-lg font-semibold transition"
          >
            <template v-if="isID">Terima kasih</template>
            <template v-else>Thank you</template>
          </button>
        </div>
      </div>

      <!-- Tanggal acuan -->
      <p class="text-sm text-slate-700 mb-4">
        <span class="font-medium">
          {{ t('ageOnDateTitle') }}
        </span>
        <br />
        <span class="text-slate-900">
          {{ formatFullDate(result.targetDate) }}
        </span>
        <br />
        <span class="text-[11px] text-slate-500">
          {{ t('ageOnDateSubtitle') }}
        </span>
      </p>

      <!-- NARASI UTAMA DENGAN BORDER JAHITAN -->
      <div class="border-t border-b border-dashed border-slate-400 py-4 mb-6">
        <p class="text-slate-700 leading-relaxed text-sm">
          <template v-if="isID">
            Kamu telah menjalani hidup selama
            <strong>{{ formatInteger(result.years) }} tahun</strong>,
            yaitu
            <strong>{{ formatInteger(result.totalDays) }} hari</strong>
            dan
            <strong>{{ formatInteger(result.totalWeeks) }} minggu</strong>.
            <br /><br />
            Setiap hari adalah bagian kecil dari cerita panjang hidupmu.
          </template>

          <template v-else>
            You have lived for
            <strong>{{ formatInteger(result.years) }} years</strong>,
            which equals
            <strong>{{ formatInteger(result.totalDays) }} days</strong>
            or
            <strong>{{ formatInteger(result.totalWeeks) }} weeks</strong>.
            <br /><br />
            Every single day is a small part of your long life story.
          </template>
        </p>
      </div>

      <!-- GROWING AGE TIMELINE (REAL TIME) -->
      <h3 class="font-semibold text-lg mt-2 mb-3 text-brand">
        {{ t('growingTimelineTitle') }}
      </h3>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-xs text-slate-500 mb-1">
            {{ t('daysLabel') }}
          </div>
          <div class="text-lg font-semibold text-brand">
            {{ formatInteger(liveTimeline.days) }}
          </div>
        </div>
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-xs text-slate-500 mb-1">
            {{ t('hoursLabel') }}
          </div>
          <div class="text-lg font-semibold text-brand">
            {{ formatInteger(liveTimeline.hours) }}
          </div>
        </div>
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-xs text-slate-500 mb-1">
            {{ t('minutesLabel') }}
          </div>
          <div class="text-lg font-semibold text-brand">
            {{ formatInteger(liveTimeline.minutes) }}
          </div>
        </div>
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-xs text-slate-500 mb-1">
            {{ t('secondsLabel') }}
          </div>
          <div class="text-lg font-semibold text-brand">
            {{ formatInteger(liveTimeline.seconds) }}
          </div>
        </div>
      </div>

      <!-- NEXT BIRTHDAY -->
      <h3 class="font-semibold text-lg mt-6 mb-3 text-brand">
        {{ t('nextBirthdayTitle') }}
      </h3>

      <div v-if="nextBirthday" class="mb-4">
        <table class="w-full text-sm text-slate-700 border-separate border-spacing-y-1">
          <tbody>
            <tr>
              <td class="w-1/2">{{ t('nextBirthdayDateLabel') }}</td>
              <td class="w-4 text-center">:</td>
              <td>{{ formatFullDate(nextBirthday.date) }}</td>
            </tr>
            <tr>
              <td>{{ t('monthsLeftLabel') }}</td>
              <td class="text-center">:</td>
              <td>
                {{ nextBirthday.monthsLeft }}
                {{ t('monthsLeftInline') }}
                {{ nextBirthday.daysPart }}
                {{ t('daysLeftInline') }}
              </td>
            </tr>
            <tr>
              <td>{{ t('daysLeftShortLabel') }}</td>
              <td class="text-center">:</td>
              <td>{{ formatInteger(nextBirthday.daysLeft) }} {{ t('daysLabel') }}</td>
            </tr>
            <tr>
              <td>{{ t('hoursLeftLabel') }}</td>
              <td class="text-center">:</td>
              <td>
                {{ formatInteger(nextBirthday.hoursLeft) }} {{ t('hoursLabel') }}
              </td>
            </tr>
            <tr>
              <td>{{ t('minutesLeftLabel') }}</td>
              <td class="text-center">:</td>
              <td>{{ formatInteger(nextBirthday.minutesLeft) }} {{ t('minutesLabel') }}</td>
            </tr>
            <tr>
              <td>{{ t('secondsLeftLabel') }}</td>
              <td class="text-center">:</td>
              <td>{{ formatInteger(nextBirthday.secondsLeft) }} {{ t('secondsLabel') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FAKTA MENAKJUBKAN -->
      <h3 class="font-semibold text-lg mt-6 mb-3 text-brand">
        {{ t('funFactsTitle') }}
      </h3>

      <table class="w-full text-sm text-slate-700 border-separate border-spacing-y-1">
        <tbody>
          <tr>
            <td class="w-1/2">{{ t('breathsLabel') }}</td>
            <td class="w-4 text-center">:</td>
            <td>{{ formatInteger(funFactsComputed.breaths) }}</td>
          </tr>
          <tr>
            <td>{{ t('heartBeatsLabel') }}</td>
            <td class="text-center">:</td>
            <td>{{ formatInteger(funFactsComputed.heartBeats) }}</td>
          </tr>
          <tr>
            <td>{{ t('laughsLabel') }}</td>
            <td class="text-center">:</td>
            <td>{{ formatInteger(funFactsComputed.laughs) }}</td>
          </tr>
          <tr>
            <td>{{ t('sleepYearsLabel') }}</td>
            <td class="text-center">:</td>
            <td>{{ formatDecimal(funFactsComputed.sleepYears, 1) }}</td>
          </tr>
          <tr>
            <td>{{ t('hairLengthLabel') }}</td>
            <td class="text-center">:</td>
            <td>{{ formatDecimal(funFactsComputed.hairLengthMeters, 2) }} m</td>
          </tr>
          <tr>
            <td>{{ t('nailLengthLabel') }}</td>
            <td class="text-center">:</td>
            <td>{{ formatDecimal(funFactsComputed.nailLengthMeters, 2) }} m</td>
          </tr>
        </tbody>
      </table>

      <p class="mt-4 text-xs text-slate-500">
        {{ t('funFactsDisclaimer') }}
      </p>
    </section>
  `,
  mounted() {
    this.startLiveTimeline();
    this.computeNextBirthday();
    this.checkBirthdayToday();
    window.addEventListener('app-language-changed', this.onLangChanged);
  },
  beforeUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.stopConfetti();
    window.removeEventListener('app-language-changed', this.onLangChanged);
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
      if (this.popupClosing) return; // jangan dobel klik

      this.popupClosing = true;
      this.stopConfetti();

      // beri waktu animasi dulu, baru hilangkan popup
      setTimeout(() => {
        this.showBirthdayPopup = false;
        this.popupClosing = false;
      }, 350); // harus sama dengan durasi animasi keluar
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