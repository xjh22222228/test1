import HeaderLocation from '../components/headerLocation/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import NoData from '../components/goods/no-data';
import NearItem from "./near-item.vue";
import { isEqual } from 'lodash';
import mf from "@/JS/mFoodSDK";

export default {
  components: {
    HeaderLocation,
    ScrollBar,
    NoData,
    NearItem
  },

  data() {
    return {
      sortType: 0,
      sortTypes: [
        { id: 0, title: "綜合排序" },
        { id: 2, title: "銷量" },
        { id: 1, title: "距離" }
      ],
      isLocationChange: false, // 记录地址是否发生变化
      outList: [], // 配送范围外门店
      next: true,
      loading: false,
      pageNo: 0,
      showFilter: false, // 显示筛选弹框
      filterList: [
        { name: '滿額立減', value: 1, selected: false },
        { name: '滿額打折', value: 2, selected: false },
        { name: '代金券', value: 3, selected: false },
        { name: '買贈活動', value: 4, selected: false },
        { name: '滿贈活動', value: 5, selected: false },
        { name: '折扣商品', value: 6, selected: false }
      ]
    };
  },

  computed: {
    memberLocation() {
      return this.$store.getters.memberLocation;
    },

    // 计算筛选选中几个
    filterSelectedNum() {
      return this.filterList.filter(item => item.selected).length;
    }
  },

  watch: {
    // 监听用户坐标是否变化
    memberLocation: {
      immediate: false,
      handler(v, nv) {
        if (!isEqual(v?.point, nv?.point)) {
          this.isLocationChange = true;
        }
      }
    }
  },

  activated() {
    this.$toast.clear();
    if (this.isLocationChange) {
      this.onTab();
      this.isLocationChange = false;
    }
  },

  methods: {
    getData(params) {
      return this.$store.dispatch('getMarketNearStore', {
        sortType: this.sortType,
        ...params
      });
    },

    onDownCallback(done) {
      this.reset();
      this.$refs.goods.reset();
      this.$refs.goods.getData(null, true).finally(() => {
        done && done();
      });
    },

    handleEnd(data) {
      if (this.loading || !this.next || data.next) {
        return;
      }
      this.loading = true;
      this.$store.dispatch('getMarketOutNearStore', {
        sortType: this.sortType,
        offset: this.pageNo * 20,
        size: 20
      })
        .then(res => {
          if (!res) {
            return;
          }
          if (this.pageNo <= 0) {
            this.outList = [];
          }
          this.pageNo += 1;
          if (res.result) {
            this.outList = [
              ...this.outList,
              ...res.result
            ];
          }
          if (!res.next) {
            this.next = false;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    reset() {
      const mescrollEl = document.querySelector('.mescroll');
      if (mescrollEl) {
        mescrollEl.scrollTop = 0;
      }
      this.pageNo = 0;
      this.outList = [];
      this.next = true;
      this.showFilter = false;
    },

    onClickFilter(idx) {
      this.filterList[idx].selected = !this.filterList[idx].selected;
    },

    // 筛选重置
    onFilterReset() {
      this.filterList.forEach((item, idx) => {
        this.filterList[idx].selected = false;
      });
      this.onTab();
    },

    // 筛选完成
    onFilterDone() {
      this.onTab();
    },

    onTab(data) {
      if (data) {
        this.sortType = data.id;
      }
      this.reset();
      this.$refs.goods.reset();
      this.$refs.goods.getData({ showLoading: true }, true);
    },

    goStore(data) {
      const secondShop = this.sortTypes.find(item => item.id === this.sortType)?.title;
      mf.goMarketStore({
        id: data.id,
        data: {
          ...data,
          second_shop: secondShop
        }
      });
    }
  }
};
