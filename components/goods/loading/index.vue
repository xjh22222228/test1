<template>
  <div class="loading3333">{{ content }}</div>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      default: '加載中...'
    }
  },

  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.loading3333 {
  width: 100%;
  text-align: center;
  font-size: 11px;
  line-height: 16px;
  color: #cecece;
  padding: 12px 0;
}
</style>
