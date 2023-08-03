<template>
  <transition name="fademfood">
    <div class="exchange-float-window" v-show="discountProduct && show">
      <div class="float-window09" @click="onScrollLocation">
        <div class="left">MOP{{ discountProduct.discountAmount == null ? discountProduct.price : discountProduct.discountAmount }}</div>
        <div class="middle">換購「MOP{{ discountProduct.price }} <span class="product-name">{{ discountProduct.productName }}</span><span class="right-frame">」</span></div>
        <div class="right"></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      observerInstance: null,
      show: false
    };
  },

  computed: {
    exchangeProduct() {
      return this.$store.state.storePreferre.exchangeProduct;
    },
    products() {
      return this.exchangeProduct.purchaseProductList || [];
    },
    // 找到折扣最高的商品
    discountProduct() {
      return this.products[0];
    }
  },

  mounted() {
    if (!this.$route.query.exchangeProductIds) {
      this.$nextTick(() => {
        this.initVisibile();
      });
    }
  },

  destroyed() {
    this.destroy();
  },

  methods: {
    destroy() {
      if (!this.observerInstance) {
        return;
      }
      this.observerInstance.disconnect();
      this.observerInstance = null;
    },

    initVisibile() {
      const el = document.querySelector("#exchange-product .expose");
      if (!el) {
        return;
      }

      this.observerInstance = new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio <= 0) {
          this.show = true;
          return;
        }
        this.show = false;
        this.destroy();
      });
      this.observerInstance.observe(el);
    },

    // 定位到超值换购
    onScrollLocation() {
      const el = document.getElementById("exchange-product");
      if (!el) {
        return;
      }
      const res = el.getBoundingClientRect().top;
      const scrollEl = document.querySelector('.containRadius');
      if (scrollEl) {
        scrollEl.scrollTo({
          top: res,
          behavior: 'smooth'
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.exchange-float-window {
  z-index: 9;
  position: fixed;
  bottom: 74px;
  left: 12px;
  right: 12px;
  height: 38px;
  display: flex;
  justify-content: center;
  white-space: nowrap;
  .float-window09 {
    position: absolute;
    min-width: 208px;
    max-width: 100%;
    height: 100%;
    padding: 0 20px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    .left {
      font-size: 14px;
      font-weight: bold;
      color: #F54747;
    }
    .middle {
      position: relative;
      margin: 0 4px 0 8px;
      padding-right: 10px;
      color: #fff;
      font-size: 12px;
      color: #FFFFFF;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
      .right-frame {
        position: absolute;
        right: -2px;
        top: 0;
      }
      .product-name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .right {
      width: 16px;
      height: 16px;
      background-image: url("./down.png");
      background-size: 16px;
      background-repeat: no-repeat;
      overflow: hidden;
    }
  }
}
</style>
