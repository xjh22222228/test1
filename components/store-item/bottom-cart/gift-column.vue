<template>
  <div class="gift-col2" v-if="currentData && currentData.ok != null" :class="{ giftColA: currentData.buyGiftType === 1, giftColANone: currentData.ok && currentData.buyGiftProducts && currentData.buyGiftProducts.length <= 0 }">
    <div class="tag-class">買贈</div>

    <!-- 用户参与达到上限 -->
    <div class="label-class" v-if="currentData.isLimitJoin">當前活動已達參與上限</div>

    <!-- 未達到門檻 -->
    <div class="label-class" v-else-if="!currentData.ok">
      滿<span class="active"> {{ currentData.limitQty }} </span>件送贈品<span class="active">（缺{{ currentData.diffQty
      }}件）</span>
    </div>

    <!-- 達到門檻並且沒有下一階梯 -->
    <div class="label-class"
      v-else-if="currentData.ok && !currentData.next && currentData.buyGiftProducts && currentData.buyGiftProducts.length > 0">
      已送贈品
    </div>

    <!-- 达到了门槛 还有下一级门槛 -->
    <div class="label-class" v-else-if="currentData.ok && currentData.next">
      已滿 <span class="active">{{ currentData.limitQty }}</span> 件，可再買 <span class="active">{{ currentData.diffQty
      }}</span> 件贈送其他贈品
    </div>

    <!-- 占位符 -->
    <div class="label-class" v-else></div>

    <div class="action" @click="handleContinueBuy" v-if="currentData.buyGiftType === 2">
      <span>繼續加購</span>
      <div class="arrow"></div>
    </div>
  </div>
</template>

<script>
import event from '@/JS/event';

export default {
  props: {
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
    }
  },

  methods: {
    handleContinueBuy() {
      this.$store.commit('marketSubmitBar', {
        overlay: false
      });
      event.$emit('marketGiftContinueBuy', this.buyGift.buyGiftId);
    }
  }
};
</script>

<style lang="less" scoped>
.gift-col2 {
  height: 28px;
  display: flex;
  align-items: center;
  padding: 6px;
  background-color: #F5F5F7;
  border-radius: 8px;
  margin: 8px 12px 0 30px;

  &.giftColA {
    border-radius: 8px 8px 0 0;
    &.giftColANone {
      display: none;
    }
  }

  .tag-class {
    text-align: center;
    width: 28px;
    height: 16px;
    border-radius: 4px;
    font-size: 11px;
    color: #F54747;
    margin-right: 8px;
    border: .5px solid #FCC8C8;
    border-radius: 4px;
  }

  .label-class {
    width: 0;
    font-size: 12px;
    color: #333333;
    flex: 1;
    padding-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .active {
      color: #FF8B1D;
    }
  }

  .action {
    display: flex;
    font-size: 11px;
    color: #666;
    align-items: center;

    .arrow {
      width: 16px;
      height: 16px;
      background-image: url("./img/arrow.png");
      background-size: 16px;
    }
  }
}</style>
