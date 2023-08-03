<template>
  <div>
    <div
      class="action-bar"
      :class="{
        vertical: verticalBtnStyle,
        'single-btn': singleBtn,
        'sm-padding': smPadding,
        'guide-mode': guideMode
      }"
      @touchmove="onTouchmove"
    >
      <template v-if="orderInfo.orderStatus === 0">
        <div class="item" @click="cancelOrder">
          <img src="../../assets/img/icon-cancel.png" alt="">
          <div class="text">取消訂單</div>
        </div>
        <div class="item" @click="handlePay">
          <van-button loading type="plain" class="btn-loading" v-if="isLoading" />
          <img src="../../assets/img/icon-money.png" alt="" v-else>
          <div class="text">立即支付</div>
        </div>
      </template>
      <template v-else-if="[1, 2, 3].includes(orderInfo.orderStatus)">
        <div class="item" @click="cancelOrder">
          <img src="../../assets/img/icon-cancel.png" alt="">
          <div class="text">{{ orderInfo.orderStatus == 1 ? '取消訂單' : '申請退款' }}</div>
        </div>
        <div class="item" @click="callRider" v-if="showCallRider">
          <img src="../../assets/img/icon_system_phone_rider.png" alt="">
          <div class="text">致電騎手</div>
        </div>
        <div class="item im" @click="callRiderIm" v-if="showRiderIm">
          <div class="dot" v-if="unReadCount">{{ unReadCount }}</div>
          <img src="../../assets/img/icon_system_msg.png" alt="">
          <div class="text">聯繫騎手</div>
        </div>
        <div class="item" @click="callMerchant">
          <img src="../../assets/img/icon_system_phone_store.png" alt="">
          <div class="text">致電商家</div>
        </div>
      </template>
      <template v-else-if="orderInfo.orderStatus === 4">
        <div class="item" :class="{disabled: orderInfo.isBanRefundButton}" @click="handleAfterSale" v-if="orderInfo.isAllowAfs">
          <img src="../../assets/img/icon-earphone.png" alt="">
          <div class="text">申請售後</div>
        </div>
        <div class="item" @click="handleRate" v-if="showRate">
          <img src="../../assets/img/icon-rate.png" alt="">
          <div class="text">訂單評價</div>
        </div>
        <div class="item im" @click="callRiderIm" v-if="showRiderIm">
          <div class="dot" v-if="unReadCount">{{ unReadCount }}</div>
          <img src="../../assets/img/icon_system_msg.png" alt="">
          <div class="text">聯繫騎手</div>
        </div>
        <div class="item" @click="callMerchant">
          <img src="../../assets/img/icon_system_phone_store.png" alt="">
          <div class="text">致電商家</div>
        </div>
        <div class="item" @click="handleRepurchase">
          <img src="../../assets/img/icon-add.png" alt="">
          <div class="text">再來一單</div>
        </div>
      </template>
      <template v-else-if="orderInfo.orderStatus === -1">
        <div class="item" @click="handleRepurchase">
          <img src="../../assets/img/icon-add.png" alt="">
          <div class="text">再來一單</div>
        </div>
      </template>
      <!-- 整單退款才會到已退款 -->
      <template v-else-if="orderInfo.orderStatus === -3">
        <div class="item" @click="handleRepurchase">
          <img src="../../assets/img/icon-add.png" alt="">
          <div class="text">再來一單</div>
        </div>
      </template>
    </div>
    <reason-select ref="reason" @ok="handleOkReason" />
  </div>
</template>

<script>
import { Button } from 'vant';
import mFoodSDK from "@/JS/mFoodSDK";
import storeAndOrderCommon from "../../store/mixis/storeAndOrderCommon";
import ReasonSelect from '../../afterSale/components/reason-select/index.vue';
import PhoneCallComponents from "@components/phoneCall";
export default {
  name: 'ActionBar',
  components: {
    [Button.name]: Button,
    ReasonSelect
  },
  mixins: [storeAndOrderCommon],
  props: {
    // 引导弹窗样式，置于引导遮罩之上。
    guideMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      reason: '',
      // IM 消息未读数
      unReadCount: 0
    };
  },
  computed: {
    marketOrderInfo() {
      return this.$store.getters.marketOrderInfo;
    },
    marketOrderOther() {
      return this.$store.getters.marketOrderOther;
    },
    orderInfo() {
      return this.$store.getters.marketOrderInfo.orderInfo;
    },
    // IM 骑手信息
    marketImRiderInfo() {
      return this.$store.getters.marketImRiderInfo || {};
    },
    // IM 骑手ID
    marketImRiderId() {
      return this.marketImRiderInfo.userId
    },
    riderInfo() {
      const { riderInfo = {} } = this.marketOrderInfo;
      return riderInfo;
    },
    // 是否自取
    isSelfPickUp() {
      return this.orderInfo.deliveryType === 3;
    },
    // 顯示致電旗手按鈕
    showCallRider() {
      return !this.isSelfPickUp && this.riderInfo.riderStatus !== null && this.riderInfo.riderStatus >= 2;
    },
    // 騎手待指派
    isRiderWaitToAssign() {
      return (
        this.marketOrderInfo.orderInfo.orderStatus === 3 &&
        this.marketOrderInfo.riderInfo.riderStatus !== null &&
        this.marketOrderInfo.riderInfo.riderStatus === 0
      );
    },
    // 显示联系骑手IM按钮
    showRiderIm() {
      return (
        mFoodSDK.isApp &&
        this.utils.compareVersion(mFoodSDK.version, '3.9.5') >= 0 &&
        !this.isSelfPickUp &&
        !this.isRiderWaitToAssign &&
        [3, 4].includes(this.marketOrderInfo.orderInfo.orderStatus) &&
        Boolean(this.marketImRiderInfo?.userId) &&
        // 是否可聯繫騎手
        this.marketOrderInfo.buyerInfo?.canCall
      )
    },
    // 顯示訂單評價按鈕
    showRate() {
      return this.orderInfo.isAllowRate && !this.orderInfo.isRate;
    },
    noRefundOrder() {
      return this.orderInfo.refundProgress === -99;
    },
    // 訂單支付
    payment() {
      return this.$store.getters.payment;
    },
    // 按鈕數量 >= 3
    verticalBtnStyle() {
      return (
        ([1, 2, 3].includes(this.orderInfo.orderStatus) && (this.showCallRider || this.showRiderIm)) ||
        (this.orderInfo.orderStatus === 4 && (this.showRate || this.orderInfo.isAllowAfs))
      );
    },
    // 單個按鈕
    singleBtn() {
      return (
        this.orderInfo.orderStatus === -1 ||
        this.orderInfo.orderStatus === -3
      );
    },
    // 小padding
    smPadding() {
      return (this.orderInfo.orderStatus === 4 && this.showRate && this.orderInfo.isAllowAfs) || (this.showCallRider && this.showRiderIm);
    }
  },
  watch: {
    marketImRiderId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.listenImEvent()
        }
      }
    }
  },
  methods: {
    // guideMode下禁止滑动
    onTouchmove(e) {
      if (this.guideMode) {
        return e.stopPropagation()
      }
    },
    // 监听IM事件
    listenImEvent() {
      if (!mFoodSDK.isApp || !this.marketImRiderId || !this.marketOrderInfo.buyerInfo?.canCall) return
      console.log('listenImEvent execute')
      mFoodSDK.listenImEvent({ imUserId: this.marketImRiderId }, data => {
        let dataObj = {}
        try {
          dataObj = JSON.parse(data)
        } catch (error) {
          console.log(error)
        }
        this.unReadCount = dataObj?.unReadCount > 99 ? '99+' : dataObj?.unReadCount
      })
    },
    callRider() {
      const data = [];
      // 第一個號碼
      const riderMobile = this.riderInfo?.riderMobile;
      if (riderMobile) {
        const arr = riderMobile.split('-');
        if (arr.length > 1) {
          const phone = arr[1];
          const per = arr[0];
          data.push({
            name: `呼叫 +${per} ${phone}`,
            className: per + phone
          });
        } else if (arr.length === 1) {
          data.push({
            name: `呼叫 +${arr[0]}`,
            className: arr[0]
          });
        }
      }
      if (!data.length) {
        return;
      }
      PhoneCallComponents({
        data: data,
        title: "致電騎手",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    },
    // 骑手IM
    callRiderIm() {
      const { userId, userName } = this.marketImRiderInfo
      if (!userId || !mFoodSDK.isApp) return
      mFoodSDK.jumpByScheme(0, 2, "C2CIMController", {
        chatId: userId,
        fromUserName: userName,
        // sourceType: 1外卖，2商超
        cloudCustomData: JSON.stringify({ sourceId: this.orderInfo.tradeId, sourceType: 2 }),
        sourceType: 2
      });
    },
    callMerchant() {
      const data = [];
      // 第一個號碼
      const storePhone = this.marketOrderInfo.storeInfo?.storePhone;
      if (storePhone) {
        const arr = storePhone.split('-');
        if (arr.length > 1) {
          const phone = arr[1];
          const per = arr[0];
          data.push({
            name: `呼叫 +${per} ${phone}`,
            className: per + phone
          });
        }
      }
      // 第二個號碼
      const storeMobile = this.marketOrderInfo.storeInfo?.storeMobile;
      if (storeMobile) {
        const arr = storeMobile.split('-');
        if (arr.length > 1) {
          const phone = arr[1];
          const per = arr[0];
          data.push({
            name: `呼叫 +${per} ${phone}`,
            className: per + phone
          });
        }
      }
      if (!data.length) {
        return;
      }
      PhoneCallComponents({
        data: data,
        title: "致電商家",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    },
    // 售後
    handleAfterSale() {
      // 不能部分退款
      // if (!this.orderInfo.supportRefund) {
      //   return this.$toast(this.$t("ORDERINFO.no_support_refund"));
      // }
      if (this.orderInfo.isBanRefundButton) {
        this.$toast('超過48小時不能申請退款哦');
        return;
      }
      this.$router.push({
        name: 'marketAfterSale',
        params: {
          tradeId: this.orderInfo.tradeId
        }
      });
    },
    // 評價
    handleRate() {
      // 跳轉到評價頁面
      this.$router.push({
        path: '/market/submitComment',
        query: {
          storeId: this.marketOrderInfo.storeInfo.storeId,
          tradeId: this.orderInfo.tradeId
        }
      });
    },
    // 取消訂單
    cancelOrder() {
      // 不能部分退款
      // if (!this.orderInfo.supportRefund) {
      //   return this.$toast(this.$t("ORDERINFO.no_support_refund"));
      // }
      if (![0, 1].includes(this.orderInfo.orderStatus)) {
        return this.$toast('暂不支持取消訂單，訂單完成後可申請售後');
      }
      this.$dialog.confirm({
        className: "centerOverlay",
        message: "確認取消訂單？",
        cancelButtonText: "再等等",
        confirmButtonText: "確認取消"
      }).then(() => {
        if (this.orderInfo.orderStatus === 1) {
          return this.handleOpenReason();
        }
        this.$toast.loading({ message: "正在取消...", duration: 0 });
        this.$store
          .dispatch("marketOrderCancel", {
            cancelType: 1,
            tradeId: this.orderInfo.tradeId
          })
          // 處理成功
          .then(result => {
            mFoodSDK.operatedMarketOrder();
            this.$toast.clear();
            this.$store.dispatch("marketOrderInfo", this.orderInfo.tradeId);
          })
          // 處理錯誤
          .catch(e => {
            this.$toast.clear();
            this.$toast(e?.response?.data?.note || '取消訂單失敗');
          });
      }).catch(() => {});
    },
    // 再來一單
    handleRepurchase() {
      this.$store.dispatch('getAgainProduct', this.orderInfo.tradeId).then(() => {
        mFoodSDK.goMarketStore({
          id: this.marketOrderInfo.storeInfo.storeId,
          from: '超市訂單頁',
          tradeId: this.orderInfo.tradeId
        });
      });
    },
    handlePay() {
      this.isLoading = true;
      try {
        this.paymentMarketOrder();
      } catch (error) {
        this.isLoading = false;
      }
    },
    paymentingSuccess() {
      clearInterval(this.timer);
      this.goOrderInfo(true);
      this.$toast.success({ message: "支付成功", duration: 12000 });
    },
    // 處理支付結果
    dealPayResult(type) {
      // 1 成功 (兩種情況 ：
      // 1.1支付成功 ，能查詢到訂單已成功支付
      // 1.2支付成功，未查到訂單已成功支付)
      // 2  取消支付（沒有支付）  app 只有 1，2
      // 3 支付成功  取消訂單 成功
      // 4 支付成功  取消訂單失敗
      this.isLoading = false;
      if (mFoodSDK.isApp) {
        this.goOrderInfo(type === 1);
      } else {
        switch (type) {
          case 1: {
            this.paymentingSuccess();
            return;
          }
          case 2: {
            this.goOrderInfo(false);
            return;
          }
          case 3: {
            this.goOrderInfo(false);
            return;
          }
          case 4: {
            this.goOrderInfo(false);
            return;
          }
          case 5: {
            this.goOrderInfo(false);
          }
        }
      }
    },
    goOrderInfo(success) {
      // 清除紅包和代金券
      this.$store.commit("memberOrderVoucher", {});
      this.$store.commit("resetMemberOrderRedpack");
      this.$store.commit("marketOrderOther", { ...this.marketOrderOther, missProductIndex: -1, cookTimeSelectData: {} });
      this.$store.commit("enterOrderInfo", true);
      this.$store.commit("enterStore", true);// 回退到門店
      if (success) {
        this.$router.replace({
          path: "/market/payResult",
          query: {
            ...this.$route.query,
            tradeId: this.marketOrderInfo?.orderInfo?.tradeId
          }
        });
      } else {
        // 查詢訂單信息
        this.$router.replace({
          path: "/market/orderList",
          query: {
            redirect: `/market/orderInfo?tradeId=${this.marketOrderInfo?.orderInfo?.tradeId}&fromSource=${this.$route.query.fromSource || ''}`
          }
        });
      }
    },
    handleOpenReason() {
      this.$refs.reason.open(this.reason);
    },
    handleOkReason(value) {
      this.reason = value;
      this.$toast.loading({ duration: 0 });
      this.$store.dispatch('submitApplyRefund', {
        tradeId: this.orderInfo.tradeId,
        reason: value
      }).then(() => {
        this.$toast.clear();
        this.$router.replace({
          path: '/market/afterSaleDetail',
          query: {
            tradeId: this.orderInfo.tradeId
          }
        });
      }).catch(e => {
        this.$toast(e.response?.data?.note || '退款申請失敗');
      });
    }
  }
};
</script>

<style lang="less" scoped>
.action-bar {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  padding: 0 74px;
  z-index: 1;
  margin: 0 auto;
  &.guide-mode {
    width: calc(100% - 16px);
    height: 76px;
    border-radius: 8px;
    z-index: 101;
    .item.im {
      width: 64px;
      box-shadow: 0px -2px 5px 0px rgba(250,108,23,0.65), 0px 2px 5px 0px rgba(250,108,23,0.65);
      border-radius: 8px 8px 8px 8px;
    }
  }
  .item {
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .dot {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(2px);
      min-width: 12px;
      min-height: 12px;
      padding: 0 1px;
      border-radius: 12px;
      background-color: #ED3434;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      font-size: 8px;
      color: #fff;
      z-index: 1;
    }
    &.disabled {
      opacity: .6;
    }
    .text {
      flex-shrink: 0;
    }
    .btn-loading {
      padding: 0;
      .van-loading__spinner {
        color: #FE8B1D !important;
      }
    }
    img {
      width: 24px;
      height: 24px;
      margin-right: 2px;
    }
  }
  &.vertical {
    padding: 0 48px;
    .item {
      flex-direction: column;
    }
  }
  &.single-btn{
    justify-content: center;
  }
  &.sm-padding {
    padding: 0 22px;
  }
}
</style>
