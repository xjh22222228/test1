<!-- 查看買贈商品 -->
<template>
  <van-popup
    v-model="showPopup"
    class="view-gift3"
    @close="onClose"
    position="bottom"
    get-container="body"
  >
    <div class="gift-box">
      <div class="header">
        <div class="title">{{ title }}</div>
        <svg-icon icon-class="icon_basic_mf_icon_message" class="close" @click.native="onClose" />
      </div>

      <div class="gift-scroll">
        <div class="gift-item1" v-for="item of giftProducts" :key="item.productId">
          <div class="left">贈</div>
          <div class="middle">{{ item.productName }}</div>
          <div class="right">×{{ item.__giftQuantity__ || item.giftQuantity || item.count }}</div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { Popup } from "vant";

export default {
  props: {
    // 标题
    title: {
      type: String,
      default: "買贈活動"
    }
  },

  components: {
    [Popup.name]: Popup
  },

  data() {
    return {
      showPopup: false,
      giftProducts: []
    };
  },

  watch: {
    showPopup(v) {
      // 隐藏购物车
      if (v) {
        this.$store.commit('marketSubmitBar', { show: false, overlay: false });
      } else {
        this.$store.commit('marketSubmitBar', { show: true, overlay: false });
      }
    }
  },

  methods: {
    open(giftProducts) {
      this.giftProducts = giftProducts || [];
      this.showPopup = true;
    },

    onClose() {
      this.showPopup = false;
    }
  }
};
</script>

<style lang="less">
@import "../../../../../assets/css/var.less";

.view-gift3 {
  border-radius: 12px 12px 0 0;
  height: 370px;
  .safePadding();
  .gift-box {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    height: 100%;
    overflow: hidden;
    .header {
      padding: 16px 12px 18px 12px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      .title {
        font-size: 16px;
        color: #333;
        font-weight: bold;
      }
      .close {
        width: 24px;
        height: 24px;
      }
    }
  }
  .gift-scroll {
    flex: 1;
    overflow: auto;
  }
  .gift-item1 {
    flex: 1;
    display: flex;
    border-top: .5px solid #F0F0F0;
    padding: 18px 12px;
    align-items: center;
    overflow-y: auto;
    .left {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgb(240, 146, 63);
      color: #fff;
      border-radius: 4px;
      font-size: 10px;
    }
    .middle {
      flex: 1;
      margin-left: 4px;
      font-size: 14px;
      color: #333;
      text-align: left;
    }
    .right {
      color: #333;
      font-size: 14px;
    }
  }
}
</style>
