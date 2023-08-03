import mf from '@/JS/mFoodSDK';
import storeAndOrderCommon from "./storeAndOrderCommon";
import dealError from "./dealError";

export default {
  mixins: [storeAndOrderCommon, dealError],
  data() {
    return {
      submitting: false // 是否正在提交订单
    };
  },
  watch: {
    // 监听正常商品变化重新计算购物车价格和存入历史
    marketShoppingCart: {
      handler(nv) {
        if (this.marketWacthCart == false) return;
        this.$store.dispatch('updateMarketHistoryCart');
      }
    },
    marketFailShopCart: {
      handler(nv) {
        this.$store.commit('marketFailOrderHistory', { id: this.id, data: nv });
      }
    }
  },
  computed: {
    marketSubmitBar() {
      return this.$store.getters.marketSubmitBar;
    },
    memberInfo() {
      return this.$store.getters.memberInfo;
    },
    // 门店距离
    storeDistance: function () {
      return this.$store.getters.storeDistance;
    },
    // 订单信息
    marketOrderOther: function () {
      return this.$store.getters.marketOrderOther;
    },
    marketDiscountToast() {
      return this.$store.getters.marketDiscountToast;
    },
    // 原始起送價
    marketOldSendPrice() {
      return this.$store.getters.marketOldSendPrice;
    },
    marketRequiredClassify() {
      return this.$store.getters.marketRequiredClassify;
    },
    marketWacthCart() {
      return this.$store.getters.marketWacthCart;
    },
    // 單規格商品添加到購物車的商品id
    marketCartProductId() {
      return this.$store.getters.marketCartProductId;
    },
    // 折扣菜價格統計
    marketDiscountPrice() {
      return this.$store.getters.marketDiscountPrice;
    },
    // 超重提示
    showOverWeightToast() {
      return this.$store.getters.showOverWeightToast;
    },
    // 是否有生鲜
    haveFresh() {
      return this.$store.getters.haveFresh;
    },
    // 当前配重方案
    currentWeightCost() {
      return this.$store.getters.currentWeightCost;
    },
    marketIsFullShareState() {
      return this.$store.getters.marketIsFullShareState;
    },
    // 是否有折扣菜
    marketDiscountState() {
      return this.$store.getters.marketDiscountState;
    },
    // 購物車 商品原價
    marketCartOldPrice() {
      return this.$store.getters.marketCartOldPrice;
    },
    // 購物車 實際商品價格
    marketCartPriceTotal() {
      return this.$store.getters.marketCartPriceTotal;
    },
    // 差多少錢起送
    marketFullDetailsSendPrice() {
      return this.$store.getters.marketFullDetailsSendPrice;
    },
    // 差多少錢起送狀態
    marketFullDetailsSendPriceState() {
      return this.$store.getters.marketFullDetailsSendPriceState;
    },
    // 總重量
    totalWeight() {
      return this.$store.getters.totalWeight;
    },
    marketHasRequired() {
      return this.$store.getters.marketHasRequired;
    }, //
    // 配送的方式   0 【自取或者配送】 1 【只支持自取】  2【只支持配送】
    marketDeliveryType() {
      return this.$store.getters.marketDeliveryType;
    },
    // 是否提示未达到起送价
    marketSendPriceState() {
      return this.$store.getters.marketSendPriceState;
    },
    // 可提交状态
    marketSubmitState() {
      return this.$store.getters.marketSubmitState;
    },
    // 可預定的狀態
    marketScheduledState() {
      return this.$store.getters.marketScheduledState;
    },
    // 显示底部购物车导航栏
    showMarketBar() {
      return this.$store.getters.showMarketBar;
    },
    // 是否 自取
    marketSelfCollection() {
      return this.$store.getters.marketSelfCollection;
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart;
    },
    marketRequiredProductList() {
      return this.$store.getters.marketRequiredProductList;
    },
    // 店铺详情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    // 购物车
    marketOrderHistory: function () {
      return this.$store.getters.marketOrderHistory;
    },
    // 失效
    marketFailOrderHistory: function () {
      return this.$store.getters.marketFailOrderHistory;
    },
    marketFailShopCart: function () {
      return this.$store.getters.marketFailShopCart;
    },
    marketStoreProductDetail() {
      return this.$store.getters.marketStoreProductDetail;
    },
    marketSubmitPage() {
      return this.$store.getters.marketSubmitPage;
    },
    marketOutStockTipsMap() {
      return this.$store.getters.marketOutStockTipsMap;
    },
    // 购物车转换后的数据
    marketCartData() {
      return this.$store.getters.marketCartData;
    },
    marketStoreDiscountActivityMap() {
      return this.$store.getters.marketStoreDiscountActivityMap;
    },
    // 买赠活动列表
    giftBuyList() {
      return this.$store.getters.marketGiftBuyList;
    }
  },
  methods: {
    // 從購物車將選中的商品 封裝成請求 productList
    searchProductList() {
      const productList = [];
      const marketCartData = this.marketCartData;
      const { isUseFullReduction, isUseFullDiscount } = this.marketStoreDetail;
      this.marketShoppingCart.forEach(o => {
        // 没勾选
        if (!o.selected) {
          return;
        }
        let disFullId = o.fullReduce?.id;
        let disFullAmtn = marketCartData[disFullId]?.current?.fullAtm;
        const activity = this.marketStoreDiscountActivityMap[o.discountActivityId];
        const activityType = o.fullReduce?.activityType;
        // 判断满减满折是否同享
        const isShare = (o.isDiscount && activityType === 1 && activity?.shareFullReduction) ||
          (o.isDiscount && activityType === 2 && activity?.shareFullDiscount) ||
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
          skuId: o.skuId,
          skuPrice: o.price,
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
      return productList;
    },
    // 校验必选分类
    validateRequired(productList) {
      const freshList = productList.filter(item => item.isFresh);
      if (!freshList.length) {
        return true;
      }
      const marketRequiredProductList = this.marketRequiredProductList;
      // 购物车
      if (!marketRequiredProductList.length) {
        return true;
      }
      const requiredProduct = marketRequiredProductList.filter(item => {
        return !item.sellout;
      }).map(item => item.productId);
      // 没有可售的必选商品
      if (!requiredProduct.length) {
        return true;
      }
      for (const product of productList) {
        const flag = requiredProduct.includes(product.productId);
        if (flag) {
          return true;
        }
      }
      return false;
    },

    // 点击下单
    async onSubmit(page = 'store') {
      // page = store 門店頁
      // storeDetail  門店頁詳情
      // storeSearch 門店搜索頁
      // searchDetail 門店搜索頁的詳情頁
      this.$store.commit('marketSubmitPage', page);
      // 菜品詳情頁點擊下單 傳 true
      // 下單頁 點擊下單 傳 false
      if (this.submitting || !this.marketSubmitState) {
        return;
      }
      if (!this.marketHasRequired) {
        return this.commonScrollRequireClassify();
      }
      if (!this.memberInfo.userId) {
        if (mf.isApp) {
          mf.APPLoginAsync().then(res => {
            this.onSubmit(page);
          });
          return;
        } else {
          this.$toast('請先登錄');
          return;
        }
      }
      this.submitting = true;
      // 清空高亮的必选分类
      this.$store.commit('marketRequiredClassify', '');
      // 商品價格
      const productList = this.searchProductList();
      // 必选分类
      const flag = this.validateRequired(productList);
      if (!flag) {
        this.submitting = false;
        const requiredIndex = this.marketStoreProduct.findIndex(
          item => item.isRequiredClassify
        );
        const marketRequiredClassify = this.marketStoreProduct[requiredIndex];
        if (requiredIndex == this.selectedIndex) {
          // 已在必選分類 不滾動
          this.$store.commit('marketRequiredClassify', this.marketStoreProduct[requiredIndex].classifyId);
          if (this.marketSubmitPage == 'store') {
            this.$refs?.allRecGoods.close();
          }
          this.$toast({
            position: "bottom",
            message: `需添加【${marketRequiredClassify.classifyName}】中的商品才可下單`
          });
          return;
        }

        if (marketRequiredClassify &&
          marketRequiredClassify?.products?.filter(
            item => !item.sellout// && item.availableType
          )?.length
        ) {
          // 有必选分类并且分类下有可购买商品
          // 点击该分类
          this.$toast({
            position: "bottom",
            message: `需添加【${marketRequiredClassify.classifyName}】中的商品才可下單`
          });
          await this.commonScrollRequireClassify();
          return;
        }
      }
      const deliveryType = this.marketSelfCollection ? 2 : 1;
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
      // 检查商品
      this.$store.dispatch("checkMarketProduct", {
        disFullList,
        productList,
        storeId: this.marketStoreDetail.id
      }).then(result => {
        this.$store.commit("marketOrderOther", {
          deliveryType: this.marketSelfCollection,
          // promptlyAskforType 是否接受立即自取
          askType: !this.marketStoreDetail.promptlyAskforType ? 2 : 1,
          askforTimeSelectIndex: 0,
          askforTimeSelectString: "",
          askforTimeIndex: 0,
          askforTimeSelectData: {}
        });
        this.$store.commit('marketSubmitBar', { overlay: false });
        this.$router.push({
          path: "/market/order",
          query: {
            ...this.$route.query,
            id: this.marketStoreDetail.id,
            deliveryType
          }
        });
        this.$toast.clear();
      }).catch(e => {
        this.delSubmitError(e);
      }).finally(e => {
        this.submitting = false;
      });
    },
    commonScrollRequireClassify() {
      this.$store.commit('marketShowFullList', false);
      if (this.marketSubmitPage == 'store') {
        this.$refs?.allRecGoods.close();
        this.scrollRequiredClassify();
      } else {
        this.$store.commit('marketOrderOther', { requiredClassify: 1 });
        if (this.marketSubmitPage == 'searchDetail') {
          this.$router.go(-2);
        } else {
          this.$router.go(-1);
        }
      }
    },
    // 点击假的数量器
    async onFakeStepper(data) {
      return this.$store.dispatch('plus', data);
    }
  }
};
