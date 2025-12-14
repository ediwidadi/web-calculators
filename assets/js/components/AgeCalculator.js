// assets/js/components/AgeCalculator.js

window.AgeCalculator = {
  components: {
  ResultCard: window.ResultCard,
  FunFactsCard: window.FunFactsCard,
  BirthDateCard: window.BirthDateCard
},
  // Gunakan template dari index.html
  template: '#age-calculator-template',
  
  data() {
    const today = new Date();
    const initialLang = APP_CONFIG.LANG || 'id';
    const initialLocale =
      APP_CONFIG.LOCALE || (initialLang === 'id' ? 'id-ID' : 'en-US');
    
    return {
      
      loading: false,
      progress: 0,
      _progressTimer: null,
      _finishTimer: null,
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
      
      _clickOutsideHandler: null,
      
      // handler klik internal untuk menutup dropdown ketika tombol pemilih diklik
      _internalClickHandler: null
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
    }, // <--- koma penting di sini
    
    // opsi hari dinamis untuk tanggal lahir (1..maxDay)
    birthDayOptions() {
      const max = (this.birthYear && this.birthMonth) ?
        this.getDaysInMonth(this.birthYear, this.birthMonth) :
        31;
      return Array.from({ length: max }, (_, i) => i + 1);
    },
    
    // opsi hari dinamis untuk tanggal target (1..maxDay)
    targetDayOptions() {
      const max = (this.targetYear && this.targetMonth) ?
        this.getDaysInMonth(this.targetYear, this.targetMonth) :
        31;
      return Array.from({ length: max }, (_, i) => i + 1);
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
      // jika komponen belum siap, abaikan
      if (!this.$el) return;
      
      const target = e.target instanceof Element ? e.target : null;
      
      // 1) kalau klik berada di luar root komponen -> selalu tutup
      if (!this.$el.contains(target)) {
        this.closeAllDropdowns();
        this.showBirthCalendar = false;
        this.showTargetCalendar = false;
        return;
      }
      
      // 2) klik berada *di dalam* root — jika klik berada di dalam panel/popup, biarkan (tidak ditutup)
      const inPanel = target && !!target.closest('.absolute.z-20, .fixed');
      if (inPanel) {
        return; // biarkan tombol panel sendiri menangani penutupan (mis. tombol option)
      }
      
      // 3) klik berada di dalam komponen, tapi bukan di panel/popup.
      //    Jika klik pada tombol toggle (mis. tombol yang membuka dropdown), jangan tutup:
      const isToggle = target && !!target.closest('[data-dropdown-toggle="1"]');
      if (isToggle) {
        return;
      }
      
      // 4) selain kasus di atas -> tutup semua dropdown/popups
      this.closeAllDropdowns();
      this.showBirthCalendar = false;
      this.showTargetCalendar = false;
    };
    document.addEventListener('click', this._clickOutsideHandler, true);
    
    // Internal click handler: tombol-panel yang ditandai dengan data-close-dropdown akan memicu penutupan
    this._internalClickHandler = (e) => {
      if (!this.$el) return;
      const el = e.target instanceof Element ? e.target.closest('[data-close-dropdown="1"]') : null;
      if (el && this.$el.contains(el)) {
        // tunda sedikit untuk memberi kesempatan handler tombol (mis. select) berjalan dulu
        // lalu tutup dropdown
        setTimeout(() => {
          this.closeAllDropdowns();
        }, 0);
      }
    };
    
    // pasang handler capture di root element supaya kita dapat tangani tombol dinamis awal
    this.$el.addEventListener('click', this._internalClickHandler, true);
    
    // attach atribut data-close-dropdown & data-dropdown-toggle pada elemen dinamis
    this._attachCloseAttributes();
  },
  
  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
    window.removeEventListener('language-changed', this.onLangChanged);
    window.removeEventListener('app-go-home', this.onGoHome);
    
    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }
    
    if (this._internalClickHandler && this.$el) {
      this.$el.removeEventListener('click', this._internalClickHandler, true);
      this._internalClickHandler = null;
    }
  },
  
  watch: {
birthDateObj: {
immediate: true,
handler() {
if (!this.birthDateObj) return;

this.startLiveTimeline();  
  this.computeNextBirthday();  
  this.checkBirthdayToday();  
}

},

  // =====================================================
  // TARGET DATE
  // 👉 simpan ke session + reset hasil
  // =====================================================
  targetDay() {
    this.persistTargetDate();
    this.hasCalculated = false;
  },
  targetMonth() {
    this.persistTargetDate();
    this.hasCalculated = false;
  },
  targetYear() {
    this.persistTargetDate();
    this.hasCalculated = false;
  },

  // =====================================================
  // BIRTH INPUT
  // 👉 reset hasil jika user ubah tanggal lahir
  // =====================================================
  birthDay() {
    this.hasCalculated = false;
  },
  birthMonth() {
    this.hasCalculated = false;
  },
  birthYear() {
    this.hasCalculated = false;
  },

  // =====================================================
  // DROPDOWN & CALENDAR
  // 👉 pastikan click-outside & close logic aman
  // =====================================================
  isBirthDayOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  isBirthMonthOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  isBirthYearOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  isTargetDayOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  isTargetMonthOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  isTargetYearOpen() {
    this.$nextTick(this._attachCloseAttributes);
  },
  showBirthCalendar() {
    this.$nextTick(this._attachCloseAttributes);
  },
  showTargetCalendar() {
    this.$nextTick(this._attachCloseAttributes);
  }
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
    
    // === HELPERS UNTUK MENANDANAI TOMBOL YANG HARUS MENUTUP DROPDOWN ===
    // Ini menambahkan attribute data-close-dropdown="1" ke tombol di panel dropdown dan popup kalender
    _attachCloseAttributes() {
      if (!this.$el) return;
      
      // Hapus tanda lama dulu supaya idempotent
      const oldTagged = this.$el.querySelectorAll('[data-close-dropdown], [data-dropdown-toggle="1"]');
      oldTagged.forEach(n => {
        n.removeAttribute('data-close-dropdown');
        n.removeAttribute('data-dropdown-toggle');
      });
      
      // Tandai tombol di dalam panel dropdown (biasanya container absolute.z-20)
      const dropdownPanels = Array.from(this.$el.querySelectorAll('.absolute.z-20'));
      dropdownPanels.forEach(panel => {
        const buttons = panel.querySelectorAll ? Array.from(panel.querySelectorAll('button, a')) : [];
        buttons.forEach(b => b.setAttribute('data-close-dropdown', '1'));
      });
      
      // Tandai tombol di popup kalender (fixed modal)
      const popupPanels = Array.from(this.$el.querySelectorAll('.fixed'));
      popupPanels.forEach(panel => {
        const buttons = panel.querySelectorAll ? Array.from(panel.querySelectorAll('button, a')) : [];
        buttons.forEach(b => b.setAttribute('data-close-dropdown', '1'));
      });
      
      // Tandai tombol toggle yang membuka dropdown.
      // Heuristik: tombol toggle biasanya punya caret "▼" / svg icon.
      const allButtons = Array.from(this.$el.querySelectorAll('button'));
      allButtons.forEach(btn => {
        const txt = (btn.textContent || '').trim();
        const hasCaret = txt.includes('▼') || txt.includes('▾');
        const hasSvg = !!btn.querySelector('svg');
        // Hanya tandai jika terlihat seperti tombol toggle (caret atau svg present)
        if (hasCaret || hasSvg) {
          btn.setAttribute('data-dropdown-toggle', '1');
        }
      });
      
      // Pastikan link <a> yang ada juga menutup dropdown saat diklik
      const anchors = Array.from(this.$el.querySelectorAll('a'));
      anchors.forEach(a => a.setAttribute('data-close-dropdown', '1'));
    },
    
    getDaysInMonth(year, month) {
      const y = Number(year);
      const m = Number(month);
      if (!y || !m) return 31;
      return new Date(y, m, 0).getDate();
    },
    
    normalizeBirthDate() {
      if (!this.birthYear || !this.birthMonth || !this.birthDay) return;
      
      const maxDay = this.getDaysInMonth(this.birthYear, this.birthMonth);
      const currentDay = Number(this.birthDay);
      
      if (currentDay > maxDay) {
        this.birthDay = String(maxDay);
      }
    },
    
    normalizeTargetDate() {
      if (!this.targetYear || !this.targetMonth || !this.targetDay) return;
      
      const maxDay = this.getDaysInMonth(this.targetYear, this.targetMonth);
      const currentDay = Number(this.targetDay);
      
      if (currentDay > maxDay) {
        this.targetDay = String(maxDay);
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
      
      // re-attach attributes because panel DOM might have been created
      this.$nextTick(() => this._attachCloseAttributes());
    },
    
    selectBirthDay(d) {
      this.birthDay = String(d);
      this.isBirthDayOpen = false;
      // ensure day options stay in-sync
      this.$nextTick(() => this._attachCloseAttributes());
    },
    selectBirthMonth(m) {
      this.birthMonth = String(m);
      this.isBirthMonthOpen = false;
      this.normalizeBirthDate();
      this.$nextTick(() => this._attachCloseAttributes());
    },
    selectBirthYear(y) {
      this.birthYear = String(y);
      this.isBirthYearOpen = false;
      this.normalizeBirthDate();
      this.$nextTick(() => this._attachCloseAttributes());
    },
    
    selectTargetDay(d) {
      this.targetDay = String(d);
      this.isTargetDayOpen = false;
      this.$nextTick(() => this._attachCloseAttributes());
    },
    selectTargetMonth(m) {
      this.targetMonth = String(m);
      this.isTargetMonthOpen = false;
      this.normalizeTargetDate();
      this.$nextTick(() => this._attachCloseAttributes());
    },
    selectTargetYear(y) {
      this.targetYear = String(y);
      this.isTargetYearOpen = false;
      this.normalizeTargetDate();
      this.$nextTick(() => this._attachCloseAttributes());
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
      
      // re-attach attributes for popup buttons
      this.$nextTick(() => this._attachCloseAttributes());
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
      
      // re-attach attributes for popup buttons
      this.$nextTick(() => this._attachCloseAttributes());
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
      this.$nextTick(() => this._attachCloseAttributes());
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
      this.$nextTick(() => this._attachCloseAttributes());
    },
    
    // === HIGHLIGHT TANGGAL TERPILIH ===
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
      this.$nextTick(() => this._attachCloseAttributes());
    },
    
    pickTargetFromCalendar(cell) {
      if (!cell) return;
      this.targetDay = String(cell.day);
      this.targetMonth = String(cell.month);
      this.targetYear = String(cell.year);
      this.showTargetCalendar = false;
      this.$nextTick(() => this._attachCloseAttributes());
    },
    
    // === HITUNG UMUR ===
calculate() {
  if (this.loading) return;

  // RESET STATE
  this.error = null;
  this.result = null;
  this.funFacts = null;
  this.hasCalculated = false;

  // VALIDASI CEPAT (SEBELUM LOADING)
  if (!this.birthDay || !this.birthMonth || !this.birthYear) {
    this.error = this.t('errorBirthIncomplete');
    APP_CONFIG.toast(this.t('toastIncomplete'), 'error');
    return;
  }

  if (!this.targetDay || !this.targetMonth || !this.targetYear) {
    this.error = this.t('errorTargetIncomplete');
    APP_CONFIG.toast(this.t('toastIncomplete'), 'error');
    return;
  }

  // START LOADING
  this.loading = true;
  this.progress = 0;
  APP_CONFIG.toast(this.t('toastCalculating'));

  // RANDOM PROGRESS (NATURAL)
  this._progressTimer = setInterval(() => {
    if (this.progress >= 95) return;
    const step = Math.floor(Math.random() * 4) + 1; // 1–4
    this.progress = Math.min(this.progress + step, 95);
  }, 120);

  // SIMULASI PROSES
  this._finishTimer = setTimeout(() => {
    try {
   const birthDate = new Date(
  Number(this.birthYear),
  Number(this.birthMonth) - 1,
  Number(this.birthDay)
);

this.birthDateObj = birthDate;

const targetDate = new Date(
  Number(this.targetYear),
  Number(this.targetMonth) - 1,
  Number(this.targetDay)
);

// 🔑 WAJIB — INI KUNCI SEMUANYA


const birthDateISO =
  `${this.birthYear}-` +
  `${this.formatTwoDigits(this.birthMonth)}-` +
  `${this.formatTwoDigits(this.birthDay)}`;

const ageResult = DateUtils.calculateAge(birthDate, targetDate);

this.result = {
  ...ageResult,
  birthDateISO
};

this.funFacts = DateUtils.calculateFunFacts(this.result);
this.hasCalculated = true;

APP_CONFIG.toast(this.t('toastDone'), 'success');

    } catch (err) {
      this.error = err.message || this.t('errorGeneric');
    }

    // FINISH PROGRESS
    this.progress = 100;

    setTimeout(() => {
      clearInterval(this._progressTimer);
      this.loading = false;
    }, 500);

  }, 3000);
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