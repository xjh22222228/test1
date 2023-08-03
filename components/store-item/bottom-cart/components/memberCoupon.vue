<template>
  <div v-if="length > 0">
    <div @click="$emit('showCoupon')" class="market-member-coupon-btn">
      <span class="num">{{ length }}</span>
      <span>張商品券</span>
      <svg-icon icon-class="mf_icon_arrow_right_3" class="icon" />
    </div>
  </div>
</template>

<script>
import { Icon } from "vant";
export default {
  components: {
    [Icon.name]: Icon
  },
  data() {
    return {
    };
  },
  computed: {
    length() {
      return this.marketMemberCoupon.length;
    },
    marketMemberCoupon() {
      return this.$store.getters.marketMemberCoupon
    }
    // couponList() {
    //   return [

    //   ];
    // }
  },

  mounted() {},

  methods: {}
};
</script>
<style lang="less">
.market-member-coupon-dialog {
  text-align: left;
  .van-dialog__header {
    padding-top: 18px;
    font-weight: 600;
    color: #191919;
  }
  .van-dialog__content {
    padding: 12px 20px 0;
    p {
      margin-bottom: 16px;
    }
  }
  .van-button__text {
    color: #fff;
  }
}

.market-member-coupon-btn {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  border: 1px solid #fa6c17;
  margin: 0 0 0 auto;
  padding: 5px 10px 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #333333;
  .num {
    color: #fa6c17;
    margin-right: 2px;
  }
  .icon {
    color: #000;
    font-size: 12px;
    margin-left: 2px;
    margin-top: 2px;
  }
}
</style>
