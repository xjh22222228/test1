<template>
  <div class="mproduct-item2" v-if="product" :class="product.className">
    <div class="productItem" :class="{ sellout: product.sellout }">
      <div class="img">
        <van-image
          fit="contain"
          v-if="product.iconUrl"
          class="right-top-img"
          :src="product.iconUrl | imgCompress"
          lazy-load
        ></van-image>
      <van-image
        fit="cover"
        :class="{ productImage: true, selloutImg: product.sellout }"
        :error-icon="errorIcon"
        :src="product.productImg | imgCompress"
        @click="showProduct(product)"
        lazy-load
      >

        <div class="sellout" v-if="product.sellout">
          <div class="tips">補貨中</div>
        </div>
        <!-- 不可售 -->
        <no-sale-pure-mark v-else-if="isNoSale()" :data="item" />
      </van-image>
      </div>
      <div class="info">
        <div class="details" @click="showProduct(product)">
          <p class="name">{{ product.productName }}</p>
          <p class="setMeal ellipsis2">
           {{product.subhead}}</p>
          <div class="tag-main">
            <!-- 标签 -->
            <tag-group :data="product"></tag-group>
          </div>
        </div>
        <div class="options">
          <div class="left">
            <div class="price" @click="showProduct(product)">
              <b class="amt">{{ product.discountCommonPrice || product.oldDiscountAmt || product.seckillPrice || product.storeSalePrice }}</b>
              <del class="del" v-if="product.discountCommonPrice != null || product.oldDiscountAmt != null || product.seckillPrice != null">MOP{{ product.storeSalePrice }}</del>
            </div>
            <vip-tag :data="product" :type="3" />
          </div>

          <div class="right">
            <no-sale-text-icon v-if="isNoSale()" :data="item" />
            <!-- 單規格 -->
            <div class="option" v-else-if="!product.sellout">
              <div
                class="fakeStepper"
                v-if="!product.quantity"
                @click.stop="plus()"
              ></div>
              <van-stepper
                v-else-if="product.quantity"
                class="purchase"
                @minus="minus()"
                @plus="plus()"
                @overlimit="overlimit($event,product)"
                :class="inputClass(product.quantity)"
                async-change
                v-model="product.quantity"
                :disable-input="true"
                :min="product.minPurchase ? product.minPurchase - 1 : 0"
                :max="maxLimit"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Image as VanImage, Stepper } from "vant";
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';
import NoSalePureMark from '@/views/market/components/goods/no-sale/pure-mark';
import NoSaleTextIcon from '@/views/market/components/goods/no-sale/text-icon';
import { isNoSale } from '@/views/market/components/goods/no-sale/utils';
import VipTag from '@/views/activity/h5/components/vip-tag';
const errorIcon = require("assets/images/default_dishes_pic.png");

export default {
  name: "productItem",
  components: {
    [VanImage.name]: VanImage,
    [Stepper.name]: Stepper,
    TagGroup,
    NoSalePureMark,
    NoSaleTextIcon,
    VipTag
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      errorIcon,
      menuProduct: {
        fKey: '', sKey: '', tKey: '', productIndex: ''
      }
    };
  },
  watch: {
    item: {
      immediate: true,
      deep: true,
      async handler(nv) {
        if (!nv || !nv.productId || !nv.id) {
          this.menuProduct = {
            fKey: '', sKey: '', tKey: '', productIndex: ''
          };
          return;
        }
        this.$store.dispatch('findProductById', { productId: nv.id }).then(res => {
          if (!res) {
            this.menuProduct = {
              fKey: '', sKey: '', tKey: '', productIndex: ''
            };
            return this.menuProduct;
            // 更新购物车 树里面的数据
          }
          this.menuProduct = res;
        });
      }
    }
  },
  computed: {
    marketShoppingCart() {
      const cart = this.$store.getters.marketShoppingCart;
      return cart || [];
    },
    productMaps() {
      return this.$store.getters.marketProductMaps
    },
    product() {
      const res = this.menuProduct;
      const marketShoppingCart = this.marketShoppingCart;
      const data = res;
      if (!data) {
        return {};
      }
      let quantity = 0;
      for (const cartItem of marketShoppingCart) {
        if (cartItem.productId === data.productId) {
          quantity = cartItem.quantity;
        }
      }
      const { availableTime, availableType, saleTime, sellout } = this.item;
      const product = this.productMaps[this.item.productId]
      const productItem = {
        ...this.item,
        ...data,
        ...product,
        quantity,
        availableTime,
        availableType,
        saleTime,
        sellout
      };
      return productItem
    },
    inputClass() {
      return (qty) => {
        const className = "input-";
        if (!qty) {
          return className + 1;
        } else {
          const res = qty + "";
          return className + res.length;
        }
      };
    },
    productStockMap() {
      return this.$store.getters.productStockMap;
    },
    maxLimit() {
      const productStockMap = this.productStockMap;
      const product = this.product;
      let tmax = 1000;
      if (!product.required) {
        if (typeof productStockMap[product.productId] === 'number') {
          const stock = productStockMap[product.productId];
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
    }
  },
  methods: {
    // 不可售
    isNoSale() {
      return isNoSale(this.item);
    },

    // 格式化折扣比例
    formatDiscountRate(rate) {
      if (rate == null) {
        return null;
      }
      return Number((rate * 10).toFixed(2));
    },

    async overlimit(res, item) {
      if (res === 'plus') {
        const maxPurchase = item.maxPurchase || 1000;
        if (!item.required) {
          const stock = await this.$store.dispatch('queryProductStock', item);
          const quantity = item.quantity;

          // 商品
          if (stock <= quantity && stock < maxPurchase) {
            return this.$toast({
              message: `商品已達庫存上限`,
              className: "storeToast"
            });
          }
        }
        this.$toast(`商品已達限購上限，限購${item.maxPurchase}件`);
      }
    },
    minus() {
      this.$store.dispatch("minus", this.menuProduct);
    },
    plus() {
      this.$store.dispatch("plus", this.menuProduct);
    },
    showProduct(product) {
      const d = (this.productMaps[product.productId]);
      this.$emit("showProduct", { ...product, ...d });
    }
  }
};
</script>

<style lang="less">
.mproduct-item2 {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  background: #FFFFFF;
  padding:12px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  &.active {
    animation-name: shineRed;
    animation-duration: 2s;
    animation-iteration-count: 3;
  }
  &.lightActive {
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 4px;
      right: 4px;
      bottom: 0;
      animation-name: activeProduct;
      animation-duration: 5s;
      animation-fill-mode: forwards;
      pointer-events: none;
    }
  }
  // 商品
  > .productItem {
    display: flex;
    flex: 1;
    text-align: left;
    position: relative;
    > div.info {
      flex:1;
      box-sizing: border-box;
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      padding: 0 4px 0px 8px;

      // 操作欄
      > div.options {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 6px 2px 0;// 底部加2px 防止ios 被截取
        .right {
          align-self: flex-end;
        }
        // 單規格
        .purchase {
          position: relative;
          &.active {
            &::after {
              display: none;
            }
          }
          &.input-1 {
            .van-stepper__input {
              width: 15px;
            }
          }
          &.input-2 {
            .van-stepper__input {
              width: 20px;
            }
          }
          &.input-3 {
            .van-stepper__input {
              width: 25px;
            }
          }
          &.input-4 {
            .van-stepper__input {
              width: 30px;
            }
          }

          .van-stepper__input {
            height: 20px;
            background:transparent;
            font-size: 11px;
            font-weight: bold;
            color: #333333ff;
          }

          .van-stepper__minus {
            color: #fa6c17ff;
            width: 20px;
            height: 20px;
            background: #ffffff;
            overflow: hidden;
            border-radius: 50%;
            border: 1px #fa6c17ff solid;
            &:before {
              height: 2px;
            }

            &.van-stepper__minus--disabled {
              opacity: 0.5;
            }
          }

          .van-stepper__plus {
            color: #ffffff;
            background: #fa6c17ff;
            width: 20px;
            height: 20px;
            overflow: hidden;
            border-radius: 50%;
            &:before {
              height: 2px;
            }
            &:after {
              width: 2px;
            }
            &.van-stepper__plus--disabled {
              opacity: 0.5;
            }
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
            content: "";
          }
        }

        .price {
          font-size: 16px;
          line-height: 1.2;
          font-weight: bold;
          color: #f54747ff;
          flex: 1;
          overflow: hidden;
          position: relative;
          &:before {
            content: "MOP";
            font-size: 10px;
            margin-bottom: 2px;
            margin-right: 1px;
          }
          > .none {
            display: none;
          }
          .del {
            font-size: 12px;
            color: #CCCCCC;
            line-height: 17px;
            margin-left: 4px;
            font-weight: normal;
          }
        }
        > .van-button--primary {
          background: #fa6c17ff;
          border: 0;
          padding: 0 8px;
          border-radius: 4px;
          position: relative;
          height: 20px;
          span.badge {
            position: absolute;
            top: -8px;
            right: -8px;
            z-index: 1;
            min-width: 16px;
            padding: 0 3px;
            height: 16px;
            background: #ff261d;
            border-radius: 8px;
            display: flex;
            align-items: center;
            align-content: center;
            justify-content: center;
            font-size: 12px;
            text-align: center;
            color: #ffffff;
          }
        }
      }
      > .details {
        flex: 1;
        .tag-item {
          height: 14px;
          border: 1px solid #FCC8C8;
          padding: 0 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #F54747;
          font-size: 10px;
          &:not(&:nth-last-child(1)) {
            margin-right: 4px;
          }
        }
        > p.name {
          font-size: 14px;
          font-weight: bold;
          color: #333333;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          line-clamp: 1;
          -webkit-box-orient: vertical;
          word-break: break-all;
        }
        // 商品描述
        > p.setMeal {
          overflow: hidden;
          margin-top: 2px;
          color: #999999ff;
          font-size: 11px;
          > span {
            &:first-child {
              margin-right: 8px;
              background: #f5f5f7ff;
              border-radius: 4px;
              padding: 2px 5px;
              color: #333333ff;
            }
            &:last-child {
              color: #999999ff;
            }
            font-size: 11px;
          }

          b {
            font-size: 11px;
            color: rgba(49, 46, 75, 0.5);
            word-break: break-all;
          }
        }
      }
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        .gold {
          margin: 8px 4px 0 0;
          height: 16px;
          line-height: 16px;
          padding: 0 4px;
          border-radius: 4px;
          background: #fadd2d;
          color: #aa5401;
          font-size: 10px;
        }
      }
    }
    >.img{
      position: relative;
      .right-top-img {
        position: absolute;
        width: 34px;
        top: -2px;
        left: -2px;
        z-index: 100;

      }
    }
    // 商品小卡片
    .productImage {
      width: 88px;
      height: 88px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      overflow: hidden;
      position: relative;
      &.selloutImg {
        > img {
          opacity: 0.5;
        }
      }
      > img {
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      .van-icon__image {
        width: 80px;
        height: 80px;
      }

      .sellout {
        left: 0;
        bottom: 0;
        z-index: 1;
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;

        .tips {
          font-size: 14px;
          padding: 0 10px;
          height: 22px;
          line-height: 22px;
          background: rgba(0, 0, 0, 0.5);
          color: #ffffff;
          border-radius: 11px;
        }
      }
    }
  }

  .van-skeleton {
    width: 100%;
    padding: 0;

    .van-skeleton__avatar--round {
      border-radius: 8px;
      width: 80px !important;
      height: 80px !important;
    }

    .van-skeleton__content {
      padding-top: 0;
      display: flex;
      flex-flow: column;
      justify-content: space-between;
    }

    .van-skeleton__row {
      margin: 0;
      width: 100% !important;
    }
  }
  // 商品折扣信息
  > div.discount {
    font-size: 11px;
    color: #f54747;
    line-height: 16px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    align-content: center;
    padding-left: 88px;
    span {
      margin-right: 5px;
    }
    .size24 {
      width: 10px;
      height: 10px;
      margin-right: 5px;
    }
  }
}
</style>
