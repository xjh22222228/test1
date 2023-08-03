<template>
  <div >
    <van-popup
      v-model="state"
      get-container="body"
      closeable
      position="bottom"
      class="market-popup-out"
      @closed="hide"
    >
      <div class="head">
        <div class="title">門店超出配送範圍</div>
        <div class="msg-wrap">
          <p class="msg">因定位地址超出配送範圍 無法配送到當前位置</p>
        </div>

        <div v-if="showTips">
          <span class="tips">為您推薦附近相似好店</span>
        </div>
        <div class="location-box">
          <span class="address">
            <van-icon style="font-weight: bold" name="location-o" />
            {{memberLocation.address && geoLocationStatus !== 2? $$(orderOther, "selectedAddress", "address") ||memberLocation.address
                : "獲取定位失敗"
            }}</span>
          <span @click="goAddress" class="link">更換地址 <van-icon name="arrow" /></span>
        </div>
        <NearList ref="NearList" @show="showTips = true"></NearList>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Popup, Icon } from "vant";
import NearList from '../near-store/list';
import mf from '@/JS/mFoodSDK';
export default {
  components: {
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    NearList
  },
  data() {
    return {
      state: false,
      showTips: false
    };
  },
  computed: {
    // 用戶地址
    memberLocation: function () {
      return this.$store.getters.memberLocation;
    },
    // 定位狀態，0沒有定位，1定位成功，2定位失敗
    geoLocationStatus: function () {
      return this.$store.getters.geoLocationStatus;
    },
    // 選中的新地址
    orderOther() {
      return this.$store.getters.marketOrderOther;
    }
  },
  methods: {
    show() {
      if (this.$route.name !== 'marketStore') {
        return;
      }
      this.$store.commit('marketSubmitBar', { show: false });
      this.state = true;
      this.showTips = false;
      this.$nextTick(() => {
        this.$refs.NearList.getData();
      });
    },
    hide() {
      this.state = false;
      this.$store.commit('marketSubmitBar', { show: true });
    },
    goAddress() {
      if (mf.isApp) {
        mf.APPLoginAsync().then(() => {
          this.$router.push({
            path: '/deliveryAddress',
            query: {
              from: 'market'
            }
          });
        });
      } else {
        this.$router.push({
          path: '/deliveryAddress',
          query: {
            from: 'market'
          }
        });
      }
    }
  }
};
</script>
<style lang='less' scoped>
.market-popup-out {
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
.head {
  padding: 0 12px;
  text-align: center;
}
.msg {
  margin: 18px 0 23px;
  width: 190px;
  text-align: center;
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
.location-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 26px;
  background: rgba(250, 137, 0, 0.09);
  border-radius: 8px;
  padding: 15px 12px;
  font-size: 14px;
  color: #191919;
  .address {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .link {
    color: #ff8b1d;
    font-size: 12px;
    flex-shrink: 0;
  }
}
</style>
