<template>
  <div class="market-header-voucher-list"  v-if="list.length">
    <template v-for="(item,index) in list">
      <newVoucher :key="index" :item="item" v-if="item.userScope === 1"></newVoucher>
      <storeVoucher :key="'a' + index" :item="item" v-else></storeVoucher>
    </template>
  </div>
</template>
<script >
import newVoucher from './new-voucher.vue';
import storeVoucher from './store-voucher.vue';
export default {
  components: {
    newVoucher,
    storeVoucher
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    };
  }
};
</script>
<style lang="less">
.market-header-voucher-list {
  z-index: 2;
  position: relative;
  width:100%;
  overflow:auto;
  -webkit-overflow-scrolling: touch;
  display:flex;
  padding:8px 0 1px 0;
  .mk-header-new-v,.mk-header-nor-v{
    margin-right:4px;
  }
  &:after{
    content:'';
    width:8px;
    height:8px;
    flex-shrink:0;
  }
}
</style>
