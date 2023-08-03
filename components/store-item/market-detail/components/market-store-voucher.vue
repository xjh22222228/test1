<template>
  <div :class="{'store-item-270':true,'receive':item.isReceive}">
    <div class="flex-center-class top-mid-class" v-if="item.userScope === 1">
      <img src="./tab_new_member_c@2x.png"/>
    </div>
    <div class="voucher-data-class">
      <div class="voucher-price-class">
        <div class="price">
          <span class="price-title ellipsis">{{item.amount}}</span>
          <div class="limitAmount ellipsis">{{item.limitAmountStr}}</div>
        </div>
        <div :class="`opt-btn ${item.isReceive?'receive':''}`" @click="$emit('click')">
          {{item.isReceive?'已領':'領取'}}
        </div>
      </div>
      <div class="voucher-label-class">
        <template v-if="item.isReceive">
          有效期至 {{item.expireTime|dateFormat('yyyy.MM.dd')}}
        </template>
        <template v-else>
          領取后{{item.validDays}}天内有效
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
  }
};
</script>

<style lang="less">
  .store-item-270{
    flex-shrink: 0;
    margin-right: 5px;
    position: relative;
    width: 171px;
    height: 98px;
    padding:0 8px 5px 12px;
    background-image: url("./quan_order_unfold_bg_nor@2x.png");
    background-size: 100% auto;
    background-position: 0 0;
    background-repeat: no-repeat;
    &.receive{
      pointer-events: none;
      background-image: url("./quan_order_unfold_bg_sel@2x.png");
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
        margin-top: 14px;
        overflow: hidden;
        .price{
          flex:1;
          overflow: hidden;
          color: #52341A;
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
          margin-left: 5px;
          flex-shrink: 0;
          width: 48px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          background: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          color: #52341A;
          border: 0.5px solid #52341A;
          &.receive{
            opacity: 0.6;
          }
        }
      }
      .voucher-label-class{
        width: 100%;
        text-align: center;
        color: #52341A;
        font-size: 11px;
      }
    }
  }
</style>
