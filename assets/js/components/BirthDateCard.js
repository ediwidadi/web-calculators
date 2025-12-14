// assets/js/components/BirthDateCard.js

window.BirthDateCard = {
  props: ['birthDateISO'],

  data() {
    return {
      lang: APP_CONFIG.LANG
    };
  },

  computed: {
    birthParts() {
      if (!this.birthDateISO) return null;

      const date = new Date(this.birthDateISO);
      if (isNaN(date)) return null;

      const locale = this.lang === 'id' ? 'id-ID' : 'en-US';

      return {
        weekday: date.toLocaleDateString(locale, { weekday: 'long' }),
        day: date.toLocaleDateString(locale, { day: '2-digit' }),
        month: date.toLocaleDateString(locale, { month: 'long' }),
        year: date.getFullYear()
      };
    }
  },

  mounted() {
    window.addEventListener('app-language-changed', this.onLangChanged);
  },

  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
  },

  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    },
    onLangChanged(e) {
      this.lang = e?.detail?.lang || APP_CONFIG.LANG;
      this.$forceUpdate();
    }
  },

  template: `
    <div v-if="birthParts" class="bg-white rounded-xl shadow p-6 text-center">
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
  `
};