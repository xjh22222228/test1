import { Dialog, Toast } from "vant";
import storeAndOrderCommon from "../../store/mixis/storeAndOrderCommon";

export default {
  mixins: [storeAndOrderCommon],
  methods: {
    goBackStorePage() {
      this.$store.commit("enterStore", true);
      this.orderCommonBackStore();
    },

    async updateProductStock({
      productId,
      stock,
      init = true
    }) {
      this.$store.commit('addProductStockMap', {
        productId,
        canUseStock: stock
      });
      const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
      const index = _.findIndex(marketOrderHistory, { id: this.id });
      const headerCart = _.head(_.filter(marketOrderHistory, { id: this.id }));
      const orderCart = headerCart.data;
      const rawProduct = (orderCart || []).find(item => item.productId === productId);
      let param = rawProduct;
      try {
        param = await this.$store.dispatch('queryMarketProduct', { productId, skuId: rawProduct?.skuId });
      } catch (error) {}
      if (!param) { // 没找到该商品
        _.remove(orderCart, { productId });
      } else { // 更新
        const data = param;
        data.maxPurchase = stock;
        if (data.quantity > stock) {
          data.quantity = stock;
        }
        this.$store.dispatch('updateMenuProduct', { newItem: data, param });
        for (var i = 0; i < orderCart.length; i++) {
          const item = orderCart[i];
          if (item.required) {
            continue;
          }
          if (productId == item.productId) {
            const res = await this.$store.dispatch("queryMarketProduct", {
              productId: item.productId,
              skuId: item.skuId
            });
            // 單個商品價格
            let priceTotal = 0;
            const sku = _.head(res.skus);
            // 折扣菜商品數量
            const maxPurchase = res.maxPurchase;// 最大限購數量
            if (maxPurchase && (maxPurchase < orderCart[i].quantity)) {
              // 當前數量已超過 最大限購數量
              orderCart[i].quantity = maxPurchase;
            }
            if (orderCart[i].quantity > stock) {
              orderCart[i].quantity = stock;
            }
            if (stock === 0) {
              orderCart[i].sellout = true;
            }
            orderCart[i].maxPurchase = stock;
            orderCart[i].price = sku.skuPrice;
            priceTotal = sku.skuPrice * orderCart[i].quantity;
            orderCart[i].priceTotal = priceTotal;
          }
        }
      }
      // 購物車商品
      marketOrderHistory[index].data = orderCart;
      this.$store.commit("marketOrderHistory", marketOrderHistory);
      this.$store.commit("marketShoppingCart", orderCart);
      if (init) {
        this.init();
      }
    },
    // 更新商品價格
    async updateCart(productId) {
      const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
      const index = _.findIndex(marketOrderHistory, { id: this.id });
      const headerCart = _.head(_.filter(marketOrderHistory, { id: this.id }));
      const orderCart = headerCart.data;

      for (var i = 0; i < orderCart.length; i++) {
        const item = orderCart[i];
        if (!productId || productId == item.productId) {
          const res = await this.$store.dispatch("queryMarketProduct", {
            productId: item.productId,
            skuId: item.skuId
          });

          // 單個商品價格
          let priceTotal = 0;
          const sku = _.head(res.skus);
          // 折扣菜商品數量
          const maxPurchase = res.maxPurchase;// 最大限購數量
          if (maxPurchase && (maxPurchase < orderCart[i].quantity)) {
            // 當前數量已超過 最大限購數量
            orderCart[i].quantity = maxPurchase;
          }
          orderCart[i].price = sku.skuPrice;
          priceTotal = sku.skuPrice * orderCart[i].quantity;
          orderCart[i].priceTotal = priceTotal;
        }
      }

      _.remove(orderCart, { quantity: 0 });
      // 購物車商品
      marketOrderHistory[index].data = orderCart;
      this.$store.commit("marketOrderHistory", marketOrderHistory);
      this.init();
    },
    // 必选分类
    goStoreToRequired(classifyId) {
      this.$store.commit("marketOrderOther", { requiredClassify: classifyId });
      this.goBackStorePage();
    },
    // 刪除購物車的商品 并返回上一頁
    delShoppingCartProduct(id) {
      const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
      const index = _.findIndex(marketOrderHistory, { id: this.id });
      const orderCart = _.head(_.filter(marketOrderHistory, { id: this.id }));
      if (orderCart?.data) {
        const data = _.filter(orderCart.data, n => n.productId != id);
        marketOrderHistory[index].data = data;
        this.$store.commit("marketOrderHistory", marketOrderHistory);
      }
      this.goBackStorePage();
    },
    // 检查起送价
    checkSendPrice(note) {
      this.submitBarLoading = false;
      if (this.deliveryType) return;
      const sendPrice = this.marketOrderOther.cookTimeSelectData.sendPrice;
      this.$store.commit("marketOrderOther", { sendPrice: sendPrice });
      Dialog.confirm({
        className: "sendPrice",
        message: note,
        confirmButtonText: "去凑單"
      }).then(() => {
        this.goBackStorePage();
      });
    },
    // 不支持配送類型
    deliveryTypeError() {
      this.$store.commit("orderOther", { deliveryType: "" });
      this.goBackStorePage();
    },
    // 門店打樣，重新選擇送達時間
    backMarketAndRefresh() {
      this.init().then(res => {
        this.goBackStorePage();
      });
    },
    // 紅包異常
    refreshRedPacket() {
      this.$store.commit("memberOrderVoucher", {});
      this.init();
    },
    // 積分一場
    async mcionError() {
      await this.$store.dispatch("memberInfo");
      await this.$store.dispatch("mcoinInfo");
      this.init();
    },
    catchError(e) {
      Toast.clear();
      // 刷新换购数据
      if (this.$refs.exchange) {
        this.$refs.exchange.getData();
      }
      this.dealError(e);
    },
    checkOverWeight() {
      Dialog.confirm({
        className: "sendPrice",
        message: '商品已超重，請減購商品',
        confirmButtonText: "返回門店"
      }).then(() => {
        this.orderCommonBackStore();
        this.$store.commit('marketDisabledDialogType', '');
      });
    },
    async dealError(e) {
      const that = this;
      const code = e?.response?.data?.code || 0;
      const note = e?.response?.data?.note || "";
      const id = e?.response?.data?.errorParam?.id || 0;
      const stock = e?.response?.data?.errorParam?.stock || 0;
      const storeId = this.$route.query.id;

      function handleDefaultError() {
        that.$store.dispatch('refreshStoreCart', storeId).finally(() => {
          that.init();
        });
      }

      switch (code) {
        case -20121003: // 當前商品不屬於該門店
        case -20121002: // 已下架，請重新選擇
        case -20121004: // 已售罄，請重新選購
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => this.delShoppingCartProduct(id)
          });
        case -20121006:
          // 含有生鮮商品，需添加【必選】中的商品才可以下單
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => this.goStoreToRequired(id)
          });
        case -20105008:
          // 自取訂單必須傳預留手機號
          return this.$toast({
            position: "bottom",
            message: note
          });
        // 門店不存在，逛逛別家吧
        case -20121009:
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => this.orderCommonBackOutStore()
          });
        // 當前門店不支持自取方式下單
        case -20121010:
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.deliveryTypeError();
            }
          });
        case -20121011:
          // 當前門店不支持配送方式下單
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.deliveryTypeError();
            }
          });
        case -20121012:
          // 當前門店不支持預訂單
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.deliveryTypeError();
            }
          });
        case -20121013:
          // 積分相關參數錯誤
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.mcionError();
            }
          });
        case -20121014: // 某個商品超出每單最大限購數
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.updateCart(id);
            }
          });
        case -20121015:
          // 門店已打烊，不能下單
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.submitBarLoading = false;
            }
          });
        case -20121016:
          // 門店已打烊，請重新選擇送達時間
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.backMarketAndRefresh();
            }
          });
        case -20121017:
          // 門店已打烊，請重新選擇自取時間
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.submitBarLoading = false;
              // this.backMarketAndRefresh()
            }
          });
        case -20121020:
          // mFood紅包不存在，請重新選擇優惠方案
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.refreshRedPacket();
            }
          });
        case -20121022:
          // 紅包已過期
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.refreshRedPacket();
            }
          });
        case -20121024:
          // 紅包金額有變化，請重試
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.refreshRedPacket();
            }
          });
        case -20203022:
          // 該時段配送費不支持您的收貨地址,僅配送門店周邊區域
          return this.init();
        case -20203023:
          // 所選菜品重量超出配送能力
          return this.checkOverWeight();
        case -20203024:
          // 菜品金額未達到起送價
          return this.checkSendPrice(note);
        case -20121032:
          // 商品庫存不足，剩餘%s份
          this.updateProductStock({
            productId: id,
            stock,
            init: false
          }).finally(() => {
            handleDefaultError();
          });
          return this.$toast({
            position: "bottom",
            message: note
          });
        case -2012108:
          // 订单包含了不可售商品
          return this.$toast({
            position: "bottom",
            duration: 5000,
            message: note,
            onClose: () => {
              this.delShoppingCartProduct(id)
            }
          });
        case -2012201:
          // 月卡信息更新了
          this.submitBarLoading = false;
          return this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              this.$store.commit('marketOrderOther', { vipData: null });
              const { memberSettingId } = this.memberOrderRedpack?.common;
              if (memberSettingId) {
                this.$store.commit("resetMemberOrderRedpack");
              }
              this.init();
            }
          });

        case -2012301: {
          this.$toast({
            position: "bottom",
            message: note
          });
          // 服务端会返回数组库存，更新页面上库存
          const list = e?.response?.data?.errorParam?.product_stock || [];
          for (let i = 0; i < list.length; i++) {
            const init = i === list.length - 1;
            for (const key in list[i]) {
              const productId = key;
              const canUseStock = list[i][key];
              await this.updateProductStock({
                productId,
                stock: canUseStock,
                init
              });
            }
          }
          handleDefaultError();
        }
          break;

        default:
          this.submitBarLoading = false;
          this.$toast({
            position: "bottom",
            message: note,
            onClose: () => {
              // 菜品价格异常
              if (code === -20121005) {
                this.goBackStorePage();
              }
            }
          });
          handleDefaultError();
      }
    }
  }
};
