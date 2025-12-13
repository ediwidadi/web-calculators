const { createApp } = Vue;

const appEl = document.getElementById('app');
const page = appEl.dataset.page || 'home';

const HomePage = {
  template: '#HomePage',
  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    }
  }
};

createApp({
  components: {
    LayoutHeader,
    LayoutFooter,
    HomePage,
    ...(typeof AgeCalculator !== 'undefined' ? { AgeCalculator } : {})
  },

  data() {
    return {
      lang: APP_CONFIG.LANG,
      page
    };
  },

  methods: {
    onLangChanged(e) {
      this.lang = (e && e.detail && e.detail.lang) || APP_CONFIG.LANG;
    }
  },

  mounted() {
    window.addEventListener('app-language-changed', this.onLangChanged);
  },

  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
  },

  template: `
    <div class="min-h-screen flex flex-col bg-slate-100">

      <!-- HEADER -->
      <layout-header />

      <!-- CONTENT -->
      <component
        :is="page === 'home' ? 'HomePage' : 'AgeCalculator'"
        :key="page === 'home' ? lang : null"
      />

      <!-- FOOTER -->
      <layout-footer />

    </div>
  `
}).mount('#app');