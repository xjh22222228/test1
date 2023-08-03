import GoodsTab from './tab';
import GoodsGroup from '../../../components/goods/group/index.vue';
import GoodsItem from '../../../components/goods/item/index.vue';
import GoodsNoData from '../../../components/goods/no-data';
import filter from '@/JS/filter.js';
import event, { MARKET_TAB } from '@/JS/event';
import NearItem from '../../../near/near-item.vue';

export default {
  props: {
    // 新用户
    newUser: {
      type: Boolean,
      default: false
    },
    // HTTP请求
    http: {
      type: Function,
      default: undefined
    }
  },

  components: {
    GoodsGroup,
    GoodsItem,
    GoodsNoData,
    GoodsTab,
    NearItem
  },

  data() {
    return {
      imgCompress: filter.imgCompress,
      id: null, // tab栏目ID
      finish: false,
      cacheMap: {} // 缓存Tab数据
    };
  },

  computed: {
    tabs() {
      if (this.newUser) {
        return [];
      }
      return this.$store.state.marketHome.marketGoodsTabs;
    },
    // 当前选中Tab索引
    tabIndex() {
      return this.tabs.findIndex(item => item.id === this.id);
    },
    // 当前选中Tab数据
    tabData() {
      return this.tabs[this.tabIndex] || {};
    }
  },

  methods: {
    handleFinish(q) { // 参数
      if (q.offset == 0) {
        // 首页进入，才滑动
        setTimeout(() => {
          const clickGoods = this.$route.params.productSkuId;
          const dom = document.getElementById(`item-${clickGoods}`);
          if (dom && clickGoods) {
            dom.scrollIntoView({
              behavior: 'smooth', block: 'center', inline: 'start'
            });
          }
        }, 100);
      }
      // 首页进来初次加载定位到对应商品
      this.finish = true;
    },
    getGoodsData(params) {
      if (this.$refs.goods) {
        this.$refs.goods.reset();
        this.$refs.goods.getData(params);
      }
    },
    onTab(id) {
      if (!id && this.tabs.length > 0) {
        id = this.tabs[0].id;
      }
      this.getGoodsData({
        showLoading: true,
        id,
        callback: () => {
          this.id = id;
          this.$refs.goods.reWaterfallFlow(); // 触发下瀑布流
          // Tab 置顶
          // this.$nextTick(() => {
          //   const tabEl = document.getElementById('goods-zone');
          //   const headEl = document.querySelector('.market-home-sticky');
          //   const mescrollEl = document.querySelector('.mescroll');
          //   if (tabEl && headEl && mescrollEl) {
          //     const top = tabEl.offsetTop - headEl.offsetHeight;
          //     mescrollEl.scroll({
          //       top,
          //       behavior: 'smooth'
          //     });
          //   }
          // });
        }
      });

      const tabIdx = this.tabs.findIndex(item => item.id === id);

      // 不是在新人专区页面，预加载其他Tab数据
      if (!this.newUser && tabIdx >= 0) {
        // 第一个
        if (tabIdx === 0) {
          this.getData({ id: this.tabs[tabIdx + 1]?.id, static: true });
          this.getData({ id: this.tabs[tabIdx + 2]?.id, static: true });
        } else if (tabIdx === this.tabs.length - 1) {
          // 最后一个
          this.getData({ id: this.tabs[tabIdx - 1]?.id, static: true });
          this.getData({ id: this.tabs[tabIdx - 2]?.id, static: true });
        } else {
          this.getData({ id: this.tabs[tabIdx + 1]?.id, static: true });
          this.getData({ id: this.tabs[tabIdx - 1]?.id, static: true });
        }
      }
    },

    // 獲取數據
    async getData(params) {
      if (this.http) {
        return this.http(params);
      }
      const payload = {
        id: this.id,
        ...params
      };
      if (!payload.id) {
        return;
      }
      // 先检测是否有缓存
      if (
        this.cacheMap[payload.id] &&
        payload.offset === 0 &&
        !payload.static // 走缓存
      ) {
        return this.cacheMap[payload.id];
      }

      const tabData = this.tabs.find(item => item.id === payload.id);
      const http = tabData?.type === 2
        ? this.$store.dispatch('getMarketGoodsByTabId', payload)
        : this.$store.dispatch('getMarketStoreByTabId', payload);
      return http.then(res => {
        // 缓存第一个数据
        if (!params.offset) {
          this.cacheMap[payload.id] = res;
        }
        return res;
      }).catch(e => {
        if (!params.offset) {
          const note = e?.response?.data?.note;
          this.cacheMap[payload.id] = null;
          if (note && !payload.static) {
            this.$toast(note);
          }
        }
        return e;
      });
    }
  },

  mounted() {
    event.$on(MARKET_TAB, this.onTab);
    // 清空缓存
    event.$on('clearMarketIndexTabCache', () => {
      this.cacheMap = {};
    });
  }
};
