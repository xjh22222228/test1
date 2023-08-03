import NavBar from '@/components/2.0.0/nav';
import { Image as VanImage, Divider, Cell, Icon, CountDown } from "vant";
import ExplainDialog from '../components/explainDialog/index.vue';
import PhoneCallComponents from "@components/2.0.0/phoneCall";
import mf from "@/JS/mFoodSDK";
import ActionBar from './components/ActionBar.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import GoodsNoData from '@/views/market/components/goods/no-data';
import utils from '@/JS/utils';
import PlatformFee from '@/components/platformFee';
import EnjoyBenefit from "@/views/components/3.7.0/member/enjoyBenefit.vue"
import GuidePopup from './components/guidePopup.vue';

export default {
  name: 'marketOrderInfo',
  components: {
    NavBar,
    VanImage,
    ExplainDialog,
    ActionBar,
    ScrollBar,
    [Divider.name]: Divider,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [CountDown.name]: CountDown,
    GoodsNoData,
    PlatformFee,
    EnjoyBenefit,
    GuidePopup
  },
  data() {
    return {
      utils,
      safeClassName: utils.getSafeTopClassName('padding'),
      tradeId: this.$route.query.tradeId,
      deliveryTypeMap: {
        1: 'mFood送',
        2: '商家自送',
        3: '自取',
        4: '遠程配送'
      },
      isProductListExpanded: false,
      showWhiteBgNavDistance: 0,
      showWhiteBgNav: false,
      timeoutId: null,
      deviceType: mf.originalDeviceType,
      isApp: mf.isApp,
      // 當前上下文是否允許訂單輪詢
      canPolling: true,
      isAliPay: mf.isAliPay,
      // 是否显示im引导弹窗
      guidePopupVisible: false
    };
  },
  computed: {
    hideTopBar() {
      return this.isAliPay;
    },
    actionBarClass() {
      return [!mf.isApp ? 'non-full-screen' : '', this.deviceType];
    },
    marketOrderInfo() {
      return this.$store.getters.marketOrderInfo;
    },
    // IM 骑手信息
    marketImRiderInfo() {
      return this.$store.getters.marketImRiderInfo || {};
    },
    marketOrderSurplusTime() {
      return this.$store.getters.marketOrderSurplusTime?.time;
    },
    productList() {
      return this.isProductListExpanded
        ? this.marketOrderInfo.productList
        : this.marketOrderInfo.productList.slice(0, 3);
    },
    isSelfPickUp() {
      const { orderInfo } = this.marketOrderInfo;
      return orderInfo.deliveryType === 3;
    },
    refundProgressMap() {
      const map = {
        '-99': '',
        '-2': '已撤銷',
        '-1': '商家拒絕退款',
        0: this.marketOrderInfo.orderInfo.refundIsAccept ? '等待商品送回' : '等待商家處理',
        1: '退款成功'
      };
      return map;
    },
    orderStatusMap() {
      const map = {
        '-3': '已退款',
        '-1': '訂單取消/訂單關閉',
        0: '待支付',
        1: '已付款/商家待接單',
        2: '商家已接單',
        // 騎手指派前，訂單主狀態仍顯示‘商家已接單’
        3: this.isSelfPickUp ? '待自取' : this.isRiderWaitToAssign ? '商家已接單' : '配送中',
        4: '訂單已完成'
      };
      return map;
    },
    // 騎手待指派
    isRiderWaitToAssign() {
      return (
        this.marketOrderInfo.orderInfo.orderStatus === 3 &&
        this.marketOrderInfo.riderInfo.riderStatus !== null &&
        this.marketOrderInfo.riderInfo.riderStatus === 0
      );
    },
    // 显示联系骑手IM
    showRiderIm() {
      return (
        mf.isApp &&
        this.utils.compareVersion(mf.version, '3.9.5') >= 0 &&
        !this.isSelfPickUp &&
        !this.isRiderWaitToAssign &&
        [3, 4].includes(this.marketOrderInfo.orderInfo.orderStatus) &&
        Boolean(this.marketImRiderInfo?.userId) &&
        // 是否可聯繫騎手
        this.marketOrderInfo.buyerInfo?.canCall
      )
    },
    // 是否顯示待支付倒計時
    showPayCountDown() {
      return this.marketOrderInfo.orderInfo.orderStatus === 0 && this.marketOrderSurplusTime > 0;
    },
    // 訂單狀態副標題
    subTitle() {
      let title = '';
      let action = '';
      if (this.marketOrderInfo.actions && this.marketOrderInfo.actions.length) {
        action = this.marketOrderInfo.actions[0].actionName;
      }
      switch (this.marketOrderInfo.orderInfo.orderStatus) {
        case -3:
          title = '支付金額將退還至您的支付賬戶';
          break;
        case 0:
          title = '等待支付';
          break;
        case -1:
        case 1:
        case 2:
          title = action;
          break;
        case 3:
          title = action;
          break;
        case 4:
          title = '感謝您使用mFood，期待再次光臨';
          break;
        default:
          break;
      }
      return title;
    },
    // 是否新人
    isNewPeople() {
      return this.$store.state.marketHome.marketIsNewUser;
    },
    marketOrderMemberGrowthAndScore() {
      return this.$store.getters.marketOrderMemberGrowthAndScore || {}
    },
    showEnjoyBenefit() {
      if (!this.marketOrderMemberGrowthAndScore) return;
      return (this.marketOrderMemberGrowthAndScore.growthValue || this.marketOrderMemberGrowthAndScore.score);
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.canPolling = false;
    clearTimeout(this.timeoutId);
    this.removeListener();
  },
  methods: {
    init() {
      this.$store.dispatch('memberInfo');
      this.$store.dispatch('getGlobalMemberLevel') // 获取全局配置会员等级信息
      this.pollingData(true);
      this.removeListener();
      const mainEl = document.querySelector('.mescroll');
      if (mainEl) {
        mainEl.addEventListener('scroll', this.onScroll);
      }
      const safeHeadEl = this.$refs.safeHead;
      if (safeHeadEl) {
        const distance = safeHeadEl.offsetHeight;
        this.showWhiteBgNavDistance = distance;
        this.showWhiteBgNav = mainEl.scrollTop > distance;
      }
    },
    removeListener() {
      const mainEl = document.querySelector('.mescroll');
      if (mainEl) {
        mainEl.removeEventListener('scroll', this.onScroll);
      }
    },
    handleNavBack() {
      this.$store.dispatch('goBack');
    },
    onScroll(e) {
      const top = e.target.scrollTop;
      this.showWhiteBgNav = top > this.showWhiteBgNavDistance;
    },
    onDownCallback(done) {
      this.getData().finally(() => {
        done && done();
      });
    },
    // 輪詢
    async pollingData(isInit) {
      if (!this.canPolling) return;
      // 首次調用需要查詢剩餘支付時間，因為此時不知道訂單的狀態
      if (isInit) {
        this.$store.dispatch('marketOrderSurplusTime', this.tradeId).catch(() => { });
        // 獲取订单积分/成长值
        this.$store.dispatch('marketOrderMemberGrowthAndScore', {
          id: this.tradeId,
          businessType: 2
        });
      }
      try {
        await this.$store.dispatch('marketOrderInfo', this.tradeId);
        if (this.showRiderIm) {
          this.$store.dispatch('getMarketImRiderInfo', {
            orderId: this.tradeId,
            // 1外卖 2超市
            sourceType: 2
          }).then(() => {
            this.handleGuidePopup()
          })
        }
      } catch (error) {
        // 如果報錯，跳轉到缺省頁
        return this.$router.replace('/errorPage?errorCode=404');
      }
      if (isInit) {
        this.$toast.clear();
      }
      // 特定訂單狀態下才輪詢。
      if ([1, 2, 3].includes(this.marketOrderInfo.orderInfo.orderStatus)) {
        this.timeoutId = setTimeout(this.pollingData, 1000 * 10);
      }
    },
    getData() {
      const promiseList = [
        this.$store.dispatch('marketOrderInfo', this.tradeId),
        this.$store.dispatch('marketOrderMemberGrowthAndScore', {
          id: this.tradeId,
          businessType: 2
        }),
        this.$store.dispatch('getMarketImRiderInfo', {
          orderId: this.tradeId,
          // 1外卖 2超市
          sourceType: 2
        })
      ];
      if (this.marketOrderInfo.orderInfo.orderStatus === 0) {
        promiseList.push(this.$store.dispatch('marketOrderSurplusTime', this.tradeId));
      }
      return Promise.all(promiseList).finally(() => {
        this.$toast.clear();
      });
    },
    // 自動取消過期未支付訂單
    cancelOrder() {
      this.$store
        .dispatch("marketOrderCancel", {
          cancelType: 1,
          tradeId: this.marketOrderInfo.orderInfo.tradeId
        })
        // 處理成功
        .then(() => {
          this.$store.dispatch("marketOrderInfo", this.tradeId);
        });
    },
    // 显示im 指引弹窗
    handleGuidePopup() {
      let guideConfig = {}
      try {
        const item = localStorage.getItem('guideConfig')
        if (item) {
          guideConfig = JSON.parse(localStorage.getItem('guideConfig'))
        }
      } catch (error) {
        console.log(error)
      }
      const { riderImGuideIsShow } = guideConfig
      if (!riderImGuideIsShow) {
        this.guidePopupVisible = true
        localStorage.setItem('guideConfig', JSON.stringify({
          ...guideConfig,
          riderImGuideIsShow: true
        }))
      }
    },
    expandProductList() {
      this.isProductListExpanded = !this.isProductListExpanded;
    },
    toAfsDetail() {
      this.$router.push({
        path: '/market/afterSaleDetail',
        query: {
          tradeId: this.tradeId
        }
      });
    },
    toStoreDetail() {
      this.$store.commit('enterStore', true);
      this.$store.commit("marketOrderOtherReset");
      this.$router.push({
        path: '/market/store',
        query: {
          id: this.marketOrderInfo.storeInfo.storeId
        }
      });
    },
    openExplain(type) {
      const { orderInfo } = this.marketOrderInfo;
      switch (type) {
        // 包裝費
        case 1:
          this.$refs.explain.open({
            type,
            totalAmt: orderInfo.plasticBagFee,
            plasticBagQty: orderInfo.plasticBagQty
          });
          break;
        // 配送費
        case 2:

          this.$refs.explain.open({
            type,
            totalAmt: orderInfo.deliveryFee,
            baseAmt: orderInfo.basicDeliveryFee,
            weightAmt: orderInfo.overWeightFee,
            freshDeliveryFee: orderInfo.freshDeliveryFee,
            plusAmt: orderInfo.incrementDeliveryFee,
            deliveryType: orderInfo.deliveryType,
            deliveryFreeAmt: (orderInfo?.disDeliveryAmtn || 0) + (orderInfo?.disMerchantDeliveryAmtn || 0)
          });
          break;
      }
    },
    // 撥打客服電話
    onCallService() {
      PhoneCallComponents({
        title: this.$t("ORDERINFO.call_mFood_customer_service"),
        about: false,
        data: [{ name: `${this.$t("common.call")} +853 63570088`, className: "85363570088" }],
        onCall: number => this.$store.dispatch("appCallPhone", number),
        onAboutLink: () => this.$router.push({ path: "/about" })
      });
    },
    handlePhoneCall() {
      // 致電商家彈窗
      const actionSheetPhoneData = [];
      let storeMobile = this.marketOrderInfo.storeInfo.storeMobile;
      let storePhone = this.marketOrderInfo.storeInfo.storePhone;
      if (storeMobile) {
        storeMobile = storeMobile.split("-");
        actionSheetPhoneData.push({
          name: `呼叫 +${storeMobile[0]} ${storeMobile[1]}`,
          className: storeMobile[0] + "" + storeMobile[1]
        });
      }
      if (storePhone) {
        storePhone = storePhone.split("-");
        actionSheetPhoneData.push({
          name: `呼叫 +${storePhone[0]} ${storePhone[1]}`,
          className: storePhone[0] + "" + storePhone[1]
        });
      }
      PhoneCallComponents({
        data: actionSheetPhoneData,
        title: "致電商家",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    },
    copyStr() {
      mf.copyStrInAll(this.marketOrderInfo.orderInfo.tradeNo, !mf.isApp);
    },
    toOrderActions() {
      this.$router.push({
        path: '/market/orderActions',
        query: {
          tradeId: this.tradeId
        }
      });
    },
    onPayTimeout() {
      if (this.marketOrderInfo.orderInfo.orderStatus === 0) {
        this.$store.dispatch('marketOrderSurplusTime', this.tradeId);
      }
    }
  }
};
