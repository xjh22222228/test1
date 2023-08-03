<template>
  <div class="mk-voucher-item-class14-2 wrapper3">
    <img src="./bg.png" class="bg" />
    <div class="box3">
      <div :class="`mid-item-class type-1`">
        <div class="store-name-class ellipsis">{{item.redpackName}}</div>
        <div class="limit">{{ item.limitAmountStr }}</div>
        <div class="voucher-time-class ellipsis">{{item.effectDateStr}}</div>
      </div>
      <div class="right-item-class" @click.prevent="onClick(item,index)">
        <div class="all-price-class">
          <span class="unit">MOP</span>
          <span class="big-price-class">{{item.amount}}</span>
        </div>
        <div class="button--primary" :class="{'go-use-class': item.isReceive,'disabled': isDisable(item)}">{{ item.buttonText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import mf from "@/JS/mFoodSDK";
import { Image as VanImage } from "vant";
import { post } from "@ajax";
import redPacket from "@/assets/images/logo_redpocket.png";
import { homeReceiveRed, homeReceiveVoucher } from "@/JS/shenceUtils/discountUtil";
import event from '@/JS/event';

export default {
  components: {
    [VanImage.name]: VanImage
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      redPacket
    };
  },
  computed: {
    rollWindowData() {
      return this.$store.getters.marketRollWindowData;
    },
    // 紅包列表
    marketActivityPageRedList() {
      return this.rollWindowData?.aggregateRedpackInfo || [];
    }
  },
  methods: {
    isDisable(data) {
      // buttonType 按钮类型
      // 1=去使用，2=领取已上限，3=今日已上限，4=已领完,5=今日已领完，6=未开始，7=今日已结束，8=领券，9=8:00可领
      if (data.isReceive && !data.isEnable) {
        return true;
      }
      return [2, 3, 4, 5, 6, 7, 9, 10].includes(data.buttonType);
    },
    onClick(data, index) {
      if (this.isDisable(data) && data.buttonType !== 10) {
        return;
      }
      if (!data.isReceive) {
        this.getRedpacket(data, index);
      } else {
        this.useRedpacket(data);
      }
    },
    // 使用紅包
    useRedpacket(item) {
      if (!item.isReceive) {
        return;
      }
      if (!item.isEnable) {
        return this.$toast("未到使用時間");
      }
      if (item.busicessTypes.includes(3)) {
        // 商超
        mf.useMarketRedPack(item);
      } else {
        // 外賣
        mf.appUserRedPacket(item);
      }
      this.$emit('close');
    },
    // 領取紅包
    getRedpacket(item, index) {
      mf.APPLoginAsync().then(() => {
        this.$toast.loading({ message: "領取中...", duration: 0 });
        post("/activity/platform/redpack/_receive-redpack-by-h5", {
          redpackId: item.redpackId,
          activityId: this.rollWindowData.activityId,
          sourceType: 12,
          datasetId: item.dataSetId
        }, { useActivityLocation: true }).then(res => {
          // homeReceiveRed(res);
          this.$toast.clear();
          // this.marketActivityPageRedList.splice(index, 1, res);
        }).catch(e => {
          this.$toast(e?.response?.data?.note);
        }).finally(() => {
          event.$emit('marketCollarRollGet', { refresh: true });
        });
      });
    }
  }
}
</script>
<style lang="less">
.mk-voucher-item-class14-2{
  width: 100%;
  display: flex;
  border-radius: 12px;
  box-shadow: 0px 2px 6px 0px rgba(49, 46, 75, 0.08);
  margin-bottom: 8px;
  &.wrapper3 {
    position: relative;
    margin-bottom: 8px;
    .bg {
      width: 100%;
      height: 80px;
    }
    .limit {
      font-size: 11px;
      color: #666;
      text-align: left;
    }
    .voucher-item-class{
      z-index: 2;
      position: absolute;
      top: 0;
      left: 0;
      background-color: transparent !important;
      padding-right: 0 !important;
      .right-item-class {
        width: 85px !important;
        align-items: center !important;
      }
    }
    .box3 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      padding: 11px 0;
    }
  }
  .van-image{
    flex-shrink: 0;
  }
  .mid-item-class{
    &.type-1{
      flex: 1;
      overflow: hidden;
    }
    &.type-2{
      width: calc(100% - 126px);
    }

    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .store-name-class{
      word-break: break-all;
      color:#333333FF;
      font-size:16px;
      font-weight: bold;
      text-align: left;
    }
    .pick-fee-class{
      display: flex;
      justify-content: space-between;
      align-items: center;
      .pick-fee-price-class{
        color:#F54747FF;
        word-break: break-all;
        font-size: 12px;
        font-weight: bold;
        padding-left:5px;
        text-align: left;
        span{
          font-size: 18px;
        }
      }
      .store-pick-time-class{
        color:  #999999FF;
        font-size: 11px;
      }
    }
    .voucher-time-class{
      text-align: left;
      color: #999999FF;
      font-weight: 400;
      font-size: 11px;
      text-align: left;
    }
  }
  .right-item-class{
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 85px;
    overflow: hidden;
    white-space: nowrap;
    padding-bottom: 5px;
    .all-price-class{
      color: #F54747;
      width: auto;
      .unit {
        font-weight: bold;
        font-size: 10px;
      }
      .big-price-class{
        font-weight: bold;
        font-size: 28px;
        line-height: 32px;
      }
    }
    .button--primary{
      background: linear-gradient(135deg, #FF9127 0%, #FE5900 100%);
      border-radius: 12px;
      font-size: 11px;
      padding: 2px 10px;
      display: flex;
      align-items: center;
      text-align: center;
      color: #FFFFFF;
      font-weight: bold;
      min-width: 48px;
      justify-content: center;
      max-width: 80px;
      margin-top: 4px;
    }
    .go-use-class{
      padding:2px 4px;
      background: white;
      color: #FA6C17;
      border:1px solid #FA6C17;
    }
    .disabled{
      padding: 2px 4px;
      background: #ccc;
      color: white;
      border:0 ;
      white-space: nowrap;
    }
  }
}
</style>
