<template>
  <div
    class="recommend5"
    :class="{recommendBg: hasBg}"
  >
    <img v-if="data.image" :src="data.image" class="bg" />

    <div class="reheader">
      <div class="left">{{ data.name }}</div>
      <div class="right" @click="onClickViewAll(data)">
        查看全部<svg-icon icon-class="mf_icon_arrow_left_w" class="arrow" />
      </div>
    </div>

    <no-data v-if="products.length <= 0" content="暫無商品" />

    <div class="products23">
      <product-item
        v-for="item of products"
        :key="item.productId"
        :product="item"
        :show-subtract="false"
      />
    </div>
  </div>
</template>

<script>
import ProductItem from '../../../components/store-item/product-block/product-item.vue';
import NoData from '@/views/market/components/goods/no-data'

export default {
  components: {
    ProductItem,
    NoData
  },

  props: {
    storeId: String,
    data: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      products: []
    };
  },

  watch: {
    data: {
      immediate: true,
      handler() {
        this.getData();
      }
    }
  },

  computed: {
    // 是否有背景图片
    hasBg() {
      return this.data.image;
    }
  },
  methods: {
    // 查看全部
    onClickViewAll(data) {
      this.$emit('viewAll', { ...data, payloadType: 'recommend' })
    },

    // 获取商品数据
    getData() {
      this.products = [];
      if (!this.data.id || !this.storeId) {
        return;
      }

      this.$store.dispatch('getPosterProduct', {
        sort: 0, // 写死
        id: this.data.id,
        offset: 0,
        size: 6,
        storeId: this.storeId
      }).then(res => {
        this.products = res?.result || [];
      });
    }
  }
};
</script>

<style lang="less" scoped>
.recommend5 {
  position: relative;
  border-radius: 12px;
  background-color: #fff;
  padding: 12px;
  overflow: hidden;
  margin: 12px 12px 0 12px;
  &.recommendBg {
    &::after {
      display: none;
    }
  }
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(180deg, #FF8B1C 0%, rgba(255,255,255,0) 100%);
  }
  .bg {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  .reheader {
    z-index: 3;
    position: relative;
    display: flex;
    .left {
      flex: 1;
      text-align: left;
      font-size: 16px;
      color: #fff;
      font-weight: bold;
      width: 0;
      word-break: break-all;
    }
    .right {
      color: #fff;
      font-size: 12px;
      margin-left: 12px;
      .arrow {
        transform: rotate(180deg);
      }
    }
  }

  .no-data333 {
    position: relative;
    z-index: 3;
    padding-bottom: 30px;
  }

  .products23 {
    z-index: 3;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    /deep/.product {
      width: calc(33.33% - 8px);
      &:not(:nth-child(3n)) {
        margin-right: 12px;
      }
      .productItemBox {
        border-color: transparent;
        overflow: initial;
        margin-bottom: 0 !important;
      }
      .productItem {
        overflow: initial;
      }
      .poster-box {
        border: 1px solid #EDEDED;
        border-radius: 4px;
        background-color: #fff;
        height: 100px;
        width: 100px;
        .productImage {
          border-radius: 0 !important;
        }
      }
      .name {
        font-size: 11px !important;
        color: #333 !important;
        font-weight: normal !important;
      }
      .vip-tag2 {
        transform-origin: left bottom;
        transform: scale(.8);
        margin-top: 0;
      }
    }
  }
}
</style>
