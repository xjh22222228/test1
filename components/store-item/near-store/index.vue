<template>
  <van-popup class="popup-out2" position="bottom" get-container="body" closeable v-model="status" title=" " @closed="hide">
    <div class="content">
      <div class="head">
        <div class="title">門店已打烊</div>
        <van-image class="closeIcon" :src="closeIcon" width="130" />
        <div v-if="showTips">
          <span class="tips">為您推薦附近相似好店</span>
        </div>
      </div>

      <NearList ref="NearList"  @show="showTips = true"></NearList>
    </div>
  </van-popup>
</template>

<script>
import { Popup, Image as VanImage, Icon } from "vant";
import NearList from './list';
export default {
  components: {
    [Popup.name]: Popup,
    [VanImage.name]: VanImage,
    [Icon.name]: Icon,
    NearList
  },
  data() {
    return {
      closeIcon: require("./close-store@2x.png"),
      status: false,
      showTips: false
    };
  },
  methods: {
    show() {
      if (this.$route.name !== 'marketStore') {
        return;
      }
      this.$store.commit('marketSubmitBar', { show: false });
      this.status = true;
      this.showTips = false;
      this.$nextTick(() => {
        this.$refs.NearList.getData();
      });
    },
    hide() {
      this.status = false;
      this.$store.commit('marketSubmitBar', { show: true });
    }
  }
};
</script>

<style lang='less' scoped>
.popup-out2 {
  border-radius: 12px 12px 0px 0px;
  .title {
    color: #191919;
    text-align: center;
    font-weight: bold;
    font-size: 17px;
    padding: 16px 0 12px;
  }
  .msg-wrap {
    display: flex;
    margin-top: 12px;
    padding: 0 20px;
    justify-content: center;
  }
}
.flex {
  display: flex;
}
.flex-sb {
  display: flex;
  justify-content: space-between;
}
.ai-center {
  align-items: center;
}
.mg-b-5 {
  margin-bottom: 5px;
}
.content {
  .head {
    text-align: center;
  }
  .closeIcon {
    margin: 40px 0 22px;
  }
  .tips {
    color: #cecece;
    font-size: 12px;
    position: relative;
    &::before,
    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 46px;
      height: 1px;
      top: 50%;
      background: #cecece;
    }
    &::before {
      margin-right: 1em;
      right: 100%;
    }
    &::after {
      margin-left: 1em;
      left: 100%;
    }
  }
}
</style>
