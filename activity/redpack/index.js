import { post } from "@ajax";
import GoodsComponents from "@/views/market/components/store-item/near-store/storeItem";
import PolymerizationComponents from "@components/polymerization/index";
import loginComponent from "@components/loginComponent";
import mf from "@/JS/mFoodSDK";
export default {
  components: {
    GoodsComponents,
    PolymerizationComponents,
    loginComponent
  },
  data() {
    return {
      inList: [],
      navShow: mf.navShow,
      mescroll: {
        navTitle: "可用門店",
        total: 0,
        next: true,
        allwayShow: mf.navShow,
        up: {
          htmlNodata: 0,
          htmlLoading: "<p class=\"upwarp-progress mescroll-rotate\"></p><p class=\"upwarp-tip\">加載中..</p>"
        }
      },
      params: {
        lat: "",
        lon: "",
        size: 20,
        offset: 0,
        redpackId: this.$route.query.redpackId,
        storeIds: ''
        // showLoading: true
      }
    };
  },
  computed: {
    // 紅包列表點擊去使用的門店列表
    marketRedpackStore: function () {
      return this.$store.getters.marketRedpackStore;
    },
    // 活動定位地址
    activityLocation: function () {
      return this.$store.getters.activityLocation;
    }
  },
  watch: {
    marketRedpackStore: {
      deep: true,
      immediate: true,
      handler(newData, oldData) {
        const { lat, lon, id } = newData;
        // 下拉組件還未創建對象
        if (!this.mescroll.component) return;
        // 參數不齊全
        if (!lat || !lon || !id) return;
        // 參數沒有變動
        if (_.isEqual(_.omit(newData, "cache"), _.omit(oldData, "cache"))) {
          this.mescroll.component.mescroll.scrollTo(this.mescroll.scroll, 0);
          return this.$toast.clear();
        }
        // 參數
        this.params = {
          ...this.params,
          ...{ lat: newData.lat, lon: newData.lon, redpackId: newData.id },
          size: 20,
          offset: 0
        };

        // 清空數據
        this.inList = [];
        // 執行查詢
        this.mescroll.component.mescroll.endDownScroll();
        this.mescroll.component.mescroll.resetUpScroll();
      }
    }
  },
  methods: {
    back(res) {
      res.data = false;
      this.$store.dispatch('goBack');
    },
    share() {
      this.$refs.share.share({
        shareTitle: this.mescroll.navTitle,
        shareRemark: this.mescroll.navTitle,
        shareImage: this.activityData.banner
      });
    },
    midLabelShow(index) {
      const inList = this.inList;
      if (!inList || inList.length <= 0) return false;
      const item = inList[index];
      if (index == 0 && !item.isInDeliveryArea) return true;
      if (index == 0) return false;
      const firstItem = inList[index - 1];
      if (firstItem.isInDeliveryArea && !item.isInDeliveryArea) return true;
      return false;
    },
    backDetailFn(data) {
      this.$refs.storeJump.jump({ id: data.id });
    },
    storeShowFn(data) { },
    storeErrorFn(data) { },
    resetAction() {
      this.params = {
        ...this.params,
        size: 20,
        offset: 0
      };
      this.mescroll.component.mescroll.resetUpScroll();
    },
    searchAction() {
      if (this.$route.query.couponId) {
        post("/member/score/mall/coupon/_storeIdList", { id: this.$route.query.couponId, couponUserId: this.$route.query.couponUserId }).then(res => {
          const ids = res.storeIdList || []
          this.params.storeIds = ids.join();
          this.requestData();
        })
      } else {
        this.requestData();
      }
    },
    requestData() {
      post("/market/store/near/_list", {
        ...this.params
      })
        .then(result => {
          if (this.params.offset === 0) {
            this.inList.splice(0);
          }
          this.$toast.clear();
          this.mescroll.total += (result?.result?.length || 0);
          this.mescroll.next = result.next;
          this.params.offset = parseInt(result.nextOffset);
          this.inList.push(...result.result);
          this.$refs?.component?.endSuccess(this.mescroll.total, this.mescroll.next);
        }).catch(error => {
          console.log(error);
          document.title = "可用門店";
          this.mescroll = { ...this.mescroll, ...{ navTitle: "可用門店" } };
          this.$toast.clear();
          const { total, next } = this.mescroll;
          this.mescroll.component.endSuccess(total, next);
        });
    },
    loadPage() {
      mf.hideTopbar();
      if (this.$route.query.couponId) {
        // 清空數據
        this.inList = [];
        // 執行查詢
        this.mescroll.component.mescroll.endDownScroll();
        this.mescroll.component.mescroll.resetUpScroll();
      } else {
        // 使用緩存
        if (this.marketRedpackStore.cache) {
          this.$toast.clear();
          this.mescroll.component.mescroll.scrollTo(this.mescroll.scroll, 0);
        }
        // 不使用緩存
        else {
          this.params.storeIds = ''
          this.params.redpackId = this.$route.query.redpackId
          // 判斷是否在客戶端並且有歷史路徑傳入
          this.$store.commit("marketRedpackStore", { lat: "", lon: "", cache: true });
          this.$store.dispatch("getPointInAllClient").then(result => {
            const id = this.$route.query.redpackId;
            const lat = this.$route.query.lat || this.activityLocation?.point?.lat;
            const lon = this.$route.query.lon || this.activityLocation?.point?.lon;
            this.$store.commit("marketRedpackStore", { lat, lon, id });
          });
        }
      }
    }
  },
  activated() {
    this.loadPage()
  },

  mounted: function () {
    this.mescroll = {
      ...this.mescroll,
      ...{
        resetAction: this.resetAction,
        searchAction: this.searchAction,
        component: this.$refs.component
      }
    };
    this.loadPage()
  }
};
