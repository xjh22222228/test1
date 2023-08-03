<template>
  <div class="no-data333">
    <img src="../img/no-data.png" />
    <div class="no-txt">{{ content }}</div>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      default: "附近暫無可配送門店，切換地址試下啦~"
    }
  },

  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.no-data333 {
  width: 100%;
  margin-top: 35px;
  text-align: center;
  img {
    width: 102px;
  }
  .no-txt {
    margin-top: 6px;
    color: #666;
    font-size: 14px;
  }
}
</style>
