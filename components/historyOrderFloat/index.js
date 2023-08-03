import { Tag, Cell, Popup, Empty, CellGroup, Image as VanImage } from "vant";
import PhoneCallComponents from "@components/phoneCall";
import event from '@/JS/event';
import { debounce } from 'lodash';

export default {
  components: {
    PhoneCallComponents,
    [Tag.name]: Tag,
    [Cell.name]: Cell,
    [Popup.name]: Popup,
    [Empty.name]: Empty,
    [VanImage.name]: VanImage,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      state: false,
      disabled: false,
      orderEmpty: require("assets/images/orderEmpty.png")
    };
  },
  computed: {
    distributionList: function() {
      return this.$store.state.marketOrder.marketOrderPendingList;
    },
    // 前面2个订单
    beforeList() {
      return this.distributionList.slice(0, 2);
    },
    // 第一个订单
    orderInfo() {
      return this.distributionList[0] || {};
    }
  },
  activated() {
    this.state = false;
    this.getData();
  },
  mounted() {
    event.$on('refreshMarketIndexOrder', this.getData);
    this.getData();
  },
  methods: {
    getData: debounce(function () {
      return this.$store
        .dispatch("getMarketOrderPending");
    }, 100),
    // 当前用户订单进度
    handleHistoryOrder() {
      if (this.distributionList.length >= 2) {
        // 防止連續點擊
        if (this.disabled) return;
        // 防止連續點擊
        this.disabled = true;
        // 提示用戶加載中
        this.$toast.loading({
          duration: 0,
          message: "加載中",
          forbidClick: true
        });
        this.getData()
          .then(result => {
            this.$toast.clear();
            this.state = true;
            this.disabled = false;
          })
          .catch(e => {
            this.state = false;
            this.disabled = false;
            this.$toast({ position: "bottom", message: "獲取訂單失敗" });
          });
      } else {
        this.$router.push({
          path: '/market/orderInfo',
          query: {
            tradeId: this.orderInfo.tradeId
          }
        });
      }
    },

    // 跳轉訂單列表
    handleOrderList() {
      this.state = false;
      this.disabled = false;
      this.$store.commit("orderList", { cache: false });
      this.$router.push({ path: "/market/orderList" });
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
    // 跳轉訂單詳情
    handleOrderInfo(item) {
      this.state = false;
      this.disabled = false;
      this.$store.commit("enterOrderInfo", true);
      this.$router.push({
        path: "/market/orderInfo",
        query: { tradeId: item.tradeId, storeId: item.storeId }
      });
    },

    getTitle(item) {
      if (item.orderStatus === 0) {
        return '待支付';
      } else if (item.orderStatus === 1 && item.transactionStatus !== -2) {
        return '等待商家接單';
      } else if (item.orderStatus === 2 && item.transactionStatus !== -2 && item.deliveryType === 3) {
        return '商家已接單';
      } else if (item.orderStatus === 3 && item.transactionStatus !== -2 && item.deliveryType === 3) {
        return '商家已出餐待取';
      } else if (item.orderStatus === 2 && item.transactionStatus !== -2 && item.deliveryType === 2) {
        return '商家已接單';
      } else if (item.orderStatus === 3 && item.transactionStatus !== -2 && item.deliveryType === 2) {
        return '商家配送中';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus <= 1) {
        return '商家已接單';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus === 2) {
        return '騎手已接單';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus === 3) {
        return '騎手已到店';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus === 4) {
        return '騎手正在送貨';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus === 5) {
        return '騎手已到達';
      } else if ((item.orderStatus === 2 || item.orderStatus === 3) && item.transactionStatus !== -2 && (item.deliveryType === 1 || item.deliveryType === 4) && item.riderStatus === 6) {
        return '騎手已完成';
      } else if (item.orderStatus === 4) {
        return '已完成';
      } else if (item.orderStatus === -1) {
        return '已取消';
      } else if (item.orderStatus === -3) {
        return '已退款';
      } else if (item.transactionStatus === -2) {
        return '未退款';
      }
      return '';
    }
  }
};
