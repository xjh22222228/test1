<template>
<div class="mk-full-product-parent">
  <div class="mk-full-data">
    <div class="img-box">
      <img class="full-product-img" :src="product.productImg"/>
      <!-- 售罄 -->
      <div class="sellout3" v-if="product.sellout">
        <div class="sellout-txt">補貨中</div>
      </div>
      <!-- 不可售 -->
      <no-sale-mark v-else-if="isNoSale()" :data="product" />
    </div>
    <div class="full-detail">
      <div class="product-name ellipsis2">{{product.productName}}</div>
      <div class="flex-between">
        <div class="price">
          <span class="unit">{{$t('price_unit')}}</span>
          <span class="big-price">{{ product.isDiscount ? `${product.discountCommonPrice != null ? product.discountCommonPrice : product.defaultSku && product.defaultSku.skuPrice}` : `${product.productDiscountAmt != null ? product.productDiscountAmt : product.defaultSku && product.defaultSku.skuPrice}` }}</span>
          <span class="old-price" v-if="product.isDiscount ? product.discountCommonPrice != null : product.productDiscountAmt != null">MOP{{product.defaultSku && product.defaultSku.skuPrice}}</span>
        </div>
        <div class="opt">
          <div
            v-if="!product.quantity"
            @click.stop="fakeStepper"
            :class="`fakeStepper ${disableProduct?'disabled':''}`"
            type="primary"></div>
          <van-stepper
            v-if="product.quantity"
            async-change
            @minus="minus"
            @plus="plus"
            @overlimit="overlimit(product)"
            :class="inputClass(product.quantity)"
            class="purchase-skus active"
            :disable-minus="false"
            v-model="product.quantity"
            :disable-input="true"
            :min="product.minPurchase?product.minPurchase - 1:0"
            :max="maxLimit" />
        </div>
      </div>
      <div class="full-tips" v-if="$$(product,'fullReduce','twoPrice')">
        <div class="money">MOP{{product.fullReduce.twoPrice}}</div>
        <div class="double-label">2件預估單價</div>
      </div>
    </div>
  </div>

  <goods-end v-if="product.isEnd || end" />
</div>
</template>

<script>
import { Stepper } from 'vant';
import { isNoSale } from '@/views/market/components/goods/no-sale/utils';
import NoSaleMark from '@/views/market/components/goods/no-sale/pure-mark';
import GoodsEnd from '@/views/market/components/goods/end/index.vue';

export default {
  components: {
    [Stepper.name]: Stepper,
    NoSaleMark,
    GoodsEnd
  },
  props: {
    end: {
      type: Boolean,
      default: false
    },
    source: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    product() {
      const source = this.source;
      const marketShoppingCart = this.marketShoppingCart;
      const productArr = marketShoppingCart.filter(item => item.productId == source.productId);
      return {
        ...source,
        quantity: _.sumBy(productArr, 'quantity')
      };
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart;
    },
    disableProduct() {
      const source = this.product;
      const productStockMap = this.productStockMap;
      const stock = productStockMap[source.productId] || 1000;
      return isNoSale(source) || source.sellout || (source.maxPurchase !== null && source.quantity === source.maxPurchase) ||
      (stock <= source.quantity);
    },
    inputClass() {
      const className = "input-";
      return qty => {
        if (!qty) {
          return className + 1;
        } else {
          const res = qty + "";
          return className + res.length;
        }
      };
    },
    canNotSell() {
      return this.source.status === 1 || this.source.status === 3;
    },
    productStockMap() {
      return this.$store.getters.productStockMap;
    },
    maxLimit() {
      const productStockMap = this.productStockMap;
      const source = this.source;
      let tmax = 1000;
      if (!source.required) {
        if (typeof productStockMap[source.productId] === 'number') {
          const stock = productStockMap[source.productId];
          if (stock < tmax) {
            tmax = stock;
          }
        }
      }
      if (typeof source.maxPurchase === 'number') {
        if (source.maxPurchase < tmax) {
          tmax = source.maxPurchase;
        }
      }
      return tmax;
    },
  },
  methods: {
    // 不可售
    isNoSale() {
      return isNoSale(this.data);
    },
    async plus() {
      await this.$store.dispatch('plus', this.source);
    },
    async overlimit(res) {
      const source = this.source;
      if (res.type == 'plus') {
        const maxPurchase = source.maxPurchase || 1000;
        if (!source.required) {
          const stock = await this.$store.dispatch('queryProductStock', source);
          const quantity = source.quantity;

          // 商品
          if (stock <= quantity && stock < maxPurchase) {
            return this.$toast({
              message: `商品已達庫存上限`,
              className: "storeToast"
            });
          }
        }
        this.$toast(`商品已達限購上限，限購${this.source.maxPurchase}件`);
      }
    },
    async minus() {
      await this.$store.dispatch("minus", this.source);
    },
    async fakeStepper() {
      if (this.canNotSell) return;
      await this.$store.dispatch('plus', this.source);
    }
  }
};
</script>
<style lang="less">
.mk-full-product-parent{
  padding:0 12px ;
  margin-bottom:20px;
  width:100%;
  .mk-full-data{
    width:100%;
    padding-bottom:10px;
    border-bottom: 1px solid #F0F0F0;
    display:flex;
    align-items:flex-start;
    .img-box {
      position: relative;
      .nosaletxt {
        font-size: 10px;
        padding: 1px 8px;
      }
      .sellout3 {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #fff;
          opacity: .8;
        }

        .sellout-txt {
          z-index: 2;
          position: relative;
          width: 45px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          font-size: 10px;
          color: #fff;
          background: rgba(0, 0, 0, 0.5000);
          opacity: 1;
        }
      }
    }
    .full-product-img {
      flex-shrink:0;
      width:56px;
      height:56px;
      border-radius: 8px;
      overflow:hidden;
    }
    .full-detail{
      flex:1;
      margin-left:8px;
      .product-name {
        color:#333333;
        font-size:16px;
        font-weight:bold;
        text-align:left;
      }
      .flex-between{
        display:flex;
        align-items:center;
        justify-content:space-between;
        .price{
          .unit{
            color:#F54747;
            font-size:11px;
            font-weight:bold;
            vertical-align:1px;
          }
          .big-price {
            color:#F54747;
            font-weight:bold;
            font-size:16px;
          }
          .old-price{
            margin-left:2px;
            text-decoration: line-through;
            font-size:11px;
            color:#CCCCCC;
            vertical-align:1px;
          }
        }
        .opt{
          flex-shrink:0;
        }
      }
    }
    .full-tips{
      display:inline-flex;
      border-radius: 4px;
      overflow:hidden;
      height:16px;
      line-height:16px;
      font-size:11px;
      .money{
        color:#fff;
        padding:0 4px;
        background:#F54747;
      }
      .double-label{
        padding:0 4px;
        background:#F0F0F0;
        color:#F54747;
      }
    }
    .fakeStepper {
      position: relative;
      width: 20px;
      height: 20px;
      color: #ffffff;
      background: #fa6c17;
      overflow: hidden;
      border-radius: 50%;
      &.disabled{
        pointer-events:none;
        opacity: 0.5;
      }

      &:before,
      &:before {
        width: 50%;
        height: 2px;
      }

      &:after,
      &:after {
        width: 2px;
        height: 50%;
      }

      &:after,
      &:after,
      &:before,
      &:before {
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: currentColor;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        content: '';
      }
    }
    .purchase-skus {
      position: relative;
      &.active {
        &::after {
          display: none;
        }
      }
      .van-stepper__input {
        font-size: 12px;
      }
      .van-stepper__input {
        height: 20px;
        background:transparent;
        font-size: 12px;
        font-weight: bold;
        color: #333333FF;
      }
        &.input-1{
          .van-stepper__input {
            width:20px;
            font-size: 12px;
          }
        }
        &.input-2{
          .van-stepper__input {
            width:26px;
          }
        }
        &.input-3{
          .van-stepper__input {
            width:34px;
          }
        }
        &.input-4{
          .van-stepper__input {
            width:44px;
          }
        }
      .van-stepper__minus {
        color: #FA6C17FF;
        width: 20px;
        height: 20px;
        background: #ffffff;
        border-radius: 50%;
        border: 1px #FA6C17FF solid;
        &.van-stepper__minus--disabled {
          opacity: 0.5;
        }
      }
      .van-stepper__plus {
        color: #ffffff;
        background: #FA6C17FF;
        width: 20px;
        height: 20px;
        overflow: hidden;
        border-radius: 50%;
        &.van-stepper__plus--disabled {
          background:#D8D8D8;
          // background:rgba(216,216,216 , 0.7);
        }
      }
    }
  }
}
</style>