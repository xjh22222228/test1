<template>
  <div class="search-product-in-list">
    <div class="out-box" v-if="!list.length &&!loading">
      <img :src="empty" class="out-icon"/>
    </div>
    <product-item
      @showProduct="goMarketProduct"
      :item="product"
      :key="product.id"
      v-for="product in list"
    ></product-item>
    <!-- 下方購物車 -->
    <bottom-cart v-if="showPop" @onSubmit="onSubmit('storeSearch')"></bottom-cart>
  </div>
</template>

<script>
import BottomCart from "@/views/market/components/store-item/bottom-cart";
import productMixins from "@/views/market/store/mixis/product";
import productItem from "./productItem.vue";
import empty from '@/views/market/search/img/out.png';
export default {
  mixins: [productMixins],
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    productItem,
    BottomCart
  },
  data() {
    return {
      empty
    };
  },
  computed: {
    showPop() {
      const path = this.$route.path;
      return path == '/market/storeSearch';
    }
  }
};
</script>
<style lang='less' scoped>
/*.product-list{*/
/*  background: #F5F5F7;*/
/*  padding:12px;*/
/*}*/
  .search-product-in-list{
    .out-box{
      img{
        width: 136px;
      }
    }
  }
</style>
