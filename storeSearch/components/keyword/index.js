import event from '../../event';

export default {
  props: {
    showData: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      hotDataList: [],
      historyKeywords: [] // 历史关键词
    };
  },

  mounted() {
    // 歷史關鍵字
    const historyKeywords = window.localStorage.getItem("market-keywords");
    if (historyKeywords) {
      this.historyKeywords = JSON.parse(historyKeywords);
      this.$emit('change', this.historyKeywords);
    }
    event.$on('keyword', (historyKeywords) => {
      this.historyKeywords = historyKeywords;
      const json = JSON.stringify(this.historyKeywords);
      window.localStorage.setItem("market-keywords", json);
      this.$emit('change', this.historyKeywords);
    });
  },
  activated() {
    // 歷史關鍵字
    const historyKeywords = window.localStorage.getItem("market-keywords");
    if (historyKeywords) {
      this.historyKeywords = JSON.parse(historyKeywords);
      this.$emit('change', this.historyKeywords);
    }
    event.$on('keyword', (historyKeywords) => {
      this.historyKeywords = historyKeywords;
      const json = JSON.stringify(this.historyKeywords);
      window.localStorage.setItem("market-keywords", json);
      this.$emit('change', this.historyKeywords);
    });
  },

  methods: {
    searchHistory(data) {
      this.$emit('search', data, true/** 是否历史搜索 */);
    },

    // 清空历史
    handleClear() {
      this.historyKeywords = [];
      window.localStorage.removeItem("market-keywords");
      this.$emit('change', this.historyKeywords);
    }
  }
};
