(function () {

  const STORAGE_KEY = 'app_lang';

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
    return 'id'; // 🔒 DEFAULT LOKAL (INDONESIA)
  }

  let currentLang = getInitialLang();

  const TRANSLATIONS = {
    id: {},
    en: {}
  };

  function t(key) {
    return (
      TRANSLATIONS[currentLang][key] ??
      TRANSLATIONS.en[key] ??
      key
    );
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    if (lang === currentLang) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const detail = {
      lang,
      locale: lang === 'id' ? 'id-ID' : 'en-US'
    };

    // update <html lang>
    document.documentElement.lang = lang;

    window.dispatchEvent(new CustomEvent('app-language-changed', { detail }));
    window.dispatchEvent(new CustomEvent('language-changed', { detail }));
  }

  function registerTranslations(lang, data) {
    if (!TRANSLATIONS[lang]) return;
    Object.assign(TRANSLATIONS[lang], data);
  }

  // set lang attribute sejak awal
  document.documentElement.lang = currentLang;

function showToast(message, type = 'info', duration = 2500) {
  let toast = document.createElement('div');
  toast.className = `
    fixed top-4 left-1/2 -translate-x-1/2 z-50
    px-4 py-2 rounded-lg text-sm font-medium shadow
    transition-all duration-300 opacity-0 translate-y-2
  `;

  if (type === 'error') {
    toast.classList.add('bg-red-600', 'text-white');
  } else if (type === 'success') {
    toast.classList.add('bg-lime-600', 'text-white');
  } else {
    toast.classList.add('bg-slate-800', 'text-white');
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}




  window.APP_CONFIG = {
  get LANG() {
    return currentLang;
  },
  get LOCALE() {
    return currentLang === 'id' ? 'id-ID' : 'en-US';
  },
  t,
  setLang,
  registerTranslations,
  toast: showToast   // ⬅️ INI
};

})();