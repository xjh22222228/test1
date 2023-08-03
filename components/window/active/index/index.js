import { Popup } from "vant";
import SwiperBannerComponents from "@components/2.0.0/swiperBanner/index";
import PublicJumpComponents from "@components/publicJump/index";
import exitImg from '@/assets/images/icon_popup_exit_w@2x.png';
export default {
  components: {
    [Popup.name]: Popup,
    SwiperBannerComponents,
    PublicJumpComponents
  },
  data() {
    return {
      state: false,
      repeatClick: false,
      exitImg,
      activeBanner: {
        // 切换的比例显示
        bannerHeight: 4 / 3,
        // 切换的数据来源
        bannerType: "activeBanner",
        hidePagination: true,
        spaceBetween: 16
      }
    };
  },
  computed: {
    fullPath() {
      return this.$route.path;
    },
    showState: function () {
      const full = this.fullPath;
      const state = this.state;
      const show = state && full.startsWith('/market/index');
      return show;
    },
    activeWindowData: function () {
      return this.$store.getters.marketActiveWindowData;
    },
    memberLocation: function () {
      return this.$store.getters.memberLocation;
    },
    showIndex: function () {
      return this.$store.getters.marketShowIndex;
    },
    locationPoint() {
      return this.$store.getters.locationPoint;
    }
  },
  watch: {
    showState: {
      immediate: true,
      handler(nv) {
        if (nv) {
          this.$nextTick(() => {
            this.initBanner();
          });
        }
      }
    },
    showIndex(nv, ov) {
      if (nv.length && nv[0] === "active") {
        this.state = true;
      } else {
        this.state = false;
      }
    }
  },
  methods: {
    initBanner() {
      if (!this.$refs.activeBanner) {
        return;
      }
      this.$refs.activeBanner.data = this.activeWindowData;
      this.$refs?.activeBanner?.onAction().then(result => {
        this.$refs?.activeBanner.onReset();
        this.activeBanner = {
          ...this.activeBanner,
          show: this.activeWindowData?.length
        };
      });
    },
    async initData() {
      const { dispatch } = this.$store;
      const point = { ...this.locationPoint, ...this.memberLocation?.point };
      return dispatch("marketDispatchActiveWindow", { point });
    },
    nextTimeShow() {
      this.close();
    },
    close() {
      this.state = false;
      this.$store.commit("marketRemoveShowIndex", "active");
      this.$store.dispatch("marketSetNextTimeWindow", "active");

      // 上报数据
      const reportParams = this.activeWindowData.map(item => ({
        id: item.id,
        clickType: 3, // 弹窗
        clickCloseNum: 1
      }));
      this.$store.commit('setMarketReports', reportParams);
    },
    clickBanner(data) {
      // 上报
      this.$store.commit('setMarketReports', [{
        id: data.id,
        clickType: 3, // 弹窗
        clickNum: 1
      }]);
      this.close();
    },
    onExpose(data) {
      // 上报
      this.$store.commit('setMarketReports', [{
        id: data.id,
        clickType: 3, // 弹窗
        rotationShowNum: 1
      }]);
    }
  }
};
