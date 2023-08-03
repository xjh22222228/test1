import { Search, Tab, Tabs } from "vant";
import Keyword from './components/keyword/index.vue';
import event from './event';
import { cloneDeep } from 'lodash';
import GoodsItem from '../components/search-goods/item/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import GoodsEnd from '../components/goods/end/index.vue';
import utils from '@/JS/utils';
import StoreTakeoutTimeComponents from "@components/storeTakeoutTime";
import shence from '@/JS/shence';

const outData = {
  pageNo: 0,
  pageSize: 20,
  next: true,
  loading: false,
  goods: [] // 不在配送範圍的商品
};

export default {
  components: {
    Keyword,
    GoodsItem,
    ScrollBar,
    GoodsEnd,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Search.name]: Search,
    StoreTakeoutTimeComponents
  },
  data() {
    return {
      safeClassName: utils.getSafeTopClassName('padding'),
      keywords: "",
      showAction: true,
      showData: false,
      keywordsData: [],
      sortId: 0,
      sortType: [
        { id: 0, title: "綜合排序" },
        { id: 1, title: "價格", up: false }
      ],
      hotDataList: [],
      hasSearch: false,
      mode: '',
      outData: { // 不在配送範圍
        ...outData
      },
      isHistory: false // 是否从历史记录里搜索
    };
  },
  computed: {
    // 顯示左上角返回按鈕
    showBack: function () {
      return !this.showAction && !!this.keywords;
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
    this.hasSearch = false;
  },
  activated() {
    this.outData = { ...outData };
    this.keywords = this.$route.query.q || '';
    this.$toast.clear();
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

    onChangeHistory(keywords) {
      this.sortId = 0;
      this.keywordsData = keywords;
    },

    // 搜索框獲得焦點
    onSearchBack() {
      this.keywords = "";
      this.showData = false;
      this.showAction = true;
      this.$store.dispatch('goBack');
    },
    // 搜索框獲得焦點
    onFocus() {
      this.showData = false;
      this.showAction = true;
    },
    // 取消搜索，返回上一頁
    handlenCancel() {
      this.$store.dispatch('goBack');
    },
    onTouchstart() {
      // document.activeElement.blur();
    },

    // 點擊搜索
    handlenSearch(val, isHistory) {
      if (typeof val === "object" || !val) {
        return false;
      }
      this.isHistory = !!isHistory;
      this.hasSearch = true;
      let keywordsData = cloneDeep(this.keywordsData);
      // 刪除原來關鍵字
      const index = keywordsData.indexOf(val);
      if (index !== -1) keywordsData.splice(index, 1);
      // 添加新關鍵字
      keywordsData.unshift(val);
      keywordsData = keywordsData.slice(0, 5);
      event.$emit('keyword', keywordsData);
      // 點擊搜索
      this.keywords = val;
      this.$router.replace({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          q: val
        }
      });
      this.showAction = false;
      this.showData = true;
      this.resetOut();
      this.$refs.goods.reset(true);
      this.$refs.goods.getData({ showLoading: true }, true);
    },

    // 搜索查詢參數
    getSearchParams() {
      const queryParams = {
        keyword: this.keywords,
        sortType: null,
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
      if (!this.showData) {
        return;
      }
      this.mode = this.$route.query.mode;
      const queryParams = {
        ...this.getSearchParams(),
        ...params
      };

      let http;
      if (queryParams.keyword === '') {
        http = false;
      } else {
        // 獲取店内商品
        http = this.$store.dispatch('getMarketGoods', queryParams).then(res => {
          if (queryParams.offset === 0) {
            this.$store.dispatch('getGlobalMemberLevel') // 获取全局配置会员等级信息
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
      this.resetOut();
      this.$refs.goods.reset();
      this.$refs.goods.getData({ showLoading: true }, true);
    },

    resetOut() {
      const mescrollEl = document.querySelector('.mescroll');
      if (mescrollEl) {
        mescrollEl.scrollTop = 0;
      }
      this.outData.loading = false;
      this.outData.pageNo = 0;
      this.outData.next = true;
      this.outData.goods = [];
    },

    // 觸發到底部
    onEnd(data) {
      if (!this.showData) {
        return;
      }
      if (this.outData.loading || !this.outData.next || data?.next) {
        return;
      }
      this.outData.loading = true;
      this.$store.dispatch('getMarketOutGoods', {
        ...this.getSearchParams(),
        offset: this.outData.pageNo * this.outData.pageSize,
        size: this.outData.pageSize
      }).then(res => {
        if (this.outData.pageNo <= 0) {
          this.outData.goods = [];
        }
        this.pageNo += 1;
        if (res && res.result) {
          this.outData.goods = [
            ...this.outData.goods,
            ...res.result
          ];
        }
        if (res && !res.next) {
          this.outData.next = false;
        }
      }).finally(() => {
        this.outData.loading = false;
      });
    }
  },

  // 進入路由
  beforeRouteEnter(to, from, next) {
    next(vm => {
      const storePage = ["marketStore", 'marketOrder'];
      if (!storePage.includes(from.name)) {
        // 店内搜索
        vm.showData = false;
        vm.searchEnd = true;
      } else {
        vm.searchEnd = false;
      }
    });
  }
};
