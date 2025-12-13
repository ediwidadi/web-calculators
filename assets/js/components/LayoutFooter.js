window.LayoutFooter = {
  methods: {
    t(key) {
      return APP_CONFIG.t(key);
    }
  },
  template: `
    <footer class="text-center text-xs text-slate-500 py-4">
      © 2025 {{ t('appName') }}
    </footer>
  `
};