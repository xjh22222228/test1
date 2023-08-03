<template>
  <!-- 如果是分享页面，下载 -->
  <bottomDownload :params="fullPath" :label="bottomDownload" v-if="!isApp || isShare" />
  <div v-else>
    <van-popup
      :duration="0"
      class="marketSubmitPopup"
      :value="marketSubmitBar.show"
      :lazy-render="false"
      get-container="body"
      :overlay="false"
      position="bottom"
    >
      <div class="tips-parent-class" v-if="!marketSubmitBar.overlay&& !marketStoreLoading && (!marketSelfCollection || marketMemberCoupon.length)">
      <div :style="`justify-content:${marketMemberCoupon.length?'space-between':'center'}`" class="discount-box-market" v-if="marketFullDetailsSendPriceState || $$(currentWeightCost,'marketDeliveryFeeStr') || marketMemberCoupon.length">
        <div>
          <span v-if="marketFullDetailsSendPriceState && !marketSelfCollection" v-html="$t('STORE.needed_price_for_delivery', { price: marketFullDetailsSendPrice })"></span>
          <span v-if="marketFullDetailsSendPriceState && marketSelfCollection" v-html="$t('STORE.needed_price_for_sale', { price: marketFullDetailsSendPrice })"></span>
          <!--
          <span v-if="!marketFullDetailsSendPriceState && marketDiscountPrice" v-html="$t('STORE.discount_reduced', { price: utils.filterSecret(marketDiscountPrice) })"></span>
          <span v-if="!marketFullDetailsSendPriceState && marketDiscountPrice && $$(currentWeightCost,'marketDeliveryFeeStr')" > | </span>
          -->
          <span v-if="!marketFullDetailsSendPriceState && $$(currentWeightCost,'marketDeliveryFeeStr')" v-html="currentWeightCost.marketDeliveryFeeStr"></span>
        </div>
        <markerMemberCoupon @showCoupon="showCoupon" v-if="marketMemberCoupon.length" />
      </div>
<!--          <div class="tips-class" v-if="marketScheduledState&&!marketSubmitBar.closeReserve">-->
<!--            <div class="reserve-parent-class">-->
<!--              接受預定，明天{{'08:30'}}起{{marketSelfCollection?'可售':'配送'}}-->
<!--              {{marketSubmitBar.closeReserve}}-->
<!--              <div class="close-flag"  @click="marketSubmitBar.closeReserve = !marketSubmitBar.closeReserve">-->
<!--                <img class="size24" :src="closeImg"/>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
  <!--    <div class="over-weight-tips"
          v-if="currentWeightCost.overBaseWeight && !currentWeightCost.overWeightCannotSend">
        當前已超重，需收取部分運費
      </div>
      -->
    </div>
      <div class="overflow-bg" v-if="marketSubmitBar.overlay" @click="handleHideCart">
      </div>
      <div :class="`footer ${marketSubmitBar.overlay?'expend':''}`">
        <div class="productListParent" v-show="marketSubmitBar.overlay">
        <div class="discount-top-box-market" v-if="marketFullDetailsSendPriceState || $$(currentWeightCost,'marketDeliveryFeeStr')">
        <span v-if="marketFullDetailsSendPriceState && !marketSelfCollection" v-html="$t('STORE.needed_price_for_delivery', { price: marketFullDetailsSendPrice })"></span>
        <span v-if="marketFullDetailsSendPriceState && marketSelfCollection" v-html="$t('STORE.needed_price_for_sale', { price: marketFullDetailsSendPrice })"></span>
        <!--
        <span v-if="!marketFullDetailsSendPriceState && marketDiscountPrice" v-html="$t('STORE.discount_reduced', { price: utils.filterSecret(marketDiscountPrice) })"></span>
        <span v-if="!marketFullDetailsSendPriceState && marketDiscountPrice && $$(currentWeightCost,'marketDeliveryFeeStr')" > | </span>
        -->
        <span v-if="!marketFullDetailsSendPriceState && $$(currentWeightCost,'marketDeliveryFeeStr')" v-html="currentWeightCost.marketDeliveryFeeStr"></span>
      </div>
      <!--
        <div class="discount-top-box-market"
          v-if="currentWeightCost.marketDeliveryFeeStr&& !marketSelfCollection"
          v-html="currentWeightCost.marketDeliveryFeeStr">
        </div>
      -->
        <div class="top-btn">
          <div class="left" @click="toggleSelectAll">
            <svg-icon class="size24" :icon-class="isCheckAll?'selfCollection2':'marketNotSelect'"></svg-icon>
            <div class="all">全選</div>
            <div class="label" v-if="productCount">(已選{{productCount}}件，共{{totalWeight}}kg)</div>
          </div>
          <div class="right">
            <svg-icon icon-class="mf_icon_search_delete" class="size24"/>
            <span class="label" @click="onRemoveCart">清空購物車</span>
          </div>
        </div>
        <!-- 商品券 -->
        <memberCouponColumn v-if="marketMemberCoupon.length" @showCoupon="showCoupon"/>
        <div class="productList">
          <!-- 购物车列表 -->
          <div v-for="(item, idx) of marketCartData" :key="idx">
            <full-reduce-column :data="item" v-if="item.id" />
            <div class="line" v-if="!item.id"></div>
            <product-item
              v-for="(item, idx) of item.products"
              :key="item.productId + idx"
              :product="item"
              :productIndex="idx"
            />
          </div>

          <!-- 失效商品 -->
          <template v-if="marketFailShopCart.length">
            <div class="top-btn2">
              <div class="left">失效商品</div>
              <div class="right">
                <svg-icon icon-class="mf_icon_search_delete" class="size24"/>
                <span class="label" @click="onRemoveExpiredCart">清空失效商品</span>
              </div>
            </div>
            <div class="productList pList-expired">
              <product-item
                v-for="(item, idx) of marketFailShopCart"
                :key="item.productId + idx"
                :product="item"
                :productIndex="idx"
                :fail="true"
              />
            </div>
          </template>
          </div>
        </div>

        <div class="market-bottom-bar">
          <van-submit-bar :safe-area-inset-bottom="false" :class="{'marketSubmitBar':true,'active':!!allProductCount}" v-if="!marketStoreLoading">
            <div class="bottomBarOptions">
              <div class="shippingPrice" @click="onProductList">
                <van-image :class="`cart-bottom-bar-img ${allProductCount?'active':'not'}`" :src="sel" >
                  <div class="count" v-show="productCount">{{productCount}}</div>
                </van-image>
                <div class="product-price" >
                  <div :class="`product ${productCount?'':'zero'}`">
                    <span class="marketCartPriceTotal">{{utils.filterSecret(marketCartPriceTotal)}}</span>
                    <!-- 原价 -->
                    <del class="discount" v-if="marketCartOldPrice != marketCartPriceTotal">MOP {{utils.filterSecret(marketCartOldPrice)}}</del>
                  </div>
                  <div class="delivery-fee" v-if="!marketSelfCollection && !currentWeightCost.overWeightCannotSend">
                  <template v-if="currentWeightCost.currentPlan">
                    預估配送費 MOP{{currentWeightCost.currentPlan.realCost }}
                    <span class="delDelivAmt2" v-if="currentWeightCost.currentPlan.realCost  !== currentWeightCost.currentPlan.originalTotal">MOP{{currentWeightCost.currentPlan.originalTotal}}</span>
                  </template>
                  </div>
                </div>
                <div class="sendPrice" v-if="showMarketBar">
                  <!-- 自取 -->
                  <div v-if="marketDeliveryType == 0"
                      :class="{'storeSelfCollection':true, 'active':marketSelfCollection}"
                      @click.stop="onSelfCollection">
                    <svg-icon  :icon-class="marketSelfCollection?'selfCollection2':'marketNotSelect'" class="size24" />
                    <span>自取</span>
                  </div>
                </div>
              </div>
            </div>
              <!-- 打樣 -->
              <div class="submit-button" slot="button" v-if="!showMarketBar" @click="showRestToast">
                <div class="disable-submit-content" >{{marketClosedLabel}}</div>
              </div>
              <div v-else class="submit-button" slot="button" >
                <template v-if="!productCount">
                  <!-- 接受预定 -->
                  <div class="disable-submit-content yuding" v-if="marketScheduledState">
                    {{marketSelfCollection?'自取預定':'接受預定'}}
                  </div>
                  <div class="disable-submit-content" v-else-if="marketSendPriceState">
                    <div class="mop-price">{{marketSendPrice}}</div>
                    <div class="label">{{ marketSelfCollection ? ' 起售' : ' 起送'}}</div>
                  </div>
                  <div class="disable-submit-content" v-else>
                    {{marketSelfCollection?'自取下單':'下單'}}
                  </div>
                </template>

                <template v-else>
                  <!-- 提交中的状态 -->
                  <van-button v-if="submitting" class="submit-content" loading></van-button>
                  <!-- 可提交狀態 -->
                  <div class="submit-content" v-else-if="marketSubmitState" @click="$emit('onSubmit')">{{marketHasRequired?(marketSelfCollection?'自取下單':'下單'):'未點必選品'}}</div>
                  <!-- 不可提交 -->
                  <template v-else>
                    <!-- 不足起送價 -->
                    <div class="disable-submit-content" v-if="marketSendPriceState">
                      <div class="mop-price">{{marketSendPrice}}</div>
                      <div class="label"> {{ marketSelfCollection ? ' 起售' : ' 起送'}}</div>
                    </div>
                    <!-- 超重 -->
                    <div class="disable-submit-overweight-content" v-else-if="currentWeightCost.overWeightCannotSend">
                      <div class="small-label"> 已超重 </div>
                      <div class="weight-price">{{currentWeightCost.overLimitWeight}}kg</div>
                    </div>
                    <!-- 可預定 -->
                    <div class="disable-submit-content yuding" v-else-if="marketScheduledState">
                      {{marketSelfCollection?'自取預定':'接受預定'}}
                    </div>
                    <!-- 不可預定 -->
                    <div v-else class="disable-submit-content" >{{marketSelfCollection?'自取下單':'下單'}}</div>
                  </template>
                </template>
              </div>
          </van-submit-bar>
        </div>
      </div>
      <!-- 满减促销 -->
      <full-amt ref="fullamt" />
      <!-- 买赠继续加购 -->
      <gift-buy ref="giftBuy" />
    </van-popup>

    <couponList ref="couponList"/>
  </div>
</template>
<script>
import { Icon, Image as VanImage, Popup, SubmitBar, Button, Toast } from "vant";
import sel from "./img/cart_sel.png";
import closeImg from '@/assets/images/close_w.png';
import shareMixins from "@/views/share/shareMixins.js";
import FullAmt from './full-amt';
import ProductItem from './product-item';
import FullReduceColumn from './full-reduce-column';
import GiftBuy from './gift-buy';
import { cloneDeep } from 'lodash';
import mf from "@/JS/mFoodSDK";
import couponList from "./components/couponList.vue"
import markerMemberCoupon from "./components/memberCoupon.vue"
import memberCouponColumn from "./components/memberCouponColumn.vue"
import event from '@/JS/event';

export default {
  name: "bottom-cart",
  mixins: [shareMixins],
  props: {
    submitting: {
      type: Boolean,
      default: false
    }
  },
  components: {
    FullAmt,
    [Popup.name]: Popup,
    [SubmitBar.name]: SubmitBar,
    [Icon.name]: Icon,
    [VanImage.name]: VanImage,
    [Button.name]: Button,
    ProductItem,
    FullReduceColumn,
    couponList,
    markerMemberCoupon,
    memberCouponColumn,
    GiftBuy
  },
  computed: {
    // 门店加载
    marketStoreLoading() {
      return this.$store.state.marketStore.marketStoreLoading;
    },
    currentWeightCost() {
      return this.$store.getters.currentWeightCost;
    },
    // 門店起送價
    marketSendPrice() {
      const currentWeightCost = this.currentWeightCost;
      if (currentWeightCost.currentPlan) {
        return currentWeightCost.sendPrice;
      }
      return this.storeSendPrice || 0;
    },
    marketFailShopCart() {
      return this.$store.getters.marketFailShopCart;
    },
    // 购物车
    marketOrderHistory: function() {
      return this.$store.getters.marketOrderHistory;
    },
    marketSubmitBar() {
      return this.$store.getters.marketSubmitBar;
    },
    marketFullDetailsSendPrice() {
      return this.$store.getters.marketFullDetailsSendPrice;
    },
    marketFullDetailsSendPriceState() {
      return this.$store.getters.marketFullDetailsSendPriceState;
    },
    marketDiscountPrice() {
      return this.$store.getters.marketDiscountPrice;
    },
    // 是否参与满减
    marketIsFullShareState() {
      return this.$store.getters.marketIsFullShareState;
    },
    // 是否有折扣菜
    marketDiscountState() {
      return this.$store.getters.marketDiscountState;
    },
    marketCartOldPrice() {
      return this.$store.getters.marketCartOldPrice;
    },
    // 購物車 實際商品價格
    marketCartPriceTotal() {
      return this.$store.getters.marketCartPriceTotal;
    },
    totalWeight() {
      return this.$store.getters.totalWeight;
    },
    marketHasRequired() {
      return this.$store.getters.marketHasRequired;
    },
    marketDeliveryType() {
      return this.$store.getters.marketDeliveryType;
    },
    marketSendPriceState() {
      return this.$store.getters.marketSendPriceState;
    },
    marketSubmitState() {
      return this.$store.getters.marketSubmitState;
    },
    // 可预定状态
    marketScheduledState() {
      return this.$store.getters.marketScheduledState;
    },
    showMarketBar() {
      return this.$store.getters.showMarketBar;
    },
    marketSelfCollection() {
      return this.$store.getters.marketSelfCollection;
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart || [];
    },
    marketStoreDiscountActivityMap() {
      return this.$store.getters.marketStoreDiscountActivityMap;
    },
    marketMemberCoupon() {
      return this.$store.getters.marketMemberCoupon
    },
    // 原先是对象分组，为了排序转换成数组
    marketCartData() {
      const { isUseFullReduction, isUseFullDiscount } = this.marketStoreDetail;
      const arr = [];
      const otherData = [];
      const discountNotShare = []; // 不同享
      const dataMap = cloneDeep(this.$store.getters.marketCartData); // 不影响原有数据
      for (const k in dataMap) {
        const data = dataMap[k];
        // 与满减满折不同享拆分购物车，将不同享的丢到最下面
        data.products.forEach(item => {
          item.__quantity__ = item.quantity; // 自定義字段，记录原有数量，其他地方用
          item.__discountQuantity__ = item.discountQuantity;
          const activity = this.marketStoreDiscountActivityMap[item.discountActivityId];
          const activityType = item.fullReduce?.activityType;
          // 这里判断不共享
          if (
            // 新折扣
            (item.isDiscount &&
            item.quantity !== item.discountQuantity &&
            ((activityType === 1 && activity?.shareFullReduction === false) ||
            (activityType === 2 && activity?.shareFullDiscount === false))) ||
            // 旧折扣
            (item.isOldDiscount &&
            item.quantity !== item.discountQuantity &&
            ((activityType === 1 && isUseFullReduction === false) ||
            (activityType === 2 && isUseFullDiscount === false))) ||
            // 秒杀默认不共享
            (
              item.isSeckill &&
              item.quantity !== item.discountQuantity &&
              item.fullReduce
            ) ||
            // 组合价
            (item.group &&
            item.quantity !== item.discountQuantity &&
            ((activityType === 1 && item.group.shareFullReduction === false) ||
            (activityType === 2 && item.group.shareFullDiscount === false)))
          ) {
            const quantity = item.group ? item.groupJoinQty : item.discountQuantity;
            discountNotShare.push({
              ...item,
              groupNormalQty: (quantity % item.group?.threshold) || 0,
              __split__: true, // 标识这个是拆开
              discountQuantity: 0,
              quantity,
              priceTotal: item.group
                ? this.utils.filterSecret(item.discountQuantity * item.compositePrice)
                : this.utils.filterSecret(item.discountQuantity * item.productDiscountAmt)
            });
            item.quantity = item.group ? item.groupNormalQty : (item.quantity - item.discountQuantity);
            item.priceTotal = this.utils.filterSecret(item.quantity * item.price);
            item.discountQuantity = 0;
            item.showDiscountIcon = false; // 不显示折扣图标
          }
        });
        if (data.id) {
          if (data.products.length) {
            arr.push(data);
          }
        } else {
          otherData.push(data);
        }
      }
      if (otherData.length === 1) {
        otherData[0].products = [...otherData[0].products, ...discountNotShare];
      }
      return arr.sort((a, b) => {
        a.products = a.products.sort((a, b) => b.joinTime - a.joinTime);
        return b.joinTime - a.joinTime;
      }).concat(otherData);
    },
    productCount() {
      return this.marketShoppingCart.reduce((acc, cur) => {
        if (cur.selected) {
          return acc + cur.quantity;
        }
        return acc;
      }, 0);
    },
    allProductCount() {
      return _.sumBy(this.marketShoppingCart, 'quantity');
    },
    // 订单信息
    marketOrderOther() {
      return this.$store.getters.marketOrderOther;
    },
    storeFullActivityName() {
      const marketStoreFull = this.marketStoreFull;
      if (Array.isArray(marketStoreFull.fullDetails) && marketStoreFull.fullDetails.length) {
        let htmlStr = "";
        const arr = [];
        for (const item of marketStoreFull.fullDetails) {
          arr.push(`<span>滿<span class="high-price">${item.limitAmount}</span>減<span class="high-price">${item.amount}</span></span>`);
        }
        htmlStr += arr.join(",");
        return htmlStr;
      } else {
        return "";
      }
    },
    // deliveryFee() {
    //   const marketSelfCollection = this.marketSelfCollection;
    //   const marketFullDetailsSendPriceState = this.marketFullDetailsSendPriceState;
    //   if (marketSelfCollection || marketFullDetailsSendPriceState) {
    //     return "";
    //   }
    //   // 当前价格所需的配送費
    //   const shippingPrice = this.deliveryFeeItem.shippingPrice || 0;
    //   if (!shippingPrice) {
    //     return "<span class='all-high-price'>免配送費</span>";
    //   }
    //   return this.deliveryFeeItem.deliveryFeeStr;
    // },
    // 商家满减优惠
    marketMerchantDeliveryFreeInfo() {
      return this.$store.getters.marketMerchantDeliveryFreeInfo;
    },
    // 門店滿減優惠
    marketStoreFull: function () {
      return this.$store.getters.marketStoreFull;
    },
    // 店铺详情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    // 平台配送費減免
    storeDelivery: function () {
      return this.$store.getters.storeDelivery;
    },
    marketClosedLabel() {
      return this.$store.getters.marketClosedLabel;
    }
  },
  watch: {
    marketShoppingCart: {
      immediate: true,
      handler(nv) {
        // 是否全选
        this.isCheckAll = nv.every(item => item.selected);
      }
    }
  },
  methods: {
    hasArrayItem(arr) {
      return Array.isArray(arr) && !!arr.length;
    },
    // 清空购物车
    onRemoveCart() {
      this.$dialog.confirm({
        confirmButtonText: "確認",
        cancelButtonText: "取消",
        className: "centerOverlay",
        message: "是否確認清空購物車中所有商品？"
      }).then(() => {
        this.marketShoppingCart.splice(0);
        this.$store.commit('marketSubmitBar', { show: true, overlay: false });
        // 清空历史购物车
        const marketOrderHistory = _.cloneDeepWith(this.marketOrderHistory);
        const index = _.findIndex(marketOrderHistory, {
          id: this.id
        });
        delete marketOrderHistory[index];
        this.$store.commit("marketOrderHistory", marketOrderHistory);
        this.$store.commit("marketFailShopCart", []);
        this.$store.commit('marketSubmitBar', {
          overlay: false
        });
        this.$store.dispatch('marketFullDetails', {
          isTip: false
        });
      });
    },
    // 清空失效商品
    onRemoveExpiredCart() {
      this.$dialog.confirm({
        confirmButtonText: "確認",
        cancelButtonText: "取消",
        className: "centerOverlay",
        message: "是否確認清空所有失效商品？"
      }).then(() => {
        // 清空历史购物车
        this.$store.commit("marketFailShopCart", []);
        if (this.marketShoppingCart.length <= 0) {
          this.$store.commit('marketSubmitBar', {
            overlay: false
          });
        }
        this.$store.dispatch('marketFullDetails', {
          isTip: false
        });
      });
    },
    // 展开底部购物车商品，展示所有购买商品
    onProductList() {
      if (
        this.marketShoppingCart.length <= 0 &&
        this.marketFailShopCart.length <= 0
      ) return;
      this.$store.commit('marketCartProductId', 0);
      this.$store.commit('marketSubmitBar', {
        show: true,
        overlay: true
      });
      // const storeId = this.$route.query.id || this.$route.query.storeId;
      // window.__NO_REFRESH_MENU__ = true; // 不让刷新菜单
      // this.$store.dispatch('refreshStoreCart', storeId);
    },
    // 自取開關
    async onSelfCollection() {
      this.$store.commit('marketSelfCollection', !this.marketSelfCollection);
      await this.$store.dispatch('marketFullDetails', {
        isTip: false
      });
      // 判断是否未达到起送价
      const detail = this.marketStoreDetail;
      if (this.marketSendPriceState && this.marketDiscountState && this.marketSelfCollection) {
        Toast({
          className: "storeToast",
          message: `訂單中含有優惠商品，訂單金額需要達到MOP${detail.sendPrice}`
        });
      }
    },
    showRestToast() {
      this.$toast('門店休息中，暫無法接單');
    },
    // 全选、反选
    toggleSelectAll() {
      for (const carProduct of this.marketShoppingCart) {
        carProduct.selected = !this.isCheckAll;
      }
      this.$store.commit('marketShoppingCart', this.marketShoppingCart);
      this.$store.dispatch('marketFullDetails');
    },
    showCoupon() {
      this.$refs.couponList.popupShow();
    },
    // 隐藏购物车窗口
    handleHideCart() {
      this.$store.commit('marketCartProductId', 0);
      this.$store.commit('marketSubmitBar', { overlay: false });
    }
  },
  data() {
    return {
      storeSendPrice: 0,
      isApp: process.env.NODE_ENV === 'development' ? true : mf.isApp,
      sel,
      closeImg,
      isCheckAll: false,
      productStatus: {
        2: '無貨',
        3: '已下架'
      }
    };
  },
  activated() {
    event.$on('storeSendPrice', sendPrice => {
      this.storeSendPrice = sendPrice;
    });
  }
};
</script>

<style scoped lang="less">
.marketSubmitPopup {
  display: flex;
  flex-flow: column;
  background: initial;
  max-height: 72%;
  z-index: 2001 !important;
  .overflow-bg{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 101px;
    background: rgba(0, 0, 0, 0.6);
  }
  .footer {
    flex: 1;
    display: flex;
    flex-flow: column;
    overflow: scroll;
    box-sizing: border-box;
    z-index: 10;
    &.expend{
      .market-bottom-bar{
        &:after{
          top: 0;
          content: '';
          width: 100%;
          height: 10px;
          position: absolute;
          background: white;
        }
      }
    }
    &.active {
      padding: 8px 16px 16px;
    }
    .size24 {
      width: 24px;
      height: 24px;
      margin-left: 1px;
    }
    .size14{
      width: 14px;
      height: 14px;
    }
  }
  .split-class{
    margin: 0 4px;
    color: #999999!important;
  }
  .split-active-class{
    margin: 0 4px;
    color: #333!important;
  }

  .footer .productListParent {
    // transform: translateY(2px);
    border-radius: 12px 12px 0px 0px;
    padding:0px 0 20px 0;
    background-color: #ffffff;
    flex: 1;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .discount-top-box-market{
      width:100%;
      padding:6px 12px ;
      border-radius:12px 12px 0 0;
      text-align:center;
      font-size:11px;
      background: rgba(254,240,232,0.95);
      ::v-deep.dis-cart-price {
        color:#FF8B1C;
        margin:0 5px;
      }
      ::v-deep b {
        color:#FF8B1C;
        font-weight:normal;
      }
    }
    .top-btn{
      margin-top:12px;
      padding: 0 12px 0 12px;
      background: #ffFFFF;
      display: flex;
      height: 35px;
      margin-bottom: 10px;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      .left,.right{
        display: flex;
        align-items: center;
      }
      .all{
        color: #333333;
        font-size: 12px;
        margin:0 5px;
      }
      .label{
        color:#999999;
        font-size: 12px;
      }
    }
    .top-btn2 {
      height: 48px;
      min-height: 48px;
      background-color: #F5F5F7;
      padding: 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #999;
      .left {
        font-size: 12px;
        color: #333;
      }
      .right {
        display: flex;
        align-items: center;
      }
    }
    .productList{
      flex: 1;
      overflow: auto;
      &.pList-expired {
        overflow: initial;
      }
      .line {
        height: 8px;
        background: #F5F5F7;
      }
    }
  }
  .discount-box-market{
    display: flex;
    align-items: center;
    justify-content: center;
      width:100%;
      transform:translateY(12px);
      padding:6px 12px 18px 6px;
      border-radius:12px 12px 0 0;
      // text-align:center;
      font-size:11px;
      background: rgba(254,240,232,0.95);
      ::v-deep.dis-cart-price {
        color:#FF8B1C;
        margin:0 5px;
      }
      ::v-deep b {
        color:#FF8B1C;
        font-weight:normal;
      }
    }
    .tips-parent-class {
      width: 100%;
      padding: 0 12px;
      .over-weight-tips{
        position: relative;
        background: rgba(254, 240, 232, 0.9);
        color: #333333;
        font-size: 11px;
        text-align: center;
        height: 28px;
        line-height: 28px;
        border-radius: 12px 12px 0px 0px;
      }
      .tips-class{
        padding: 12px 22px;
        .reserve-parent-class{
          position: relative;
          background: linear-gradient(90deg, #5994F8 0%, #4786F2 100%);;
          height: 34px;
          width: 100%;
          border-radius: 17px;
          opacity: 0.85;
          line-height: 34px;
          text-align: center;
          color: white;
          font-size: 12px;
          .close-flag{
            height: 100%;
            position: absolute;
            right: 0px;
            top: 0px;
            z-index: 11;
            padding: 5px 11px;
            display: flex;align-items: center;
            justify-content: center;
          }
        }
      }
    }
  .market-bottom-bar {
    position: relative;
    padding: 0 ;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .market-bottom-bar .marketSubmitBar {
    box-sizing: border-box;
    position: relative;
    background: transparent;
    padding : 2px 10px 42px 10px;
    height: 100px;
    z-index:3000;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%);
    .van-submit-bar__bar{
      display: flex;
      overflow: hidden;
      position: relative;
      width: 100%;
      background: white;
      z-index: 1;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.1);
    }
    &.active {
      .submit-button{
        .submit-content{
          background: #FF8B1D;
        }
      }
    }
      .submit-button {
        height: 100%;
        display: block;
        flex-shrink: 0;
        border: 0;
        padding: 4px ;
        background: inherit;
        box-sizing: border-box;
        border-radius: 0;
        text-align: center;
        .disable-submit-overweight-content{
          padding: 0 8px;
          color: #999999;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          flex-direction:column;
          align-items: center;
          justify-content:center;
          height: 100%;
          .small-label{
            font-size: 11px;
            font-weight: normal;
          }
        }
        .disable-submit-content{
          padding: 0 8px;
          color: #999999;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          height: 100%;
          &.yuding {
            color: #FF8B1C;
          }
          .mop-price{
            &:before{
              content: 'MOP ';
              font-size:12px;
              vertical-align:1px;
            }
          }
          .label{
            margin-left: 2px;
          }

        }
        .submit-content{
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 42px;
          min-width: 96px;
          padding: 0 10px;
          font-size: 16px;
          color: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          background: #BDBDBD;
          font-weight: bold;

          .weight-price{
            font-size: 15px;

          }
          .small-label{
            font-size: 11px;
            font-weight: normal;
          }
        }
        .close-content{
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 42px;
          min-width: 96px;
          padding: 0 10px;
          font-size: 16px;
          color: #FFFFFF;
          border-radius:21px ;
          overflow: hidden;
          background: linear-gradient(90deg, #D5D5D5 0%, #BDBDBD 100%);
          font-weight: bold;
          .mop-price{
            font-size: 15px;
            &:before{
              content: 'MOP ';
              font-size: 12px;
            }
          }
          .small-label{
            font-size: 11px;
            font-weight: normal;
          }
        }
      }

    div.bottomBarOptions {
      display: flex;
      height: 100%;
      justify-content: space-between;
      flex: 1;
      overflow: hidden;

    }
    // 自取
    div.storeSelfCollection {
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-flow: column;
      align-items: center;
      align-content: center;
      justify-content: center;
      color: #FF8B1C;

      .not-check{
        border-radius: 50%;
        box-sizing: border-box;
        border: 2px solid #FF8B1C;
      }

      span {
        font-size: 11px;
        font-weight: 400;
      }
    }

    div.sendPrice {
      flex-shrink: 0;
      margin:0 5px;
      .item {
        width: 96px;
        height: 100%;
        font-size: 16px;
        font-weight: bold;
        padding: 8px 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
      }
    }

    div.shippingPrice {
      flex: 1;
      height: 100%;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      align-content: center;
      box-sizing: border-box;
      padding-left:8px ;
      .cart-bottom-bar-img{
        width: 42px;
        height: 42px;
        position: relative;
        &.not{
          filter: grayscale(100);
        }
        /deep/.count {
          background: #F1833C;
          border-radius: 8px;
          color: white;
          font-size: 9px;
          padding:0 3px;
          display: flex;
          min-width: 16px;
          border :1px solid #fff;
          justify-content: center;
          align-items: center;
          position: absolute;
          right:0;
          transform: translateX(50%);
          top:0;
        }

      }

    }
    // 商品 加个
    div.product-price {
      display: flex;
      padding-left: 12px;
      flex-flow: column;
      justify-content:  center;
      align-items: flex-start;
      flex: 1;
      overflow: hidden;
      position: relative;
      &:after{
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        height: 22px;
        width: 8px;
        background: linear-gradient(0, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
      }
      .delDelivAmt2 {
        text-decoration: line-through;
        font-size: 11px;
        color: #ccc;
        margin-left: 4px;
      }
      .product{
        position: relative;
        display: flex;
        align-items: flex-end;
        flex: 1;
        &.zero{
          .marketCartPriceTotal{
            color: #999999;
          }
        }
        .marketCartPriceTotal{
          color: #333333;
          font-size: 16px;
          font-weight: bold;
          flex-shrink:0;
          &:before{
            content: 'MOP ';
            font-size: 12px;
            margin-right: 1px;
          }
        }
        .discount{
          flex-shrink:0;
          color: #CCCCCC;
          font-size: 11px;
          margin-left: 4px;
          margin-bottom: 3px;
        }
      }
      // 配送費
      .delivery-fee{
        position: relative;
        color: #999999;
        font-size: 11px;
        overflow:hidden;
        width:100%;
        white-space: nowrap;
        &:after{
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          height: 22px;
          width: 8px;
          background: linear-gradient(0, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
        }
      }
      .delivery-fee-class {
        font-size: 12px;
        /deep/ .original-class {
          margin-right: 8px;
          font-size: 12px;
          text-decoration: line-through;
        }
      }
    }
  }

  .marketSubmitBar div.sendPrice .showType {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    align-content: flex-end;
    font-size: 12px;
    color: #c0c4cc;

    span:first-child {
      font-size:16px;
      font-weight: bold;
    }
    &.item{
      font-size: 11px;
      font-weight: normal;
    }
  }

  /deep/.purchase {
    position: relative;

    &.active {
      &::after {
        display: none;
      }
    }

    .van-stepper__input {
      width: 20px;
      height: 20px;
      background:transparent;
      font-size: 12px;
      font-weight: bold;
      color: #333333FF;
    }

    .van-stepper__minus {
      color: #FF8B1D;
      width: 20px;
      height: 20px;
      background: #ffffff;
      overflow: hidden;
      border-radius: 50%;
      border: 1px #FF8B1D solid;

      &.van-stepper__minus--disabled {
        opacity: 0.5;
      }
    }

    .van-stepper__plus {
      color: #ffffff;
      background: #FF8B1D;
      width: 20px;
      height: 20px;
      overflow: hidden;
      border-radius: 50%;

      &.van-stepper__plus--disabled {
        opacity: 0.5;
      }
    }
  }
}
</style>
