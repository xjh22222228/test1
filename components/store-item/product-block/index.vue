<template>
  <div
    class="market-product"
    :class="{ marketProductDiscount: item.isParent && (item.isDiscount || item.isOldDiscount || item.isSeckill) }"
    :data-index="index"
    :data-uid="item.uid"
    :data-id="item.classifyId"
    :data-parent-id="item.parentId"
  >
    <div>
      <!-- 分類標題 -->
      <div
        class="ellipsis productAnchor"
        v-if="item.isParent"
      >
        {{ item.isSeckill ? `限時秒殺 ${storeDiscount.__seckillDiscount__}折起` : item.classifyName }}
      </div>

      <div class="normal-product-list" v-else>
        <product-item
          v-for="(product, index) in itemProductList"
          class="product"
          :product="product"
          :key="index"
          :cid="index"
          :id="`product` + product.productId"
          :class="{lightActive: product.productId === productId}"
        />
      </div>
    </div>

    <div id="monit" v-if="isLast"></div>
  </div>
</template>

<script>
import ProductItem from './product-item.vue';

export default {
  name: 'productBlock',
  components: {
    ProductItem
  },
  props: {
    index: {
      type: Number
    },
    source: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
    }
  },
  computed: {
    // 当前定位的商品ID
    productId() {
      return this.$store.state.marketStore.marketStoreProductId
    },
    isLast() {
      return this.products.length === this.index + 1
    },
    products() {
      return this.$store.state.marketStore.marketStoreProductArr;
    },
    item() {
      return this.source;
    },
    itemProductList() {
      const item = this.item
      return (item.products || []).filter((item) => !item.hide)
    },
    // 門店優惠信息
    storeDiscount() {
      return this.$store.state.marketStore.marketStoreDiscount;
    }
  }
}
</script>

<style lang="less">
.market-product {
  .productAnchor {
    position: relative;
    text-align: left;
    font-size: 14px;
    font-weight: bold;
    color: #666666;
    padding-left: 8px;
    border-top: 5px solid transparent;;
  }
  .high-light-required {
    .purchase {
      .van-stepper__input {
        background: transparent;
      }
    }
  }
  .normal-product-list {
    border-top: 4px solid transparent;
    display: flex;
    flex-wrap: wrap;
    padding: 0 8px;
    .product:nth-child(1) {
      margin-right: 10px;
    }
  }
  .high-light-required {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    column-gap: 10px;
    padding: 0 8px;
    &:after {
      content: ' ';
      top: 0;
      left: 0;
      position: absolute;
      pointer-events: none;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(250, 108, 23, 0.12) 0%,
        rgba(250, 108, 23, 0) 100%
      );
    }
  }
  // 進入門店定位到商品高亮
  @keyframes activeProduct {
    from {
      background: rgba(133, 179, 95, 0.1);
      border-radius: 12px;
      border: 2px solid #85b35f;
      z-index: 10;
    }

    to {
      border-radius: 4px;
      border-color: transparent;
      background: transparent;
      display: none;
    }
  }
  #monit {
    height: 25px;
  }
}
</style>
