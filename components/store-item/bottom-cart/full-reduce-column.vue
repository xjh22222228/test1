<template>
  <div class="full-decode-class2">
    <template v-if="data.activityType === 1">
      <div class="tag-class">滿減</div>
        <!-- 還沒有達到門檻 -->
        <div class="label-class" v-if="data.idx === -1">
          再買<span class="active">&nbsp;MOP{{data.diff}}&nbsp;</span>可減<span class="active">&nbsp;MOP{{data.discount}}</span>
        </div>

        <!-- 已滿足一檔，還有下一檔 -->
        <div class="label-class" v-else-if="data.isNext">
          已減<span class="active">&nbsp;MOP{{data.current.discount}}&nbsp;</span>再買<span class="active">&nbsp;MOP{{data.diff}}&nbsp;</span>可減<span class="active">&nbsp;MOP{{data.next.discount}}</span>
        </div>

        <!-- 已達到最高門檻 -->
        <div class="label-class" v-else-if="data.isTop">
          已滿<span class="active">&nbsp;MOP{{data.fullAtm}}&nbsp;</span>已減<span class="active">&nbsp;MOP{{data.discount}}</span>
        </div>
    </template>

    <template v-if="data.activityType === 2">
      <div class="tag-class">滿折</div>
        <!-- 還沒有達到門檻 -->
        <div class="label-class" v-if="data.idx === -1">
          再買<span class="active">&nbsp;MOP{{data.diff}}&nbsp;</span>可打<span class="active">&nbsp;{{formatDiscount(data.discount)}}折</span>
        </div>

        <!-- 已滿足一檔，還有下一檔 -->
        <div class="label-class" v-else-if="data.isNext">
          已打<span class="active">&nbsp;{{formatDiscount(data.current.discount)}}折&nbsp;</span>再買<span class="active">&nbsp;MOP{{data.diff}}&nbsp;</span>可打<span class="active">&nbsp;{{formatDiscount(data.next.discount)}}折</span>
        </div>

        <!-- 已達到最高門檻 -->
        <div class="label-class" v-else-if="data.isTop">
          已滿<span class="active">&nbsp;MOP{{data.fullAtm}}&nbsp;</span>已減<span class="active">&nbsp;MOP{{data.discountAtm}}</span>
        </div>
    </template>

    <div class="action" @click="handleContinueBuy">
      <span>繼續加購</span>
      <div class="arrow"></div>
    </div>
  </div>
</template>

<script>
import event from '@/JS/event';

export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {};
  },

  methods: {
    handleContinueBuy() {
      this.$store.commit('marketSubmitBar', {
        overlay: false
      });
      event.$emit('marketContinueBuy', this.data.id);
      // 关闭掉买赠继续加购弹窗
      event.$emit('marketGiftContinueBuyClose');
    },

    // 格式化折扣
    formatDiscount(rate) {
      return Number((rate * 10).toFixed(2));
    }
  }
};
</script>

<style lang="less" scoped>
.full-decode-class2 {
  background: #FEF1EA;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 12px;
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
  .label-class{
    width: 0;
    font-size: 12px;
    color:#333333;
    flex: 1;
    padding-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .active{
      color:#FF8B1D;
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
}
</style>
