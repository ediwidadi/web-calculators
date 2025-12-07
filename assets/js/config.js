(function () {

  // Deteksi bahasa dari browser
  function detectBrowserLang() {
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('id') ? 'id' : 'en';
  }

  let currentLang = detectBrowserLang();

  const TRANSLATIONS = {
    id: {
      appName: 'Kalkulator Umur',
      navHome: 'Beranda',
      calcTitle: 'Hitung Umur Kamu',
      birthDateLabel: 'Tanggal Lahir',
      targetDateLabel: 'Tanggal Target',
      targetHint: 'Tanggal target disimpan selama Kamu berada di website ini.',
      ageResultSubTitle: 'Umur kamu',
      birthDateTitle: 'Kamu lahir pada tanggal',
      calculateButton: 'Hitung Umur',
      calcInfoText: 'Semua perhitungan dilakukan langsung di browser Kamu.',
      precisionBadgeTitle: 'Presisi kalender',
      precisionBadgeSubtitle: 'berdasarkan selisih tanggal riil',
      ageResultTitle: 'Hasil',
      funFactsTitle: 'Fakta Tentang Kamu',
      ageOnDateTitle: 'Usia Kamu pada Tanggal:',
      ageOnDateSubtitle: '(tanggal acuan perhitungan)',
      livedTitle: 'Kamu Sudah Hidup',
      yearsLabel: 'Tahun',
      monthsApproxLabel: 'Bulan',
      weeksLabel: 'Minggu',
      daysLabel: 'Hari',
      hoursLabel: 'Jam',
      minutesLabel: 'Menit',
      secondsLabel: 'Detik',
      footerText: 'Semua proses dilakukan di browser Kamu.',
      errorBirthInvalid: 'Tanggal lahir tidak valid.',
      errorTargetInvalid: 'Tanggal target tidak valid.',
      errorTargetBeforeBirth: 'Tanggal target tidak boleh lebih awal dari tanggal lahir.',
      errorBirthIncomplete: 'Tanggal lahir belum lengkap.',
      errorTargetIncomplete: 'Tanggal target belum lengkap.',
      errorGeneric: 'Terjadi kesalahan saat menghitung.',
      growingTimelineTitle: 'Timeline Umur (Live)',
      nextBirthdayTitle: 'Ulang Tahun Berikutnya',
      nextBirthdayDateLabel: 'Tanggal',
      monthsLeftLabel: 'Sisa Bulan',
      daysLeftShortLabel: 'Sisa Hari',
      hoursLeftLabel: 'Sisa Jam',
      minutesLeftLabel: 'Sisa Menit',
      secondsLeftLabel: 'Sisa Detik',
      monthsLeftInline: 'bulan',
      daysLeftInline: 'hari',
      usageIntroText:
        'Masukkan tanggal lahir dan tanggal target, lalu tekan "Hitung Umur".',
      langID: 'Bahasa Indonesia',
      langEN: 'English'
    },
    en: {
      appName: 'Age Calculator',
      navHome: 'Home',

      calcTitle: 'Calculate Your Age',
      birthDateLabel: 'Date of Birth',
      targetDateLabel: 'Target Date',
      targetHint: 'The target date is remembered while you stay on this site.',
      ageResultSubTitle: 'Your age',
      birthDateTitle: 'You were born on',
      calculateButton: 'Calculate Age',
      calcInfoText: 'All calculations are done directly in your browser.',

      precisionBadgeTitle: 'Calendar-precise',
      precisionBadgeSubtitle: 'based on real date difference',

      ageResultTitle: 'Result',
      livedTitle: 'You Have Lived',
      funFactsTitle: 'Amazing Facts About You',
      ageOnDateTitle: 'Your age on this date:',
      ageOnDateSubtitle: '(reference date)',
      yearsLabel: 'Years',
      monthsApproxLabel: 'Months',
      weeksLabel: 'Weeks',
      daysLabel: 'Days',
      hoursLabel: 'Hours',
      minutesLabel: 'Minutes',
      secondsLabel: 'Seconds',
      footerText: 'All processing is done in your browser.',
      errorBirthInvalid: 'Date of birth is not valid.',
      errorTargetInvalid: 'Target date is not valid.',
      errorTargetBeforeBirth: 'Target date cannot be earlier than date of birth.',
      errorBirthIncomplete: 'Date of birth is incomplete.',
      errorTargetIncomplete: 'Target date is incomplete.',
      errorGeneric: 'An error occurred while calculating.',
      growingTimelineTitle: 'Growing Age Timeline',
      nextBirthdayTitle: 'Next Birthday',
      nextBirthdayDateLabel: 'Date',
      monthsLeftLabel: 'Months left',
      daysLeftShortLabel: 'Days left',
      hoursLeftLabel: 'Hours left',
      minutesLeftLabel: 'Minutes left',
      secondsLeftLabel: 'Seconds left',
      monthsLeftInline: 'months',
      daysLeftInline: 'days',
      usageIntroText:
        'Enter your birth date and target date, then press "Calculate Age".',

      langID: 'Bahasa Indonesia',
      langEN: 'English'
    }
  };
  function t(key) {
    const pack = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return pack[key] || key;
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) {
      console.warn('Unknown language:', lang, 'fallback to EN');
      lang = 'en';
    }

    currentLang = lang;

    const detail = { lang, locale: lang === 'id' ? 'id-ID' : 'en-US' };

    window.dispatchEvent(new CustomEvent('app-language-changed', { detail }));
    window.dispatchEvent(new CustomEvent('language-changed', { detail }));
  }

  window.APP_CONFIG = {
    get LANG() {
      return currentLang;
    },
    get LOCALE() {
      return currentLang === 'id' ? 'id-ID' : 'en-US';
    },
    t,
    setLang
  };

})();