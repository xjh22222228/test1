<template>
  <van-popup
    :safe-area-inset-bottom="true"
    :duration="0"
    v-model="showPopup"
    position="bottom"
    class="mk-svoucherList"
    get-container="#app"
  >
    <nav-bar
      :back="close"
      title="門店優惠券"
      className="type1"
      background-color="#fff"
      :allway-show="true"
    />
    <div class="mk-data">
      <van-list
        v-if="showPopup"
        v-model="loading"
        :finished="finished"
        finished-text="已經到底啦"
        @load="onLoad"
      >
        <storeVoucher
          :item="item"
          v-for="item in marketStoreVoucher"
          :key="item.id"
          @click.native="$emit('onReceiveVoucher',item)"
        />
      </van-list>
    </div>
  </van-popup>
</template>

<script >
import storeVoucher from '../storeDiscount/storeVoucher.vue';
import { Popup, List } from 'vant';
import utils from '@/JS/utils';
import NavBar from "@/components/headerNav";

export default {
  components: {
    [Popup.name]: Popup,
    [List.name]: List,
    storeVoucher,
    NavBar
  },
  data() {
    return {
      safeClass: utils.getSafeTopClassName('height'),
      showPopup: false,
      loading: false,
      finished: false,
      offset: 0
    };
  },
  computed: {
    marketStoreVoucher() {
      return this.$store.getters.marketStoreVoucher;
    }
  },
  activated() {
    this.showPopup = false;
  },
  methods: {
    show() {
      this.showPopup = true;
    },
    close() {
      this.showPopup = false;
    },
    onLoad() {
      this.finished = true;
    }
  }
};
</script>

<style lang="less">
.mk-svoucherList {
  height: 100%;
  display: flex;
  flex-direction: column;
  .van-popup__close-icon {
    color:#191919;
    top:12px;
  }
  .mk-sv-title {
    width: 100%;
    text-align: center;
    height: 44px;
    line-height :44px;
    color: #191919;
    font-size: 17px;
    font-weight: bold;
  }
  .mk-data {
    flex:1;
    overflow: auto;
    position: relative;
    background: #F5F5F7;
    padding: 12px;
    .mk-store-v1 {
      margin-bottom: 12px;
    }
    .van-list__finished-text {
      font-size: 11px;
    }
  }
}
</style>
