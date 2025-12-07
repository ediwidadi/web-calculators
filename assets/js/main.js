const { createApp } = Vue;

const app = createApp({
  components: {
    LayoutHeader,
    AgeCalculator
  },
  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    }
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-100">
      <layout-header />
      <age-calculator />
      <footer class="mt-auto text-center text-xs text-slate-500 py-4">
        © 2025 {{ t('appName') }}. {{ t('footerText') }}
      </footer>
    </div>
  `
});

app.mount('#app');