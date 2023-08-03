import PolymerizationComponents from "@components/polymerization/index";
import normalRedPacket from "../components/user-items/normalRedPacket";
import normalVoucher from "../components/user-items/normalVoucher.vue";
import vipRedPacket from "../components/user-items/vipRedPacket.vue";

import {
  Button,
  Toast,
  Tab,
  Tabs,
  Image as VanImage,
  Notify
} from "vant";
import { post } from "@ajax";
import TabBar from '../../components/tabBar/index.vue';
import mf from '@/JS/mFoodSDK';
import endCom from '@/views/market/components/goods/end/index.vue';
export default {
  components: {
    [Button.name]: Button,
    [Toast.name]: Toast,
    [Notify.name]: Notify,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [VanImage.name]: VanImage,
    normalRedPacket,
    PolymerizationComponents,
    normalVoucher,
    vipRedPacket,
    TabBar,
    endCom
  },
  data() {
    return {
      params: { // 可用請求參數
        status: 1, // [1:可用 ,-1:失效]
        offset: 0,
        size: 20,
        dataType: 2,
        businessType: 3// (1:外卖,2:团购,3:商超)
      },
      voucherParam: {
        status: 1, // [1:可用 ,-1:失效]
        offset: 0,
        size: 20
        // dataType: 1,
        // businessType: 3// (1:外卖,2:团购,3:商超)
      },
      redPacketList: {
        topList: [], // 月卡紅包
        list: [], // 普通列表
        next: true,
        useLimitMsg: "",
        showTips: true, // 顯示提示
        expend: false
      },
      voucherList: {
        topList: [], // 月卡紅包
        list: [], // 普通列表
        next: true,
        useLimitMsg: "",
        showTips: true, // 顯示提示
        expend: false
      },
      tabs: 0,
      ready: false,
      memberRedpackData: [],
      empty: require("assets/images/market_coupon.png"),
      logo: require("assets/images/logo100@2x.png"),
      mescroll: {
        scroll: 0,
        navTitle: "我的優惠",
        rightTitle: "無效券/紅包",
        allwayShow: true,
        component: null,
        background: "#F5F5F7",
        up: {
          htmlNodata: 2
        }
      },
      deviceType: mf.originalDeviceType
    };
  },
  computed: {
    memberRedpack: function () {
      return this.$store.getters.memberRedpack;
    },
    enterUserUseful() {
      return this.$store.getters.enterUserUseful;
    }
  },
  methods: {

    historyBack(res) {
      res.data = false;
      this.$router.go(-1);
      // return this.$router.replace('/market/index')
    },
    // 使用説明
    goDis: function onUse() {
      this.$router.push('/market/user/disUseful?tabs=' + this.tabs);
    },
    changeTab(index) {
      if (index === this.tabs) {
        return;
      }
      this.tabs = index;
      this.searchAction();
    },
    // 退回
    turnBack(item) {
      this.$refs.merchantRed.backRedPacket(item);
    },
    // 去使用
    handleUse(item) {
      // if (!item.isEnable) return this.$toast({ message: "未到使用時間" });
      mf.useMarketRedPack(item);
    },
    // 重置参数
    resetAction() {
      this.ready = false;
      // 重置推荐栏门店参数
      if (this.tabs) { // 商家代金券
        this.voucherParam.offset = 0;
        this.voucherList.showTips = true;
        this.voucherList.next = true;
      } else { // 红包
        this.params.offset = 0;
        this.redPacketList.showTips = true;
        this.redPacketList.next = true;
      }
      this.$refs?.component?.mescroll.endSuccess();
      this.$refs?.component?.mescroll.resetUpScroll();
    },
    searchAction() {
      let tempParam = {};// 請求參數
      if (this.tabs) { // 商家
        if (!this.voucherList.next) {
          return this.$refs?.component?.mescroll.endSuccess();
        }
        tempParam = { ...this.voucherParam };
        this.queryVoucher(tempParam);
      } else { // 紅包
        if (!this.redPacketList.next) {
          return this.$refs?.component?.mescroll.endSuccess();
        }
        tempParam = { ...this.params };
        this.queryRedList(tempParam);
        this.queryRed(tempParam);
      }
    },
    queryVoucher(param) {
      post("/activity/activity/coupon/get-buyer-coupon", param).then(res => {
        const offset = this.voucherParam.offset;
        this.voucherList.next = res.next;
        // this.voucherList.useLimitMsg = res.useLimitMsg;
        this.voucherParam.offset = res.nextOffset;
        if (!offset) {
          this.voucherList.list = res.result;
        } else {
          this.voucherList.list = this.voucherList.list.concat(res.result);
        }
        this.$toast.clear();
        this.$refs.component.endSuccess(
          this.voucherList.list.length + 1,
          this.voucherList.next
        );
      }).catch(e => {
        console.warn(e);
        this.$toast.clear();
        this.$refs.component.endSuccess(1, false, "");
      }).finally(() => {
        this.ready = true;
      });
    },
    // 頂部折疊紅包
    queryRedList(param) {
      post("/activity/activity/voucher/_get-buyer-red-package-list", param).then(res => {
        this.redPacketList.topList = res;
        this.redPacketList.expend = false;
      });
    },
    // 分頁紅包
    queryRed(param) {
      post("/activity/activity/voucher/_get-buyer-red-package-page", param).then(res => {
        // 如果是在配送范围内，并且没有下一页，那么请求一次不在配送范围内的
        // 舊的
        const offset = this.params.offset;

        this.redPacketList.next = res.dataList.next;
        this.redPacketList.useLimitMsg = res.useLimitMsg;
        this.params.offset = res.dataList.nextOffset;
        if (!offset) {
          this.redPacketList.list = res.dataList.result;
        } else {
          this.redPacketList.list = this.redPacketList.list.concat(res.dataList.result);
        }
        this.$toast.clear();
      }).then(res => {
        const tempResult = this.redPacketList;
        this.$refs.component.endSuccess(
          tempResult.list.length + tempResult.topList.length + 1,
          tempResult.next
        );
        this.$toast.clear();
      }).catch(e => {
        console.warn(e);
        this.$toast.clear();
        this.$refs.component.endSuccess(1, false, "");
      }).finally(e => {
        this.ready = true;
      });
    },
    loadPage() {
      this.mescroll = {
        ...this.mescroll,
        resetAction: this.resetAction,
        searchAction: this.searchAction,
        component: this.$refs.component
      };
      if (!this.enterUserUseful) {
        this.$toast.clear();
      } else {
        this.$store.commit('enterUserUseful', '');
        this.$nextTick(() => {
          this.resetAction();
        });
      }
    },
    appLogin() {
      mf.APPLoginAsync().then(() => {
        this.loadPage();
      }).catch(e => {
        this.$toast.clear();
        this.$dialog.confirm({
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          className: "centerOverlay",
          message: "請先登錄"
        }).then(e => {
          this.appLogin();
        }).catch(e => {
          this.$router.go(-1);
        });
      });
    }
  },
  deactivated() {

  },
  activated() {
    const tabs = parseInt(this.$route.query.tabs)
    if (tabs >= 0) {
      this.tabs = tabs
    }
    if (mf.isApp) {
      this.appLogin();
    } else {
      this.loadPage();
    }
  }
};
