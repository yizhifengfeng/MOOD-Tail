const DIRECTION_CLASS = {
  bright: 'mood-bright',
  calm: 'mood-calm',
  deep: 'mood-deep'
};

function pad2(n) {
  const x = Number(n);
  return x < 10 ? `0${x}` : `${x}`;
}

function toDateStr(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function buildMoodMap(moodData) {
  const map = {};
  const list = Array.isArray(moodData) ? moodData : [];
  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    if (!row || typeof row !== 'object') continue;
    const date = row.date;
    if (typeof date !== 'string' || !date) continue;
    map[date] = {
      date,
      direction: row.direction === 'bright' || row.direction === 'calm' || row.direction === 'deep' ? row.direction : 'calm',
      cocktailId: row.cocktailId != null ? String(row.cocktailId) : ''
    };
  }
  return map;
}

Component({
  properties: {
    moodData: {
      type: Array,
      value: []
    }
  },

  data: {
    currentYear: 1970,
    currentMonth: 1,
    calendarDays: [],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    gridOpacity: 1
  },

  observers: {
    moodData() {
      this.generateCalendar();
    }
  },

  lifetimes: {
    attached() {
      const now = new Date();
      this.setData({
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1
      });
      this.generateCalendar();
    }
  },

  methods: {
    generateCalendar() {
      const year = this.data.currentYear;
      const month = this.data.currentMonth;
      const moodMap = buildMoodMap(this.properties.moodData);

      const first = new Date(year, month - 1, 1);
      const startWeekday = first.getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

      const today = new Date();
      const ty = today.getFullYear();
      const tm = today.getMonth() + 1;
      const td = today.getDate();

      const cells = [];
      let idx = 0;

      for (let i = 0; i < startWeekday; i++) {
        cells.push({
          type: 'empty',
          cellKey: `e-${year}-${month}-${idx++}`,
          rowClass: 'mood-calendar__cell mood-calendar__cell--empty'
        });
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = toDateStr(year, month, d);
        const mood = moodMap[dateStr];
        const direction = mood ? mood.direction : '';
        const moodClass = direction && DIRECTION_CLASS[direction] ? DIRECTION_CLASS[direction] : '';
        const hasMood = Boolean(mood);

        const isToday = ty === year && tm === month && td === d;
        let cellClass = 'mood-calendar__cell mood-calendar__cell--day';
        if (moodClass) cellClass += ` ${moodClass}`;
        if (isToday) cellClass += ' cell-today';

        cells.push({
          type: 'day',
          cellKey: `d-${dateStr}`,
          day: d,
          dateStr,
          hasMood,
          rowClass: cellClass,
          isToday
        });
      }

      while (cells.length < 42) {
        cells.push({
          type: 'empty',
          cellKey: `t-${year}-${month}-${idx++}`,
          rowClass: 'mood-calendar__cell mood-calendar__cell--empty'
        });
      }

      if (cells.length > 42) {
        cells.length = 42;
      }

      this.setData({ calendarDays: cells });
    },

    prevMonth() {
      let { currentYear, currentMonth } = this.data;
      currentMonth -= 1;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear -= 1;
      }
      this._switchMonth(currentYear, currentMonth);
    },

    nextMonth() {
      let { currentYear, currentMonth } = this.data;
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
      this._switchMonth(currentYear, currentMonth);
    },

    _switchMonth(currentYear, currentMonth) {
      this.setData({ gridOpacity: 0.35 });
      setTimeout(() => {
        this.setData({ currentYear, currentMonth });
        this.generateCalendar();
        this.setData({ gridOpacity: 1 });
      }, 120);
    },

    onDateTap(e) {
      const dateStr = e.currentTarget.dataset && e.currentTarget.dataset.dateStr;
      if (!dateStr) return;

      const moodMap = buildMoodMap(this.properties.moodData);
      const mood = moodMap[dateStr] || null;
      if (!mood) return;

      this.triggerEvent('datetap', {
        date: dateStr,
        direction: mood.direction,
        cocktailId: mood.cocktailId || '',
        mood
      });
    }
  }
});
