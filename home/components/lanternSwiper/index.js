import PublicJump from '@/components/publicJump';

export default {
  components: {
    PublicJump
  },

  data() {
    return {
      scrollLeft: 0
    };
  },

  computed: {
    lantern() {
      return this.$store.state.marketHome.marketLantern;
    },
    lanternList() {
      return this.$store.state.marketHome.marketLanternList;
    },
    width() {
      if (this.lantern?.layoutType == 2) {
        if (this.lanternList.length > 10) {
          const len = Math.ceil(this.lanternList.length / 2);
          return (len * 0.61) + ((len + 1) * 0.12) + 'rem';
        }
      }
      return null;
    },

    // 显示进度条
    showProgress() {
      return this.lantern?.layoutType == 2 && this.lanternList.length > 10;
    }
  },

  watch: {
    lanternList() {
      const el = this.$refs.swipe;
      const containerEl = this.$refs.container;
      if (el) {
        el.scrollLeft = 0;
      }
      if (containerEl) {
        containerEl.scrollLeft = 0;
      }
      this.resetScroll();
    }
  },

  activated() {
    this.$nextTick(() => {
      const el = this.$refs.swipe;
      const containerEl = this.$refs.container;
      if (el) {
        el.scrollLeft = this.scrollLeft;
      }
      if (containerEl) {
        containerEl.scrollLeft = this.scrollLeft;
      }
    });
  },

  methods: {
    // 还原滚动条位置
    resetScroll() {
      this.$nextTick(() => {
        const barEl = this.$refs.bar;
        if (!barEl) {
          return;
        }
        barEl.style.left = 0;
      });
    },

    onClick(data) {
      this.$refs.jump.jump(data);
    },

    onScroll(e) {
      const scrollLeft = e.target.scrollLeft;
      this.scrollLeft = scrollLeft;
      if (!this.showProgress) {
        return;
      }
      const barEl = this.$refs.bar;
      const containerEl = this.$refs.container;
      const swipeEl = this.$refs.swipe;
      const progressEl = this.$refs.progress;
      if (!barEl) {
        return;
      }
      const barWidth = barEl.offsetWidth;
      const diff = swipeEl.offsetWidth - containerEl.offsetWidth;
      const left = scrollLeft / diff;
      const w = progressEl.offsetWidth - barWidth;
      barEl.style.left = w * left + 'px';
    }
  }
};
