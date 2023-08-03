<template>
  <div class="product product33">
    <img :src="__product__.iconUrl | imgCompress" class="iconUrl" v-if="__product__.iconUrl" />
    <div class="productItemBox" :class="__product__.className">
      <div class="productItem" :class="{ sellout: product.sellout }">
        <div class="poster-box">
          <div
            :class="{ productImage: true, selloutImg: __product__.sellout }"
            :style="{backgroundImage: `url(${imgCompress(__product__.productImg)})`}"
            @click="showProduct(__product__)"
          >
            <no-sale-mark
              v-if="isNoSale(__product__)"
              :data="__product__"
            />
            <div class="sellout" v-else-if="__product__.sellout">
              <div class="tips">補貨中</div>
            </div>
          </div>
        </div>
        <div class="info">
          <div class="details" @click="showProduct(__product__)">
            <p class="name ellipsis2">{{ __product__.productName }}</p>
            <p class="setMeal ellipsis">{{ __product__.subhead }}</p>
            <!-- 標簽信息 -->
            <discount-tag :product="__product__" />
            <!-- 会员标签 -->
            <vip-tag :data="__product__" :show-subtract="showSubtract" />
          </div>

          <div class="options" v-if="!$route.query.isShare">
            <div class="price" @click="showProduct(__product__)">
              <b class="price">{{ __product__.isDiscount ? `${__product__.discountCommonPrice != null ? __product__.discountCommonPrice : __product__.defaultSku && __product__.defaultSku.skuPrice}` : `${__product__.productDiscountAmt != null ? __product__.productDiscountAmt : __product__.defaultSku && __product__.defaultSku.skuPrice}` }}</b>
              <div
                class="discount"
                v-if="__product__.isDiscount ? __product__.discountCommonPrice != null : __product__.productDiscountAmt != null"
              >MOP{{ __product__.defaultSku && __product__.defaultSku.skuPrice }}</div>
            </div>
            <div
              class="option"
              :class="{
                disabled:
                  disabledProduct(__product__) ||
                  isNoSale(__product__)
              }"
            >
              <div
                class="click"
                @click.stop="onFakeStepper(__product__)"
              ></div>
              <div
                class="fakeStepper"
                @click.stop="onFakeStepper(__product__)"
              >
                <div class="number" v-if="productQty(__product__)">
                  {{ productQty(__product__) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import filter from '@/JS/filter.js';
import NoSaleMark from '@/views/market/components/goods/no-sale/mark';
import VipTag from '@/views/activity/h5/components/vip-tag';
import DiscountTag from './tag';
import event from '@/JS/event';
import { isNoSale } from '@/views/market/components/goods/no-sale/utils'

const errorIcon = require('assets/images/default_dishes_pic.png')

export default {
  components: {
    NoSaleMark,
    VipTag,
    DiscountTag
  },

  props: {
    // 会员标签是否显示再减
    showSubtract: {
      type: Boolean,
      default: true
    },
    product: {
      type: Object,
      defualt: () => ({})
    }
  },

  data() {
    return {
      imgCompress: filter.imgCompress,
      errorIcon,
      adding: false // 是否添加中购物车，第一次加入需要查询库存
    };
  },

  computed: {
    __product__() {
      const key = this.$store.state.marketStore.marketKey;
      return {
        ...key,
        ...this.merchantProductMaps[this.product.productId],
        ...this.productMaps[this.product.productId],
        ...this.product
      }
    },
    // 当前定位的商品ID
    productId() {
      return this.$store.state.marketStore.marketStoreProductId
    },
    productMaps() {
      return this.$store.state.marketStore.marketProductMaps
    },
    merchantProductMaps() {
      return this.$store.state.marketStore.marketMerchantProductMaps
    },
    products() {
      return this.$store.state.marketStore.marketStoreProductArr;
    },
    item() {
      return this.source;
    },
    disabledProduct() {
      const productStockMap = this.productStockMap
      return (product) => {
        const maxPurchase = product.maxPurchase || 1000;
        const qty = this.productQty(product);
        let stock = productStockMap[product.productId] ?? 1000
        if (product.required) {
          stock = 1000;
        }
        return (
          product.sellout ||
          qty === maxPurchase ||
          (stock <= qty && stock < maxPurchase)
        )
      }
    },
    // 购物车商品Map
    cartProductMap() {
      return this.$store.getters.marketCartProductMap
    },
    itemProductList() {
      const item = this.item
      return (item.products || []).filter((item) => !item.hide)
    },
    productStockMap() {
      return this.$store.getters.productStockMap
    },
    // 門店優惠信息
    storeDiscount() {
      return this.$store.state.marketStore.marketStoreDiscount;
    }
  },
  methods: {
    // 当前商品加购的数量
    productQty(product) {
      return (this.cartProductMap[product.productId] &&
        this.cartProductMap[product.productId].quantity) || 0;
    },
    // 不可售
    isNoSale(data) {
      return isNoSale(data)
    },
    // 点击加购商品
    onFakeStepper(product) {
      if (this.adding) {
        return;
      }
      this.adding = true;
      this.$store.dispatch('plus', product).finally(() => {
        this.adding = false;
      });
    },
    // 查看商品詳情
    showProduct(product) {
      // 必選的不能查看商品詳情，因為沒有詳情
      if (product.required) {
        return
      }
      event.$emit('showProduct', product)
    }
  }
};
</script>

<style lang="less" scoped>
.product {
  position: relative;
  display: flex;
  width: calc(50% - 6px);
  flex-wrap: wrap;
  margin-top: 3px;
  &.active {
    animation-name: shineRed;
    animation-duration: 2s;
    animation-iteration-count: 3;
  }
  &.lightActive {
    border: 2px solid #85b35f;
    background: rgba(133, 179, 95, 0.1);
    border-radius: 12px;
  }
  .iconUrl {
    top: -2px;
    left: -2px;
    z-index: 32;
    position: absolute;
    height: 18px;
    display: block;
  }
  .productItemBox {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    text-align: left;
    border: 1px solid #f5f5f7;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 8px;
    // 商品
    > .productItem {
      flex: 1;
      width: 100%;
      text-align: left;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 12px;
      > div.info {
        flex: 1;
        box-sizing: border-box;
        display: flex;
        flex-flow: column;
        justify-content: space-between;
        padding: 4px 4px 11px 4px;

        // 操作欄
        > div.options {
          position: relative;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 6px 0 0;
          .option {
            position: relative;
            align-self: flex-end;
            .click {
              width: 50px;
              height: 50px;
              position: absolute;
              top: -20px;
              left: -20px;
            }
            &.disabled {
              .fakeStepper {
                background: rgba(250, 108, 23, 0.5);
                background: rgba(250, 108, 23, 0.5);
              }
            }
          }
          .fakeStepper {
            position: relative;
            width: 20px;
            height: 20px;
            color: #ffffff;
            background: #fa6c17;
            border-radius: 50%;
            .number {
              background: #f1833c;
              border-radius: 0.08rem;
              color: white;
              font-size: 0.09rem;
              padding: 0 0.03rem;
              display: flex;
              min-width: 0.16rem;
              border: 0.01rem solid #fff;
              justify-content: center;
              align-items: center;
              position: absolute;
              right: 0;
              transform: translate3d(50%, -50%, 0);
              top: 0;
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

          > div.price {
            font-size: 14px;
            line-height: 1.2;
            font-weight: bold;
            color: #f54747ff;
            flex: 1;
            overflow: hidden;
            position: relative;
            &:before {
              content: 'MOP';
              font-size: 11px;
              margin-bottom: 2px;
              margin-right: 1px;
              font-weight: normal;
            }
            > .none {
              display: none;
            }
            > .discount {
              font-size: 10px;
              color: #ccc;
              text-decoration: line-through;
              font-weight: normal;
              margin-top: 2px;
            }
            > .qi {
              font-size: 10px;
              color: #f54747ff;
              font-weight: normal;
              margin-left: 2px;
              margin-bottom: 2px;
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
          > p.name {
            font-size: 14px;
            font-weight: bold;
            color: #333333;
            overflow: hidden;
          }
          // 商品描述
          > p.setMeal {
            overflow: hidden;
            color: #999999ff;
            font-size: 11px;
            border-top: 2px solid transparent;
            border-bottom: 2px solid transparent;
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
      }
      // 商品小卡片
      > .poster-box {
        height: 134px;
        overflow: hidden;
        > .productImage {
          width: 100%;
          height: 100%;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          overflow: hidden;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          &.selloutImg {
            > img {
              opacity: 0.5;
            }
          }

          position: relative;
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
              line-height: 24px;
              background: rgba(0, 0, 0, 0.5);
              color: #ffffff;
              border-radius: 11px;
            }
          }
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
}
</style>
