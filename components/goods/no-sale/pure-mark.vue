<template>
  <div class="nosale2" v-if="isNoSale()">
    <div class="nosaletxt">不可售</div>
  </div>
</template>

<script>
import { isNoSale } from './utils';

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
    isNoSale() {
      return isNoSale(this.data);
    }
  }
};
</script>

<style lang="less" scoped>
.nosale2 {
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    .nosaletxt {
      border-radius: 11px;
      background-color: rgba(0,0,0,0.5);
      padding: 1px 11px 1px 12px;
      font-size: 14px;
      color: #fff;
    }
  }
</style>
