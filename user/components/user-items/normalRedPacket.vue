<template>
  <van-card :class="`market-normal-user-red-packet ${disabled?'fail':''}`">
    <template #tags>
      <DeliveryRedpacketTag :item="item" class="normal-type-icon" v-if="item.deliveryRedpack" />
      <TypeIcon :item="item" class="normal-type-icon" v-else />
    </template>
    <template #desc>
      <div class="details" >
        <div class="firstItem ellipsis">
          <span class="name ellipsis">{{item.redpackName}}</span>
          <span :class="`tips ellipsis ${item.expireTips&&item.expireTips.indexOf('今日到期')>-1?'font-bold':''}`"
                v-html="expireTips"> </span>
        </div>
        <div class="lastItem">
          <span class="price">
            <span class="pre-tag" v-if="item.deliveryRedpack">{{ $t('COUPON.up_to_less') }}</span>
            <b class="symbol">MOP</b>{{item.amount}}
          </span>
          <span class="info">{{item.limitAmountStr}}</span>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="van-card_footer" >
        <div class="info " @click="show">
          <div class="firstInfo"  :class="{'active':item.show}">
            <p  v-html="expireUseExplain(item)" :class="item.show?'':'hide ellipsis'"></p>
<!--            <van-icon :name="item.show?'arrow-up':'arrow-down'" />-->
          </div>
        </div>
        <div class="use" v-if="!disabled">
          <span class="btn" @click="$emit('handleUse',item)"  :class="{disabled:!item.isEnable}">去使用</span>
        </div>
      </div>
    </template>
  </van-card>
</template>

<script>
import { Card, Icon } from "vant";
import filter from "../../../../../JS/filter";
import TypeIcon from '@/components/common/redpacket-tag/typeIcon.vue';
import DeliveryRedpacketTag from '@/components/common/redpacket-tag/delivery.vue';
import { breakExpireStr } from '@/JS/common/businessUtils';

export default {
  name: "normal-red-packet",
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon,
    TypeIcon,
    DeliveryRedpacketTag
  },
  data() {
    return {
      expireUseExplain: filter.expireUseExplain
    };
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    listData() {
      const d = this.disabled;
      const item = this.item;
      if (d) {
        return item.invalidListData || [];
      } else {
        return item.effectiveListData || [];
      }
    },
    expireTips() {
      // 免配红包limitAmountStr太长了，故对左侧有效时间换行
      return this.item?.deliveryRedpack ? breakExpireStr(this.item?.expireTips) : this.item?.expireTips
    }
  },
  methods: {
    show() {
      this.item.show = !this.item.show;
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="less">
  .market-normal-user-red-packet {
    width: 100%;
    padding: 18px 16px 14px 16px !important;
    border-radius: 12px;
    position: relative;
    box-sizing: border-box;
    background: url("~@/assets/images/bg_redpocket_logo.png") #FFFFFF;
    background-size: 63px 85px;
    background-repeat: no-repeat;
    margin: 0 0  12px 0;
    .normal-type-icon {
      position: absolute;
      top: 0;
      left: 0;
    }
    .icon-vip {
      position: absolute;
      top: -17px;
      left: -16px;
      width: 80px;
      height: 20px;
    }

    &.fail {
      opacity: 0.5;
      .van-card__header .van-card__content div .details{
        .firstItem .name{
          // color:#999999
        }
        .lastItem {
          .symbol{
            // color: #999999;
          }
          .price{
            // color: #999999;
          }
          .info{
            // color:#999999;
          }
        }
      }

      .van-card_footer {
        // color: #999999;
        div.info {
          display: block !important;
        }
      }
    }

    .van-card_footer {
      text-align: left;
      font-size: 12px;
      font-weight: 400;
      padding-top: 5px;
      box-sizing: border-box;
      margin-top: 16px;
      color: #999999;
      position: relative;
      display: flex;
      flex-flow: row;
      word-break: break-word;

      .van-icon-arrow-down.active {
        transform: rotate(180deg) translateY(3px) !important;
        transform-origin: center;
      }

      .info {
        flex: 1;
        padding-top: 7px;
        overflow: hidden;
        padding-right: 20px;
        line-height: 18px;
        display: block;
        align-items: center;

        .hide {
          height: 19px;
        }
      }

      .firstInfo {
        width: 100%;
        display: flex;
        flex-flow: row;
        padding-top: 5px;
        word-break: break-word;
        &.active{
          p {
            >span{
              &:after{
                transform: rotate(0deg);
              }
            }
          }
        }
        p {
          padding-right: 4px;
          >span{
            &:after{
              display: inline-block;
              vertical-align: sub;
              content: '';
              background-image: url('~@/assets/images/icon_system_arrow_mini_up@2x.png');
              background-size: 100% 100%;
              width: 14px;
              height: 14px;
              transform: rotate(180deg);
            }
          }
        }

        .van-icon {
          // transform: translateY(2px);
        }
      }

      .use {
        padding-top: 3px;

        .btn {
          display: inline-block;
          width: 60px;
          padding: 3px 0 4px 0;
          background: #FA6C17;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #FFFFFF;
          text-align: center;
          margin-top: 4px;

          &.disabled {
            pointer-events: none;
            opacity: 1;
            background: #E5E5E5;
          }
        }
      }

      &::after {
        content: ' ';
        top: 0;
        left: 0;
        width: 100%;
        position: absolute;
        border-bottom: 1px dashed rgba(49, 46, 75, 0.1);
      }
    }

    .van-card__content {
      .normal-type-icon {
        position: absolute;
        top: 0;
        left: 0;
        margin-top: -18px;
        margin-left: -16px;
      }
      >div {
        width: 100%;
      }

      text-align: left;
      position: relative;
      min-height: inherit;
      align-items: baseline;
      box-sizing: border-box;
      justify-content: space-between;

      span.name {
        padding-top: 3px;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      span.price {
        color: #FF261D;
        font-size: 32px;
        font-weight: bold;
        display: flex;
        flex-flow: row;
        align-items: flex-end;
        transform: translateY(-5px);
        .pre-tag {
          font-size: 11px;
          color: #F54747;
          background: #FEECEC;
          border-radius: 4px;
          padding: 1px 4px;
          font-weight: normal;
          margin: 0 2px 8px 0;
        }

        b.symbol {
          font-size: 14px;
          font-weight: bold;
          color: #FF261D;
          margin-bottom: 5px;
          margin-right: 2px;
          transform: translateY(-1px);
        }
      }

      span.tips {
        margin-top: 18px;
        font-size: 11px;
        color: #999999;
      }

      span.tips.font-bold {
        font-weight: bold;
      }

      span.info {
        font-size: 12px;
        font-weight: bold;
        color: #333;
      }

      div.details {
        flex: 1;
        width: 100%;
        display: flex;
        flex-flow: row;

        /*&.hasVip {*/
        /*  margin-top: 10px;*/
        /*}*/

        .firstItem,
        .lastItem {
          display: flex;
          flex-flow: column;
        }

        .firstItem {
          flex: 1;
          padding-right: 16px;
          box-sizing: border-box;

          .name {
            min-height: 26px;
            // max-height: 42px;
            box-sizing: border-box;
          }
        }

        .lastItem {
          align-items: flex-end;

          .tips {
            flex: 1;
            padding-right: 20px;
          }
        }
      }
    }
  }
</style>
