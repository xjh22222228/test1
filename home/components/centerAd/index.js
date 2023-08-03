import filter from '@/JS/filter.js';
import PublicJump from '@/components/publicJump';

export default {
  components: {
    PublicJump
  },
  data() {
    return {
      imgCompress: filter.imgCompress,
      observerReport: null // 侦测曝光
    };
  },

  computed: {
    // 結構對應的數量
    typeCountList() {
      return [2, 3, 4, 4, 3, 3]
    },
    // 瓷片广告列表
    marketPorcelainAds() {
      const list = this.$store.state.marketHome.marketPorcelainAds || []
      return list.map(item => {
        return this.formatItem(item)
      })
    }
  },
  activated() {
    // 避免刚进页面时多余的广告统计
    setTimeout(() => {
      this.handleObserverReport();
    }, 500);
  },
  deactivated() {
    this.destoryObserver();
  },

  destroyed() {
    this.destoryObserver();
  },

  watch: {
    marketPorcelainAds: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.handleObserverReport();
        }
      }
    }
  },

  methods: {
    // 格式化一个瓷片广告组件数据
    formatItem(item) {
      const itemList = item.list
      // 瓷片广告模版结构类型
      // type结构类型：1 一行兩個 2 一行三個 3 一行四個 4 兩行四個 5 左一右二 6 左二右一
      const index = item.type - 1
      if (index < 0) return []
      if (!itemList?.length) return []
      const count = this.typeCountList[index]
      // 構造對應長度的數組
      let customList = new Array(count).fill({})
      customList = customList.map((item, index) => {
        // 找到對應位置的瓷片
        const foundItem = itemList.find(element => element.porcelainChipsLocation === index + 1)
        if (foundItem) {
          return { ...foundItem }
        } else {
          return {
            id: index + 1
          }
        }
      })
      return {
        type: item.type,
        list: customList
      };
    },
    destoryObserver() {
      if (this.observerReport) {
        this.observerReport.disconnect();
        this.observerReport = null;
      }
    },

    // 曝光
    handleObserverReport() {
      this.$nextTick(() => {
        if (this.observerReport) return
        const el = this.$refs.node;
        if (!el) {
          return;
        }
        this.destoryObserver();
        this.observerReport = new IntersectionObserver(entries => {
          if (entries[0].intersectionRatio <= 0) {
            return;
          }
          const params = []
          // 为格式化过的原始数据
          this.$store.state.marketHome.marketPorcelainAds.forEach(item => {
            const list = item.list.map((element) => {
              return {
                id: element.id,
                clickType: 2,
                rotationShowNum: 1
              }
            })
            params.push(...list)
          });
          this.$store.commit('setMarketReports', params);
        });
        this.observerReport.observe(el);
      })
    },

    onClick(data) {
      if (!data.id) return
      // 上报
      this.$store.commit('setMarketReports', [{
        id: data.id,
        clickType: 2, // 中通
        clickNum: 1
      }]);
      this.$refs.publicJump.jump({
        ...data,
        _from: '商超中通瓷片'
      });
    }
  }
};
