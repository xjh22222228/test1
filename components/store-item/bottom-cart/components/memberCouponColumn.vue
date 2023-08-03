<template>
  <div class="full-wrap">
    <div class="l">
      <div class="tag">券</div>
      <div class="text">
        你有該門店的商品券 <span class="primary">{{ marketMemberCoupon.length }}</span> 張
      </div>
    </div>
    <div @click="$emit('showCoupon')" class="primary">去看看 <van-icon color="#FF8B1D" name="arrow" /></div>
  </div>
</template>

<script>
import { Icon } from "vant";
export default {
  components: {
    [Icon.name]: Icon
  },
  data() {
    return {};
  },
  computed: {
    marketMemberCoupon() {
      return this.$store.getters.marketMemberCoupon
    }
  },

  mounted() {},

  methods: {}
};
</script>
<style lang="less" scoped>
.full-wrap {
  background: #fef1ea;
  display: flex;
  align-items: center;
  padding: 5px 12px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  font-weight: 400;
  font-size: 12px;
  .l {
    display: flex;
    align-items: center;
    .tag {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 4px;
      font-size: 8px;
      color: #fff;
      border-radius: 4px;
      background: #ff8d20;
      margin-right: 9px;
    }
    .text {
      color: #333;
    }
  }

  .primary {
    color: #ff8b1d;
  }
}
</style>
