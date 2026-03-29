const ACCENT = {
  bright: '#FF9F43',
  calm: '#4ECDC4',
  deep: '#A855F7'
};

const ACCENT_GLOW = {
  bright: 'rgba(255, 159, 67, 0.28)',
  calm: 'rgba(78, 205, 196, 0.28)',
  deep: 'rgba(168, 85, 247, 0.28)'
};

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function safeStr(v) {
  return v == null ? '' : String(v);
}

Component({
  properties: {
    recipe: {
      type: Object,
      value: {}
    },
    direction: {
      type: String,
      value: 'calm'
    },
    /** 为 true 时隐藏体感/浓度条（详情页改在「你当时说」下方展示） */
    hideBottomMeter: {
      type: Boolean,
      value: false
    }
  },

  data: {
    accentColor: ACCENT.calm,
    accentGlow: ACCENT_GLOW.calm,
    baseName: '',
    baseFlavor: '',
    topIngredient: '',
    topMood: '',
    midIngredient: '',
    midMood: '',
    tailIngredient: '',
    tailMood: '',
    feeling: '',
    concentrationText: '0%',
    progressPercent: 0,
    summary: ''
  },

  observers: {
    direction: function (dir) {
      this.applyAccent(dir);
    },
    recipe: function (r) {
      this.applyRecipe(r);
    }
  },

  lifetimes: {
    attached() {
      this.applyAccent(this.properties.direction);
      this.applyRecipe(this.properties.recipe);
    }
  },

  methods: {
    applyAccent(dir) {
      const key = dir && ACCENT[dir] ? dir : 'calm';
      this.setData({
        accentColor: ACCENT[key],
        accentGlow: ACCENT_GLOW[key]
      });
    },

    applyRecipe(raw) {
      const recipe = raw && typeof raw === 'object' ? raw : {};
      const base = recipe.base && typeof recipe.base === 'object' ? recipe.base : {};
      const notes = recipe.notes && typeof recipe.notes === 'object' ? recipe.notes : {};
      const top = notes.top && typeof notes.top === 'object' ? notes.top : {};
      const mid = notes.mid && typeof notes.mid === 'object' ? notes.mid : {};
      const tail = notes.tail && typeof notes.tail === 'object' ? notes.tail : {};

      const conc = recipe.concentration;
      const num = typeof conc === 'number' ? conc : parseFloat(conc);
      const pct = clamp(Number.isNaN(num) ? 0 : Math.round(num), 0, 100);

      this.setData({
        baseName: safeStr(base.name),
        baseFlavor: safeStr(base.flavor),
        topIngredient: safeStr(top.ingredient),
        topMood: safeStr(top.mood),
        midIngredient: safeStr(mid.ingredient),
        midMood: safeStr(mid.mood),
        tailIngredient: safeStr(tail.ingredient),
        tailMood: safeStr(tail.mood),
        feeling: safeStr(recipe.feeling),
        concentrationText: `${pct}%`,
        progressPercent: pct,
        summary: safeStr(recipe.summary)
      });
    }
  }
});
