import { Search, Tab, Tabs } from "vant";
import Keyword from './components/keyword/index.vue';
import event from './event';
import { cloneDeep } from 'lodash';
import GoodsItem from '../components/search-goods/item/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import GoodsEnd from '../components/goods/end/index.vue';
import InStore from './components/inStore';
import { post } from "@ajax";
import utils from '@/JS/utils';
import StoreTakeoutTimeComponents from "@components/storeTakeoutTime";
import shence from '@/JS/shence';

export default {
  components: {
    Keyword,
    GoodsItem,
    ScrollBar,
    GoodsEnd,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Search.name]: Search,
    InStore,
    StoreTakeoutTimeComponents
  },
  data() {
    const that = this;
    return {
      safeClassName: utils.getSafeTopClassName('padding'),
      keywords: "",
      showAction: true,
      showData: false,
      keywordsData: [],
      sortId: 0,
      ready: false,
      sortType: [
        { id: 0, title: "綜合排序" },
        { id: 1, title: "價格", up: false }
      ],
      hotDataList: [],
      ApiGetStoreGoods: (payload) => {
        return post("/market/product/_list_product_in_store", {
          ...payload
        }).then(async result => {
          const { dispatch } = that.$store;
          const isSafe = await dispatch('checkMenuProductBySearch', result.result);
          if (!isSafe) {
            const storeId = that.$route.query.storeId;
            await dispatch("marketStoreDetailProduct", {
              id: storeId
            });
          }
          return result;
        });
      },
      isHistory: false // 记录是否从历史记录搜索
    };
  },
  computed: {
    // 顯示左上角返回按鈕
    showBack: function () {
      return !this.showAction && !!this.keywords;
    },
    marketSearchReady() {
      return this.$store.getters.marketSearchReady;
    },
    // 店铺详情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    }
  },
  watch: {
    // 監聽關鍵字，只保留前20個字符
    keywords(data) {
      const arr = data.split("");
      const str = arr.slice(0, 30).join("");
      const reg1 = /[^\0-9a-zA-Z\u4E00-\u9FA5]/g;
      this.keywords = str.replace(reg1, "");
    }
  },
  deactivated() {
    this.removeEvent();
  },
  mounted () {
    this.$store.dispatch("marketStoreDetail", this.$route.query.storeId);
    this.$store.commit("marketSubmitBar", { show: true });
  },
  activated() {
    this.$toast.clear();
    this.$store.commit('marketSearchReady', true);
    this.$store.commit('marketDetailReady', false);
    this.addEvent();
  },
  methods: {
    removeEvent() {
      const el = document.querySelector('.mescroll');
      if (el) {
        el.removeEventListener('touchstart', this.onTouchstart);
      }
    },

    addEvent() {
      this.removeEvent();
      const el = document.querySelector('.mescroll');
      if (el) {
        el.addEventListener('touchstart', this.onTouchstart);
      }
    },

    onTouchstart() {
      // document.activeElement.blur();
    },

    onChangeHistory(keywords) {
      this.keywordsData = keywords;
    },
    // 搜索框獲得焦點
    onSearchBack() {
      this.$router.go(-1);
      this.keywords = "";
    },
    // 搜索框獲得焦點
    onFocus() {
      this.showData = false;
      this.showAction = true;
    },
    // 取消搜索，返回上一頁
    handlenCancel() {
      this.$router.go(-1);
    },

    // 點擊搜索
    handlenSearch(val, isHistory) {
      if (typeof val === "object" || !val) {
        return false;
      }
      this.isHistory = !!isHistory;
      let keywordsData = cloneDeep(this.keywordsData);
      // 刪除原來關鍵字
      const index = keywordsData.indexOf(val);
      if (index !== -1) keywordsData.splice(index, 1);
      // 添加新關鍵字
      keywordsData.unshift(val);
      keywordsData = keywordsData.slice(0, 15);
      event.$emit('keyword', keywordsData);
      // 點擊搜索
      this.keywords = val;
      this.showAction = false;
      this.$refs.goods.reset(true);
      this.$refs.goods.getData({ showLoading: true }, true);
      this.$refs.goods.lockDown(true);
      this.showData = true;
    },

    // 搜索查詢參數
    getSearchParams() {
      const queryParams = {
        keyword: this.keywords,
        sortType: null
      };
      if (this.sortId === 0) {
        queryParams.sortType = 0;
      }
      if (this.sortId === 1) {
        const idx = this.sortType.findIndex(item => item.id === this.sortId);
        if (this.sortType[idx].up) {
          queryParams.sortType = 4; // 升序
        } else {
          queryParams.sortType = 5; // 降序
        }
      }
      return queryParams;
    },

    // 點擊關鍵字
    async getData(params) {
      const queryParams = {
        ...this.getSearchParams(),
        ...params
      };
      const that = this
      let http;
      if (queryParams.keyword === '') {
        http = false;
      } else {
        // 獲取店内商品
        http = that.ApiGetStoreGoods({
          ...queryParams, storeId: this.$route.query.storeId
        }).then(res => {
          if (queryParams.offset === 0) {
            shence.marketSearchRequest({
              key_word: queryParams.keyword,
              is_recent_keyword: this.isHistory,
              result_number: res.result.length
            });
          }
          return res;
        });
      }
      return http;
    },

    // 下拉刷新
    onDownCallback(done) {
      if (this.showData) {
        this.$refs.goods.reset();
        this.$refs.goods.getData(null, true).finally(() => {
          done();
        });
      } else {
        done();
      }
    },

    // 排序
    handleSortType(id) {
      const idx = this.sortType.findIndex(item => item.id === id);
      if (this.sortType[idx].up != null && id === this.sortId) {
        this.sortType[idx].up = !this.sortType[idx].up;
      }
      this.sortId = id;
      this.$refs.goods.reset();
      this.$refs.goods.getData({ showLoading: true }, true);
    }
  },

  // 進入路由
  beforeRouteEnter(to, from, next) {
    next(vm => {
      const storePage = ["marketStore"];
      if (storePage.includes(from.name)) {
        // 店内搜索進入
        vm.showData = false;
      }
    });
  }
};
