<template>
  <div :class="{'store-red-voucher-item-270':true,'receive':item.isReceive}">
    <div class="flex-center-class top-mid-class" >
      <img src="./tab_vip_member_c@2x.png"/>
    </div>
    <div class="voucher-data-class">
      <div class="voucher-price-class">
        <div class="price">
          <span class="price-title ellipsis">{{item.amount}}</span>
          <div class="limitAmount ellipsis">{{item.limitAmountStr}}</div>
        </div>
        <div :class="`opt-btn ${item.isReceive?'receive':''}`" @click="$emit('click')">
          {{item.isReceive?'已兌':'兌換'}}
          <div v-if="!item.isReceive" class="vip-label-class">1張月卡紅包</div>
        </div>
      </div>
      <div class="voucher-label-class">
        <template v-if="item.expireTime">
          有效期至 {{item.expireTime|dateFormat('yyyy.MM.dd')}}
        </template>
        <template v-else>
          購買后{{memberOpenInfo.memberCycleDays}}天内有效
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "store-voucher",
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    memberBasicInfo() {
      return this.$store.getters.memberBasicInfo;
    },
    memberOpenInfo() {
      return this.$store.getters.memberOpenInfo;
    }
  }
};
</script>

<style lang="less">
  .store-red-voucher-item-270{
    flex-shrink: 0;
    margin-right: 5px;
    position: relative;
    width: 171px;
    height: 98px;
    padding:0 8px 5px 12px;
    background-image: url("./vip_order_unfold_bg@2x.png");
    background-size: 100% auto;
    background-position: 0 0;
    background-repeat: no-repeat;
    &.receive{
      pointer-events: none;
    }
    .top-mid-class{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 16px;
      >img{
        width: 56px;
        height: 16px;
      }
    }
    .voucher-data-class{
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .voucher-price-class{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        .price{
          flex:1;
          overflow: hidden;
          color: #89543D;
          .price-title{
            font-size: 24px;
            font-weight: bold;
            &:before{
              content: 'MOP ';
              font-size:14px ;
            }
          }
          .limitAmount{
            font-size: 12px;
          }
        }
        .opt-btn{
          position: relative;
          margin-left: 5px;
          flex-shrink: 0;
          width: 48px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          background: linear-gradient(135deg, #FF9127 0%, #FE5900 100%);
          border-radius: 12px;
          font-weight: bold;
          color: white;
          font-size: 12px;
          .vip-label-class{
            position: absolute;
            left: 0;
            top: 20px;
            font-size: 9px;
            color: #89543D;
            font-weight: normal;
            white-space: nowrap;
            text-align: center;
          }
          &.receive{
            background: #FB985D;
          }
        }
      }
      .voucher-label-class{
        width: 100%;
        text-align: center;
        color: #89543D;
        font-size: 11px;
      }
    }
  }
</style>
