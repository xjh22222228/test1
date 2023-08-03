<template>
  <div class="mdownload2">
    <nav-bar :title="titleLabel" className="type1" background-color="#fff" v-if="!isAliPay" />
    <div :class="`content ${isMPay?'mpbg':''}`"></div>
  </div>
</template>

<script>
import NavBar from '@/components/2.0.0/nav';
import mf from "@/JS/mFoodSDK";

export default {
  components: {
    NavBar
  },
  data() {
    return {
      isAliPay: mf.isAliPay,
      isMPay: mf.isMPay
    };
  },
  computed: {
    titleLabel() {
      return this.isMPay ? 'mFood超市' : '下載mFood App';
    }
  },
  mounted() {
    this.$toast.clear();
    document.title = this.titleLabel;
  }
};
</script>

<style lang="less" scoped>
.mdownload2 {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .content {
    flex: 1;
    background-image: url("./bg.jpg");
    background-size: 100%;
    &.mpbg{
      background-image: url("./mpbg.jpg");
    }
  }
}
</style>
