import NavBar from '@/components/2.0.0/nav';
import { Image as VanImage, Divider, Cell } from "vant";
import utils from '@/JS/utils';
import MarketTimeSteps from '../components/market-time-steps/index.vue';
import mFoodSDK from "@/JS/mFoodSDK";

export default {
  components: {
    NavBar,
    VanImage,
    MarketTimeSteps,
    [Divider.name]: Divider,
    [Cell.name]: Cell
  },
  data() {
    return {
      safeClass: utils.getSafeTopClassName('padding'),
      tradeId: this.$route.query.tradeId,
      statusMap: {
        '-2': '退款已撤銷',
        '-1': '退款已拒絕/退款失敗',
        0: '等待商家處理',
        1: '商家已審核/退款成功'
      },
      customMarketRefundInfo: []
    };
  },
  mounted() {
    this.$toast.clear();
    this.getMarketRefundInfo();
  },
  beforeDestroy() {
    this.$store.commit('setMarketRefundInfo', []);
  },
  methods: {
    handleNavBack() {
      if (window.history.length > 2) {
        this.$router.go(-1);
      } else {
        this.$router.replace({
          path: '/market/orderInfo',
          query: {
            tradeId: this.tradeId
          }
        });
      }
    },
    setCustomMarketRefundInfo() {
      let info = this.$store.getters.marketRefundInfo;
      if (info && Array.isArray(info)) {
        info = info.map(item => {
          return {
            ...item,
            limitItems: item.items && Array.isArray(item.items) ? item.items.filter((element, index) => index < 2) : item.items,
            isProductListExpanded: false
          };
        });
      }
      this.customMarketRefundInfo = info;
    },
    // 獲取退款信息
    getMarketRefundInfo() {
      this.$store.dispatch('getMarketRefundInfo', {
        tradeId: this.tradeId
      }).then(() => {
        this.setCustomMarketRefundInfo();
      }).catch(e => {
        this.$toast(e?.response?.data?.note);
      });
    },
    // 撤銷售後申請
    handleCancelRefund() {
      this.$dialog.confirm({
        className: "centerOverlay",
        message: '確認撤銷退款申請嗎？',
        cancelButtonText: "取消",
        confirmButtonText: "確認撤銷"
      }).then(() => {
        this.$store.dispatch('cancelMarketRefund', {
          tradeId: this.tradeId
        }).then(res => {
          mFoodSDK.operatedMarketOrder();
          this.getMarketRefundInfo();
        }).catch(e => {
          this.$toast(e?.response?.data?.note);
        });
      }).catch(() => {
      });
    },
    showRedpacketTips({ orderStatus, isUseDiscount, isAllRefund }) {
      // 部分退款時，才顯示紅包/代金券等不退回提示
      return orderStatus !== -3 && isUseDiscount && !isAllRefund;
    },
    expandProductList(index) {
      this.customMarketRefundInfo[index].isProductListExpanded = true;
      this.customMarketRefundInfo[index].limitItems = this.customMarketRefundInfo[index].items;
    },
    // 原价金额处理
    formatAmt(product) {
      const amt = product.originalPrice * product.count;
      if (!amt) {
        return 0;
      }
      return Number(amt.toFixed(2));
    },
    isRefundSuccess(item) {
      return item.refundStatus === 1
    },
    goGoldIndex(item) {
      if (!this.isRefundSuccess(item)) return
      if (mFoodSDK.isApp && utils.compareVersion(mFoodSDK.version, '3.9.0') !== -1) {
        mFoodSDK.jumpByScheme('', 2, 'ConsumptionListController')
      } else {
        this.$router.push('/gold/index')
      }
    },
    goUserRedpack(item) {
      if (!this.isRefundSuccess(item)) return
      this.$store.commit("enterUserUseful", true)
      this.$router.push('/market/user/useful?tabs=0')
    },
    goUserVoucher(item) {
      if (!this.isRefundSuccess(item)) return
      this.$store.commit("enterUserUseful", true)
      this.$router.push('/market/user/useful?tabs=1')
    },
    goMallCoupon(item) {
      if (!this.isRefundSuccess(item)) return
      mFoodSDK.jumpByScheme('', 2, 'ExchangeRecordListController')
    }
  }
};
