import {
  Field,
  Card,
  Icon,
  Button,
  Toast,
  Checkbox,
  SubmitBar,
  Cell,
  NavBar,
  Tag,
  Dialog,
  Switch,
  CellGroup,
  Slider,
  ActionSheet,
  TreeSelect,
  Notify,
  Image as VanImage,
  Popup
} from "vant";
import secondSend from "@/views/components/secondSend/index";
import OpenMember from "@/components/openMember/index";
import headerNav from "@/components/headerNav";
import orderAddress from "./components/orderAddress";
import { post } from "@/JS/ajax";
import shence from "@shence";
import { showRequestLoad, hideRequestLoad } from "@/JS/loading";
import dialogMixins from "./mixis/dialog";
import dealError from "./mixis/dealError";
import mf from '@/JS/mFoodSDK';
import ExplainDialog from '../components/explainDialog/index.vue';
import WeightCost from "../store/mixis/WeightCost";
import utils from "../../../JS/utils";
import TimeSelect from './components/time-select';
import vipOrderOpen from '@/components/3.3.0/vip-order-open.vue';
import Gold from "@/views/order/components/gold";
import PlatformFee from '@/components/platformFee';
import event from '@/JS/event';
import BigDecimal from 'js-big-decimal';
import VipIcon from './components/vip-icon';

export default {
  mixins: [dialogMixins, dealError],
  components: {
    ExplainDialog,
    headerNav,
    TimeSelect,
    OpenMember,
    [Slider.name]: Slider,
    [VanImage.name]: VanImage,
    [Dialog.Component.name]: Dialog.Component,
    [NavBar.name]: NavBar,
    [Switch.name]: Switch,
    [Checkbox.name]: Checkbox,
    [ActionSheet.name]: ActionSheet,
    [SubmitBar.name]: SubmitBar,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
    [Card.name]: Card,
    [Button.name]: Button,
    [Cell.name]: Cell,
    [TreeSelect.name]: TreeSelect,
    [CellGroup.name]: CellGroup,
    [Toast.name]: Toast,
    [Popup.name]: Popup,
    [Notify.name]: Notify,
    [Field.name]: Field,
    secondSend,
    orderAddress,
    vipOrderOpen,
    Gold,
    PlatformFee,
    VipIcon
  },
  data() {
    return {
      pointTotal: 0,
      usePointPrice: 0,
      usePointTotal: 0,
      pointChecked: false,
      discountTotal: 0,
      disVoucherAmtn: 0,
      disGiftAmtn: 0,
      disDeliveryGiftAmtn: 0, // 免配红包抵扣金额
      reduceAmtn: 0,
      orderProduct: [],
      isUseDiscount: false,
      isUseSpecial: false,
      id: this.$route.query.id,
      isPlasticBag: false,
      submitBarLoading: false,
      totalPrice: 0,
      // 满减金额
      disFullAmtn: 0,
      orderTotal: 0,
      // 配送类型[1:配送；2||true:到店自取]
      deliveryType: "",
      // 服務費
      serviceFeePrice: 0,
      // 預留電話
      receiverMobile: "",
      // 配送事件
      expandProduct: false, // 展開商品
      canChangeAskType: true, // 能否選擇自取類型
      enjoyDiscountType: 0, // 享受的的減免方式 ，mFood減免  商家減免
      enjoyDiscountTypeMap: {
        1: "mFood減免",
        2: "商家減免",
        3: "mFood與商家減免"
      },
      baseUrl: process.env.BASE_URL,
      activityDeliveryData: "",
      checkExchangeProducts: [], // 已选中的换购商品
      newAddress: '',
      oldAddress: '',
      showChangeAddress: false,
      newCookTimeSelectDataDeliveryFee: '',
      oldCookTimeSelectDataDeliveryFee: '',
      platformFeeData: {}, // 平台费
      // 商家會員號碼
      memberNo: null
    };
  },
  computed: {
    // 平台费实付金额
    platformFeeAmount() {
      const amt = this.utils.filterSecret(this.payAmt + this.exchangeAmtInfo.amt);
      return amt > 0.1 ? amt : 0.1
    },
    // 消費金列表
    goldUseData() {
      return this.$store.getters.goldUseData || {};
    },
    // 可用消費金列表
    goldUseDataEffectiveList() {
      return this.$store.getters.goldUseData?.effectiveList || [];
    },
    // 已勾選的消費券
    goldUseChangeData() {
      return this.$store.getters.goldUseChangeData;
    },
    // 消费券列表参数
    goldUseDataParams() {
      return this.$store.getters.goldUseDataParams;
    },
    // 用户消费金-使用张数
    useTotal() {
      return this.goldUseChangeData.length;
    },
    // 用户消费金-使用金额
    useGoldAmount() {
      // 消费金金额
      let useGoldAmount = 0;
      const data = this.goldUseChangeData;
      if (!data?.length) {
        return useGoldAmount;
      }
      data.forEach((item, index) => {
        useGoldAmount += item.amount;
      });
      // 订单金额
      const amtn = this.goldUseDataParams.amtn;
      // 消費金使用超出總支付金額
      if (useGoldAmount >= amtn) {
        return this.utils.filterSecret(amtn - 0.1);
      } else {
        const payAmt = this.utils.filterSecret(amtn - useGoldAmount);
        if (payAmt < 0.1) {
          useGoldAmount = this.utils.filterSecret(useGoldAmount - (0.1 - payAmt));
        }
        return this.utils.filterSecret(useGoldAmount);
      }
    },
    // 购物车转换后的数据
    marketCartData() {
      return this.$store.getters.marketCartData;
    },
    totalWeight() {
      return this.$store.getters.totalWeight;
    },
    haveFresh() {
      return this.$store.getters.haveFresh;
    },
    currentWeightCost() {
      return this.$store.getters.currentWeightCost;
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart;
    },
    // 计算满减满折总优惠金额
    marketFullReduceDisconut() {
      return this.$store.state.marketShopCart.marketFullReduceDisconut || 0;
    },

    // // 快閃每單限制
    // flashProductLimit() {
    //   const marketStoreDetail = this.marketStoreDetail;
    //   return !marketStoreDetail.flashProductLimit
    //     ? -1 : marketStoreDetail.flashProductLimit;
    // },
    // // 快闪优惠每人限制
    // flashLeftUser() {
    //   const marketStoreDetail = this.marketStoreDetail;
    //   const flashProductLimit = this.flashProductLimit;
    //   const leftUser = marketStoreDetail.flashUserLimit - marketStoreDetail.flashUserUsed;
    //   return flashProductLimit == -1 ? (leftUser >= 0 ? leftUser : 0) : _.min([leftUser, flashProductLimit]);
    // },
    // 可用代金券數量
    usefulVoucherCount() {
      const arr = this.marketStoreVoucherList?.effectiveList || [];
      return arr.length;
    },
    // 可用紅包數量
    usefulRedCount() {
      const arr = this.marketStoreRedpackList?.effectiveList || [];
      let all = 0;
      for (const item of arr) {
        all += (item.couponSize || 1);
      }
      return all;
    },
    // 店鋪滿返活動
    storeFullReturn() {
      return this.$store.state.storePreferre.storeFullReturn;
    },

    storeSelfDiscount() {
      return this.$store.state.storePreferre.storeSelfDiscount;
    },
    // 自取折扣优惠折扣
    selfOrderRate() {
      return this.storeSelfDiscount.selfTakeOrderDiscount;
    },
    // 自取单优惠金额
    selfDiscountAmt() {
      const other = this.marketOrderOther;
      const deliveryType = this.deliveryType;
      const selfOrderRate = this.selfOrderRate;
      const isSelfDiscount = this.isSelfDiscount;
      if (selfOrderRate == null || !deliveryType) {
        return 0;
      }
      if (!isSelfDiscount) {
        return 0;
      }
      let totalAmt = other.totalPrice || 0;
      const discAmt = totalAmt - (totalAmt * selfOrderRate / 10);
      const amt = Number(discAmt || 0);
      if (amt <= 0) {
        return 0;
      }
      totalAmt += this.serviceFeePrice;
      if (this.deliveryType) {
        if (!this.isPlasticBag) {
          totalAmt += this.marketPackagePrice;
        }
      } else { // 轉送
        totalAmt += this.marketPackagePrice;
        totalAmt += other.deliveryFee;
      }
      const num = this.fixed3To2(amt);
      let leftSelfDiscountAmount = totalAmt - num;// 自取優惠后的金額
      leftSelfDiscountAmount = this.fixed3To2(leftSelfDiscountAmount);
      // if (leftSelfDiscountAmount < 0.1) {
      //   num = new BigDecimal(num - 0.1 + leftSelfDiscountAmount);
      //   num = num.round(2, BigDecimal.RoundingModes.FLOOR).value;
      //   return num;
      // } else {
      return num;
      // }
    },
    // 店铺满赠内容
    storeFullGift() {
      return this.$store.state.storePreferre.storeFullGift;
    },
    // 滿足條件贈品內容
    giftData() {
      const gifts = [...(this.storeFullGift.fullGiftDetails || [])].reverse();
      // 商品總價 + 餐盒費 + 膠袋費
      const amt = this.marketOrderOther.totalPrice +
        (this.marketOrderOther.isPlasticBag ? this.marketPackagePrice : 0);
      const data = gifts.find(item => amt >= item.limitAmount);
      return data || {};
    },
    // 自取單折扣和折扣商品同享優惠
    isSelfDiscount() {
      return false;
    },
    // 總共優惠金額
    _discountAmt() {
      return this.utils.filterSecret(
        this.discountTotal +
        this.usePointPrice +
        this.useGoldAmount +
        (this.platformFeeData.__platformDiscountAmt__ || 0)
      );
    },
    // 超值换购门槛(商品现价+餐盒费)
    exchangeLimit() {
      const amt = this.utils.filterSecret(
        this.marketOrderOther.totalPrice
      );
      return amt < 0 ? 0 : amt;
    },
    // 换购金额信息
    exchangeAmtInfo() {
      let amt = 0; // 换购需要支付金额
      let discountAmt = 0; // 总共优惠金额
      this.checkExchangeProducts.forEach(item => {
        amt += item.discountAmount;
        discountAmt += item.saveMoneyAmount;
      });
      return {
        amt: Number(amt.toFixed(2)),
        discountAmt: Number(discountAmt.toFixed(2))
      };
    },
    // 商品金額 + 餐盒費 - 自取的折扣
    orderPayAmt() {
      const amt = this.utils.filterSecret(
        this.marketOrderOther.totalPrice - this.selfDiscountAmt
      );
      return amt < 0 ? 0 : amt;
    },
    // 支付金額, 最終支付的金額
    payAmt() {
      const amt = this.utils.filterSecret(
        this.orderTotal - this.usePointPrice
      );
      return amt < 0 ? 0 : amt;
    },
    // 小計金額顯示，用於顯示，不參與計算
    payAmtOnlyShow() {
      return this.utils.filterSecret(
        this.payAmt +
        this.exchangeAmtInfo.amt -
        this.useGoldAmount +
        (this.platformFeeData.platformCommission || 0)
      );
    },
    // 月卡金額
    vipPayAmt() {
      const { vipData } = this.marketOrderOther;
      if (vipData?.memberSettingId) {
        return vipData?.discountPrice || vipData?.originalPrice;
      }
      return 0;
    },
    // 提交栏支付金额
    submitBarPayAmt() {
      // 订单金额最少为1毛钱
      const amt = this.utils.filterSecret(this.payAmt +
        this.exchangeAmtInfo.amt +
        this.vipPayAmt -
        this.useGoldAmount);
      return this.utils.filterSecret(
        (amt < 0.1 ? 0.1 : amt) + (this.platformFeeData.platformCommission || 0)
      );
    },
    // 提交栏优惠金额
    submitBarDiscountAmt() {
      return this.utils.filterSecret(
        this._discountAmt +
        this.exchangeAmtInfo.discountAmt
      );
    },
    filterList() {
      const arr = this.orderProduct;
      const exp = this.expandProduct;
      if (exp) {
        return arr;
      }
      return arr.slice(0, 3);
    },

    // 商家配送費满减优惠
    marketMerchantDeliveryFreeInfo() {
      return this.$store.getters.marketMerchantDeliveryFreeInfo;
    },
    // 用户当前所在地址
    memberLocation: function () {
      return this.$store.getters.memberLocation;
    },
    // 购物车
    marketOrderHistory: function () {
      return this.$store.getters.marketOrderHistory;
    },
    // 订单信息
    marketOrderOther: function () {
      return this.$store.getters.marketOrderOther;
    },
    // 配送方式，臨時記錄
    deliveryTypeGetters: function () {
      return this.$store.getters.deliveryTypeGetters;
    },
    // 備註，臨時記錄
    marketRemarkTextGetters: function () {
      return this.$store.getters.marketRemarkTextGetters;
    },
    // 服務費
    marketServiceFee: function () {
      return this.$store.getters.marketServiceFee;
    },
    // 用戶信息
    memberInfo: function () {
      return this.$store.getters.memberInfo;
    },

    // 商超訂單支付
    createMarketOrder: function () {
      return this.$store.getters.createMarketOrder;
    },
    // 備注
    remark: function () {
      return this.$store.getters.remark;
    },
    // 获取胶袋费
    marketPackagePrice: function () {
      return this.$store.getters.marketPackagePrice;
    },
    // 店鋪信息
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    // 根據門店id获取用户地址列表，配送范围加不在配送范围
    marketOrderAddressData: function () {
      return this.$store.getters.marketOrderAddressData;
    },
    // 訂單支付
    payment: function () {
      return this.$store.getters.payment;
    },
    // [满减]平台生效中的满减详情
    marketStoreFull: function () {
      return this.$store.getters.marketStoreFull;
    },
    // [减免配送費]减免配送費详情
    marketStoreDelivery: function () {
      return this.$store.getters.marketStoreDelivery;
    },
    // 用戶選擇的代金券
    memberOrderVoucher: function () {
      return this.$store.getters.memberOrderVoucher;
    },
    // 用戶選擇紅包
    memberOrderRedpack: function () {
      return this.$store.getters.memberOrderRedpack;
    },
    // 选中的红包数量
    memberOrderRedpackCount() {
      let count = 0
      for (const key in this.memberOrderRedpack) {
        if (this.memberOrderRedpack[key]?.id) {
          count++
        }
      }
      return count
    },
    // 用戶選擇立減券
    memberOrderReduce: function () {
      return this.$store.getters.memberOrderReduce;
    },
    // 用戶代金券總數
    marketStoreVoucherList: function () {
      return this.$store.getters.marketStoreVoucherList;
    },
    // [提交订单]红包列表
    marketStoreRedpackList: function () {
      return this.$store.getters.marketStoreRedpackList;
    },
    // [提交订单]立減券列表
    storeReduceList: function () {
      return this.$store.getters.storeReduceList;
    },
    marketStoreShoppingCart: function () {
      return this.$store.getters.marketStoreShoppingCart;
    },
    storeProduct: function () {
      return this.$store.getters.storeProduct;
    },
    storeProductDetail: function () {
      return this.$store.getters.storeProductDetail;
    },
    // （減免后的）配送費
    deliveryPrice() {
      const marketOrderOther = this.marketOrderOther;
      if (!marketOrderOther?.cookTimeSelectData) {
        return "--";
      }
      const originPrice = marketOrderOther?.cookTimeSelectData?.deliveryFee || 0;
      if (marketOrderOther.discountDeliveryFee && originPrice) {
        return originPrice - marketOrderOther.discountDeliveryFee > 0
          ? originPrice - marketOrderOther.discountDeliveryFee
          : 0;
      }
      return originPrice;
    },
    // 超值换购
    exchangeProduct: function () {
      return this.$store.state.storePreferre.exchangeProduct;
    },
    marketDisabledDialogType: function () {
      return this.$store.getters.marketDisabledDialogType;
    },
    marketProductMaps() {
      return this.$store.getters.marketProductMaps;
    },
    marketStoreDiscountActivityMap() {
      return this.$store.getters.marketStoreDiscountActivityMap;
    },
    disFullList() {
      const disFullList = []; // 符合满减
      for (const k in this.marketCartData) {
        if (this.marketCartData[k]) {
          const current = this.marketCartData[k].current;
          if (current != null) {
            disFullList.push({
              disFullId: this.marketCartData[k].id,
              disFullAmtn: this.marketCartData[k].discountAtm
            });
          }
        }
      }
      return disFullList;
    },
    memberBasicInfo() {
      return this.$store.getters.memberBasicInfo || {};
    },
    // 是否是會員
    isVip() {
      return this.memberBasicInfo?.memberType === 1;
    },
    // 商家會員號碼
    marketMemberNo() {
      return this.$store.getters.marketMemberNo
    },
    // 买赠活动列表
    giftBuyList() {
      return this.$store.getters.marketGiftBuyList;
    },
    // 会员等级
    memberLevel() {
      return this.$store.state.marketHome.memberLevelInfo?.marketCardLevel;
    },
    // 显示支付渠道图标
    payIconSrc() {
      let src = ''
      if (this.memberOrderRedpackCount === 1) {
        const { common, delivery } = this.memberOrderRedpack
        const redpack = common?.id ? common : delivery
        const { payEnIcon, payCnIcon } = redpack
        if (payEnIcon || payCnIcon) {
          src = this.$i18n.isZh ? payCnIcon : payEnIcon
        }
      }
      return src
    }
  },
  watch: {
    selfDiscountAmt() {
      this.init();
    },
    "marketOrderOther.selectedAddress"(nv, ov) {
      this.newAddress = nv;
      this.oldAddress = ov;
      if (nv.id && ov?.id && nv.id !== ov?.id) {
        this.showChangeAddress = true;
      }
    },
    "marketOrderOther.cookTimeSelectData": {
      immediate: true,
      handler: function handler(nv, ov) {
        if (!this.deliveryType) {
          if (typeof nv?.deliveryFee === 'number') {
            this.oldCookTimeSelectDataDeliveryFee = this.newCookTimeSelectDataDeliveryFee;
            this.newCookTimeSelectDataDeliveryFee = nv?.deliveryFee;
          }
          if (this.marketDisabledDialogType === 2) {
            return;
          }
          if (nv && Object.keys(nv).length &&
            this.newCookTimeSelectDataDeliveryFee !== this.oldCookTimeSelectDataDeliveryFee &&
            this.showChangeAddress && !this.marketDisabledDialogType
          ) {
            Dialog({
              className: "dialog__msg",
              message: "由於配送地址變化，您的配送費也發生了變化",
              confirmButtonText: "我知道了"
            }).then(() => {

            }).catch(Function);
            this.showChangeAddress = false;
          }
        }
      }
    },
    // 商家會員號碼
    marketMemberNo: {
      immediate: true,
      handler(data) {
        this.memberNo = data
      }
    }
  },
  methods: {
    dealVip(flag, vipData, showDialog) {
      if (flag) {
        this.$store.commit('marketOrderOther', { vipData });
        this.getRedPacketAndCheck().then(res => {
          if (res?.effectiveList) {
            const fakerList = res.effectiveList.filter(item => item.redpackBasicId && item.memberSettingId);
            // 从未选中到选中才显示Dialog
            if (fakerList.length && showDialog) {
              Dialog.confirm({
                className: "bottomOverlay",
                message: this.$t('order.select_super_combo_tips'),
                cancelButtonText: this.$t('common.cancel'),
                confirmButtonText: this.$t('common.use_it')
              }).then(() => {
                this.onGoRedpack();
              }).catch(() => {
              });
            }
          }
          this.total();
        });
      } else {
        this.$store.commit('marketOrderOther', { vipData: null });
        this.getRedPacketAndCheck().then(res => {
          this.total();
          this.getGoldUseData();
        });
      }
    },
    showOverWeight() {
      return this.$toast('已超重，請減少商品或分開下單');
    },
    // 千分位進一精確到
    fixed3To2(nummber) {
      var t = nummber * 1000;
      t = parseInt(t);
      if (t % 10) { // 去掉千分位的數
        t += 10;
        t = parseInt(t / 10);
        t *= 10;
      }
      t = t / 1000;
      t = new BigDecimal(t);
      t = parseFloat(t.round(2, BigDecimal.RoundingModes.CEILING).value);
      return t;
    },

    // 点击自取协议
    onIframe() {
      this.$router.push({
        path: "/iframe",
        query: {
          title: "到店自取用戶協議",
          url: process.env.VUE_APP_COMMON_URL + "/pick-up-agreement/index.html"
        }
      });
    },
    // 跳轉代金券
    onGoVoucher() {
      this.$router.push({
        path: "/market/voucher"
      });
    },
    // 紅包
    onGoRedpack() {
      // 商品金額 + 餐盒費  - 自取折扣 - 滿減優惠  - 代金券減免
      this.$router.push({
        path: "/market/redpack",
        query: this.getRedPacketParam()
      });
    },
    getRedPacketParam() {
      const amtn = this.orderPayAmt - this.disFullAmtn - this.disVoucherAmtn;
      const vipData = this.marketOrderOther?.vipData;
      return {
        isUseSpecial: this.isUseSpecial,
        isUseDiscount: this.isUseDiscount,
        addressId: this.marketOrderOther?.selectedAddress?.id,
        // 有效金额[红包/代金劵下单时必传]
        amtn: amtn <= 0 ? 0 : amtn,
        // 是否立刻送出，立刻送达时，必传
        atOnceSend: this.deliveryType
          ? false
          : this.marketOrderOther?.cookTimeSelectData?.promptlyType,
        // 是否已选代金劵[下单获取红包时必传]
        isUseVoucher: !!this.memberOrderVoucher?.id,
        // 配送类型[1:配送；2:到店自取]
        deliveryType: this.deliveryType ? 2 : 1,
        // 减去了商家和平台配送费活动后的配送费
        deliveryFee: this.deliveryType ? '' : this.marketOrderOther.deliveryFee,
        // 配送费减免金额(平台活动减免+商家减免，不含免配红包)
        disDeliveryFee: this.deliveryType ? '' : this.marketOrderOther.discountDeliveryFee,
        // 送餐時間
        sendTime: this.deliveryType
          ? this.marketOrderOther?.askforTimeSelectData?.sendTime
          : this.marketOrderOther?.cookTimeSelectData?.sendTime,
        // 配送 0 是今天 1是明天
        sendType: this.deliveryType
          ? this.marketOrderOther?.askforTimeSelectData?.sendType
          : this.marketOrderOther?.cookTimeSelectData?.sendType,
        cookMinutes: this.deliveryType
          ? this.marketOrderOther?.askforTimeSelectData?.cookMinutes
          : this.marketOrderOther?.cookTimeSelectData?.cookMinutes,
        // 门店ID
        storeId: this.id,
        // 代金劵ID
        voucherId: this.memberOrderVoucher?.id || "",
        reduceId: this.memberOrderReduce?.id,
        usersideDeliveryType: this.getDeliveryType(),
        businessTypes: 3,
        memberSettingId: vipData?.memberSettingId || vipData?.id || '',
        // 门店商圈ID
        centerId: this.marketStoreDetail?.centerId,
        storeLat: this.marketStoreDetail?.lat,
        storeLon: this.marketStoreDetail?.lon,
        stationId: this.marketOrderOther?.cookTimeSelectData?.stationId
      };
    },
    // 时间列表返回的配送类型[1:专送，2:自送，3：自取，4：远程]
    getDeliveryType() {
      return this.marketOrderOther.deliveryType
        ? 3
        : this.marketOrderOther?.cookTimeSelectData?.deliveryType ||
        this.marketStoreDetail.deliveryType;
    },
    // 支付成功，延迟2秒查询订单详情
    paymentingSuccess() {
      clearInterval(this.timer);
      this.goOrderInfo(true);
      Toast.success({ message: "支付成功", duration: 12000 });
    },

    goOrderInfo(success) {
      // 清除红包和代金券
      this.$store.commit("memberOrderVoucher", {});
      this.$store.commit("resetMemberOrderRedpack");
      this.remarkText = "";
      this.$store.commit("marketOrderOther", { ...this.marketOrderOther, missProductIndex: -1, cookTimeSelectData: {} });
      this.$store.commit("enterOrderInfo", true);
      this.$store.commit("enterStore", true);// 回退到門店
      if (success) {
        this.$router.replace({
          path: "/market/payResult",
          query: {
            // storeId: this.marketOrderInfo?.storeInfo?.storeId,
            tradeId: this.marketOrderInfo?.orderInfo?.tradeId
          }
        });
      } else {
        // 查询订单信息
        this.$router.replace({
          path: "/market/orderList",
          query: {
            redirect: '/market/orderInfo',
            tradeId: this.marketOrderInfo?.orderInfo?.tradeId
          }
        });
      }
    },
    // 提交订单
    async onSubmit() {
      const { isUseFullReduction, isUseFullDiscount } = this.marketStoreDetail;
      const productList = [];
      // 驗證
      Toast.clear();
      if (this.deliveryType) {
        if (!this.receiverMobile) {
          return Toast({
            message: "請預留8﹣11位電話號碼",
            className: "toastError"
          });
        }
        const area = this.phone.area;
        if (area == "86" && !/^[1]\d{10}$/.test(this.receiverMobile)) {
          return Toast({
            message: "請預留8﹣11位電話號碼",
            className: "toastError"
          });
        }
        if (area != "86" && !/^\d{8}$/.test(this.receiverMobile)) {
          return Toast({
            message: "請預留8﹣11位電話號碼",
            className: "toastError"
          });
        }

        // 判断cookMinutes为空说明没有选择时间
        if (this.marketOrderOther.askforTimeSelectData?.cookMinutes == null) {
          return Toast({
            message: "請選擇自取時間",
            className: "toastError"
          });
        }
      } else {
        if (Object.keys(this.marketOrderOther.selectedAddress).length === 0) {
          return Toast({
            message: "請選擇收貨地址",
            className: "toastError"
          });
        }
        if (Object.keys(this.marketOrderOther.cookTimeSelectData).length === 0) {
          return Toast({
            message: "請選擇送達時間",
            className: "toastError"
          });
        }
      }
      if (
        this.missProductIndex == -1 ||
        !this.missProductList?.[this.marketOrderOther.missProductIndex]?.value
      ) {
        this.missProductPopup = true;
        return;
      }
      if (!this.deliveryType && this.currentWeightCost.overWeightCannotSend) {
        return this.checkOverWeight();
      }
      const marketCartData = this.marketCartData;
      this.marketShoppingCart.forEach(o => {
        if (!o.selected) {
          return;
        }
        const skuId = o?.skuId;
        const skuPrice = o?.price;
        let disFullId = o.fullReduce?.id;
        let disFullAmtn = marketCartData[disFullId]?.current?.fullAtm;
        const activity = this.marketStoreDiscountActivityMap[o.discountActivityId];
        const activityType = o.fullReduce?.activityType;
        const isShare = (activityType === 1 && activity?.shareFullReduction) ||
          (activityType === 2 && activity?.shareFullDiscount) ||
          (o.isOldDiscount && activityType === 1 && isUseFullReduction) ||
          (o.isOldDiscount && activityType === 2 && isUseFullDiscount) ||
          (o.group && activityType === 1 && o.group.shareFullReduction) ||
          (o.group && activityType === 2 && o.group.shareFullDiscount);
        if (disFullId) {
          const full = marketCartData[disFullId];
          if (!full?.current) {
            disFullId = disFullAmtn = undefined;
          }
        }
        const item = {
          buyCount: o.quantity,
          productId: o.productId,
          productName: o.productName,
          skuId,
          skuPrice,
          disFullId,
          disFullAmtn
        };

        // 折扣商品
        if (o.isDiscount || o.isOldDiscount || o.isSeckill) {
          if (o.discountQuantity) {
            productList.push({
              ...item,
              isDiscount: o.isDiscount,
              isOldDiscount: o.isOldDiscount,
              isSeckill: o.isSeckill,
              buyCount: o.discountQuantity,
              skuPrice: o.discountPrice,
              discountActivityId: o.discountActivityId,
              disFullId: isShare ? item.disFullId : null,
              disFullAmtn: isShare ? item.disFullAmtn : null
            });
          }
          if (o.discountQuantity && o.quantity - o.discountQuantity > 0) {
            productList.push({
              ...item,
              buyCount: o.quantity - o.discountQuantity,
              isDiscount: false,
              isOldDiscount: false,
              isSeckill: false
            });
          }
          if (o.discountQuantity == 0) {
            productList.push({
              ...item,
              buyCount: o.quantity,
              isDiscount: false,
              isOldDiscount: false,
              isSeckill: false
            });
          }
        } else if (o.isMallCoupon) {
          // 商品券
          productList.push({
            ...item,
            buyCount: o.discountQuantity,
            productId: o.__productId__,
            mallCouponUserId: o.mallCouponUserId,
            disMallCouponAmtn: o.__disMallCouponAmtn__
          });
        } else if (o.group) {
          // 组合价
          if (o.discountQuantity) {
            const buyCount = o.groupJoinQty;
            productList.push({
              ...item,
              activityType: 3, // 组合单价
              activityId: o.group.activityId,
              activityProductId: o.group.activityProductId,
              activityShareVoucher: o.group.shareVoucher,
              buyCount,
              skuPrice: this.utils.filterSecret(
                o.discountQuantity * o.group.price / buyCount
              ),
              discountActivityId: o.discountActivityId,
              disFullId: isShare ? item.disFullId : null,
              disFullAmtn: isShare ? item.disFullAmtn : null
            });
          }
          if (o.groupNormalQty) {
            productList.push({
              ...item,
              buyCount: o.groupNormalQty
            });
          }
        } else {
          productList.push(item);
        }
      });
      // 买赠赠送的商品
      this.giftBuyList.forEach(item => {
        if (Array.isArray(item.buyGiftProducts)) {
          item.buyGiftProducts.forEach(p => {
            if (p.__giftQuantity__ > 0) {
              productList.push({
                isBuyGift: true,
                buyGiftId: item.buyGiftId,
                merchantProductId: p.merchantProductId,
                productId: p.productId,
                productName: p.productName,
                originalPrice: p.productPrice,
                skuPrice: 0,
                buyCount: p.__giftQuantity__,
                selfBuiltProduct: p.selfBuiltProduct
              });
            }
          });
        }
      });
      let amtn = this.utils.filterSecret(this.submitBarPayAmt + this.usePointPrice);
      if (amtn < 0.1) {
        amtn = 0.1;
      }
      const data = {
        // // 是否著數紅包
        // isCheap: !!this.memberOrderVoucher?.isCheap,
        // 收貨地址ID
        addressId: this.marketOrderOther?.selectedAddress?.id,
        // 买家实际支付金额
        amtn,
        takeFoodType: this.askType.type, // 自取類型   1 立即  2 預定
        // 是否立刻送出，立刻送达时，必传
        atOnceSend: this.deliveryType
          ? this.askType.type === 1
          : this.marketOrderOther.cookTimeSelectData.promptlyType,
        // 配送类型[1:配送；2:到店自取]
        orderType: this.deliveryType ? 2 : 1,
        // 代金卷ID
        voucherId: this.memberOrderVoucher?.id || "",
        // 紅包ID
        giftId: this.memberOrderRedpack?.common?.id || "",
        // // 立減券id
        // reduceId: this.memberOrderReduce?.id || '',
        // 满减抵扣金额
        disFullAmtn: this.disFullAmtn,
        // 紅包抵扣金额
        disGiftAmtn: this.disGiftAmtn,
        deliveryGiftId: this.disDeliveryGiftAmtn && this.memberOrderRedpack?.delivery?.id ? this.memberOrderRedpack?.delivery?.id : '',
        // 免配红包抵扣金额
        disDeliveryGiftAmtn: this.disDeliveryGiftAmtn,
        // // 立減券金額
        // reduceAmtn: this.reduceAmtn,
        // 订单来源(
        sourceOrder: this.marketOrderOther?.sourceOrder || 0,
        // 配送费减免
        discountDeliveryFee: this.marketOrderOther.discountDeliveryFee,
        // 代金卷抵扣金额
        disVoucherAmtn: this.disVoucherAmtn,
        // 是否自备胶带
        isPlasticBag: this.marketOrderOther.isPlasticBag,
        // 胶带费
        plasticBagFee: !this.marketOrderOther.isPlasticBag ? this.marketPackagePrice : 0,
        // 購買商品列表
        productList,
        // 自取预留电话
        receiverMobile: this.phone.area + "-" + this.receiverMobile,
        // 服務費
        serviceFee: this.serviceFeePrice <= 0 ? 0 : this.serviceFeePrice,
        // 備註
        remark: this.remarkText,
        // 配送費
        deliveryFee: this.utils.filterSecret(this.marketOrderOther.deliveryFee - this.disDeliveryGiftAmtn),
        // 送達時間
        sendTime: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.sendTime
          : this.marketOrderOther.cookTimeSelectData.sendTime,
        sendDate: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.sendDate
          : this.marketOrderOther.cookTimeSelectData.sendDate,
        sendType: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.sendType
          : this.marketOrderOther.cookTimeSelectData.sendType,
        // 出餐时间
        cookMinutes: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.cookMinutes
          : this.marketOrderOther.cookTimeSelectData.cookMinutes,
        // 门店ID
        storeId: this.marketStoreDetail.id,
        // 缺貨
        outOfStockType:
          this.missProductList?.[this.marketOrderOther.missProductIndex]?.value || "",
        // 用於統計滿減活動
        activityId: this.marketOrderOther.activityId,
        // // 满赠ID
        // fullGiftId: this.giftData.id,
        // 滿減優惠
        disFullList: this.disFullList,
        // 平台费原价
        originalPlatformCommission: this.platformFeeData.originalPlatformCommission,
        // 平台费
        platformCommission: this.platformFeeData.platformCommission,
        // 平台费减免用户类型
        disPlatformCommissionUserType: this.platformFeeData.disPlatformCommissionUserType,
        // 商家會員號碼，门店开启该功能才传
        memberNo: this.marketStoreDetail.isMemberNo ? this.memberNo : ''
      };
      // 自取单折扣
      if (this.deliveryType && this.selfOrderRate != null) {
        data.selfTakeOrderDiscount = this.storeSelfDiscount.selfTakeOrderDiscount;
        data.selfTakeOrderDiscountAmt = this.selfDiscountAmt;
        data.selfTakeOrderDiscountId = this.storeSelfDiscount.selfTakeOrderDiscountId;
      }
      // 使用了積分
      if (this.usePointTotal) {
        data.mcoinCount = this.usePointTotal;
        data.mcoinCountAfterAmtn = this.utils.filterSecret(
          this.submitBarPayAmt// orderTotal - this.usePointPrice
        );
      }
      // 超值换购
      if (this.checkExchangeProducts.length) {
        data.purchaseActivityId = this.exchangeProduct.activityId;
        data.purchaseProductList = this.checkExchangeProducts.map(item => ({
          buyCount: 1,
          productId: item.productId,
          productName: item.productName,
          skuId: item.skuId,
          skuName: item.skuName,
          skuPrice: item.discountAmount
        }));
      }
      // 開通會員
      const { vipData } = this.marketOrderOther;
      if (vipData?.memberSettingId) {
        data.memberSettingId = vipData?.memberSettingId;
        const { memberSettingId: redpackMemberSettingId, redpackBasicId } = this.memberOrderRedpack?.common;
        // 使用了*假月卡紅包*
        if (redpackMemberSettingId) {
          data.redpackBasicId = redpackBasicId;
        }
      }
      // 消費金使用
      const { params: goldParams } = this.getGoldSubmitParams();
      if (goldParams) {
        data.consumptionList = goldParams;
      }
      if (
        this.orderTotal <= 0.1 &&
        (this.memberOrderVoucher?.id || this.memberOrderRedpack?.common?.id)
      ) {
        const carryOn = await new Promise((resolve, reject) => {
          Dialog.confirm({
            className: "bottomOverlay",
            message: "本訂單优惠无法全部抵扣，將支付MOP0.1 ，是否繼續提交訂單？",
            cancelButtonText: "取消",
            confirmButtonText: "繼續"
          })
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        });
        if (carryOn === false) {
          return false;
        }
      }
      Toast.loading({ message: "提交訂單...", duration: 0 });
      this.$store.dispatch("createMarketOrder", data)
        .then(async result => {
          const marketOrderHistory = _.cloneDeep(this.marketOrderHistory);
          const index = _.findIndex(marketOrderHistory, { id: this.id });
          _.remove(this.marketShoppingCart, { selected: true });
          if (!this.marketShoppingCart.length) {
            delete marketOrderHistory[index];
          } else {
            marketOrderHistory[index].data = this.marketShoppingCart;
          }
          this.$store.commit("marketOrderHistory", marketOrderHistory);

          // 查詢訂單
          return await this.$store.dispatch("marketOrderInfo", this.createMarketOrder.tradeId);
        })
        .then(async result => {
          this.paymentMarketOrder();
        }).catch(e => {
          console.log(e, "发起请求错误信息");
          this.catchError(e);
        });
    },

    // 是否需要胶袋
    onIsPlasticBag() {
      this.init();
    },
    // 自取时间文字
    askforTimeText() {
      const storeDetail = this.marketStoreDetail;
      // 非立即自取不执行
      if (!this.selfPick) {
        return;
      }
      const marketAskforTime = this.marketAskforTime;
      const selectIndex = this.marketOrderOther.askforTimeSelectIndex || 0; // 左侧选中时间
      const timeIndex = this.marketOrderOther.askforTimeIndex || 0; // 右侧选中时间
      const parentData = marketAskforTime[selectIndex];
      const timeData = (parentData || [])?.cookTime?.[timeIndex];

      // 支持自取&不接受预约
      if (
        (storeDetail.promptlyAskforType && !storeDetail.promptlyReserveType)
      ) {
        this.askTypeFlag = false;
        this.askType.type = 1; // 修改为立即自取
      }

      // 不支持立即自取
      if (!storeDetail.promptlyAskforType && this.askTypeFlag) {
        this.askType.type = 2; // 修改为预定自取
        this.askTypeFlag = false;
      }
      // 不支持预约
      if (!storeDetail.promptlyReserveType && this.askTypeFlag) {
        this.askType.type = 1; // 修改为立即自取
        this.askTypeFlag = false;
      }

      // 判断是否有选中时间
      if (timeData) {
        const string = `${parentData.dateStr}${timeData.sendTime}`;
        this.$store.commit("marketOrderOther", {
          askforTimeSelectIndex: selectIndex,
          askforTimeIndex: timeIndex,
          askforTimeSelectString: string,
          askforTimeSelectData: { ...timeData, ...parentData }
        });
      }
      // 没有选中时间
      if (!timeData) {
        const payload = {
          askforTimeSelectIndex: 0,
          askforTimeIndex: 0,
          askforTimeSelectString: "",
          askforTimeSelectData: {}
        };
        // 预定自取
        if (this.askType.type === 2) {
          payload.cookMinutes = null;
        }
        this.$store.commit("marketOrderOther", payload);
      }
      // 选择了立即自取客户端自定义数据
      if (this.askType.type === 1) {
        this.$store.commit("marketOrderOther", {
          askforTimeSelectIndex: 0,
          askforTimeIndex: 0,
          askforTimeSelectString: "",
          askforTimeSelectData: {
            sendTime: "23:59",
            sendType: 1,
            sendDate: Date.now(),
            cookMinutes: 30
          }
        });
      }
    },
    // 配送时间文字
    cookTimeText() {
      // 非配送不执行
      if (this.selfPick) {
        return;
      }
      const marketCookTime = this.marketCookTime;
      const selectIndex = this.marketOrderOther.cookTimeSelectIndex || 0; // 左侧选中时间
      const timeIndex = this.marketOrderOther.cookTimeIndex || 0; // 右侧选中时间
      const parentData = marketCookTime[selectIndex];
      const timeData = (parentData || [])?.cookTime?.[timeIndex];

      // 判断是否有选中时间
      if (timeData) {
        const title = timeData.promptlyType ? "立即送達" : parentData.dateStr;
        const deliverAbout = `大約${parentData.dateStr}${timeData.sendTime}送達`;
        const deliverAboutRange = timeData.sendEndTime
          ? `大約${parentData.dateStr}${timeData.sendTime}~${timeData.sendEndTime} 送達`
          : `大約${parentData.dateStr}${timeData.sendTime}送達`;
        const string = timeData.promptlyType ? deliverAbout : deliverAboutRange;
        this.$store.commit("marketOrderOther", {
          cookTimeTitle: title,
          cookTimeSelectIndex: selectIndex,
          cookTimeIndex: timeIndex,
          cookTimeSelectString: string,
          cookTimeSelectData: { ...timeData, ...parentData }
        });
        if (timeData.overWeight && !this.marketDisabledDialogType) {
          this.$store.commit('marketDisabledDialogType', 2);
        }
      }
      // 没有选中时间
      if (!timeData) {
        this.$store.commit("marketOrderOther", {
          cookTimeSelectIndex: 0,
          cookTimeIndex: 0,
          cookTimeTitle: "",
          cookTimeSelectString: "",
          cookTimeSelectData: {}
        });
      }
      if (this.marketDisabledDialogType == 2) {
        return this.checkOverWeight();
      }
    },

    total() {
      this.enjoyDiscountType = 0;
      // 检查代金券
      if (this.marketStoreVoucherList?.effectiveList) {
        const id = this.memberOrderVoucher.id || 0;
        const effectiveList = this.marketStoreVoucherList?.effectiveList || [];
        const index = _.findIndex(effectiveList, { id: id });
        if (index === -1) {
          this.$store.commit("memberOrderVoucher", {});
        }
      } else {
        this.$store.commit("memberOrderVoucher", {});
      }
      // 订单页面带到门店页面的配送费
      this.$store.commit("marketOrderOther", { storeDeliveryFee: 0 });
      // 配送費滿減,只有配送才有配送费满减
      let deliveryFee = 0;
      const activityDeliveryData = this.activityDeliveryData;
      if (activityDeliveryData.platformAmount || activityDeliveryData.merchantAmount) {
        this.enjoyDiscountType =
          activityDeliveryData.platformAmount &&
            activityDeliveryData.merchantAmount ? 3
            : activityDeliveryData.platformAmount ? 1 : 2;
      }

      // 减免的配送费  没有超重
      const discountDeliveryFee = this.marketOrderOther?.selectedAddress?.id && !this.currentWeightCost.overWeightCannotSend
        ? (activityDeliveryData.platformAmount || 0) + (activityDeliveryData.merchantAmount || 0)
        : 0;
      // 已优惠
      // this.discountTotal = discountDeliveryFee;
      // 配送費
      const fee = this.marketOrderOther.cookTimeSelectData?.deliveryFee;

      deliveryFee = fee > discountDeliveryFee ? fee - discountDeliveryFee : 0;
      this.$store.commit("marketOrderOther", { storeDeliveryFee: deliveryFee });
      // 减免的配送费
      this.$store.commit("marketOrderOther", {
        discountDeliveryFee: discountDeliveryFee
      });
      // 配送费
      this.$store.commit("marketOrderOther", { deliveryFee: deliveryFee });
      // 服务费 =（商品總價+餐盒費 ）* 服務費 %
      const coverCharge = this.marketServiceFee?.coverCharge || 0;
      this.serviceFeePrice = (this.marketOrderOther.totalPrice) * coverCharge;
      this.serviceFeePrice = Number(this.fixed3To2(this.serviceFeePrice));

      // 优惠券，红包，满减优惠价格总和
      const amount =
        (this.memberOrderRedpack?.common?.amount || 0) +
        (this.memberOrderVoucher?.amount || 0) +
        (this.disFullAmtn) +
        (this.memberOrderReduce?.amount || 0);
      // 商品总价 +餐盒费 - 自取折扣的優惠
      let orderTotalPrice = this.orderPayAmt;
      if (orderTotalPrice - amount >= 0) {
        orderTotalPrice = orderTotalPrice - amount;
      } else {
        orderTotalPrice = 0;
      }
      // 其他费用
      let otherPrice = 0;
      // 自取，不需要胶袋
      if (this.deliveryType && this.isPlasticBag) {
        this.orderTotal =
          // 服务费
          this.serviceFeePrice +
          // 商品总价+餐盒费 - 自取折扣 -已优惠价格
          orderTotalPrice;
        otherPrice += this.serviceFeePrice;
      }
      // 自取，需要胶袋
      else if (this.deliveryType && !this.isPlasticBag) {
        this.orderTotal =
          // 服务费
          this.serviceFeePrice +
          // 胶袋费
          this.marketPackagePrice +
          // 商品总价+餐盒费 - 自取折扣 -已优惠价格
          orderTotalPrice;
        otherPrice = this.serviceFeePrice + this.marketPackagePrice;
      }
      // 配送
      else {
        const deliveryFee = this.marketOrderOther.deliveryFee;
        // 使用了免配红包
        const deliveryRp = this.memberOrderRedpack?.delivery;
        this.disDeliveryGiftAmtn = 0;
        if (deliveryRp?.id && deliveryFee) {
          // 实际抵扣的免配红包金额
          const discountDeliveryRpAmount = deliveryFee > deliveryRp?.amount ? deliveryRp?.amount : deliveryFee;
          this.disDeliveryGiftAmtn = discountDeliveryRpAmount;
        }
        this.orderTotal =
          // 服务费
          this.serviceFeePrice +
          // 胶袋费
          this.marketPackagePrice +
          // 配送费
          (this.currentWeightCost.overWeightCannotSend ? 0 : deliveryFee) -
          // 免配红包抵扣金额
          this.disDeliveryGiftAmtn +
          // 商品总价+餐盒费 - 自取折扣 -已优惠价格
          orderTotalPrice;
        otherPrice =
          this.serviceFeePrice +
          this.marketPackagePrice +
          (this.currentWeightCost.overWeightCannotSend ? 0 : deliveryFee) -
          this.disDeliveryGiftAmtn;
      }

      this.orderTotal = Math.round((this.orderTotal + 0.00001) * 100) / 100;

      (!this.isPlasticBag && this.marketPackagePrice ? this.marketPackagePrice : 0) +
        this.serviceFeePrice;

      const filterSecretNumber = this.utils.filterSecret;
      let toZeroOne = false;
      // 满减抵扣金额
      let amtn = this.orderPayAmt;
      if (this.disFullAmtn) { //  滿減生效一般都比物價少
        if ((amtn - this.disFullAmtn) <= 0) {
          amtn = 0;
          this.disFullAmtn = amtn;
          if (otherPrice < 0.1) {
            toZeroOne = true;
          }
        } else {
          // 菜品金額減 滿減優惠
          amtn = filterSecretNumber(amtn - this.disFullAmtn);
        }
      }
      // 代金卷抵扣金额
      let disVoucherAmtn = this.memberOrderVoucher?.amount || 0;
      if (disVoucherAmtn && !toZeroOne) {
        // 代金券是否比菜品金額大
        if (amtn - disVoucherAmtn <= 0) {
          disVoucherAmtn = amtn;
          if (otherPrice < 0.1) {
            toZeroOne = true;
          }
        }

        // 菜品金額減代金券金額
        amtn = filterSecretNumber(amtn - disVoucherAmtn);
      } else {
        disVoucherAmtn = 0;
      }
      this.disVoucherAmtn = filterSecretNumber(disVoucherAmtn);

      // 紅包抵扣金额
      let disGiftAmtn = this.memberOrderRedpack?.common?.amount || 0;

      if (disGiftAmtn && amtn && !toZeroOne) {
        if (amtn - disGiftAmtn <= 0) {
          disGiftAmtn = amtn;
          if (otherPrice < 0.1) {
            toZeroOne = true;
          }
        }
        amtn = filterSecretNumber(amtn - disGiftAmtn);
      } else {
        disGiftAmtn = 0;
      }
      this.disGiftAmtn = filterSecretNumber(disGiftAmtn);
      // 立減券
      let reduceAmtn = this.memberOrderReduce?.amount || 0;
      if (reduceAmtn && !toZeroOne && amtn) {
        if (amtn - reduceAmtn <= 0) {
          reduceAmtn = amtn;
          if (otherPrice < 0.1) {
            toZeroOne = true;
          }
        }

        amtn = filterSecretNumber(amtn - reduceAmtn);
      } else {
        reduceAmtn = 0;
      }
      this.reduceAmtn = reduceAmtn;

      if (toZeroOne) {
        let zeroOne = 0.1;
        if (this.reduceAmtn) {
          if (this.reduceAmtn >= zeroOne) {
            this.reduceAmtn -= zeroOne;
            this.reduceAmtn = filterSecretNumber(this.reduceAmtn);
            zeroOne = 0;
          } else {
            this.reduceAmtn = 0;
            zeroOne -= this.reduceAmtn;
          }
        }
        if (this.disGiftAmtn && zeroOne) {
          if (this.disGiftAmtn >= zeroOne) {
            this.disGiftAmtn -= zeroOne;
            this.disGiftAmtn = filterSecretNumber(this.disGiftAmtn);
            zeroOne = 0;
          } else {
            this.disGiftAmtn = 0;
            zeroOne -= this.disGiftAmtn;
          }
        }
        if (this.disVoucherAmtn && zeroOne) {
          if (this.disVoucherAmtn >= zeroOne) {
            this.disVoucherAmtn -= zeroOne;
            this.disVoucherAmtn = filterSecretNumber(this.disVoucherAmtn);
            zeroOne = 0;
          } else {
            this.disVoucherAmtn = 0;
            zeroOne -= this.disVoucherAmtn;
          }
        }
      }
      // 满减
      if (this.deliveryType) {
        // 自取
        // 滿減優惠  + 代金券優惠  + 紅包金額  + 立減券
        this.discountTotal = filterSecretNumber(
          this.disFullAmtn +
          this.disVoucherAmtn +
          this.disGiftAmtn +
          this.reduceAmtn
        );
      } else {
        // 專送
        // 配送費優惠  +  滿減優惠  + 代金券優惠  + 紅包金額  + 立減券 + 配送费红包金额
        this.discountTotal = filterSecretNumber(
          discountDeliveryFee +
          this.disFullAmtn +
          this.disVoucherAmtn +
          this.disGiftAmtn +
          this.reduceAmtn +
          this.disDeliveryGiftAmtn
        );
      }
    },
    getVoucherParam() {
      const { isUseFullReduction, isUseFullDiscount, isUseVoucher } = this.marketStoreDetail;
      const productList = [];
      // 从orderProduct里取实际价格
      const orderProduct = this.orderProduct.filter(item => !item.isBuyGift);
      const getProductDefAmtn = (productId) => {
        return orderProduct
          .find(item => item.productId === productId)
          ?.totalPrice || 0;
      };
      const getProductAmtn = (isDiscount, productId) => {
        return orderProduct
          .find(item => item.productId === productId && isDiscount === item.isDiscount)
          ?.totalPrice || 0;
      };
      const getProductOldAmtn = (isOldDiscount, productId) => {
        return orderProduct
          .find(item => item.productId === productId && isOldDiscount === item.isOldDiscount)
          ?.totalPrice || 0;
      };
      const getProductSeckillAmtn = (isSeckill, productId) => {
        return orderProduct
          .find(item => item.productId === productId && isSeckill === item.isSeckill)
          ?.totalPrice || 0;
      };
      this.marketShoppingCart.forEach(o => {
        if (!o.selected) {
          return;
        }
        const discountAct = this.marketStoreDiscountActivityMap[o.discountActivityId];
        const fullReduce = this.marketCartData[o.fullReduce?.id];
        const activityType = o.fullReduce?.activityType;
        const isShare = (o.isDiscount && activityType === 1 && discountAct?.shareFullReduction) ||
          (o.isDiscount && activityType === 2 && discountAct?.shareFullDiscount) ||
          (o.isOldDiscount && activityType === 1 && isUseFullReduction) ||
          (o.isOldDiscount && activityType === 2 && isUseFullDiscount) ||
          (o.group && activityType === 1 && o.group.shareFullReduction) ||
          (o.group && activityType === 2 && o.group.shareFullDiscount);
        const item = {
          canUseDiscountList: (fullReduce?.current && fullReduce.canUseDiscountList) || [],
          disFullId: fullReduce?.current && fullReduce.id,
          productAmtn: getProductDefAmtn(o.productId),
          productId: o.productId,
          skuId: o.skuId
        };
        // 折扣商品
        if (o.isDiscount || o.isOldDiscount || o.isSeckill) {
          if (o.discountQuantity) {
            productList.push({
              ...item,
              productAmtn: o.isDiscount
                ? getProductAmtn(true, o.productId)
                : o.isOldDiscount
                  ? getProductOldAmtn(true, o.productId)
                  : getProductSeckillAmtn(true, o.productId),
              shareFullReduction: discountAct?.shareFullReduction,
              shareFullDiscount: discountAct?.shareFullDiscount,
              shareVoucher: o.isDiscount ? discountAct?.shareVoucher : isUseVoucher,
              isDiscount: o.isDiscount,
              isOldDiscount: o.isOldDiscount,
              isSeckill: o.isSeckill,
              disFullId: isShare ? item.disFullId : null,
              canUseDiscountList: isShare ? item.canUseDiscountList : []
            });
          }
          if (
            (o.discountQuantity && o.quantity - o.discountQuantity > 0) ||
            o.discountQuantity == 0
          ) {
            productList.push({
              ...item,
              productAmtn: o.isDiscount
                ? getProductAmtn(false, o.productId)
                : o.isOldDiscount
                  ? getProductOldAmtn(false, o.productId)
                  : getProductSeckillAmtn(false, o.productId),
              isDiscount: false,
              isOldDiscount: false,
              isSeckill: false
            });
          }
        } else if (o.group) {
          // 组合价
          if (o.discountQuantity) {
            productList.push({
              ...item,
              activityType: 3, // 组合价写死
              activityShareVoucher: o.group.shareVoucher,
              productAmtn: orderProduct
                .find(item => item.productId === o.productId && o.group)
                ?.totalPrice || 0,
              disFullId: isShare ? item.disFullId : null,
              canUseDiscountList: isShare ? item.canUseDiscountList : []
            });
          }
          if (o.groupNormalQty) {
            productList.push({
              ...item,
              productAmtn: orderProduct
                .find(item => item.productId === o.productId && !item.group)
                ?.totalPrice || 0
            });
          }
        } else {
          productList.push(item);
        }
      });
      return {
        deliveryType: this.deliveryType ? 2 : 1,
        disFullList: this.disFullList,
        productList,
        storeId: this.id,
        redpackId: this.memberOrderRedpack?.common?.id,
        reduceId: this.memberOrderReduce?.id,
        redpackAmtn: 0,
        deliveryGiftId: this.memberOrderRedpack?.delivery?.id || ""
      };
    },
    onGoGold() {
      this.setGoldUseDataParams();
      this.$router.push({
        path: "/gold/use"
      });
    },
    // 获取消费金列表
    getGoldUseData() {
      // 原金額
      const { amtn: oldAmtn } = this.goldUseDataParams;
      // 消費金不能抵扣月卡金額
      const newAmtn = this.utils.filterSecret(
        this.payAmt +
        this.exchangeAmtInfo.amt +
        (this.platformFeeData.platformCommission || 0)
      );
      this.setGoldUseDataParams(newAmtn);
      // 支付金额有变动，重选消费金
      if (
        this.goldUseChangeData.length &&
        oldAmtn > 0 &&
        newAmtn !== oldAmtn
      ) {
        this.$store.commit('goldUseChangeData', []);
        setTimeout(() => {
          this.$toast(this.$t('gold_usage_change_tips'));
        }, 100);
        const newGoldUseData = this.goldUseData;
        newGoldUseData.effectiveList.forEach(item => {
          item.props.selectIndex = false;
        });
        this.$store.commit('goldUseData', { ...newGoldUseData });
      }
      this.$store.dispatch('getGoldUseData');
    },
    setGoldUseDataParams(amtn) {
      // 商超暂无超值换购
      // 使用消费金前的实付金额(包含超值换购)
      if (!amtn) {
        amtn = this.utils.filterSecret(
          this.payAmt +
          this.exchangeAmtInfo.amt +
          (this.platformFeeData.platformCommission || 0)
        );
      }
      const params = {
        amtn,
        deliveryType: this.getDeliveryType(),
        storeId: this.id
      };
      this.$store.commit('goldUseDataParams', params);
    },
    // 提交订单参数
    getGoldSubmitParams() {
      if (!this.goldUseChangeData?.length) {
        return {};
      }
      const { amtn } = this.goldUseDataParams;
      const params = [];
      // 使用消費金總額
      const len = this.goldUseChangeData.length;
      // 選中的總金額
      let total = 0;
      if (len === 1) {
        total = this.goldUseChangeData[0].amount;
        const paramItem = {
          consumptionId: this.goldUseChangeData[0].id,
          disConsumptionAmtn: this.utils.filterSecret(this.useGoldAmount)
        };
        params.push(paramItem);
      } else if (len > 1) {
        this.goldUseChangeData.forEach((item, index) => {
          const isLastItem = (index === len - 1);
          if (!isLastItem) {
            total += item.amount;
          }
          let disConsumptionAmtn = item.amount;
          // 計算最後一張消費券的抵扣金額
          if (isLastItem) {
            disConsumptionAmtn = amtn - total;
            total += item.amount;
            // 券总面额超出支付金额
            if (total >= this.utils.filterSecret(amtn - 0.1)) {
              disConsumptionAmtn = disConsumptionAmtn - 0.1;
            } else {
              disConsumptionAmtn = item.amount;
            }
          }
          const paramItem = {
            consumptionId: item.id,
            disConsumptionAmtn: this.utils.filterSecret(disConsumptionAmtn)
          };
          params.push(paramItem);
        });
      }
      return { params };
    },
    // 消費金使用說明
    showGoldUseTipsDialog() {
      Dialog.confirm({
        title: this.$t("gold_intro_for_use"),
        allowHtml: true,
        showCancelButton: false,
        confirmButtonText: this.$t("common.got_it"),
        className: "mCoinMessage",
        message: this.$t('gold_use_dialog_tips')
      });
    },
    async init() {
      showRequestLoad();
      this.submitBarLoading = true;
      const { dispatch, commit } = this.$store;
      const { delivery, askforType, isUseFullReduction, isUseFullDiscount } = this.marketStoreDetail;
      commit('haveFresh', false);
      commit("marketIsSuccessPay", false);
      // 配送方式【自取或者配送】,false為配送，true為自取
      if (this.marketOrderOther.deliveryType == "") {
        // 支持自取和配送
        if (delivery && askforType) {
          this.deliveryType = false;
          // 只支持自取
        } else if (!delivery && askforType) {
          this.deliveryType = true;
          // 只支持配送
        } else if (delivery && !askforType) {
          this.deliveryType = false;
          // 不支持配送 不支持自取
        } else if (!delivery && !askforType) {
          this.deliveryType = false;
        }
      } else {
        // 原來的配送方式【自取或者配送】,false為配送，true為自取
        this.deliveryType = this.marketOrderOther.deliveryType;
      }

      const marketOrderHistory = _.head(_.filter(this.marketOrderHistory, { id: this.id }));
      if (marketOrderHistory?.data) {
        commit('marketShoppingCart', _.cloneDeep(marketOrderHistory.data));
      } else {
        this.$router.replace({ path: "/market/index" });
      }

      this.expandProduct = false;
      // 订单商品
      const orderProduct = [];
      // 商品總價
      let totalPrice = 0;
      let totalWeight = 0;
      // 商品券所有原价总和
      let productMallRawPriceTotal = 0;
      // 商品券所有折扣价总和
      let productMallDiscountPriceTotal = 0;
      const that = this;
      this.isUseDiscount = false;
      this.isUseSpecial = false;
      this.askType.type = this.marketOrderOther.askType;

      // 店鋪詳情
      await dispatch("marketStoreDetail", this.id).catch(e => {
        console.log("views/market/order/marketStoreDetail", e);
      });

      this.marketShoppingCart.forEach(o => {
        o = { ...o };
        if (!o.selected) {
          return;
        }
        if (o.isFresh) {
          commit('haveFresh', true);
        }
        totalWeight += ((o.weight || 0) * (o.quantity || 0));
        let disFullId = o.fullReduce?.id;
        const activity = this.marketStoreDiscountActivityMap[o.discountActivityId];
        const activityType = o.fullReduce?.activityType;
        const isShare = (activityType === 1 && activity?.shareFullReduction) ||
          (activityType === 2 && activity?.shareFullDiscount) ||
          (o.isOldDiscount && activityType === 1 && isUseFullReduction) ||
          (o.isOldDiscount && activityType === 2 && isUseFullDiscount) ||
          (o.group && activityType === 1 && o.group.shareFullReduction) ||
          (o.group && activityType === 2 && o.group.shareFullDiscount);
        if (disFullId) {
          const full = this.marketCartData[disFullId];
          if (!full?.current) {
            disFullId = undefined;
          }
        }
        o.isMan = !!disFullId; // 标记是否参与满减满折
        // 新折扣菜||旧折扣||秒杀
        if (o.isDiscount || o.isOldDiscount || o.isSeckill) {
          // 折扣商品
          if (o.discountQuantity) {
            that.isUseDiscount = true;
            const ingPrice = _.sumBy(
              o.ingredients,
              j => j.price * o.discountQuantity
            );
            orderProduct.push({
              ...o,
              isMan: isShare ? o.isMan : false,
              totalPrice: o.discountQuantity * o.discountPrice + ingPrice,
              discountPriceTotal: o.discountQuantity * o.price,
              quantity: o.discountQuantity
            });
            // 商品价格
            totalPrice += o.discountQuantity * o.discountPrice + ingPrice;
          }

          // 原价商品
          if (o.discountQuantity && o.quantity - o.discountQuantity > 0) {
            that.isUseDiscount = true;
            // 原價商品
            orderProduct.push({
              ...o,
              isDiscount: false,
              isOldDiscount: false,
              isSeckill: false,
              discountPriceTotal: 0,
              quantity: o.quantity - o.discountQuantity,
              totalPrice: (o.quantity - o.discountQuantity) * o.price
            });
            // 商品价格
            totalPrice += (o.quantity - o.discountQuantity) * o.price;
          }
          // 原价商品
          if (o.discountQuantity == 0) {
            orderProduct.push({
              ...o,
              isDiscount: false,
              isOldDiscount: false,
              isSeckill: false,
              discountPriceTotal: 0,
              quantity: o.quantity,
              totalPrice: o.quantity * o.price
            });
            // 商品价格
            totalPrice += o.quantity * o.price;
          }
        } else if (o.isMallCoupon) {
          orderProduct.push({
            ...o,
            totalPrice: o.discountQuantity * o.__price__,
            discountPriceTotal: o.discountQuantity * o.price,
            quantity: o.discountQuantity
          });
          // 商品价格
          totalPrice += o.discountQuantity * o.__price__;
          productMallDiscountPriceTotal += o.discountQuantity * o.__price__;
          productMallRawPriceTotal += o.discountQuantity * o.price;
        } else if (o.group) {
          // 组合价
          if (o.discountQuantity) {
            orderProduct.push({
              ...o,
              totalPrice: o.discountQuantity * o.compositePrice,
              discountPriceTotal: o.groupJoinQty * o.price,
              quantity: o.groupJoinQty
            });
            // 商品价格
            totalPrice += o.discountQuantity * o.compositePrice;
          }
          // 原价商品
          if (o.groupNormalQty) {
            orderProduct.push({
              ...o,
              group: undefined,
              discountPriceTotal: 0,
              quantity: o.groupNormalQty,
              totalPrice: o.groupNormalQty * o.price
            });
            // 商品价格
            totalPrice += o.groupNormalQty * o.price;
          }
        } else {
          // 當前商品價格
          o.totalPrice = o.price * o.quantity;
          // 商品
          orderProduct.push(o);
          // 商品价格
          totalPrice += o.quantity * o.price;
        }
      });

      // 买赠商品塞进订单商品
      this.giftBuyList.forEach(item => {
        if (Array.isArray(item.buyGiftProducts)) {
          item.buyGiftProducts.forEach(g => {
            // 含有生鲜
            if (g.isFresh) {
              commit('haveFresh', true);
            }
            // 赠送的商品总量也要计算进去
            totalWeight += ((g.productWeight || 0) * (g.__giftQuantity__ || 0));
            orderProduct.push({
              ...g,
              isBuyGift: true,
              discountPriceTotal: g.__giftQuantity__ * g.productPrice,
              quantity: g.__giftQuantity__,
              totalPrice: 0
            });
          });
        }
      });

      this.orderProduct = orderProduct;
      shence.marketBuyNow(this);
      shence.marketAddToShoppingCart(this);
      commit('totalWeight', utils.filterSecret(totalWeight));
      // 訂單總價
      totalPrice = this.utils.filterSecret(totalPrice);
      commit("marketOrderOther", { totalPrice });

      // 用户预留手机
      if (this.memberInfo?.phone) {
        const phone = this.memberInfo.phone.split("-");
        this.receiverMobile = phone[1];
        this.phone.area = phone[0];
      }

      // 请求数据
      try {
        const arr = [
          // 平台生效中的满减详情
          // dispatch("marketStoreFull", this.id),

          // 根據門店獲取用戶收貨地址
          dispatch("marketOrderAddressData", { id: this.id }), // this.id
          // 获取胶袋费
          dispatch("marketPackagePrice", {
            storeId: this.id,
            // 商品券要按照原价计算, 先减掉原来折扣，再加回商品券原价
            price: utils.filterSecret(
              totalPrice - productMallDiscountPriceTotal + productMallRawPriceTotal
            )
          })
        ];
        // 自取
        if (this.deliveryType) {
          // 自取收穫時間
          arr.push(dispatch("marketAskforTime", { id: this.id, price: totalPrice }));
        }
        await Promise.all(arr);
      } catch (e) {
        console.log(e);
        throw e;
      }

      // 自取时间分析
      this.askforTimeText();

      // 門店活動信息
      this.disFullAmtn = this.marketFullReduceDisconut;
      let selectedAddress = this.marketOrderOther.selectedAddress || {};
      const userAddressList = this.marketOrderAddressData?.userAddressList;
      // 检查地址是否存在，不存在则清空记录，重新获取
      if (Object.keys(selectedAddress).length) {
        const index = _.findIndex(userAddressList, { id: selectedAddress?.id });
        if (index < 0) {
          selectedAddress = {};
          commit("marketOrderOther", {
            selectedAddress: selectedAddress
          });
        } else {
          commit("marketOrderOther", {
            selectedAddress: userAddressList[index]
          });
        }
      }
      // 默認第一個收貨地址，可用收貨地址
      if (Object.keys(selectedAddress).length === 0) {
        let address = {};
        const id = this.memberLocation?.id;
        if (!id) { // 沒有id説明首頁定位的是系統自動定位地址 取距離當前位置 100米以内的地址
          const getDiffDistance = this.utils.getDiffDistance;
          const point = this.memberLocation.point;
          if (point) {
            const arr = userAddressList.filter(item => {
              const distance = getDiffDistance(point.lat, point.lon, item.lat, item.lon, 8);
              return distance < 0.1;
            }).sort((a, b) => {
              return getDiffDistance(point.lat, point.lon, a.lat, a.lon, 8) - getDiffDistance(point.lat, point.lon, b.lat, b.lon, 8);
            });
            if (arr.length) {
              address = arr[0];
            }
          }
        } else { // 有id 説明首頁是收貨地址 // 需要判斷是系統選還是用戶選，
          if (this.memberLocation.userPick) { // 如果是用戶選擇那麽直接去用戶選擇的地址
            const index = _.findIndex(userAddressList, { id });
            if (index > -1) {
              address = userAddressList[index];
            }
          }
        }
        commit("marketOrderOther", { selectedAddress: address });
        // 地址重新算着了，要清空地址
        commit("marketOrderOther", { cookTimeTitle: "" });
        commit("marketOrderOther", { cookTimeIndex: "" });
        commit("marketOrderOther", { cookTimeSelectIndex: "" });
        commit("marketOrderOther", { cookTimeSelectString: "" });
        commit("marketOrderOther", { cookTimeSelectData: {} });
      }
      // 代金券和红包,收货地址
      let promiseAll = [
        dispatch("marketStoreVoucherList", this.getVoucherParam())
      ];
      if (
        this.marketOrderOther?.selectedAddress?.id &&
        !this.marketOrderOther.deliveryType
      ) {
        promiseAll.push(
          // 获取配送费和时间相关信息
          dispatch("marketCookTime", {
            id: this.id,
            amount: totalPrice,
            haveFresh: this.haveFresh,
            weight: totalWeight,
            addressId: this.marketOrderOther?.selectedAddress?.id
          })
        );
      } else {
        commit("marketCookTime", []);
      }
      try {
        await Promise.all(promiseAll);
      } catch (e) {
        console.error(e);
      }

      // 代金券 v2.0
      // if (this.marketStoreVoucherList?.effectiveList) {
      //   const id = this.memberOrderVoucher.id || 0;
      //   const effectiveList = this.marketStoreVoucherList?.effectiveList || [];
      //   const index = _.findIndex(effectiveList, { id: id });
      //   if (index === -1) {
      //     this.$store.commit("memberOrderVoucher", {});
      //   }
      // } else {
      //   this.$store.commit("memberOrderVoucher", {});
      // }
      // 配送时间分析
      this.cookTimeText();
      commit('currentWeightCost', new WeightCost({
        marketStoreDetail: this.marketStoreDetail,
        marketOrderOther: this.marketOrderOther,
        haveFresh: this.haveFresh,
        totalWeight: totalWeight,
        marketCartPriceTotal: totalPrice
      }));
      // 獲取商家配送費減免
      await dispatch("marketMerchantDeliveryFreeInfo", {
        storeId: this.marketStoreDetail.id,
        deliveryType:
          this.marketOrderOther?.cookTimeSelectData?.deliveryType ??
          this.marketStoreDetail.deliveryType ?? 0,
        sendType: this.marketOrderOther?.cookTimeSelectData?.sendType ?? 1
      });

      // 是专送
      if (!this.deliveryType) {
        this.enjoyDiscountType = 0;
        const { memberLocation, locationPoint, marketOrderOther } = this.$store.getters;
        const selectedAddresspoint = {};
        if (marketOrderOther?.selectedAddress?.lat) {
          selectedAddresspoint.lat = marketOrderOther.selectedAddress.lat;
          selectedAddresspoint.lon = marketOrderOther.selectedAddress.lon;
        }
        const payload = {
          ...locationPoint,
          ...memberLocation.point,
          ...selectedAddresspoint
        };
        const cookTimeSelectData = this.marketOrderOther?.cookTimeSelectData;
        const sendPrice = cookTimeSelectData?.sendPrice || 0;
        // 商品总价 + 餐盒费  大于起送价
        const tempTotalPrice = totalPrice > sendPrice ? totalPrice : sendPrice;

        if (cookTimeSelectData?.deliveryType) {
          await post("/activity/activity/delivery/_get-v3", {
            businessType: 3, // 业务类型[1: 外卖，3: 商超，默认为外卖][3.1.0]
            deliveryAmtn: cookTimeSelectData?.shippingPrice || 0,
            overWeightFee: cookTimeSelectData?.overWeightCost || 0,
            deliveryType:
              this.marketOrderOther.cookTimeSelectData.deliveryType ||
              this.marketStoreDetail.deliveryType,
            sendType: cookTimeSelectData.sendType,
            sendDate: cookTimeSelectData.sendDate,
            cookMinutes: cookTimeSelectData.cookMinutes,
            shippingPriceIncrement: cookTimeSelectData.shippingPriceIncrement || 0,
            storeId: this.id,
            totalPrdtAmtn: tempTotalPrice,
            haveFresh: this.haveFresh,
            atOnceSend: cookTimeSelectData.promptlyType,
            sendTime: cookTimeSelectData.sendTime,
            ...payload// 坐標
          }).then(res => {
            this.activityDeliveryData = res;
          }).catch(e => {
            this.activityDeliveryData = '';
            console.log('_get-v3', e);
          });
        } else {
          this.activityDeliveryData = '';
        }
      }
      // 記錄配送方式【自取或者配送】
      commit("marketOrderOther", { deliveryType: this.deliveryType });

      // 配送不需要自备环保袋,false為配送，true為自取
      if (this.deliveryType == false) {
        // 不需要環保袋
        this.isPlasticBag = false;
      } else if (this.deliveryType == true) {
        // 需要環保袋
        this.isPlasticBag = this.marketOrderOther.isPlasticBag || false;
      }
      commit("marketOrderOther", { isPlasticBag: this.isPlasticBag });

      // 减免配送費和服务费
      promiseAll = [];
      // 服务费
      const payload = {
        storeId: this.marketStoreDetail.id,
        atOnceSend: this.deliveryType
          ? false
          : this.marketOrderOther.cookTimeSelectData.promptlyType
      };
      // 自取
      if (this.deliveryType) {
        payload.sendTime = this.marketOrderOther.askforTimeSelectData.sendTime;
        payload.cookMinutes = this.marketOrderOther.askforTimeSelectData.cookMinutes;
        payload.sendType = this.marketOrderOther.askforTimeSelectData.sendType;
      }
      // 配送
      else {
        payload.sendTime = this.marketOrderOther.cookTimeSelectData.sendTime;
        payload.cookMinutes = this.marketOrderOther.cookTimeSelectData.cookMinutes;
        payload.sendType = this.marketOrderOther.cookTimeSelectData.sendType;
      }
      // 服務費
      if (payload.sendTime && payload.cookMinutes) {
        promiseAll.push(dispatch("marketServiceFee", payload));
      }

      // 配送，获取减免配送費
      if (this.deliveryType == false) {
        if (this.marketOrderOther.selectedAddress?.lat) {
          const data = {
            storeId: this.id,
            sendTime: this.marketOrderOther.cookTimeSelectData.sendTime,
            sendType: this.marketOrderOther.cookTimeSelectData.sendType,
            cookMinutes: this.marketOrderOther.askforTimeSelectData.cookMinutes,
            atOnceSend: this.marketOrderOther.cookTimeSelectData.promptlyType,
            businessType: 3, // 业务类型[1:外卖，3:商超，默认为外卖][3.1.0]
            addressId: this.marketOrderOther?.selectedAddress?.id,
            deliveryType: this.marketOrderOther.cookTimeSelectData.deliveryType,
            lat: this.marketOrderOther.selectedAddress?.lat || null,
            lon: this.marketOrderOther.selectedAddress?.lon || null
          };
          promiseAll.push(dispatch("marketStoreDelivery", data));
        }
      } else {
        commit("marketStoreDelivery", {});
      }
      // 减免配送費和服务费
      await Promise.all(promiseAll);
      // 计算
      this.total();
      // 获取红包列表 如不在可用红包列表清除
      await this.getRedPacketAndCheck();
      // 拿一次新的平台费
      event.$emit('getPlatformFee', () => {
        this.$nextTick(() => {
          this.submitBarLoading = false;
        });
      });
      hideRequestLoad();
    },
    // 渠道紅包提示
    showPayTipMsg() {
      const { common, delivery } = this.memberOrderRedpack
      if (common?.payTypeItems?.length && delivery?.payTypeItems?.length) {
        const intersection = common?.payTypeItems.filter(item => delivery?.payTypeItems.includes(item))
        if (intersection.length) {
          this.$toast({
            message: `使用紅包後訂單需要使用"${intersection.join('/')}"支付渠道。`
          });
        }
      } else if (common?.payTypeItems?.length) {
        this.$toast({
          message: `使用紅包後訂單需要使用"${common?.payTypeItems.join('/')}"支付渠道。`
        });
      } else if (delivery?.payTypeItems?.length) {
        this.$toast({
          message: `使用紅包後訂單需要使用"${delivery?.payTypeItems.join('/')}"支付渠道。`
        });
      }
    },
    getReduceParam() {
      return {
        isUseSpecial: this.isUseSpecial,
        isUseDiscount: this.isUseDiscount,
        addressId: this.marketOrderOther?.selectedAddress?.id,
        isUseRedpack: !!this.memberOrderRedpack?.common?.id || !!this.memberOrderRedpack?.delivery?.id,
        productAmtn: this.marketOrderOther.totalPrice,
        amtn: this.orderPayAmt, // 含餐盒費 減去自取優惠   減去滿減   減去代金券  減去紅包
        isUseVoucher: !!this.memberOrderVoucher?.id,
        storeId: this.id,
        voucherAmtn: (this.memberOrderVoucher?.amount || 0), // 代金券
        giftAmtn: (this.disGiftAmtn || 0), // 紅包
        fullAmtn: this.disFullAmtn, // 滿減
        selfTakeOrderDiscountAmt: 0, // amtn 已減去自取
        atOnceSend: this.deliveryType
          ? false
          : this.marketOrderOther.cookTimeSelectData.promptlyType,
        sendTime: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.sendTime
          : this.marketOrderOther.cookTimeSelectData.sendTime,
        sendType: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.sendType
          : this.marketOrderOther.cookTimeSelectData.sendType,
        cookMinutes: this.deliveryType
          ? this.marketOrderOther.askforTimeSelectData.cookMinutes
          : this.marketOrderOther.cookTimeSelectData.cookMinutes,
        voucherId: this.memberOrderVoucher?.id,
        deliveryType: this.getDeliveryType()
      };
    },
    // 获取红包列表 如不在可用红包列表清除
    async getRedPacketAndCheck() {
      const param = this.getRedPacketParam();
      // [提交订单]红包列表
      const res = await this.$store.dispatch("marketStoreRedpackList", param).catch(error => {
        console.log(error);
        return {};
      });
      // 红包检查
      if (this.marketStoreRedpackList?.effectiveList) {
        const { id, redpackBasicId, memberSettingId } = this.memberOrderRedpack?.common;
        const { id: deliveryRpId } = this.memberOrderRedpack?.delivery;
        const effectiveList = this.marketStoreRedpackList?.effectiveList || [];
        // memberSettingId有值，该红包为假红包。
        // api返回的虚假红包的id会变化
        const index = memberSettingId ? _.findIndex(effectiveList, { redpackBasicId, memberSettingId }) : _.findIndex(effectiveList, { id: id });
        const deliveryRpIndex = _.findIndex(effectiveList, { id: deliveryRpId })
        // 最新可用红包中找不到已选中的红包
        if ((id && index === -1) || (deliveryRpId && deliveryRpIndex === -1)) {
          this.$store.commit("resetMemberOrderRedpack");
          this.total()
        }
      } else {
        this.$store.commit("resetMemberOrderRedpack");
        this.total()
      }
      return res;
    },

    // 處理支付一場
    dealPayResult(type) {
      // 1 成功 (兩種情況 ：
      // 1.1支付成功 ，能查詢到訂單已成功支付
      // 1.2支付成功，未查到訂單已成功支付)
      // 2  取消支付（沒有支付）  app 只有 1，2
      // 3 支付成功  取消訂單 成功
      // 4 支付成功  取消訂單失敗

      // 清空选择时间数据
      this.$store.commit("marketOrderOther", {
        askforTimeSelectIndex: 0,
        askforTimeIndex: 0,
        askforTimeSelectString: '',
        askforTimeSelectData: {},
        cookTimeSelectIndex: 0,
        cookTimeIndex: 0,
        cookTimeTitle: '',
        cookTimeSelectString: '',
        cookTimeSelectData: {}
      });
      if (mf.isApp) {
        this.goOrderInfo(type == 1);
      } else {
        switch (type) {
          case 1: {
            this.paymentingSuccess();
            return;
          }
          case 2: {
            this.goOrderInfo(false);
            return;
          }
          case 3: {
            this.goOrderInfo(false);
            return;
          }
          case 4: {
            this.goOrderInfo(false);
            return;
          }
          case 5: {
            this.goOrderInfo(false);
          }
        }
      }
    },

    // 获取平台费
    getPlatformFee(platformFeeData) {
      this.platformFeeData = platformFeeData;
      this.getGoldUseData();
    }
  },
  destroyed() {
    clearInterval(this.timer);
    this.$store.commit("marketRemarkTextGetters", this.remarkText);
    this.$store.commit("missProductIndexGetters", this.missProductIndex);
    this.$store.commit("setMarketMemberNo", this.memberNo);
  },
  mounted() {
    this.$toast.clear();
    this.init().then(result => {
      const { isUseFullReduction, isUseFullDiscount } = this.marketStoreDetail;
      this.showPayTipMsg();
      // 折扣与满减不同享提示
      const hasDiscount = this.orderProduct.some(item => {
        const activity = this.marketStoreDiscountActivityMap[item.discountActivityId];
        return (
          (item.isDiscount &&
          item.fullReduce &&
          (
            (item.fullReduce?.activityType === 1 && activity?.shareFullReduction === false) ||
            (item.fullReduce?.activityType === 2 && activity?.shareFullDiscount === false)
          )) ||
          (item.isOldDiscount &&
          item.fullReduce &&
          (
            (item.fullReduce?.activityType === 1 && isUseFullReduction === false) ||
            (item.fullReduce?.activityType === 2 && isUseFullDiscount === false)
          ))
        );
      });
      if (hasDiscount) {
        this.$toast('優惠商品不享滿減/滿折優惠');
      }
    }).catch(e => {
      console.log(e);
      this.$toast({
        position: "bottom",
        message: "網絡請求失敗",
        onClose: () => {
          this.$store.commit("enterStore", true);
          this.$router.go(-1);
        }
      });
    }).finally(() => {
      hideRequestLoad();
    });
  }
};
