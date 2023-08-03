<template>
  <div :class="{'vip-user-red-packet-parent' :true,'fail':disabled}">
    <div :class="{'vip-user-red-packet' :true,'fail':disabled,'mult':item.couponSize}">
      <RedpacketVipTag :item="item" />
      <div class="details" >
        <div class="firstItem">
          <img v-if="item.isUpMoney && item.storeIcon" class="store-img" :src="item.storeIcon"/>
          <div class="title-class" :class="{ 'ml': item.isUpMoney && item.storeIcon }">
            <span class="name ellipsis">{{item.storeName || item.redpackName}}</span>
            <span
              :class="`tips ellipsis expire-wrapper-time ${item.expireTips && (item.expireTips.indexOf('今日到期') > -1 || item.expireTips.indexOf('due today') > -1) ? 'font-bold' : ''}`"
              v-html="expireTips">
            </span>
          </div>
        </div>
        <div class="lastItem">
          <span class="price">
            <span class="pre-tag" v-if="item.deliveryRedpack">{{ $t('COUPON.up_to_less') }}</span>
            <b class="symbol">MOP</b>{{item.amount}}
          </span>
          <span class="info">{{item.limitAmountStr}}</span>
        </div>
      </div>
      <div class="van-card_footer" >
        <div class="info" @click.stop="show" v-if="expireUseExplain(item)">
          <div class="firstInfo" :class="{'active': showExplain}">
            <p v-html="expireUseExplain(item)" :class="showExplain?'':'hide ellipsis'"></p>
          </div>
        </div>
        <div class="use" v-if="!disabled">
          <!-- <span class="return-btn" v-if="item.isUpMoney" @click="$emit('turnBack',item)">{{ $t('COUPON.return_back') }}</span> -->
          <span
            class="btn"
            @click="onClickBtn(item)"
            :class="{disabled:!item.isEnable}"
          >{{ $t('common.use_it') }}</span>
        </div>
      </div>
    </div>
    <div class="mult-red-packet" v-if="item.couponSize && item.couponSize >1">
      <img :src="mul"/>
    </div>
  </div>

</template>

<script>
import mul from "@/assets/images/vip_card_numberous@2x.png";
import { Card, Icon } from "vant";
import RedpacketVipTag from '@/components/common/redpacket-tag/vip.vue';
import { breakExpireStr } from '@/JS/common/businessUtils';
import filter from "@/JS/filter";

export default {
  name: "vip-red-packet",
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon,
    RedpacketVipTag
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
  data() {
    return {
      mul,
      expireUseExplain: filter.expireUseExplain,
      showExplain: false
    };
  },
  computed: {
    expireTips() {
      // 免配红包limitAmountStr太长了，故对左侧有效时间换行
      return this.item?.deliveryRedpack ? breakExpireStr(this.item?.expireTips) : this.item?.expireTips
    }
  },
  methods: {
    show() {
      this.showExplain = !this.showExplain
    },
    onClickBtn(item) {
      if (!item.isEnable) {
        this.$toast(this.$t('COUPON.cannot_use_redpacket'));
        return;
      }
      this.$emit('handleUse', item);
    }
  }
};
</script>

<style lang="less">
  .vip-user-red-packet-parent{
    margin-bottom:12px ;
    position: relative;
    &:before{
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: -1;
    }
    &.fail{
      .mult-red-packet{
        filter: opacity(0.4);
      }
    }
    .vip-user-red-packet {
      width: 100%;
      padding: 22px 16px 12px 16px;
      border-radius: 12px;
      position: relative;
      box-sizing: border-box;
      background: linear-gradient(135deg, #FFE0C6 0%, #FFC19B 100%);
      text-align: left;
      align-items: baseline;
      justify-content: space-between;

      &.fail {
        &:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
        }
      }
      .icon-vip {
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        line-height: 20px;
        padding: 0 8px;
        border-radius: 12px 0px 12px 0px;
        background: linear-gradient(317deg, #252730 0%, #5A5D6F 100%);
        color: #EEC374;
        font-size: 11px;
        img{
          width: 20px;
          height: 16px;
          margin-right: 2px;
        }
      }

      /*&.fail.mult{*/
      /*  .mult-red-packet{*/
      /*    filter: opacity(0.4);*/
      /*  }*/
      /*}*/
      >.details {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: center;
        .firstItem {
          flex: 1;
          padding-right: 12px;
          box-sizing: border-box;
          display: flex;
          overflow: hidden;
          .store-img {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: 8px;
          }
          .title-class {
            flex: 1;
            overflow: hidden;
            &.ml {
              margin-left: 8px;
            }
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .name {
              box-sizing: border-box;
              font-size: 16px;
              font-weight: bold;
              color: #89543D;
            }
          }
        }

        .lastItem {
          display: flex;
          flex-flow: column;
          transform: translateY(-3px);
          align-items: flex-end;
          .tips {
            flex: 1;
            padding-right: 20px;
            white-space: pre-line;
          }
        }

        span.price {
          color: #F54747;
          font-size: 32px;
          font-weight: bold;
          display: flex;
          flex-flow: row;
          align-items: flex-end;
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
            font-size: 16px;
            font-weight: bold;
            color: #F54747;
            margin-bottom: 5px;
            margin-right: 2px;
            transform: translateY(-1px);
          }
        }

        span.tips {
          font-size: 11px;
          color: #89543D;
          &.font-bold {
            color: #F54747;
            font-weight: bold;
          }
        }
        span.info {
          font-size: 12px;
          font-weight: bold;
          color: #89543D;
        }
      }

      .van-card_footer {
        text-align: left;
        font-size: 11px;
        font-weight: normal;
        padding-top: 10px;
        box-sizing: border-box;
        margin-top: 10px;
        position: relative;
        display: flex;
        align-items: flex-start;
        color: #89543D;
        word-break: break-word;
        .info {
          flex: 1;
          padding-right: 20px;
          align-items: center;
          line-height: 16px;
          display: flex;
          align-items: center;
          overflow: hidden;
          .firstInfo {
            width: 100%;
            display: flex;
            flex-flow: row;
            padding-top: 5px;
            word-break: break-word;
            .hide {
              height: 17px;
            }
            &.active{
              p {
                >span{
                  &:after{
                    transform: rotate(0deg) translateY(2px);
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
                  background-image: url('~@/assets/images/icon_system_arrow_mini_up_brown@2x.png');
                  transform: rotate(180deg);
                  background-size: 100% 100%;
                  width: 17px;
                  height: 16px;
                  background-position: center;
                }
              }
            }
          }
        }
        .use {
          display: flex;
          align-items: center;
          .btn {
            display: inline-block;
            padding: 0 8px;
            height: 24px;
            line-height: 24px;
            background: #FA6C17;
            border-radius: 4px;
            font-size: 12px;
            font-weight: normal;
            color: #FFFFFF;
            text-align: center;
            &.disabled {
              opacity: 1;
              background: #E5E5E5;
            }
          }
          .return-btn{
            display: inline-block;
            padding: 0 8px;
            height: 24px;
            line-height: 24px;
            background: rgba(255,255,255,0.4);
            border: 1px solid rgba(137,84,61,0.6);
            border-radius: 4px;
            font-size: 12px;
            font-weight: normal;
            color: #89543D;
            text-align: center;
            margin-right: 8px;
          }
        }

        &::after {
          content: ' ';
          top: 0;
          left: 0;
          width: 100%;
          position: absolute;
          border-bottom: 1px dashed rgba(166, 106, 80, 0.64);
        }
      }

    }
    .mult-red-packet{
      width: 100%;
      height: 16px;
      position: relative;
      overflow: hidden;
      >img{
        transform: translateY(-6px);
        width: 100%;
      }
    }
  }

</style>
