<template>
  <div class="nsale-text3" v-if="isNoSale()" @click.stop="onClick">
    {{ data.availableTime }}
    <span class="sale-icon"></span>
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
.nsale-text3 {
  font-size: 12px;
  color: #FF8B1C;
  display: flex;
  align-items: center;
  .sale-icon {
    display: inline-block;
    margin-left: 2px;
    width: 16px;
    height: 16px;
    background: url("./icon-black.png");
    background-size: 16px;
  }
}
</style>
