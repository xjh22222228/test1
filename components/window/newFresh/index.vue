<template>
<van-popup get-container="#pop-main"
           :value.sync="showState"
           class="mk-new-fresh-class z-index-2002"
           @click-overlay="close"
           overlay-class="z-index-2002">
  <van-image v-show="showState"
             fit="contain"
             lazy-load
             @click="goNew"
             :src="marketNewFreshData.imgUrl" > </van-image>
  <div class="svg"  v-show="showState">
    <div class="empty-class" @click="close"></div>
    <div @click.prevent="close" class="close-box">
    <img class="icon_popup_exit_w"  :src="exitImg"/>
    </div>
    <div class="empty-class" @click="close"></div>
  </div>
</van-popup>
</template>

<script>
import exitImg from '@/assets/images/icon_popup_exit_w@2x.png';
import { Popup, Image as VanImage } from "vant";
export default {
  components: {
    [Popup.name]: Popup,
    [VanImage.name]: VanImage
  },
  data() {
    return {
      state: false,
      exitImg
    };
  },
  computed: {
    fullPath() {
      return this.$route.path;
    },
    showState: function () {
      const full = this.fullPath;
      const state = this.state;
      const show = state && full.startsWith('/market/index');
      return show;
    },
    marketNewFreshData() {
      return this.$store.getters.marketNewFreshData;
    },
    marketShowIndex() {
      return this.$store.getters.marketShowIndex;
    }
  },
  watch: {
    marketShowIndex(nv, ov) {
      if (nv.length && nv[0] === "newFresh") {
        this.state = true;
      } else {
        this.state = false;
      }
    }
  },
  methods: {
    goNew() {
      this.$router.push('/market/new');
      this.close();
    },
    async initData() {
      const { dispatch } = this.$store;
      await dispatch("marketNewFreshWindow");
    },
    nextTimeShow() {
      this.close();
    },
    close() {
      this.state = false;
      this.$store.commit("marketRemoveShowIndex", "newFresh");
    },
  }
};
</script>
<style lang="less">
.z-index-2002{
  z-index:2002!important;
}
.mk-new-fresh-class {
  width: 295px;
  display: flex;
  flex-flow: column;
  align-items: center;
  background-color: inherit;

  .van-image{
    border-radius: 12px;
    overflow: hidden;
  }
  &.van-popup{
    background: #FFFFFF00;
  }
  .svg {
    padding-top: 20px;
    position: relative;
    height: 65px;
    width: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .empty-class{
      width: calc(50% - 25px);height: 100%;
    }
    .close-box{
      //height: 30px;
      width: 50px;
    }
    //&::after {
    //  top: 0;
    //  left: 50%;
    //  height: 30px;
    //  content: ' ';
    //  opacity: 0.6;
    //  margin-left: -1px;
    //  position: absolute;
    //  border-right: 2px solid #ffffff;
    //}
  }

  .icon_popup_exit_w {
    width: 40px !important;
    height: 40px !important;
    font-size:40px;
  }

  .van-image {
    width: 100%;
    height: auto;
    overflow: hidden;
  }
}
</style>
