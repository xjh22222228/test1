<!-- 标签信息 -->
<template>
  <div class="disc-tag">
    <!-- 折扣標簽(旧) -->
    <template v-if="product.isOldDiscount">
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock != 0"
      >
        {{ formatDiscountRate(product.productDiscountRate) }}折
        <template v-if="product.limitCount > 0" >, 限{{ product.limitCount }}份</template >
        <template
          v-if="
            product.discountStock <= 5 &&
            product.discountStock > 0
          "
          >，剩{{ product.discountStock }}份</template>
      </span>
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock === 0"
      >今日已售罄，恢復原價</span>
    </template>
    <!-- 折扣標簽(筍货) -->
    <template v-if="product.isDiscount">
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock != 0"
      >
        {{ product.isDiscountMember ? '會員' : '筍貨' }}{{ formatDiscountRate(product.productDiscountRate) }}折
        <template v-if="product.limitCount > 0" >, 限{{ product.limitCount }}份</template >
        <template
          v-if="
            product.discountStock <= 5 &&
            product.discountStock > 0
          "
          >，剩{{ product.discountStock }}份</template>
      </span>
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock === 0"
      >今日已售罄，恢復原價</span>
    </template>
    <!-- 秒杀 -->
    <template v-if="product.isSeckill">
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock != 0"
      >
        秒殺{{ formatDiscountRate(product.productDiscountRate) }}折{{product.limitCount === -1 ? '' : `限${product.limitCount}份` }}
        <template
          v-if="
            product.discountStock <= 5 &&
            product.discountStock > 0
          "
          >，剩{{ product.discountStock }}份</template>
      </span>
      <span
        class="tag-item ellipsis"
        v-if="product.discountStock === 0"
      >今日已售罄，恢復原價</span>
    </template>
    <!-- 滿減满折標簽 -->
    <template
      v-if="
        product.fullReduce &&
        product.fullReduce.discountContentList
      "
    >
      <span class="tag-item ellipsis">
        {{
          product.fullReduce.activityType === 1
            ? `滿${product.fullReduce.discountContentList[0].fullAtm}減${product.fullReduce.discountContentList[0].discount}`
            : `滿${
                product.fullReduce.discountContentList[0]
                  .fullAtm
              }打${formatDiscountRate(
                product.fullReduce.discountContentList[0]
                  .discount
              )}折`
        }}
      </span>
    </template>
    <!-- 买赠标签 -->
    <span class="tag-item ellipsis" v-if="product.buyGiftStr">
      {{ product.buyGiftStr }}
    </span>
    <!-- 组合价 -->
    <span class="tag-item ellipsis" v-if="product.compositeThreshold && product.compositePrice != null">{{ `${product.compositeThreshold}件MOP${product.compositePrice}` }}</span>
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      default: () => ({})
    }
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
.disc-tag {
  padding-bottom: 2px;
  max-height: 35px;
  overflow: hidden;
  line-height: 1.1;
  .tag-item {
    height: 14px;
    border: 1px solid #fcc8c8;
    padding: 0 3px;
    display: inline-block;
    line-height: 14px;
    text-align: left;
    max-width: 100%;
    border-radius: 4px;
    color: #f54747;
    font-size: 10px;
    &:not(&:nth-last-child(1)) {
      margin-right: 4px;
    }
  }
}
</style>
