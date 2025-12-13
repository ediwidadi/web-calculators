// assets/js/components/ResultCard.js

window.ResultCard = {
  props: ['result'],

  data() {
    return {
      lang: APP_CONFIG.LANG || 'id'
    };
  },

  computed: {
    birthParts() {
      if (!this.result) return null;

      const raw = this.result.birthDateISO || this.result.birthDate;
      if (!raw) return null;

      const date = new Date(raw);
      if (isNaN(date)) return null;

      const locale = this.lang === 'id' ? 'id-ID' : 'en-US';

      return {
        weekday: date.toLocaleDateString(locale, { weekday: 'long' }),
        day: date.toLocaleDateString(locale, { day: '2-digit' }),
        month: date.toLocaleDateString(locale, { month: 'short' }),
        year: date.getFullYear()
      };
    }
  },

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
      this.lang =
        (e && e.detail && e.detail.lang) ||
        APP_CONFIG.LANG ||
        this.lang;
      this.$forceUpdate();
    }
  },

  template: `
    <div class="space-y-4">

      <!-- ===== CARD HASIL UMUR ===== -->
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="font-semibold text-lg mb-2 text-lime-600">
          {{ t('ageResultTitle') }}
        </h3>

        <h4 class="text-sm text-slate-600 mb-4 text-center">
          {{ t('ageResultSubTitle') }}
        </h4>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-3 bg-slate-50 rounded">
            <div class="text-2xl font-bold text-lime-600">
              {{ result.years }}
            </div>
            <div class="text-sm">{{ t('yearsLabel') }}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded">
            <div class="text-2xl font-bold text-lime-600">
              {{ result.months }}
            </div>
            <div class="text-sm">{{ t('monthsApproxLabel') }}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded">
            <div class="text-2xl font-bold text-lime-600">
              {{ result.days }}
            </div>
            <div class="text-sm">{{ t('daysLabel') }}</div>
          </div>
        </div>
      </div>

      <!-- ===== CARD TANGGAL LAHIR ===== -->
      <div
        v-if="birthParts"
        class="bg-white rounded-xl shadow p-6 text-center"
      >
        <p class="text-sm text-slate-600 mb-3">
          {{ t('birthDateTitle') }}
        </p>

        <div class="flex flex-wrap gap-2 justify-center">
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
  `
};