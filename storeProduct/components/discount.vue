<template>
  <div class="discount-tips2">
    <!-- 促销头 -->
    <div
      class="discount-class"
      v-if="product.fullReduce || product.isSeckill || product.compositeThreshold"
    >
      <div class="title">促銷</div>
      <div class="child2">
        <div class="block-item2" v-if="product.fullReduce || product.isSeckill" @click="$emit('fullclick')">
          <div class="discount-content2">
            <!-- 秒杀 -->
            <div class="discount-card" v-if="product.isSeckill">
              秒殺{{ formatDiscountRate(product.productDiscountRate) }}折{{product.limitCount === -1 ? '' : ` 限${product.limitCount}份` }}
            </div>
            <!-- 满减 -->
            <template v-if="product.fullReduce">
              <div class="discount-card">
                {{ product.fullReduce.activityType === 1 ? '滿減' : '滿折' }}
              </div>
              <div
                class="discount-card"
                v-for="(item, idx) of product.fullReduce.discountContentList"
                :key="idx"
              >
                {{
                  product.fullReduce.activityType === 1
                    ? `滿${item.fullAtm}減${item.discount}`
                    : `滿${item.fullAtm}打${Number((item.discount * 10).toFixed(2))}折`
                }}
              </div>
            </template>
          </div>
          <svg-icon class="right-icon" icon-class="icon_system_arrow_mini_right"></svg-icon>
        </div>

        <!-- 组合价 -->
        <div class="block-item2" v-if="product.compositeThreshold && product.compositePrice != null">
          <div class="discount-content2">
            <div class="discount-card">
              {{ `${product.compositeThreshold}件MOP${product.compositePrice}` }}
            </div>
            <span class="span-txt">{{ `數量促銷${product.compositeThreshold}件${product.compositePrice}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 买赠 -->
    <div class="gift-tip" v-if="product.buyGift && product.buyGift.limits">
      <div class="left">買{{ giftLastLimitQty }}件即贈</div>
      <div class="right">
        <div
          class="gift-item"
          v-for="item of gifts"
          :key="item.produtcId"
        >
          <img :src="item.productImg" class="product-img" />
          x{{ item.giftQuantity }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreDetailDiscount',

  props: {
    // 商品詳情
    product: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    // 买赠最低门槛件数
    giftLastLimitQty() {
      return this.product.buyGift.limits[this.product.buyGift.limits.length - 1].limitQuantity
    },

    gifts() {
      return this.product.buyGift.limits[this.product.buyGift.limits.length - 1].gifts;
    }
  },

  data() {
    return {};
  },
  methods: {
    // 格式化折扣比例
    formatDiscountRate(rate) {
      if (rate == null) {
        return null;
      }
      return Number((rate * 10).toFixed(2));
    }
  }
};
</script>

<style lang="less" scoped>
.discount-tips2 {
  .discount-class {
    display: flex;
    align-items: center;
    padding: 15px 12px 18px 12px;
    overflow: hidden;
    border-top: 12px solid #F5F5F7;
    .title {
      flex-shrink: 0;
      font-size: 16px;
      font-weight: bold;
      margin-right: 9px;
      align-self: flex-start;
    }
    .child2 {
      flex: 1;
    }
    .block-item2 {
      flex: 1;
      display: flex;
      align-items: center;
      &:not(:nth-child(1)) {
        margin-top: 12px;
      }
    }
    .discount-content2 {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: auto;
      // 滿減
      .discount-card {
        flex-shrink: 0;
        height: 16px;
        line-height: 16px;
        font-size: 10px;
        padding: 0 5px;
        border: 1px solid #FCC8C8;
        border-radius: 4px;
        color: #F54747;
        margin-right: 5px;
      }
      .span-txt {
        margin-left: 3px;
        color: #666;
        font-size: 11px;
      }
    }
    .right-icon {
      font-size: 16px;
    }
  }
  .gift-tip {
    display: flex;
    padding: 15px 12px 15px 0;
    margin-left: 12px;
    border-top: .5px solid #F0F0F0;
    align-items: center;
    .left {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
    .right {
      flex: 1;
      text-align: left;
      display: flex;
      flex-wrap: wrap;
      align-self: flex-start;
    }
    .gift-item {
      font-size: 14px;
      color: #666;
      margin-left: 8px;
      display: flex;
      align-items: center;
      .product-img {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        margin-right: 2px;
      }
    }
  }
}
</style>
