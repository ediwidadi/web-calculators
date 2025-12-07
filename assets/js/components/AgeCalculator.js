// assets/js/components/AgeCalculator.js
window.AgeCalculator = {
  components: {
    ResultCard: window.ResultCard,
    FunFactsCard: window.FunFactsCard
  },
  template: `
    <main class="flex-grow flex items-start justify-center pt-12">
      <div class="max-w-xl w-full px-6">
        <h2 class="text-2xl font-bold mb-2 text-brand text-center">
          {{ t('calcTitle') }}
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 text-center mb-6">
          {{ t('usageIntroText') }}
        </p>
        <!-- Tanggal Lahir -->
        <section class="mb-6">
          <label class="block mb-2 font-medium">
            {{ t('birthDateLabel') }}
          </label>
          <div class="flex gap-2 items-stretch">
            <!-- 3 kolom input (DD / MM / YYYY) -->
            <div class="grid grid-cols-3 gap-2 flex-1">
              <!-- Hari -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('birthDay')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ birthDay ? formatTwoDigits(birthDay) : dayPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isBirthDayOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="d in dayOptions"
                    :key="'bd-' + d"
                    type="button"
                    @click.stop="selectBirthDay(d)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ formatTwoDigits(d) }}
                  </button>
                </div>
              </div>

              <!-- Bulan -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('birthMonth')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ birthMonth ? getMonthLabel(birthMonth) : monthPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isBirthMonthOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="m in monthOptions"
                    :key="'bm-' + m.value"
                    type="button"
                    @click.stop="selectBirthMonth(m.value)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ m.label }}
                  </button>
                </div>
              </div>
     <!-- Tahun -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('birthYear')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ birthYear || yearPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isBirthYearOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="y in yearOptions"
                    :key="'by-' + y"
                    type="button"
                    @click.stop="selectBirthYear(y)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ y }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Kolom ikon kalender -->
            <div class="relative">
              <button
                type="button"
                @click.stop="toggleBirthCalendar"
                class="h-full aspect-square border border-slate-300 rounded-lg
                       flex items-center justify-center text-slate-600
                       hover:bg-slate-50 focus:outline-none focus:ring focus:ring-brand/40"
              >
                <!-- ikon kalender -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M8 7V4m8 3V4M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- Tanggal Target -->
        <section class="mb-6">
          <label class="block mb-2 font-medium">
            {{ t('targetDateLabel') }}
          </label>

          <div class="flex gap-2 items-stretch">
            <!-- 3 kolom input (DD / MM / YYYY) -->
            <div class="grid grid-cols-3 gap-2 flex-1">
              <!-- Hari -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('targetDay')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ targetDay ? formatTwoDigits(targetDay) : dayPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isTargetDayOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="d in dayOptions"
                    :key="'td-' + d"
                    type="button"
                    @click.stop="selectTargetDay(d)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ formatTwoDigits(d) }}
                  </button>
                </div>
              </div>

              <!-- Bulan -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('targetMonth')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ targetMonth ? getMonthLabel(targetMonth) : monthPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isTargetMonthOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="m in monthOptions"
                    :key="'tm-' + m.value"
                    type="button"
                    @click.stop="selectTargetMonth(m.value)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ m.label }}
                  </button>
                </div>
              </div>

              <!-- Tahun -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="toggleDropdown('targetYear')"
                  class="w-full border rounded px-3 py-2 text-center text-sm bg-white
                         border-slate-300 focus:outline-none focus:ring focus:ring-brand/40
                         flex items-center justify-between"
                >
                  <span class="flex-1 text-center">
                    {{ targetYear || yearPlaceholder }}
                  </span>
                  <span class="ml-2 text-slate-400 text-xs">
                    ▼
                  </span>
                </button>
                <span class="pointer-events-none absolute top-1/2 right-[2.1rem] -translate-y-1/2
                             h-[60%] w-[1px] bg-slate-200"></span>
                <div
                  v-if="isTargetYearOpen"
                  class="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-slate-200 rounded shadow text-sm"
                >
                  <button
                    v-for="y in yearOptions"
                    :key="'ty-' + y"
                    type="button"
                    @click.stop="selectTargetYear(y)"
                    class="w-full px-2 py-1 text-left hover:bg-slate-100"
                  >
                    {{ y }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Kolom ikon kalender -->
            <div class="relative">
              <button
                type="button"
                @click.stop="toggleTargetCalendar"
                class="h-full aspect-square border border-slate-300 rounded-lg
                       flex items-center justify-center text-slate-600
                       hover:bg-slate-50 focus:outline-none focus:ring focus:ring-brand/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M8 7V4m8 3V4M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                </svg>
              </button>
            </div>
          </div>

          <p class="mt-1 text-[11px] text-slate-500">
            {{ t('targetHint') }}
          </p>
        </section>

        <button
          @click="calculate"
          class="w-full bg-brand hover:bg-brand-dark text-white py-2 rounded font-semibold transition-colors"
        >
          {{ t('calculateButton') }}
        </button>

        <p class="text-xs text-slate-500 mt-2">
          {{ t('calcInfoText') }}
        </p>

        <p v-if="error" class="text-red-600 mt-3 text-sm">
          {{ error }}
        </p>

        <div v-if="hasCalculated && result" class="mt-6 space-y-4">
          <result-card :result="result" />
          <fun-facts-card
            v-if="funFacts"
            :result="result"
            :fun-facts="funFacts"
            :birth-date="birthDateObj"
          />
        </div>

        <!-- POPUP KALENDER: TANGGAL LAHIR (melayang di tengah) -->
        <div
          v-if="showBirthCalendar"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/20"
          @click.self="showBirthCalendar = false"
        >
          <div class="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs w-[18rem] max-w-[90vw]">
          
<div class="flex items-center gap-2">
  <!-- Pilih Bulan (tetap text, digeser pakai panah) -->
  <span class="font-semibold">
    {{ getMonthLabel(birthCalendarConfig.month) }}
  </span>

  <!-- Pilih Tahun -->
  <select
    class="border rounded px-1 py-[2px] text-xs bg-white"
    :value="birthCalendarConfig.year"
    @change="onBirthYearSelect($event)"
  >
    <option
      v-for="y in yearOptions"
      :key="'bycal-' + y"
      :value="y"
    >
      {{ y }}
    </option>
  </select>
</div>

            <div class="grid grid-cols-7 gap-1 text-[11px] text-slate-500 mb-1">
              <span
                v-for="w in weekLabels"
                :key="'bw-' + w"
                class="text-center"
              >
                {{ w }}
              </span>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(cell, idx) in birthCalendarConfig.cells"
                :key="'bc-' + idx"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded text-xs"
                :class="cell
                  ? 'hover:bg-brand/10 hover:text-brand cursor-pointer'
                  : ''"
                @click.stop="cell && pickBirthFromCalendar(cell)"
              >
                <span v-if="cell">{{ cell.day }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- POPUP KALENDER: TANGGAL TARGET (melayang di tengah) -->
        <div
          v-if="showTargetCalendar"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/20"
          @click.self="showTargetCalendar = false"
        >
          <div class="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs w-[18rem] max-w-[90vw]">
          
          
<div class="flex items-center gap-2">
  <span class="font-semibold">
    {{ getMonthLabel(targetCalendarConfig.month) }}
  </span>

  <select
    class="border rounded px-1 py-[2px] text-xs bg-white"
    :value="targetCalendarConfig.year"
    @change="onTargetYearSelect($event)"
  >
    <option
      v-for="y in yearOptions"
      :key="'tycal-' + y"
      :value="y"
    >
      {{ y }}
    </option>
  </select>
</div>
            <div class="grid grid-cols-7 gap-1 text-[11px] text-slate-500 mb-1">
              <span
                v-for="w in weekLabels"
                :key="'tw-' + w"
                class="text-center"
              >
                {{ w }}
              </span>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(cell, idx) in targetCalendarConfig.cells"
                :key="'tc-' + idx"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded text-xs"
                :class="cell
                  ? 'hover:bg-brand/10 hover:text-brand cursor-pointer'
                  : ''"
                @click.stop="cell && pickTargetFromCalendar(cell)"
              >
                <span v-if="cell">{{ cell.day }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  `,

  data() {
    const today = new Date();
    const initialLang = APP_CONFIG.LANG || 'id';
    const initialLocale = APP_CONFIG.LOCALE || (initialLang === 'id' ? 'id-ID' : 'en-US');

    return {
      // bahasa aktif (reaktif)
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
      // bisa kamu translate nanti kalau mau
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

    // dengarkan perubahan bahasa dari header
    window.addEventListener('app-language-changed', this.onLangChanged);
    window.addEventListener('language-changed', this.onLangChanged);
    // reset saat tombol Home di header diklik
    window.addEventListener('app-go-home', this.onGoHome);

    // click di luar komponen → tutup semua dropdown & kalender
    this._clickOutsideHandler = (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeAllDropdowns();
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
      const locale = APP_CONFIG.LOCALE || (newLang === 'id' ? 'id-ID' : 'en-US');
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
        sessionStorage.setItem(TARGET_DATE_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Gagal menyimpan target date ke sessionStorage:', e);
      }
    },

    closeAllDropdowns() {
  this.isBirthDayOpen = false;
  this.isBirthMonthOpen = false;
  this.isBirthYearOpen = false;
  this.isTargetDayOpen = false;
  this.isTargetMonthOpen = false;
  this.isTargetYearOpen = false;
},

onBirthYearSelect(e) {
  const y = Number(e.target.value);
  if (!Number.isFinite(y)) return;

  this.birthCalendarYear = y;
},

onTargetYearSelect(e) {
  const y = Number(e.target.value);
  if (!Number.isFinite(y)) return;

  this.targetCalendarYear = y;
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
    _getBaseCalendarDate(year, month, day) {
      if (year && month) {
        return new Date(
          Number(year),
          Number(month) - 1,
          day ? Number(day) : 1
        );
      }
      return new Date();
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

  // tutup semua dropdown dulu
  this.closeAllDropdowns();
  // tutup kalender lain
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

    // Handler untuk event "Home" — reset input & hasil
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

      const locale = APP_CONFIG.LOCALE || (this.lang === 'id' ? 'id-ID' : 'en-US');
      this.monthOptions = buildMonthOptions(locale);

      this.$forceUpdate();
    }
  }
};