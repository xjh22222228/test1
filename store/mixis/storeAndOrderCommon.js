import { Toast } from "vant";
import mf from "../../../../JS/mFoodSDK";
import event from '@/JS/event';
// 下单 和订单页通用的方法
export default {
  data() {
    return {
      onceAgain: true,
      timer: 0
    };
  },
  created() {
    event.$on('showProduct', this.goMarketProduct);
  },
  computed: {
    marketSubmitPage() {
      return this.$store.getters.marketSubmitPage;
    },
    // 店铺详情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    marketOrderOther() {
      return this.$store.getters.marketOrderOther;
    },
    // 訂單詳情
    marketOrderInfo: function () {
      return this.$store.getters.marketOrderInfo;
    },
    // 商超店铺商品
    marketStoreProduct: function () {
      return this.$store.getters.marketStoreProduct;
    }
  },
  methods: {
    commonInit() {
      if (this.marketSubmitPage == 'store') {
        this.init();
      } else if (this.marketSubmitPage == 'searchDetail') {
        this.$store.commit("marketOrderOther", { needInit: 1 });
        this.$router.go(-2);
      } else {
        this.$store.commit("marketOrderOther", { needInit: 1 });
        this.$router.go(-1);
      }
    },
    // 門店頁 搜索頁  門店詳情頁 搜索詳情頁
    storeCommonBackOutStore() {
      if (this.marketSubmitPage == 'searchDetail') {
        this.$router.go(-3);
      } else if (this.marketSubmitPage == 'store') {
        this.$router.go(-1);
      } else {
        this.$router.go(-2);
      }
    },
    // 下單頁 退出門店
    orderCommonBackOutStore() {
      if (this.marketSubmitPage == 'store') {
        this.$router.go(-2);
      } else if (this.marketSubmitPage == 'searchDetail') {
        this.$router.go(-4);
      } else { // storeSearch   storeDetail
        this.$router.go(-3);
      }
    },
    // 訂單回到門店頁面
    orderCommonBackStore() {
      if (this.marketSubmitPage == 'store') {
        this.$router.go(-1);
      } else if (this.marketSubmitPage == 'searchDetail') {
        this.$router.go(-3);
      } else { // storeSearch   storeDetail
        this.$router.go(-2);
      }
    },
    goMarketProduct(product) {
      const storeId = this.$route.query.id || this.$route.query.storeId || null;
      const isShare = this.$route.query.isShare || null;
      const query = {
        productId: product.productId,
        skuId: product.skuId || product?.defaultSku?.skuId,
        storeId,
        isShare
      };
      this.$store.commit('marketEnterProductDetail', true);
      // 門店頁
      if (this.$route.path == '/market/store') {
        this.$store.commit('marketProductDetailFrom', 'store');
        this.$router.push({
          path: '/market/storeProduct',
          query
        });
      } else if (this.$route.path == '/market/storeSearch') { // 搜索頁
        this.$store.commit('marketProductDetailFrom', 'storeSearch');
        this.$router.push({
          path: '/market/storeProduct',
          query
        });
      }
    },
    updateHistory() {
      const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
      const index = _.findIndex(marketOrderHistory, { id: this.id });
      const headerCart = _.head(_.filter(marketOrderHistory, { id: this.id }));
      const orderCart = headerCart?.data;
      // 購物車商品
      marketOrderHistory[index].data = orderCart;
      this.$store.commit("marketOrderHistory", marketOrderHistory);
    },
    // 支付商超訂單
    async paymentMarketOrder() {
      const that = this;
      const orderInfo = this.marketOrderInfo?.orderInfo;
      if (!orderInfo) {
        return console.log('請先查詢訂單信息');
      }
      // 小應用支付
      if (mf.isApp) {
        const payload = {
          id: orderInfo.tradeId,
          amtn: orderInfo.amtn,
          coinCount: orderInfo.mcoinCount || 0,
          paymentOrderType: "MARKET_ORDER"// ?
        };
        console.log("桥接入参", JSON.stringify(payload));
        // 调起原生收银台支付
        mf.payAsync(payload,
          res => {
            console.log(res, 'mf.payAsync', typeof res);
            mf.operatedMarketOrder();
            // 1 成功  2  取消支付  3
            that.dealPayResult(res == '0' ? 1 : 2);
          }
        );
      } else if (mf.isMPay || mf.isAliPay || process.env.VUE_APP_ENV === "development") {
        that.mpassPay();
      }
    },
    async mpassPay() {
      const orderInfo = this.marketOrderInfo.orderInfo;
      // 訂單支付
      const payload = {
        coinCount: orderInfo.mcoinCount || 0,
        totalAmount: orderInfo.amtn || 0,
        tradeId: orderInfo.tradeId,
        paymentOrderType: "MARKET_ORDER",
        beforeCoinAmount: this.utils.filterSecret(
          (orderInfo.amtn || 0) +
          (orderInfo.mcoinDiscountAmtn || 0)
        )
      };
      const that = this;
      that.$store.dispatch("payment", payload).then(async result => {
        if (result?.type === 'OPEN_ALI') {
          return result;
        }
        // 支付配置
        return await this.$store.dispatch("mpassConfig");
      }).then(async result => {
        function polling() {
          Toast.clear();
          const toast = Toast.loading({
            message: "驗證支付中，60秒...",
            duration: 0
          });
          let second = 60;
          that.onceAgain = true;
          that.timer = setInterval(() => {
            second--;
            if (second > 0) {
              if (that.onceAgain === true) {
                that.onceAgain = false;
                that.checkPaymenting();
              }
              toast.message = `驗證支付中，${second} 秒...`;
            } else {
              that.onceAgain = false;
              clearInterval(that.timer);
              // 取消訂單
              that.$store
                .dispatch("marketOrderCancel", {
                  cancelType: 2,
                  tradeId: orderInfo.tradeId
                })
                // 處理成功
                .then(result => {
                  that.dealPayResult(3);
                })
                // 處理錯誤
                .catch(e => {
                  Toast.fail({
                    message: "取消訂單失敗",
                    onClose() {
                      that.dealPayResult(4);
                    }
                  });
                });
            }
          }, 1000);
        }

        // 支付成功
        if (result?.type === 'OPEN_ALI') {
          if (result.resultCode === '9000') {
            return polling();
          }
          // 非支付成功
          if (result.resultCode !== '9000') {
            Toast.fail({ duration: 0, message: "支付失敗" });
            this.goOrderInfo();
          }
          return;
        }
        if (mp) {
          mp.error(function (res) {
            Toast.clear();
            Toast("請重新支付");
          });
          mp.ready(function () {
            Toast.clear();
            mp.choosePayMent({
              paymentData: that.payment.mpassExecuteResponse,
              success: function (res) {
                polling();
              },
              fail() {
                Toast({ duration: 0, message: "支付失敗" });
                that.dealPayResult(5);
              },
              cancel(res) {
                Toast({ duration: 0, message: "取消支付" });
                that.dealPayResult(2);
              }
            });
          });
        }
      });
      // shence.userorderbehavior({
      //   orderStatus: shenceEnum.Submit_Order// "提交訂單"
      // });
      // 異常抛到外面
      // .catch(e => {
      //   console.log(e, "发起请求错误信息");
      //   this.catchError(e);
      // });
    },
    // 检查订单支付结果
    checkPaymenting() {
      const id = this.marketOrderInfo.orderInfo.tradeId;
      this.$store
        .dispatch("checkMarketPaymenting", { id })
        .then(async result => {
          return await this.$store.dispatch("checkMarketPaymenResult", { id });
        })
        .then(async result => {
          if (result.success) {
            this.onceAgain = false;
            this.$store.commit("marketIsSuccessPay", true);
            await this.utils.sleep(1000);
            this.dealPayResult(1);
          } else {
            this.onceAgain = true;
          }
        })
        .catch(e => {
          this.dealPayResult(1);
        });
    }
  }
};
