<template>
  <div class="tab9">
    <div
      class="tab-item"
      :class="{active: tabType === 1}"
      @click="onClick(1)"
    >首頁</div>
    <div
      class="tab-item"
      :class="{active: tabType === 2}"
      @click="onClick(2)"
    >全部商品</div>
  </div>
</template>

<script>
export default {
  props: {
    tabType: {
      type: Number,
      default: 2
    }
  },

  data() {
    return {

    }
  },

  methods: {
    onClick(tabType) {
      this.$emit('tabchange', tabType);
    }
  }
};
</script>

<style lang="less" scoped>
.tab9 {
  z-index: 6;
  position: relative;
  display: flex;
  padding: 12px 20px 12px 20px;
  background-color: #fff;
  .tab-item {
    position: relative;
    color: #999999;
    font-size: 14px;
    margin-right: 20px;
    &.active {
      color: #FF8B1D;
      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        background: url("../../img/tab.png");
        width: 18px;
        height: 5px;
        background-size: 18px 5px;
        transform: translate(-50%, 0)
      }
    }
  }
}
</style>
