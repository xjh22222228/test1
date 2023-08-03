<template>
  <van-card :thumb="item.activityType == 3 ?tongyong:item.storeIcon"  :class="`normal-voucher-item ${disabled?'fail':''} ${item.isCheap?'cheap':''}`">
    <template #tags>
      <!-- <div class="type-icon-box"> -->
      <TypeIcon position="right" :item="item" class="type-icon"/>
      <!-- </div> -->
    </template>
    <template #desc>
      <div class="details">
        <div class="left">
          <span class="name ellipsis">{{item.activityType == 3?'商家通用代金券':item.storeName}}</span>
          <span class="info">{{item.limitAmountStr}}</span>
          <span class="tips" @click="show">
                <b v-html="item.expireStr" :class="{active: item.show, today: isToday(item.expireTime)}"></b>
                <van-icon name="arrow-down" :class="{active: item.show, today: isToday(item.expireTime)}" />
              </span>
        </div>
        <div class="right">
          <span class="price"><b class="symbol">MOP</b>{{item.amount}}</span>
          <span class="btn" @click="store">去使用</span>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="van-card_footer" v-if="item.show" v-html="item.expireUseExplain"></div>
    </template>
  </van-card>
</template>

<script>
import { Card, Icon } from "vant";
import utils from '@/JS/utils';
import TypeIcon from '@/components/common/redpacket-tag/typeIcon.vue';
import tongyong from '@/assets/images/icon_quan_tongyong.png';
export default {
  name: "normal-voucher-item",
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon,
    TypeIcon
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
    }
  },
  data() {
    return {
      tongyong
    };
  },
  methods: {
    show() {
      this.item.show = !this.item.show;
      this.$forceUpdate();
    },
    // 是否今日过期
    isToday(date) {
      const now = new Date();
      const n = new Date(date);
      return utils.dateFormat(n, 'yyyy.MM.dd') === utils.dateFormat(now, 'yyyy.MM.dd');
    },
    store() {
      if (this.item.storeId) {
        this.$store.commit("marketOrderOtherReset");
        this.$store.commit("enterStore", true);
        this.$router.push({ path: '/market/store', query: { id: this.item.storeId } });
      } else {
        this.$router.replace("/market/index");
      }
      // todo 商戶代金券，該功能未完善、未上線
      if (this.item.activityType == 3) {
        this.$store.commit('marketMerchantVoucherPage', { cache: false });
        this.$router.push({
          path: '/market/activity/merchant-voucher?id=' + this.item.id
        });
      }
    }
  }
};
</script>

<style lang="less">
  .normal-voucher-item.van-card {
    width: 100%;
    padding:20px 12px;
    border-radius: 12px;
    position: relative;
    box-sizing: border-box;
    background: #FFFFFF;
    &.cheap{
      &:after{
        content: '著數紅包';
        border-radius: 0px 12px 0px 12px;
        position: absolute;
        right: 0;
        top: 0;
        width: 60px;
        height: 16px;
        line-height: 16px;
        background: #FF666A;
        color: #fff;
        text-align: center;
      }

    }
    .van-card__thumb {
      width: 64px;
      height: 64px;
      border-radius: 4px;
      overflow: hidden;
      z-index: 11;
    }

    &.fail {
      &:before{
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: rgba(255, 255, 255, 0.5);
        z-index: 10;
        pointer-events: none;
      }
      .van-card_footer {
        color: #999;
      }

      .van-card__content {
        span.name {
          color: #999;
        }

        span.price {
          color: #999;

          b.symbol {
            color: #999;
          }
        }

        span.tips {
          color: #999;
          b {
            font-weight: normal;
          }
        }

        span.info {
          color: #999;
        }

        span.btn {
          background: rgba(49, 46, 75, 0.2);
          opacity: 0;
        }
      }
    }

    .van-card_footer {
      text-align: left;
      font-size: 12px;
      font-weight: 400;
      padding-top: 12px;
      box-sizing: border-box;
      margin-top: 12px;
      color: #999;
      position: relative;

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
      .type-icon {
        position: absolute;
        top: -20px;
        right: -12px;
      }
      > div {
        width: 100%;
        height: 100%;
      }
      text-align: left;
      position: relative;
      min-height: inherit;
      align-items: baseline;
      box-sizing: border-box;
      justify-content: space-between;

      span.name {
        color: #666;
        font-size: 14px;
        line-height: 20px;
        margin-right: 12px;
        margin-top: 4px;
      }

      span.price {
        font-size: 24px;
        font-weight: bold;
        color: #F54747;

        b.symbol {
          font-size: 14px;
          font-weight: bold;
          color: #F54747;
          margin-right: 2px;
        }
      }

      span.tips {
        display: flex;
        align-items: center;
        align-content: center;
        font-size: 11px;
        font-weight: normal;
        color: #999;
        margin-top: 4px;
        >b{
          font-weight: normal;
          &.today{
            color: #F54747;
            font-weight: bold;
          }
        }
        .van-icon-arrow-down {
          margin-left: 5px;
          font-weight: bold;

          &.active {
            transform: rotate(180deg);
          }
          &.today {
            color: #F54747;
          }
        }
      }

      span.info {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      span.btn {
        width: 52px;
        padding: 3px 0 4px 0;
        background: #FA6C17;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #FFFFFF;
        text-align: center;
        margin-top: 4px;
      }

      div.details {
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        align-items: stretch;
        justify-content: space-between;

        div.left {
          flex: 1;
          width: 0;
          display: flex;
          flex-flow: column;
        }

        div.right {
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-content: center;
          align-items: flex-end;
        }
      }
    }
  }
</style>
