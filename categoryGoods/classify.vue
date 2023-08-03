<template>
  <div class="class-two" v-show="dataList.length > 0">
    <div class="class-box">
      <div class="citem" :class="{active: selectedIdx === -1}" @click="onClick(null, -1)">
        全部
      </div>
      <div
        class="citem"
        v-for="(item, idx) of dataList"
        :class="{active: selectedIdx === idx}"
        :key="item.classifyId"
        @click="onClick(null, idx)"
      >
        {{ item.classifyName }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    selectedIdx: {
      type: Number,
      default: -1
    }
  },

  methods: {
    onClick(pIdx, idx) {
      this.$emit('click', pIdx, idx);
    }
  }
};
</script>

<style lang="less" scoped>
.class-two {
  padding: 0 10px 0 12px;
  .class-box {
    background-color: #fff;
    border-radius: 12px;
    padding: 11px 0 0 11px;
    display: flex;
    flex-wrap: wrap;
    .citem {
      margin-bottom: 12px;
      background-color: #F5F5F7;
      border-radius: 14px;
      color: #333333;
      font-size: 12px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      margin-right: 16px;
      &.active {
        background-color: #FEF7F3;
        color: #FF8B1C;
      }
    }
  }
}
</style>
