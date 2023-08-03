<template>
  <div class="exchange-product2" id="exchange-product" v-if="products.length > 0">
    <float-window />

    <div class="title-bar">
      <img src="@/assets/images/icon_order_huangou.png" class="icon">
      <span class="title3">超值換購</span>
      <span class="tip-text"><span v-if="limitAmount">已滿MOP{{ limitAmount }}，</span>享受超值換購機會</span>
    </div>

    <!-- 暴露接口 -->
    <div class="expose"></div>

    <div class="product-list">
      <div class="item" v-for="(item, idx) of products" :key="item.productId">
        <div class="poster">
          <div class="tag">省MOP{{ item.saveMoneyAmount }}</div>
          <img :src="item.imgUrl" class="image" />
        </div>
        <div class="title-wrap">
          <div class="product-title ellipsis2">{{ item.productName }}</div>
          <div class="product-title">x1</div>
        </div>

        <div class="amount-box">
          <div class="left">
            <span class="unit">MOP</span>
            <span class="amount">{{ item.discountAmount == null ? item.price : item.discountAmount }}</span>
            <del class="del" v-if="item.discountAmount">MOP{{ item.price }}</del>
          </div>
          <div
            class="right"
            :style="{backgroundImage: item.checked ? `url(${checkedImage})` : undefined}"
            @click="onCheck(item, idx)"
          >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FloatWindow from "./float-window";

const checkedImage = require("@/assets/images/restaurant_radio_sel@2x.png");

export default {
  components: {
    FloatWindow
  },

  props: {
    submitLoading: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: undefined
    }
  },

  data() {
    return {
      checkedImage,
      limitAmount: null,
      products: []
    };
  },

  watch: {
    // 监听订单页面UI加载完成
    // 如果不这样监听会导致一进页面就看到换购，换购浮窗就不显示
    submitLoading(value) {
      if (!value) {
        this.getData();
      }
    },
    limit(value) {
      if (value != null) {
        this.getData();
      }
    }
  },

  methods: {
    getData(params) {
      if (this.limit == null) {
        return;
      }
      const storeId = this.$route.query.id;
      this.$store.dispatch("getExchangeProduct", {
        orderAmount: this.limit,
        storeId,
        ...params
      }).then(res => {
        if (res) {
          let exchangeProductIds = this.$route.query.exchangeProductIds;
          if (exchangeProductIds) {
            exchangeProductIds = exchangeProductIds.split(',');
          }
          const checkMap = {};
          if (Array.isArray(exchangeProductIds)) {
            exchangeProductIds.forEach(productId => {
              checkMap[productId] = true;
            });
          }
          this.limitAmount = res.limitAmount;
          this.products = (res.purchaseProductList || []).map(item => {
            if (checkMap[item.productId]) {
              item.checked = true;
            } else {
              item.checked = false;
            }
            return item;
          });
          this.triggerChecked();
        }
      });
    },

    triggerChecked() {
      const checkAll = this.products.filter(item => item.checked);
      this.$emit('change', checkAll);
    },

    onCheck(data, idx) {
      const isCheck = !data.checked;
      this.$set(this.products[idx], 'checked', isCheck);

      // 已选中的商品
      const checkAll = this.products.filter(item => item.checked);
      this.$emit('change', checkAll);

      this.$router.replace({
        name: this.$route.name,
        query: {
          ...this.$route.query,
          exchangeProductIds: checkAll.map(item => item.productId).join(',')
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.exchange-product2 {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 12px 11px 12px 12px;
  margin-top: 8px;
  .title-bar {
    display: flex;
    align-items: center;
    .icon {
      width: 16px;
      height: 16px;
    }
    .title3 {
      font-size: 16px;
      font-weight: bold;
      color: #333333;
      margin: 0 4px 0 3px;
    }
    .tip-text {
      font-size: 12px;
      color: #666666;
      line-height: 17px;
    }
  }
  .product-list {
    display: flex;
    margin-top: 16px;
    .item {
      width: 104px;
    }
    .item:not(:nth-last-child(1)) {
      margin-right: 8px;
    }
    .poster {
      width: 104px;
      height: 78px;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }
    .image {
      width: 104px;
      height: 78px;
      object-fit: cover;
    }
    .title-wrap {
      height: 40px;
      margin: 4px 0;
      overflow: hidden;
    }
    .tag {
      z-index: 3 !important;
      position: absolute;
      top: 0;
      left: 0;
      height: 16px;
      background: linear-gradient(135deg, #F77474 0%, #F93A4A 100%);
      border-radius: 8px 0px 8px 0px;
      font-size: 11px;
      color: #FFFFFF;
      line-height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .product-title {
      font-size: 14px;
      color: #333333;
      line-height: 20px;
      text-align: left;
    }
    .amount-box {
      display: flex;
      margin-top: 3px;
      padding-right: 4px;
      .left {
        position: relative;
        flex: 1;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        &::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 8px;
          background: linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
        }
        .unit {
          font-size: 8px;
          font-weight: bold;
          color: #F54747;
          line-height: 16px;
          vertical-align: baseline;
        }
        .amount {
          margin-left: 1px;
          font-size: 14px;
          font-weight: bold;
          color: #F54747;
          line-height: 22px;
        }
        .del {
          font-size: 8px;
          color: #999999;
          line-height: 16px;
        }
      }
      .right {
        width: 20px;
        height: 20px;
        background-image: url("~@/assets/images/restaurant_radio_nor@2x.png");
        background-size: 20px;
        background-repeat: no-repeat;
      }
    }
  }
}
</style>
