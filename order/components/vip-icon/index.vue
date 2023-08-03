<template>
  <span>
    <img src="~/views/activity/h5/components/vip-tag/img/vip1.png" class="icon18" v-if="memberLevel === 1" />
    <img src="~/views/activity/h5/components/vip-tag/img/vip2.png" class="icon18" v-else-if="memberLevel === 2" />
    <img src="~/views/activity/h5/components/vip-tag/img/vip3.png" class="icon18" v-else-if="memberLevel === 3" />
    <img src="~/views/activity/h5/components/vip-tag/img/vip4.png" class="icon18" v-else-if="memberLevel === 4" />
  </span>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    // 会员等级
    memberLevel() {
      return this.$store.state.marketHome.memberLevelInfo?.marketCardLevel;
    }
  }
};
</script>

<style lang="less" scoped>
.icon18 {
  width: 18px;
  height: 18px;
  margin-right: 3px;
  vertical-align: middle;
}
</style>
