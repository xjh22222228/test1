import { Popup, Image as VanImage } from "vant";
import PublicJumpComponents from "@components/publicJump/index";
import utils from "@utils";
import { homeReceiveRed, homeReceiveVoucher } from "@/JS/shenceUtils/discountUtil";
import activityPageRed from '../activityPageRed.vue';
import plantRed from '../plantRed.vue';
import mf from "@/JS/mFoodSDK";
import exitImg from '@/assets/images/icon_popup_exit_w@2x.png';
import event from '@/JS/event';

export default {
  components: {
    [Popup.name]: Popup,
    [VanImage.name]: VanImage,
    PublicJumpComponents,
    plantRed,
    activityPageRed
  },
  filters: {
    replaceStr(data, rex) {
      return data ? data.replace("MOP", "") : "";
    }
  },
  data() {
    return {
      state: false,
      repeatClick: false,
      utils,
      exitImg
    };
  },
  computed: {
    exposeData() {
      const item = this.rollWindowData;
      return {
        ...item,
        page_name: "首頁",
        adsense_belong_area: "首頁優惠彈窗廣告"
      };
    },
    fullPath() {
      return this.$route.path;
    },
    showState() {
      const full = this.fullPath;
      const state = this.state;
      const show = state && full.startsWith('/market/index');
      return show;
    },
    backgroundStyle() {
      const data = this.rollWindowData;
      const color = data.redpackColor || "yellow";
      return {
        background: color
      };
    },
    rollWindowData() {
      return this.$store.getters.marketRollWindowData;
    },
    showIndex() {
      return this.$store.getters.marketShowIndex;
    },
    memberLocation() {
      return this.$store.getters.memberLocation;
    },
    // 紅包列表
    marketRedList() {
      return this.rollWindowData.list || [];
    },
    // 聚合頁的紅包列表  有商超有外賣
    marketActivityPageRedList() {
      return this.rollWindowData?.aggregateRedpackInfo || [];
    },
    locationPoint() {
      return this.$store.getters.locationPoint;
    }
  },
  watch: {
    showIndex(nv, ov) {
      if (nv.length && nv[0] === "roll") {
        this.state = true;
      } else {
        this.state = false;
      }
    },
    showState(nv, ov) {
      if (nv) {
        // 上报曝光
        this.$store.commit('setMarketReports', [{
          id: this.exposeData.id,
          clickType: 3, // 弹窗
          rotationShowNum: 1
        }]);
      } else {
        this.$store.commit('setMarketReports', [{
          id: this.exposeData.id,
          clickType: 3, // 弹窗
          clickCloseNum: 1
        }]);
      }
    }
  },
  methods: {
    // goStore(item) {
    //   this.close();
    //   this.$store.commit("marketOrderOtherReset");
    //   // 滿減優惠 下單需要告訴後端 activityId  sourceOrder
    //   if (this.rollWindowData.bannerSpecialType === 2) {
    //     const param = {
    //       sourceOrder: this.rollWindowData?.sourceOrder,
    //       activityId: this.rollWindowData?.activityId
    //     };
    //     this.$store.commit("marketOrderOther", param); // 下單標記來源
    //   }
    //   this.$store.commit('enterStore', true);
    //   this.$router.push({
    //     path: "/market/store",
    //     query: {
    //       id: item.storeId
    //     }
    //   });
    // },
    async initData(params) {
      const { dispatch } = this.$store;
      const point = { ...this.locationPoint, ...this.memberLocation?.point };
      return dispatch("marketDispatchWindow", { point, ...params });
    },

    nextTimeShow() {
      if (this.rollWindowData.pushFrequency === 1) {
        this.close();
        return;
      }
      this.close();
    },
    close() {
      console.log('roll-close')
      this.state = false;
      this.$store.dispatch("marketSetNextTimeWindow", "roll");
      // 关闭弹窗
      this.$store.commit("marketRemoveShowIndex", "roll");
      // 上报数据
      const reportParams = [{
        id: this.exposeData.id,
        clickType: 3, // 弹窗
        clickCloseNum: 1
      }];
      this.$store.commit('setMarketReports', reportParams);
    },
    handlerClick() {
      const orderOther = {
        // activityId: this.rollWindowData?.activityId
        // sourceOrder: 101
      };
      this.$refs.windowRollJump.jump(this.rollWindowData, { orderOther });
      // 上报
      this.$store.commit('setMarketReports', [{
        id: this.exposeData.id,
        clickType: 3, // 弹窗
        clickNum: 1
      }]);
      // 无跳转
      if (!this.rollWindowData.skipType === 3) {
        this.close();
      }
    }
  },

  mounted() {
    event.$on('marketCollarRollGet', this.initData);
  },
  activated() {
    if (this.state) {
      this.initData({ refresh: true });
    }
  }
};
