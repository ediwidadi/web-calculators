// assets/js/dateConfig.js

// Opsi hari
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

// Opsi tahun
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR; y >= 1900; y--) {
  YEAR_OPTIONS.push(y);
}

// Helper untuk membuat opsi bulan (singkatan) sesuai locale
function buildMonthOptions(locale) {
  const loc = locale || (navigator.language || 'id-ID');
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1);
    return {
      value: i + 1,
      label: date.toLocaleDateString(loc, { month: 'short' })
    };
  });
}

// Session storage untuk target date
const TARGET_DATE_STORAGE_KEY = 'ageCalcTargetDate';