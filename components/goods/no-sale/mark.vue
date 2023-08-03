<template>
  <div class="nosale01" v-if="isNoSale()">
    <div class="nosalebox" @click.stop="onClick">
      {{ data.availableTime }}
      <span class="no-icon"></span>
    </div>
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

  methods: {
    isNoSale() {
      return isNoSale(this.data);
    },

    onClick() {
      this.$emit('click');
      const { commit } = this.$store;
      commit('storeTakeoutTimeData', this.data?.saleTime);
      commit('storeTakeoutTimeState', true);
    }
  }
};
</script>

<style lang="less" scoped>
.nosale01 {
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, .8);
  display: flex;
  align-items: center;
  justify-content: center;
  .nosalebox {
    background-color: rgba(0, 0, 0, .5);
    font-size: 12px;
    color: #fff;
    padding: 3px 4px 2px 8px;
    display: flex;
    align-items: center;
    border-radius: 11px;
    .no-icon {
      display: inline-block;
      margin-left: 2px;
      width: 16px;
      height: 16px;
      background: url("./icon.png");
      background-size: 16px;
    }
  }
}
</style>
