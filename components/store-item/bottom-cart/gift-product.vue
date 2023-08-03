<!-- 显示贈送商品，只有买A送A才会呈现 -->
<template>
  <div
    class="gift3"
    :class="{giftA: currentData.buyGiftType === 1}"
    v-if="currentData && products.length > 0 && currentData.buyGiftType === 1"
  >
    <div class="gift-item" v-for="item of products" :key="item.productId">
      <div class="left">
        <img :src="item.productImg" class="img" />
      </div>

      <div class="middle">
        <div class="name">{{ item.productName }}</div>
        <div class="gift-line">
          <span class="gift-tag">贈品</span>x{{ item.__giftQuantity__ || item.giftQuantity }}
        </div>
        <div class="amt-line">
          <span class="disc-amt">MOP0</span>
          <span class="orig-amt">MOP{{ item.productPrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // 买赠数据
    buyGift: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {};
  },

  computed: {
    giftBuyList() {
      return this.$store.getters.marketGiftBuyList;
    },

    // 这个商品参与活动数据
    currentData() {
      const ids = this.buyGift.buyProduct?.merchantProductIds || [];
      const data = this.giftBuyList.find(item => {
        const has = item.buyProduct.merchantProductIds.some(id => {
          return ids.includes(id);
        });
        return has;
      });
      return data;
    },

    // 赠送商品列表
    products() {
      return this.currentData?.buyGiftProducts || [];
    }
  }
};
</script>

<style lang="less" scoped>
.gift3 {
  background-color: #F9F9F9;
  border-radius: 8px;
  margin: 8px 12px 0 30px;
  padding: 0 8px 8px 8px;
  &.giftA {
    margin-top: 0;
    border-radius: 0 0 8px 8px;
  }
  .gift-item {
    display: flex;
    padding-top: 8px;
  }
  .left {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    .img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
  }
  .middle {
    flex: 1;
    margin-left: 8px;
    width: 0;
    .name {
      color: #333;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gift-line {
      margin-top: 2px;
      color: #999;
      font-size: 12px;
      font-weight: normal;
      .gift-tag {
        padding: 0 4px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: .5px solid #FCC8C8;
        color: #F54747;
        font-size: 11px;
        border-radius: 4px;
        margin-right: 4px;
      }
    }
    .amt-line {
      line-height: 16px;
      font-size: 11px;
      .disc-amt {
        color: #F54747;
        font-weight: bold;
      }
      .orig-amt {
        color: #ccc;
        margin-left: 4px;
        text-decoration: line-through;
      }
    }
  }
}
</style>
