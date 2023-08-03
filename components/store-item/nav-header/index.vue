<template>
<div class="market-store-nav-header" :style="appHeaderStyle">
  <div class="market-store-nav-header-parent" :style="headerStyle">
    <slot name="left">
      <div v-if="!isAliPay&&!isShare" class="market-store-left" @click.stop="back">
        <svg-icon icon-class="mf_icon_arrow_left_b2" class="size" />
      </div>
    </slot>
    <slot name="mid" v-if="!isShare">
      <div class="market-store-mid-input"></div>
    </slot>
    <slot name="right" v-if="!isShare">
      <div class="market-store-right" >
        <svg-icon icon-class="icon_system_collect_b" class="size"></svg-icon>
        <svg-icon icon-class="icon_system_share_b" class="size"></svg-icon>
      </div>
    </slot>
  </div>
</div>
</template>

<script>
import mf from '@/JS/mFoodSDK';
export default {
  name: "nav-header",
  props: {
    headerStyle: {
      type: [Object, String],
      default: () => ({})
    }
  },
  data() {
    return {
      isAliPay: mf.isAliPay
    };
  },
  computed: {
    appHeaderStyle() {
      const safeTop = this.$store.state.marketHome.appSafeTop;
      return {
        paddingTop: safeTop + 'px'
      };
    },
    isShare() {
      return this.$route.query.isShare;
    }
  },
  methods: {
    back() {
      if (this.$listeners.back) {
        this.$emit('back');
      } else {
        this.$store.dispatch('goBack');
      }
    }
  }
};
</script>

<style lang="less" >
.market-store-nav-header{
  z-index: 33;
  position: sticky;
  top: 0;
  width: 100%;
  >.market-store-nav-header-parent{
    display: flex;
    align-items: center;
    padding: 9px 16px 9px 0;
    position: relative;
    .size{
      width: 9px;
      height: 16px;
    }
    .market-store-left{
      margin-left: 12px;
      width: 24px;
      height: 24px;
      padding-top: 3px;
    }
    .market-store-mid-input{
      margin:0 0 0 9px ;
      flex:1;
      background: #FFFFFF;
      height: 32px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      padding: 0 9px;
      color: #999999;
      font-size: 14px;
      .search-icon{
        width: 18px;
        height: 18px;
      }
      &.active{
        background: #F5F5F7;
      }
    }
    .market-store-right{
      display: flex;
      align-items: center;
      padding: 0 14px 0 12px;
      >.size{
        margin-right: 10px;
      }
      >.size:last-child{
        margin-right: 0px;
      }
    }
  }
}
</style>
