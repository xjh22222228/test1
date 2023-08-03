<template>
  <div class="goods12">
    <div class="tab-list" v-if="tabList && tabList.length">
      <div
        class="tab-item"
        :class="{ active: item.id === currentTabId }"
        v-for="item in tabList"
        :key="item.id"
        @click="onTabClick(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="goods-list">
      <goods-group
        ref="goods"
        v-slot:default="{list, loading, next}"
        :http="getGoodsData"
        :init="false"
        :immediate="false"
      >
        <product-item
          v-for="item of list"
          :key="item.productId"
          :product="item"
          class="goods-item9 goods-product"
        />
        <no-data v-if="list.length <= 0 && !loading && !next" content="暫無商品" class="no-data" />
      </goods-group>

    </div>
  </div>
</template>

<script>

import GoodsGroup from '@/views/market/components/goods/group/index.vue';
import ProductItem from '@/views/market/components/store-item/product-block/product-item.vue';
import NoData from '@/views/market/components/goods/no-data';
import { debounce } from 'lodash';

export default {
  components: {
    GoodsGroup,
    ProductItem,
    NoData
  },
  data() {
    return {
      tabList: [],
      currentTabId: null
    };
  },
  mounted () {
    this.initData()
  },
  methods: {
    async initData() {
      await this.getPosterClassifyList()
      this.$refs.goods.getData()
    },
    // 获取栏目配置
    async getPosterClassifyList() {
      return this.$store.dispatch('getPosterClassifyList', {
        storeId: this.$route.query.id,
        type: 2
      }).then(res => {
        this.tabList = res || []
        if (this.tabList.length) {
          this.currentTabId = this.tabList[0].id
        }
      })
    },
    // 获取选中栏目下的商品
    getGoodsData(params) {
      return this.$store.dispatch('getPosterProduct', {
        storeId: this.$route.query.id,
        id: this.currentTabId,
        ...params
      })
    },
    onTabClick: debounce(async function ({ id }) {
      if (this.currentTabId === id) return
      this.currentTabId = id
      this.$refs.goods.reset(true)
      setTimeout(() => {
        this.$refs.goods.observerPagination()
      }, 100);
    }, 500, {
      leading: true
    })
  }
};
</script>

<style lang="less" scoped>
.goods12 {
  width: 100%;
  margin-top: 12px;
  .tab-list {
    width: 100%;
    height: 44px;
    background: #FFFFFF;
    border-radius: 8px 8px 0px 0px;
    display: flex;
    flex-wrap: nowrap;
    overflow-y: auto;
    justify-items: center;
    padding: 0 12px;
    .tab-item {
      position: relative;
      padding: 4px 12px;
      font-size: 14px;
      font-weight: 400;
      color: #999;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      &.active {
        font-weight: bold;
        color: #FF8B1D;
        &::after {
          content: "";
          position: absolute;
          bottom: 3px;
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
  .goods-list {
    padding: 8px 12px;
    position: relative;
    min-height: 300px;
  }
  .no-data {
    z-index: 3;
    margin: 100px 0 10px 0;
    text-align: center;
    img {
      width: 122px;
      height: 90px;
    }
    p {
      margin-top: 12px;
      color: #999;
      font-size: 12px;
    }
  }
  .goods-product {
    ::v-deep .productItemBox {
      background: #fff;
      margin-bottom: 0;
      .productItem {
        .poster-box .productImage {
          background-size: cover;
        }
        .info {
          padding: 8px;
        }
      }
    }
  }
}
</style>
