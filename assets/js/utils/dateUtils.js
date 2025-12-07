window.DateUtils = {
  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  },

  toUtcDateOnlyTimestamp(date) {
    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  },

  _t(key, fallback) {
    if (window.APP_CONFIG && APP_CONFIG.t) {
      return APP_CONFIG.t(key);
    }
    return fallback || key;
  },

  calculateAge(birthDateInput, targetDateInput) {
    const todayRaw = targetDateInput ? new Date(targetDateInput) : new Date();
    const birthRaw = new Date(birthDateInput);

    if (!this.isValidDate(birthRaw)) {
      throw new Error(this._t('errorBirthInvalid', 'Tanggal lahir tidak valid.'));
    }
    if (!this.isValidDate(todayRaw)) {
      throw new Error(this._t('errorTargetInvalid', 'Tanggal target tidak valid.'));
    }

    const todayDateOnly = new Date(
      todayRaw.getFullYear(),
      todayRaw.getMonth(),
      todayRaw.getDate()
    );
    const birthDateOnly = new Date(
      birthRaw.getFullYear(),
      birthRaw.getMonth(),
      birthRaw.getDate()
    );

    if (birthDateOnly > todayDateOnly) {
      throw new Error(this._t(
        'errorTargetBeforeBirth',
        'Tanggal target tidak boleh lebih awal dari tanggal lahir.'
      ));
    }

    let years = todayDateOnly.getFullYear() - birthDateOnly.getFullYear();
    let months = todayDateOnly.getMonth() - birthDateOnly.getMonth();
    let days = todayDateOnly.getDate() - birthDateOnly.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(
        todayDateOnly.getFullYear(),
        todayDateOnly.getMonth(),
        0
      );
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const birthUtc = this.toUtcDateOnlyTimestamp(birthDateOnly);
    const todayUtc = this.toUtcDateOnlyTimestamp(todayDateOnly);
    const diffMs = todayUtc - birthUtc;

    const totalDays = Math.floor(diffMs / MS_PER_DAY);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    const totalYearsApprox = totalDays / 365.25;
    const totalMonthsApprox = Math.round(totalYearsApprox * 12);

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalYearsApprox,
      totalMonthsApprox,
      targetDate: todayDateOnly
    };
  },

  calculateFunFacts(age) {
    const totalDays = age.totalDays;
    const totalMinutes = age.totalMinutes;

    if (typeof totalDays !== 'number' || typeof totalMinutes !== 'number') {
      throw new Error(this._t(
        'errorGeneric',
        'Terjadi kesalahan saat menghitung.'
      ));
    }

    const totalYearsApprox =
      typeof age.totalYearsApprox === 'number'
        ? age.totalYearsApprox
        : totalDays / 365.25;

    const totalMonthsApprox =
      typeof age.totalMonthsApprox === 'number'
        ? age.totalMonthsApprox
        : Math.round(totalYearsApprox * 12);

    const AVG_BREATHS_PER_MIN = 12;
    const AVG_HEART_BEATS_PER_MIN = 72;
    const AVG_LAUGHS_PER_DAY = 10;
    const SLEEP_FRACTION = 1 / 3;
    const HAIR_GROWTH_CM_PER_MONTH = 1.25;
    const NAIL_GROWTH_MM_PER_MONTH = 3.5;

    const breaths = Math.round(totalMinutes * AVG_BREATHS_PER_MIN);
    const heartBeats = Math.round(totalMinutes * AVG_HEART_BEATS_PER_MIN);
    const laughs = Math.round(totalDays * AVG_LAUGHS_PER_DAY);

    const sleepYears = totalYearsApprox * SLEEP_FRACTION;
    const hairLengthMeters =
      (totalMonthsApprox * HAIR_GROWTH_CM_PER_MONTH) / 100;
    const nailLengthMeters =
      (totalMonthsApprox * NAIL_GROWTH_MM_PER_MONTH) / 1000;

    return {
      breaths,
      heartBeats,
      laughs,
      sleepYears,
      hairLengthMeters,
      nailLengthMeters
    };
  }
};