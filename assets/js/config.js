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

  window.APP_CONFIG = {
    get LANG() {
      return currentLang;
    },
    get LOCALE() {
      return currentLang === 'id' ? 'id-ID' : 'en-US';
    },
    t,
    setLang,
    registerTranslations
  };

})();