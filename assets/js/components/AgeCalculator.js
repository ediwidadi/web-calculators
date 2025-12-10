// assets/js/components/AgeCalculator.js

window.AgeCalculator = {
  components: {
    ResultCard: window.ResultCard,
    FunFactsCard: window.FunFactsCard
  },


  // Gunakan template dari index.html
  template: '#age-calculator-template',

  data() {
    const today = new Date();
    const initialLang = APP_CONFIG.LANG || 'id';
    const initialLocale =
      APP_CONFIG.LOCALE || (initialLang === 'id' ? 'id-ID' : 'en-US');

    return {
      // bahasa aktif
      lang: initialLang,

      // input tanggal lahir
      birthDay: '',
      birthMonth: '',
      birthYear: '',

      // input tanggal target (default: hari ini)
      targetDay: String(today.getDate()),
      targetMonth: String(today.getMonth() + 1),
      targetYear: String(today.getFullYear()),

      dayOptions: DAY_OPTIONS,
      monthOptions: buildMonthOptions(initialLocale),
      yearOptions: YEAR_OPTIONS,

      result: null,
      funFacts: null,
      error: null,
      hasCalculated: false,

      birthDateObj: null,

      // state dropdown custom
      isBirthDayOpen: false,
      isBirthMonthOpen: false,
      isBirthYearOpen: false,
      isTargetDayOpen: false,
      isTargetMonthOpen: false,
      isTargetYearOpen: false,

      // state kalender pop-up
      showBirthCalendar: false,
      showTargetCalendar: false,
      birthCalendarYear: null,
      birthCalendarMonth: null,
      targetCalendarYear: null,
      targetCalendarMonth: null,

      _clickOutsideHandler: null
    };
  },

  computed: {
    dayPlaceholder() {
      return this.lang === 'id' ? 'HH' : 'DD';
    },
    monthPlaceholder() {
      return this.lang === 'id' ? 'BB' : 'MM';
    },
    yearPlaceholder() {
      return this.lang === 'id' ? 'TTTT' : 'YYYY';
    },

    // label hari di header kalender
    weekLabels() {
      return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    },

    // konfigurasi kalender tanggal lahir
    birthCalendarConfig() {
      const base = this._getBaseCalendarDate(
        this.birthYear,
        this.birthMonth,
        this.birthDay
      );
      return this._buildCalendarConfig(
        this.birthCalendarYear || base.getFullYear(),
        this.birthCalendarMonth || base.getMonth() + 1
      );
    },

    // konfigurasi kalender tanggal target
    targetCalendarConfig() {
      const base = this._getBaseCalendarDate(
        this.targetYear,
        this.targetMonth,
        this.targetDay
      );
      return this._buildCalendarConfig(
        this.targetCalendarYear || base.getFullYear(),
        this.targetCalendarMonth || base.getMonth() + 1
      );
    }
  },

  mounted() {
    // load target date tersimpan
    try {
      const saved = sessionStorage.getItem(TARGET_DATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.day && parsed.month && parsed.year) {
          this.targetDay = String(parsed.day);
          this.targetMonth = String(parsed.month);
          this.targetYear = String(parsed.year);
        }
      }
    } catch (e) {
      console.warn('Gagal membaca target date dari sessionStorage:', e);
    }

    // dengarkan perubahan bahasa
    window.addEventListener('app-language-changed', this.onLangChanged);
    window.addEventListener('language-changed', this.onLangChanged);
    // reset saat tombol Home di header diklik
    window.addEventListener('app-go-home', this.onGoHome);

    // click di luar komponen → tutup dropdown & kalender
    this._clickOutsideHandler = (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeAllDropdowns();
        this.showBirthCalendar = false;
        this.showTargetCalendar = false;
      }
    };
    document.addEventListener('click', this._clickOutsideHandler);
  },

  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
    window.removeEventListener('language-changed', this.onLangChanged);
    window.removeEventListener('app-go-home', this.onGoHome);

    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }
  },

  watch: {
    targetDay() { this.persistTargetDate(); },
    targetMonth() { this.persistTargetDate(); },
    targetYear() { this.persistTargetDate(); }
  },

  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    },

    onLangChanged(e) {
      const newLang =
        (e && e.detail && e.detail.lang) ||
        APP_CONFIG.LANG ||
        this.lang;

      this.lang = newLang;

      // rebuild label bulan dengan locale baru
      const locale =
        APP_CONFIG.LOCALE || (newLang === 'id' ? 'id-ID' : 'en-US');
      this.monthOptions = buildMonthOptions(locale);

      this.$forceUpdate();
    },

    persistTargetDate() {
      if (!this.targetDay || !this.targetMonth || !this.targetYear) return;

      const payload = {
        day: Number(this.targetDay),
        month: Number(this.targetMonth),
        year: Number(this.targetYear)
      };

      try {
        sessionStorage.setItem(
          TARGET_DATE_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch (e) {
        console.warn('Gagal menyimpan target date ke sessionStorage:', e);
      }
    },

    // === DROPDOWN CUSTOM HELPERS ===
    closeAllDropdowns() {
      this.isBirthDayOpen = false;
      this.isBirthMonthOpen = false;
      this.isBirthYearOpen = false;
      this.isTargetDayOpen = false;
      this.isTargetMonthOpen = false;
      this.isTargetYearOpen = false;
    },

    toggleDropdown(name) {
      const map = {
        birthDay: 'isBirthDayOpen',
        birthMonth: 'isBirthMonthOpen',
        birthYear: 'isBirthYearOpen',
        targetDay: 'isTargetDayOpen',
        targetMonth: 'isTargetMonthOpen',
        targetYear: 'isTargetYearOpen'
      };

      const key = map[name];
      if (!key) return;

      const newState = !this[key];
      this.closeAllDropdowns();
      this[key] = newState;
    },

    selectBirthDay(d) {
      this.birthDay = String(d);
      this.isBirthDayOpen = false;
    },
    selectBirthMonth(m) {
      this.birthMonth = String(m);
      this.isBirthMonthOpen = false;
    },
    selectBirthYear(y) {
      this.birthYear = String(y);
      this.isBirthYearOpen = false;
    },

    selectTargetDay(d) {
      this.targetDay = String(d);
      this.isTargetDayOpen = false;
    },
    selectTargetMonth(m) {
      this.targetMonth = String(m);
      this.isTargetMonthOpen = false;
    },
    selectTargetYear(y) {
      this.targetYear = String(y);
      this.isTargetYearOpen = false;
    },

    getMonthLabel(monthValue) {
      const num = Number(monthValue);
      const found = this.monthOptions.find(m => m.value === num);
      return found ? found.label : monthValue;
    },

    // === KALENDER HELPERS ===

    // Basis tanggal kalender mengikuti input:
    // - kalau tahun diisi → pakai tahun itu
    // - kalau bulan diisi → pakai bulan itu
    // - kalau hari diisi → dipakai untuk highlight (bukan base)
    _getBaseCalendarDate(year, month, day) {
      const today = new Date();

      const y = year ? Number(year) : today.getFullYear();
      const m = month ? Number(month) - 1 : today.getMonth();
      const d = day ? Number(day) : 1;

      return new Date(y, m, d);
    },

    _buildCalendarConfig(year, month) {
      const y = Number(year);
      const m = Number(month);

      const firstDay = new Date(y, m - 1, 1);
      const startWeekday = firstDay.getDay(); // 0-6
      const daysInMonth = new Date(y, m, 0).getDate();

      const cells = [];
      // sel kosong sebelum tanggal 1
      for (let i = 0; i < startWeekday; i++) {
        cells.push(null);
      }
      // sel tanggal
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, year: y, month: m });
      }

      return { year: y, month: m, cells };
    },

    toggleBirthCalendar() {
      const wasOpen = this.showBirthCalendar;

      // tutup dropdown & kalender lain dulu
      this.closeAllDropdowns();
      this.showTargetCalendar = false;

      if (!wasOpen) {
        const base = this._getBaseCalendarDate(
          this.birthYear,
          this.birthMonth,
          this.birthDay
        );
        this.birthCalendarYear = base.getFullYear();
        this.birthCalendarMonth = base.getMonth() + 1;
      }

      this.showBirthCalendar = !wasOpen;
    },

    toggleTargetCalendar() {
      const wasOpen = this.showTargetCalendar;

      this.closeAllDropdowns();
      this.showBirthCalendar = false;

      if (!wasOpen) {
        const base = this._getBaseCalendarDate(
          this.targetYear,
          this.targetMonth,
          this.targetDay
        );
        this.targetCalendarYear = base.getFullYear();
        this.targetCalendarMonth = base.getMonth() + 1;
      }

      this.showTargetCalendar = !wasOpen;
    },

    changeBirthMonth(delta) {
      let y = this.birthCalendarYear || new Date().getFullYear();
      let m = this.birthCalendarMonth || (new Date().getMonth() + 1);

      m += delta;
      if (m < 1) {
        m = 12;
        y -= 1;
      } else if (m > 12) {
        m = 1;
        y += 1;
      }

      this.birthCalendarYear = y;
      this.birthCalendarMonth = m;
    },

    changeTargetMonth(delta) {
      let y = this.targetCalendarYear || new Date().getFullYear();
      let m = this.targetCalendarMonth || (new Date().getMonth() + 1);

      m += delta;
      if (m < 1) {
        m = 12;
        y -= 1;
      } else if (m > 12) {
        m = 1;
        y += 1;
      }

      this.targetCalendarYear = y;
      this.targetCalendarMonth = m;
    },

    // === HIGHLIGHT TANGGAL TERPILIH ===
    // Versi sederhana: cocokkan hanya angka hari (07 → 7)
    isBirthSelected(cell) {
      if (!cell) return false;
      if (!this.birthDay) return false;
      return Number(this.birthDay) === cell.day;
    },

    isTargetSelected(cell) {
      if (!cell) return false;
      if (!this.targetDay) return false;
      return Number(this.targetDay) === cell.day;
    },

    pickBirthFromCalendar(cell) {
      if (!cell) return;
      this.birthDay = String(cell.day);
      this.birthMonth = String(cell.month);
      this.birthYear = String(cell.year);
      this.showBirthCalendar = false;
    },

    pickTargetFromCalendar(cell) {
      if (!cell) return;
      this.targetDay = String(cell.day);
      this.targetMonth = String(cell.month);
      this.targetYear = String(cell.year);
      this.showTargetCalendar = false;
    },

    // === HITUNG UMUR ===
    calculate() {
      this.error = null;
      this.result = null;
      this.funFacts = null;
      this.hasCalculated = false;

      if (!this.birthDay || !this.birthMonth || !this.birthYear) {
        this.error = this.t('errorBirthIncomplete');
        return;
      }

      if (!this.targetDay || !this.targetMonth || !this.targetYear) {
        this.error = this.t('errorTargetIncomplete');
        return;
      }

      const birthDate = new Date(
        Number(this.birthYear),
        Number(this.birthMonth) - 1,
        Number(this.birthDay)
      );

      const targetDate = new Date(
        Number(this.targetYear),
        Number(this.targetMonth) - 1,
        Number(this.targetDay)
      );

      this.birthDateObj = birthDate;

      try {
        const age = DateUtils.calculateAge(birthDate, targetDate);
        const facts = DateUtils.calculateFunFacts(age);

        const birthDateISO =
          `${this.birthYear}-` +
          `${this.formatTwoDigits(this.birthMonth)}-` +
          `${this.formatTwoDigits(this.birthDay)}`;

        this.result = {
          ...age,
          birthDateISO
        };

        this.funFacts = facts;
        this.hasCalculated = true;

        this.persistTargetDate();
      } catch (err) {
        this.error = err && err.message
          ? err.message
          : this.t('errorGeneric');
      }
    },

    formatTwoDigits(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return value;
      return n < 10 ? `0${n}` : String(n);
    },

    // Reset via tombol Home
    onGoHome() {
      this.birthDay = '';
      this.birthMonth = '';
      this.birthYear = '';

      this.result = null;
      this.funFacts = null;
      this.error = null;
      this.hasCalculated = false;
      this.birthDateObj = null;

      this.closeAllDropdowns();
      this.showBirthCalendar = false;
      this.showTargetCalendar = false;

      const locale =
        APP_CONFIG.LOCALE || (this.lang === 'id' ? 'id-ID' : 'en-US');
      this.monthOptions = buildMonthOptions(locale);

      this.$forceUpdate();
    }
  }
};