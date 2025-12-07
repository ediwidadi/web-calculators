// LayoutHeader.js (debuggable, safe)
window.LayoutHeader = {
  data() {
    return {
      lang: APP_CONFIG && APP_CONFIG.LANG ? APP_CONFIG.LANG : 'id'
    };
  },
  computed: {
    isID() {
      return this.lang === 'id';
    }
  },
  methods: {
    setLang(lang) {
      console.log('[LayoutHeader] setLang called ->', lang);
      if (this.lang === lang) return;

      this.lang = lang;

      if (typeof APP_CONFIG !== 'undefined') {
        if (typeof APP_CONFIG.setLang === 'function') {
          APP_CONFIG.setLang(lang);
        } else if (typeof APP_CONFIG.setLanguage === 'function') {
          APP_CONFIG.setLanguage(lang);
        } else {
          APP_CONFIG.LANG = lang;
          APP_CONFIG.LOCALE = lang === 'id' ? 'id-ID' : 'en-US';
        }
      }

      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang === 'id' ? 'id' : 'en';
      }

      window.dispatchEvent(
        new CustomEvent('app-language-changed', {
          detail: { lang }
        })
      );
    },

    onLangChanged(e) {
      const newLang =
        (e && e.detail && e.detail.lang) || (APP_CONFIG && APP_CONFIG.LANG) || 'id';
      console.log('[LayoutHeader] onLangChanged ->', newLang);
      this.lang = newLang;
    },

   goHome() {
  // kirim event reset ke semua komponen
  window.dispatchEvent(new CustomEvent('app-go-home'));
  
  // scroll ke atas biar terasa kembali "Home"
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
  },
  mounted() {
    console.log('[LayoutHeader] mounted, LANG=', this.lang);
    window.addEventListener('app-language-changed', this.onLangChanged);
  },
  beforeUnmount() {
    window.removeEventListener('app-language-changed', this.onLangChanged);
  },
  template: `
    <header class="w-full bg-brand text-white shadow-md sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <!-- LEFT: LOGO + TITLE -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white text-lg font-bold">
            <span>A</span>
          </div>
          <h1 class="text-base sm:text-lg font-semibold tracking-tight select-none">
            Kalkulator Umur
          </h1>
        </div>

        <!-- RIGHT: HOME ICON (clickable) + LANG SWITCH -->
        <div class="flex items-center gap-3">
          <!-- HOME BUTTON -->
          <button
            type="button"
            @click="goHome"
            class="home-button flex items-center justify-center w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition"
            title="Beranda"
            aria-label="Beranda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-white" aria-hidden="true">
              <path d="M10.707 1.293a1 1 0 0 0-1.414 0l-8 8A1 1 0 0 0 2 11h1v6a1 1 0 0 0 1 1h4.5a.5.5 0 0 0 .5-.5V13h3v4.5a.5.5 0 0 0 .5.5H16a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-8-8z" />
            </svg>
          </button>

          <!-- LANG SWITCH -->
          <div class="flex items-center gap-1 text-xs font-medium border border-white/40 rounded-full px-1 py-0.5 bg-white/20">
            <button
              type="button"
              @click="setLang('id')"
              :class="['px-2 py-1 rounded-full transition', isID ? 'bg-white text-brand shadow-sm' : 'text-white/80 hover:text-white']"
            >ID</button>
            <button
              type="button"
              @click="setLang('en')"
              :class="['px-2 py-1 rounded-full transition', !isID ? 'bg-white text-brand shadow-sm' : 'text-white/80 hover:text-white']"
            >EN</button>
          </div>
        </div>
      </div>
    </header>
  `
};