<!-- 購物車商品 -->
<template>
  <div class="cartItem3" :class="{fail: fail}" v-if="product.quantity">
    <div class="cartItemProduct">
      <svg-icon v-if="fail" class="size24" icon-class="expired-disable"></svg-icon>
      <span v-else @click="upDateSelect(product)">
        <svg-icon class="size24" :icon-class="product.selected?'selfCollection2':'marketNotSelect'"></svg-icon>
      </span>
      <van-image class="product-image"
                v-if="product.productImg"
                :src="product.productImg|imgCompress"
                fit="contain"
                :error-icon="errorIcon">
        <vip-icon class="zhe-img vip-icon" v-if="isMemberPrice" />
        <img src="./img/zhe.png" v-else-if="product.isDiscount && product.showDiscountIcon !== false && product.__discountQuantity__" class="zhe-img" />
        <img src="./img/zhe-old.png" v-else-if="product.isOldDiscount && product.showDiscountIcon !== false && product.__discountQuantity__" class="zhe-img" />
        <svg-icon v-else-if="product.isSeckill && product.showDiscountIcon !== false && product.__discountQuantity__" icon-class="miao" class="zhe-img" />
        <svg-icon v-else-if="product.group && product.__discountQuantity__ && product.showDiscountIcon !== false" icon-class="zu" class="zhe-img" />
      </van-image>
      <div class="info">
        <div class="infoBox">
          <div>
            <p class="name ellipsis">{{product.productName}}</p>
            <!-- 组合价 -->
            <template v-if="product.group && product.showDiscountIcon !== false">
              <div class="tag-block">
                <span class="coupon-atm">{{ `${product.compositeThreshold}件MOP${product.compositePrice}` }}</span>
                <span class="qty">x{{ product.__discountQuantity__ }}</span>
              </div>
              <div class="tag-block" v-if="product.groupNormalQty > 0">
                <span class="coupon-atm">原價</span>
                <span class="qty">x{{ product.groupNormalQty }}</span>
              </div>
            </template>
            <!-- 商品券 -->
            <span class="coupon-atm" v-else-if="product.isMallCoupon">商品券-MOP{{ product.__disMallCouponAmtn__ }}</span>
            <!-- 其他活动 -->
            <div class="attr" v-else>
              x{{product.quantity}}
              <span v-if="product.discountQuantity && product.isDiscount && product.discountQuantity != product.quantity">
                <template v-if="product.isDiscountMember">(含{{product.discountQuantity}}份會員折扣商品) </template>
                <template v-else>(含{{product.discountQuantity}}份筍貨商品) </template>
              </span>
              <span v-else-if="product.discountQuantity && product.isOldDiscount && product.discountQuantity != product.quantity">
                (含{{product.discountQuantity}}份折扣商品)
              </span>
              <span v-else-if="product.discountQuantity && product.isSeckill && product.discountQuantity != product.quantity">
                (含{{product.discountQuantity}}份秒殺活動商品)
              </span>
            </div>
          </div>
          <div class="options">
            <!-- 折扣价 -->
            <span
              class="price"
              v-if="isDiscountProduct && product.showDiscountIcon !== false">
              <b>{{utils.filterSecret($$(product,'priceTotal'))}}</b> <del class="discount">MOP{{utils.filterSecret($$(product,'price') * $$(product,'quantity'))}}</del>
            </span>
            <span class="price" v-else>
              {{utils.filterSecret($$(product,'price') * $$(product,'quantity'))}}
            </span>
            <van-stepper
              v-if="!fail"
              async-change
              @minus="bottomCartMinus(product)"
              @plus="bottomCartPlus(product)"
              @overlimit="overlimit($event,product)"
              class="purchase active"
              :disable-minus="false"
              :disable-plus="disablePlus(product)"
              :value="product.quantity"
              :disable-input="true"
              :min="0"
              :max="maxLimit(product)" />
          </div>
        </div>
      </div>
      <div class="step-btn-class"></div>
    </div>

    <gift-column v-if="product.buyGift && !product.__split__" :buyGift="product.buyGift" />
    <gift-product v-if="product.buyGift && !product.__split__" :buyGift="product.buyGift" />
  </div>
</template>

<script>
import GiftProduct from './gift-product';
import GiftColumn from './gift-column';
import { Image as VanImage, Stepper, Toast } from "vant";
import errorIcon from 'assets/images/default_dishes_pic.png';
import VipIcon from '@/views/market/order/components/vip-icon';

export default {
  components: {
    GiftProduct,
    GiftColumn,
    VipIcon,
    [VanImage.name]: VanImage,
    [Stepper.name]: Stepper
  },

  props: {
    product: {
      type: Object,
      default: () => ({})
    },
    productIndex: {
      type: Number,
      default: 0
    },
    // 是否為失效樣式
    fail: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      errorIcon
    };
  },

  computed: {
    // 是否是折扣类商品
    isDiscountProduct() {
      return (this.product.isDiscount || this.product.isOldDiscount || this.product.isSeckill || this.product.isMallCoupon || this.product.group) && this.product.__discountQuantity__;
    },
    // 是否享受会员折扣价
    isMemberPrice() {
      return this.product.isDiscount && this.product.showDiscountIcon !== false && this.product.__discountQuantity__ && this.product.isDiscountMember && this.memberLevel != null;
    },
    // 会员等级
    memberLevel() {
      return this.$store.state.marketHome.memberLevelInfo?.marketCardLevel;
    },
    productStockMap() {
      return this.$store.getters.productStockMap;
    },
    maxLimit() {
      const productStockMap = this.productStockMap;
      return product => {
        let tmax = 1000;
        if (!product.required) {
          const stock = productStockMap[product.productId];
          if (typeof stock === 'number') {
            if (stock < tmax) {
              tmax = stock;
            }
          }
        }
        if (typeof product.maxPurchase === 'number') {
          if (product.maxPurchase < tmax) {
            tmax = product.maxPurchase;
          }
        }
        return tmax;
      };
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart || [];
    }
  },

  methods: {
    disablePlus(product) {
      // 商品券只能购买一张
      if (product.isMallCoupon && product.__quantity__ >= 1) {
        return true;
      }
      const max = product.maxPurchase || this.productStockMap[product.productId] || 1000;
      return product.__quantity__ >= max;
    },

    async overlimit(res, item) {
      if (res == 'plus') {
        // 商品券
        if (item.isMallCoupon) {
          return;
        }
        const maxPurchase = item.maxPurchase || 1000;
        if (!item.required) {
          const stock = await this.$store.dispatch('queryProductStock', item);
          const quantity = item.__quantity__;

          // 商品
          if (stock <= quantity && stock < maxPurchase) {
            return Toast({
              message: `商品已達庫存上限`,
              className: "storeToast"
            });
          }
        }
        this.$toast(`商品已達限購上限，限購${maxPurchase}件`);
      }
    },
    // 選中
    upDateSelect(product) {
      const idx = this.marketShoppingCart.findIndex(item => {
        return item.productId === product.productId;
      });
      if (idx >= 0) {
        this.marketShoppingCart[idx].selected = !this.marketShoppingCart[idx].selected;
      }
      this.$store.commit('marketShoppingCart', this.marketShoppingCart);
      this.$store.dispatch('marketFullDetails');
    },
    // 底部購物車增加
    async bottomCartPlus(_product) {
      return this.$store.dispatch('plus', _product);
    },
    // 底部購物車減少數量
    async bottomCartMinus(_product) {
      return this.$store.dispatch('minus', _product);
    }
  }
};
</script>

<style lang="less" scoped>
.cartItem3 {
  display: flex;
  flex-flow: column;
  background: #ffffff;
  text-align: left;
  padding-left: 12px;
  padding-bottom: 16px;
  &.fail {
    .product-image {
      opacity: .8;
      /deep/.van-image__img {
        opacity: .8;
      }
      /deep/.expired-txt {
        z-index: 3;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 65px;
        height: 22px;
        background: rgba(0,0,0,0.5);
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
      }

    }
    .infoBox .name,
    .infoBox .attr,
    .infoBox .price {
      color: #ccc !important;
    }
  }
  .cartItemProduct {
    flex: 1;
    display: flex;
    align-items: center;
    margin-top: 17px;
    &:first-child{
      margin-top: 12px;
    }
    .product-image {
      /deep/.van-image__img {
        border-radius: 8px;
      }
    }
    .van-image{
      margin-left: 13px;
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      position: relative;
      pointer-events: none;
      .zhe-img {
        width: 16px;
        position: absolute;
        top: -2px;
        left: -2px;
        &.vip-icon {
          top: -6px;
          left: -5px;
        }
      }
    }
    div.info {
      flex: 1;
      padding: 3px 12px 0 8px;
      display: flex;
      flex-flow: column;
      box-sizing: border-box;
      justify-content: space-between;
      height: 80px;
      overflow: hidden;
    }
    .step-btn-class{
      flex-shrink: 0;
      height: 80px;
      display: flex;
      align-items: flex-end;
    }
  }
  .attr {
    margin-top: 4px;
    color: #999;
    font-size: 12px;
  }
  .tag-block {
    line-height: 1;
    margin-top: 3px;
    font-size: 0;
  }

  .coupon-atm {
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: .5px solid #FCC8C8;
    border-radius: 4px;
    color: #F54747;
    font-size: 10px;
    padding: 0 4px;
    line-height: 16px;
  }

  div.infoBox {
    flex: 1;
    display: flex;
    flex-flow: column;
    box-sizing: border-box;
    justify-content: space-between;
    .qty {
      color: #999;
      font-size: 12px;
      margin-left: 2px;
    }
  }
  div.options {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  p.name {
    font-size: 14px;
    line-height: 16px;
    font-weight: bold;
    color: #333333;
  }
  span.price {
    font-size: 16px;
    font-weight: bold;
    color: #F54747;
    display: flex;
    align-items: center;
    &:before{
      content: 'MOP';
      font-size: 11px;
      margin-right: 1px;
    }

    .discount {
      font-size: 11px;
      font-weight: normal;
      margin-left: 2px;
      color: #CCCCCC;
    }

    .symbol {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
  }
}
</style>
