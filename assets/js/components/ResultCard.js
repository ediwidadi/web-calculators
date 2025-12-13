window.ResultCard = {
  props: ['result'],
  data() {
    return {
      lang: APP_CONFIG.LANG || 'id'
    };
  },
  computed: {
    // tanggal lahir: hari / angka / bulan / tahun
    birthParts() {
      if (!this.result) return null;

      const raw = this.result.birthDateISO || this.result.birthDate;
      if (!raw) return null;

      try {
        const date = new Date(raw);
        if (isNaN(date.getTime())) return null;

        // locale ikut bahasa aktif (id → id-ID, selain itu → en-US)
        const locale = this.lang === 'id' ? 'id-ID' : 'en-US';

        return {
          weekday: date.toLocaleDateString(locale, { weekday: 'long' }),
          day: date.toLocaleDateString(locale, { day: '2-digit' }),
          month: date.toLocaleDateString(locale, { month: 'short' }),
          year: date.getFullYear()
        };
      } catch {
        return null;
      }
    }
  },

  template: `
    <div class="mt-6 bg-white rounded-xl shadow p-6">
    
      <!-- JUDUL UTAMA -->
      <h3 class="font-semibold text-lg mb-2 text-lime-600">
        {{ t('ageResultTitle') }}
      </h3>

      <!-- SUB JUDUL UMUR -->
      <h4 class="text-sm text-slate-600 mb-3 text-center">
        {{ t('ageResultSubTitle') }}
      </h4>

      <!-- HASIL UMUR -->
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-2xl font-bold text-lime-600">{{ result.years }}</div>
          <div class="text-sm">{{ t('yearsLabel') }}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-2xl font-bold text-lime-600">{{ result.months }}</div>
          <div class="text-sm">{{ t('monthsApproxLabel') }}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded">
          <div class="text-2xl font-bold text-lime-600">{{ result.days }}</div>
          <div class="text-sm">{{ t('daysLabel') }}</div>
        </div>
      </div>

      <!-- JUDUL TANGGAL LAHIR -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-600 mb-3">
          {{ t('birthDateTitle') }}
        </p>

        <!-- TANGGAL LAHIR -->
        <div v-if="birthParts" class="flex flex-wrap gap-2 justify-center">
          <div class="px-3 py-2 bg-slate-50 rounded font-semibold text-lime-600">
            {{ birthParts.weekday }}
          </div>
          <div class="px-3 py-2 bg-slate-50 rounded font-semibold text-lime-600">
            {{ birthParts.day }}
          </div>
          <div class="px-3 py-2 bg-slate-50 rounded font-semibold text-lime-600">
            {{ birthParts.month }}
          </div>
          <div class="px-3 py-2 bg-slate-50 rounded font-semibold text-lime-600">
            {{ birthParts.year }}
          </div>
        </div>
      </div>

    </div>
  `,

  mounted() {
    window.addEventListener('app-language-changed', this.onLangChanged);
    window.addEventListener('language-changed', this.onLangChanged);
  },

  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
    window.removeEventListener('language-changed', this.onLangChanged);
  },

  methods: {
    t(key) {
      return APP_CONFIG.t(key) || '';
    },
    
    onLangChanged(e) {
      const newLang =
        (e && e.detail && e.detail.lang) ||
        APP_CONFIG.LANG ||
        this.lang;

      this.lang = newLang;
      // Karena birthParts pakai this.lang, computed ini otomatis
      // akan dihitung ulang ketika lang berubah.
      this.$forceUpdate();
    }
  }
};