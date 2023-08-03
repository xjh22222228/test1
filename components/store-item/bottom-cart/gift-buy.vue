<!-- 买赠继续加购页面，只呈现买N送N -->
<template>
  <van-popup
    :safe-area-inset-bottom="true"
    :value="showPopup"
    position="right"
    class="giftBuy2"
    :overlay="false"
    get-container="body"
  >
    <div class="mk-full-parent">
       <div class="position-sticky">
        <nav-bar title="買贈活動" className="type1" background-color="#fff" :allway-show="true" :delta="true" :back="onBack" :class="safeClass" />
      </div>

      <div class="cls-container">
        <div class="cls-box">
          <div
            class="cls-item"
            :class="{active: item.buyGiftId == buyGiftId}"
            v-for="item of marketGiftBuyList"
            :key="item.buyGiftId"
            @click="onChangeGift(item)"
          >
            <div class="title">{{item.buyGiftName.length > 5 ? `${item.buyGiftName.slice(0, 5)}...` : item.buyGiftName}}</div>
            <div class="tag">{{getGiftText(item)}}</div>
          </div>
        </div>
      </div>

      <div class="main-title" v-if="lastLimit">買{{ lastLimit.limitQuantity }}件送贈品 ({{ dataList.length }})</div>
      <div class="gtitle" v-if="currentData">
        <!-- 用户参与达到上限 -->
        <div class="left" v-if="currentData.isLimitJoin">
          當前活動已達參與上限，請留意門店其他買贈活動吧
        </div>

        <!-- 未達到門檻 -->
        <div class="left" v-else-if="!currentData.ok">
          以下活動買<span>{{ currentData.limitQty }}</span>件目前還缺<span>{{ currentData.diffQty }}</span>件送贈品
        </div>

        <!-- 達到門檻並且沒有下一階梯 -->
        <div class="left" v-if="currentData.ok && !currentData.next">
          已經達到活動門檻可送贈品
        </div>

        <!-- 达到了门槛 还有下一级门槛 -->
        <div class="left" v-if="currentData.ok && currentData.next">
          以下活動再買<span>{{ currentData.diffQty }}</span>件，可獲得其他贈品
        </div>

        <div class="right" @click="onViewGift" v-if="gifts.length > 0 && !currentData.isLimitJoin">
          查看贈品<svg-icon icon-class="ic_arrow_right" class="arrow" />
        </div>
      </div>
      <div class="warn" v-if="lastLimit && !lastLimit.isWhatever">* 買同一商品達到{{ lastLimit.limitQuantity }}件才送贈品</div>

      <div class="mk-pro-class2">
        <full-product
          v-for="(item, idx) of dataList"
          :key="item.productId"
          :source="item"
          :end="idx + 1 === dataList.length"
        />
      </div>
    </div>

    <view-gift-popup ref="viewGift" />
  </van-popup>
</template>

<script>
import { Popup } from "vant";
import NavBar from '@/components/2.0.0/nav';
import utils from '@/JS/utils';
import fullProduct from './full-product.vue';
import event from '@/JS/event';
import ViewGiftPopup from './view-gift-popup';

export default {
  components: {
    NavBar,
    ViewGiftPopup,
    fullProduct,
    [Popup.name]: Popup
  },
  data() {
    return {
      showPopup: false,
      buyGiftId: '',
      safeClass: utils.getSafeTopClassName('padding'),
    };
  },
  activated() {
    // 每次进来设置关闭
    // this.showPopup = false;
    event.$on('marketGiftContinueBuy', buyGiftId => {
      const isExistId = this.marketGiftBuyList.some(item => item.buyGiftId === buyGiftId);
      // 找不到ID，直接取第一个活动
      if (!isExistId && this.marketGiftBuyList.length > 0) {
        buyGiftId = this.marketGiftBuyList[0].buyGiftId;
      }
      this.open(buyGiftId);
      // 关闭满减满折继续加购弹窗
      this.$store.commit('marketShowFullList', false);
    });
    event.$on('marketGiftContinueBuyClose', this.onBack);
  },
  deactivated() {
    event.$off('marketGiftContinueBuy');
    event.$off('marketGiftContinueBuyClose');
  },
  computed: {
    // 只显示买N送N
    marketGiftBuyList() {
      return this.$store.state.marketStore.marketGiftBuyList
        .filter(item => item.buyGiftType === 2);
    },

    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart;
    },

    merchantProductMaps() {
      return this.$store.state.marketStore.marketMerchantProductMaps;
    },

    // 当前选中的活动
    currentData() {
      const data = this.marketGiftBuyList.find(item => item.buyGiftId === this.buyGiftId);
      return data;
    },

    // 最小门槛
    lastLimit() {
      if (this.currentData) {
        return this.currentData.limits[this.currentData.limits.length - 1];
      }
      return null;
    },

    // 参与的商品列表
    dataList() {
      if (this.currentData) {
        const ids = this.currentData.buyProduct?.merchantProductIds || [];
        const products = [];
        ids.forEach(id => {
          if (this.merchantProductMaps[id]) {
            const cartData = this.marketShoppingCart.find(c => c.merchantProductId === id);
            products.push({
              ...this.merchantProductMaps[id],
              ...cartData
            });
          }
        });
        return products;
      }
      return [];
    },

    // 当前门槛赠送商品
    gifts() {
      return this.currentData?.buyGiftProducts || []
    }
  },

  methods: {
    open(id) {
      this.showPopup = true;
      this.buyGiftId = id;
    },

    onBack() {
      this.showPopup = false;
    },

    getGiftText(data) {
      return `買${data.limits[data.limits.length - 1].limitQuantity}件送贈品`
    },

    onChangeGift(data) {
      this.buyGiftId = data.buyGiftId;
    },

    // 查看赠送商品列表
    onViewGift() {
      if (!this.$refs.viewGift) {
        return;
      }
      this.$refs.viewGift.open(this.gifts);
    }
  }
};
</script>

<style lang="less">
.giftBuy2 {
  width: 100%;
  height: 100%;
  z-index: 2000 !important;
  .mk-full-parent{
    position: relative;
    height:100%;
    padding-bottom:120px;
    display:flex;
    flex-direction :column;
    .mk-pro-class2{
      flex: 1;
      overflow: auto;
      margin-top: 12px;
      div[role="listitem"]:nth-last-child(1) {
        .mk-full-data {
          border-bottom-color: transparent;
        }
      }
    }
  }
  .main-title {
    padding: 12px 0 4px 12px;
    color: #333;
    font-size: 16px;
    font-weight: bold;
  }
  .gtitle {
    display: flex;
    padding: 0 12px 0 12px;
    .left {
      flex: 1;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 0;
      padding-right: 8px;
      span {
        margin: 0 2px;
        color: #FF8B1C;
      }
    }
    .right {
      color: #666;
      font-size: 11px;
      display: flex;
      align-items: center;
      .arrow {
        width: 11px;
        height: 11px;
      }
    }
  }
  .warn {
    margin: 0 0 12px 12px;
    color: #999;
    font-size: 12px;
  }
  .cls-container {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 76px;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFFFFF 100%);
      pointer-events: none;
    }
  }
  .cls-box {
    position: relative;
    padding: 12px 0;
    display: flex;
    overflow: hidden;
    overflow-x: auto;
    white-space: nowrap;
    border-bottom: .5px solid #F0F0F0;
    .cls-item {
      position: relative;
      padding: 0 12px;
      text-align: center;
      &:not(&:nth-last-child(1))::after {
        content: "";
        position: absolute;
        top: 10px;
        right: 0;
        width: 1px;
        height: 19px;
        background-color: #F0F0F0;
      }
      &.active {
        .title {
          color: #FF8B1C;
        }
        .tag {
          background: #FF8B1C;
          color: #fff;
        }
      }
    }
    .title {
      font-size: 14px;
      color: #333;
      font-weight:bold;
    }
    .tag {
      margin-top: 2px;
      padding: 0 8px;
      color: #999999;
      font-size: 12px;
      height: 17px;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
