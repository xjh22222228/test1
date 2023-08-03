import storeAndOrderCommon from "../../store/mixis/storeAndOrderCommon";

export default {
  mixins: [storeAndOrderCommon],
  methods: {
    goBack() {
      if (this.marketSubmitPage == 'searchDetail') {
        this.$router.go(-2);
      } else {
        this.$router.go(-1);
      }
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
      const param = await this.$store.dispatch('findProductById', { productId });
      const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
      const index = _.findIndex(marketOrderHistory, { id: this.marketStoreDetail.id });
      const headerCart = _.head(_.filter(marketOrderHistory, { id: this.marketStoreDetail.id }));
      const orderCart = headerCart?.data;

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
            let res = item;
            try {
              res = await this.$store.dispatch("queryMarketProduct", {
                productId: item.productId,
                skuId: item.skuId
              });
            } catch (error) {}
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
      _.remove(orderCart, { quantity: 0 });
      // 購物車商品
      marketOrderHistory[index].data = orderCart;
      const { commit } = this.$store;
      commit("marketOrderHistory", marketOrderHistory);
      commit("marketShoppingCart", orderCart);
    },

    // 处理下单响应错误
    async delSubmitError(e) {
      const that = this;
      const code = e?.response?.data?.code;
      const note = e?.response?.data?.note;
      const id = e?.response?.data?.errorParam?.id;
      const stock = e?.response?.data?.errorParam?.stock || 0;
      const storeId = this.$route.query.id || this.$route.query.storeId;
      function handleDefaultError() {
        that.$store.dispatch('refreshStoreCart', storeId);
        if (that.tabType === 1 && that.$refs.store) {
          that.$refs.store.scrollTop = 0;
        }
      }
      // 門店已打烊，不能下單
      if (code === -20121015) {
        this.$toast({
          position: "bottom",
          message: note,
          onClose: () => {
            this.commonInit();
          }
        });
      }
      // 門店不存在，逛逛別家吧
      else if (code === -20121009) {
        return this.$toast({
          position: "bottom",
          message: note,
          onClose: () => {
            this.storeCommonBackOutStore();
          }
        });
      }
      // 含有生鮮商品，需添加【必選】中的商品才可以下單
      else if (code === -20121006) {
        return this.$toast({
          position: "bottom",
          message: note,
          onClose: () => {
            this.commonScrollRequireClassify();
          }
        });
      }
      else if (
        code == -20121002 || // 商品已下架，請重新選擇
        code === -20121003 || // "當前商品不屬於該門店"
        code === -20121004 || // "已售馨，請重新選擇"
        code === -20121014 || // 超出每單最大限購數
        code === -2012108 // 商品不可售，不在可售时间范围内
      ) {
        this.productError(e);
        handleDefaultError();
        return this.$toast({
          position: "bottom",
          message: note
        });
      } else if (code === -20121032) {
        // 商品庫存不足，剩餘%s份
        this.updateProductStock({
          productId: id,
          stock
        }).finally(() => {
          handleDefaultError();
        });
        return this.$toast({
          position: "bottom",
          message: note
        });
      } else if (code === -2012301) {
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
      } else {
        this.$toast({
          position: "bottom",
          message: note
        });
        handleDefaultError();
      }
    },

    // 校验购物车商品
    productError(item) {
      const id = item?.response?.data?.errorParam?.id;
      if (!id) {
        return;
      }
      _.remove(this.marketShoppingCart, {
        productId: id
      });
      this.$store.commit('marketShoppingCart', this.marketShoppingCart);
    }
  }
};
