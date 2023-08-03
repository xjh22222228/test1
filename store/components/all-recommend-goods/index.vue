<template>
  <van-popup
    get-container="body"
    v-model="visible"
    class="store-all-rec-goods"
    :overlay="false"
  >
    <div class="position-sticky">
      <div class="safe-head" :class="safeClassName"></div>
      <NavBar
        :title="title"
        className="type1"
        class="header-bar"
        backgroundColor="#fff"
        :back="onBack"
      ></NavBar>
    </div>
    <img :src="bannerUrl" alt="" class="banner" v-if="bannerUrl">
    <div class="content">
      <div class="filter" :class="deviceType">
        <div class="filter-item" :class="{ active: sortType === 0 }" @click="onFilter(0)">綜合</div>
        <div class="filter-item" :class="{ active: sortType === 1 }" @click="onFilter(1)">銷量</div>
        <div class="filter-item" :class="{ active: sortType === 2 }" @click="onFilter(2)">
          <div>價格</div>
          <div class="icon-group">
            <svg-icon icon-class="icon_system_triangle_down" :class="{ active: sortType === 2 && isPriceAsc, up: true}"></svg-icon>
            <svg-icon icon-class="icon_system_triangle_down" :class="{ active: sortType === 2 && !isPriceAsc, down: true }"></svg-icon>
          </div>
        </div>
      </div>
      <div class="goods-list">
        <goods-group
          ref="allGoods"
          v-slot:default="{list, loading, next}"
          :http="getData"
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
  </van-popup>
</template>

<script>
import { Popup } from 'vant';
import NavBar from '@/components/2.0.0/nav'
import GoodsGroup from '@/views/market/components/goods/group/index.vue';
import ProductItem from '@/views/market/components/store-item/product-block/product-item.vue';
import NoData from '@/views/market/components/goods/no-data'
import mf from '@/JS/mFoodSDK'
import { debounce } from 'lodash'

export default {
  components: {
    [Popup.name]: Popup,
    NavBar,
    GoodsGroup,
    ProductItem,
    NoData
  },
  data() {
    return {
      // 是否升序
      isPriceAsc: true,
      sortType: 0,
      visible: false,
      deviceType: mf.originalDeviceType,
      id: null,
      storeId: null,
      classifyId: null,
      actionName: '',
      bannerUrl: '',
      title: ''
    }
  },
  computed: {
    safeClassName() {
      return this.utils.getSafeTopClassName('padding')
    }
  },
  methods: {
    show(data) {
      this.visible = true
      this.sortType = 0
      this.isPriceAsc = true
      const { id, name, payloadType, classifyId, storeId, image } = data
      this.id = id
      this.storeId = storeId
      this.title = name
      this.bannerUrl = ''
      switch (payloadType) {
        // 推荐模块商品接口
        case 'recommend':
          this.actionName = 'getPosterProduct'
          break
        // 广告商品接口
        case 'ad':
          this.actionName = 'getPosterAdProduct'
          this.classifyId = classifyId
          this.bannerUrl = image
          break
        default:
          break
      }
      this.$nextTick(() => {
        this.$refs?.allGoods.reset(true)
        setTimeout(() => {
          this.$refs?.allGoods.observerPagination()
        }, 100)
      })
    },
    close() {
      this.onBack()
    },
    onBack() {
      this.visible = false
      this.classifyId = null
    },
    getData(params) {
      return this.$store.dispatch(this.actionName, {
        storeId: this.storeId || this.$route.query.id,
        classifyId: this.classifyId,
        sort: this.getSort(),
        id: this.id,
        ...params
      })
    },
    // 0：综合 1：销量 2：价格升序 3：价格降序
    getSort() {
      if (this.sortType === 2) {
        return this.isPriceAsc ? 2 : 3
      }
      return this.sortType
    },
    onFilter: debounce(function (type) {
      if (this.sortType === 2 && type === 2) {
        this.isPriceAsc = !this.isPriceAsc
      } else {
        if (type === this.sortType) {
          return
        }
      }
      this.sortType = type
      this.$refs?.allGoods.reset(true)
      this.$nextTick(() => {
        this.$refs?.allGoods.observerPagination()
      })
    }, 500, {
      leading: true
    })
  },
  activated() {
    this.close()
  }
};
</script>

<style lang="less" scoped>
.store-all-rec-goods {
  width: 100%;
  height: 100%;
  z-index: 2000 !important;
  .safe-head {
    background-color: #fff;
  }
  .banner {
    width: 375px;
    height: 125px;
    margin: 0 auto;
  }
  .filter {
    position: sticky;
    top: 44px;
    z-index: 99;
    &.ios {
      top: calc(44px + var(--ios-safe-top));
    }
    &.android {
      top: calc(44px + var(--android-safe-top));
    }
    left: 0;
    width: 100%;
    height: 44px;
    background: #FFF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .filter-item {
      width: 33%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #666;
      font-size: 16px;
      position: relative;
      &.active {
        color: #333;
        font-weight: bold;
        &::after {
          content: '';
          width: 16px;
          height: 2px;
          background: linear-gradient(144deg, #FF951D 0%, #FF8B1D 100%);
          border-radius: 1px;
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translate(-50%, -4px);
        }
      }
      .icon-group {
        color: #999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .svg-icon {
          font-size: 7px;
          margin-left: 5px;
          &.active {
            color: #FF8B1C;
          }
          &.up {
            // 使左右内边距与down图标相同
            transform: rotate(180deg) scaleX(-1);
          }
        }
      }
    }
  }
  .goods-list {
    padding: 8px 12px;
    position: relative;
    min-height: 300px;
    padding-bottom: 150px;
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
