<template>
  <div class="market-time-steps" :class="[type]">
    <template v-if="type === 'rich'" >
      <div class="box" v-for="(item, index) in actions" :key="index">
        <div
          class="border-box"
          :class="{
            'active': index === 0,
            'last': index === 0,
            'first': index === actions.length - 1,
            'only-one': actions.length === 1
          }"
        >
          <div class="info-box triangle">
            <div class="title-row">
              <div class="icon">
                <img :src="item.icon" alt="">
              </div>
              <div class="title ellipsis">{{ item.actionName }}</div>
              <div class="time">{{ item.dateStr }}</div>
            </div>
            <div class="desc-row" v-if="item.memo">
              <div class="desc ellipsis3">{{ item.memo }}</div>
              <!-- 預留交互按鈕 -->
              <!-- <div class="icon"><van-icon name="arrow" /></div> -->
            </div>
            <div class="desc-row" v-if="item.actionContent">
              <div class="desc ellipsis3">{{ item.actionContent }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template  v-if="type === 'common'">
      <div class="box" v-for="(item, index) in actions" :key="index">
        <div
          class="border-box"
          :class="{
            'active': index === 0,
            'last': index === 0,
            'first': index === actions.length - 1,
            'only-one': actions.length === 1
          }"
        >
          <div class="info-box">
            <div class="title-row">
              <div class="icon"></div>
              <div class="title ellipsis">{{ item.actionName }}</div>
            </div>
            <div class="desc-row" v-if="item.memo">
              <div class="desc ellipsis3">{{ item.memo }}</div>
            </div>
            <div class="desc-row" v-if="item.actionContent">
              <div class="desc ellipsis3">{{ item.actionContent }}</div>
            </div>
            <div class="desc-row" v-if="item.createTime">
              <div class="desc ellipsis3">{{ item.createTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>

import { Icon } from 'vant';

export default {
  name: 'MarketTimeSteps',
  components: {
    [Icon.name]: Icon
  },
  props: {
    // common: 常规的；rich: 丰富的，显示交互及图标的
    type: {
      type: String,
      default: 'common'
    },
    actions: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.market-time-steps {
  padding: 12px 12px 12px 24px;
  &.rich {
    background-color: #F5F5F7;
  }
  .box {
    width: 100%;
  }
  .border-box {
    position: relative;
    padding: 6px 0 6px 30px;
    &::after {
      position: absolute;
      display: block;
      content: "";
      top: 0;
      left: 0;
      width: 200%;
      height: 200%;
      border-left: 1px solid #ccc;
      transform: scale(0.5);
      transform-origin: left top;
      box-sizing: border-box;
      z-index: 0;
    }
    &.only-one {
      &::after {
        height: 0 !important;
      }
    }
    &.last {
      &::after {
        height: calc(200% - 24px);
        transform: translateY(12px) scale(0.5);
      }
      .info-box {
        .title-row {
          .icon {
            background-color: #FE8B1D;
          }
        }
      }
    }
    &.first {
      &::after {
        height: 24px;
      }
    }
    .info-box {
      border-radius: 6px;
      background-color: #fff;
      padding: 12px;
      position: relative;
      &.triangle {
        &::before {
          position: absolute;
          left: 0;
          top: 0;
          content: '';
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 5px 8.7px 5px 0;
          border-color: transparent #fff transparent transparent;
          transform: translate(-8px, 14px);
        }
      }
      .title-row {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-content: center;
        margin-bottom: 8px;
        .icon {
          width: 26px;
          height: 26px;
          position: absolute;
          left: 0;
          top: 0;
          border-radius: 100%;
          background-color: #fff;
          transform: translate(-55px, -6px);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 18px;
            height: 18px;
          }
        }
        .title {
          font-weight:bold;
          font-size: 14px;
          line-height: 1.2;
          color: #333;
          flex: 1;
          padding-right: 10px;
          text-align: left;
        }
        .time {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }
      }
      .desc-row {
        font-size: 13px;
        color: #999;
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        .desc {
          text-align: left;
          flex: 1;
          padding-right: 20px;
        }
        .icon {
          flex-shrink: 0;
        }
      }
    }
  }
  &.common {
    background-color: #fff;
    padding: 6px;
    .box {
      .border-box {
        position: relative;
        padding: 0 0 0 17px;
        .info-box {
          background-color: #fff;
          padding: 12px 12px 12px 0;
          position: relative;
          .title-row {
            .icon {
              width: 4px;
              height: 4px;
              position: absolute;
              left: 0;
              top: 0;
              background-color: #ccc;
              border-radius: 100%;
              transform: translate(-19px, 5px);
              z-index: 1;
            }
          }
        }
        &.last {
          &::after {
            height: calc(200% - 38px);
            transform: translateY(19px) scale(0.5);
          }
        }
        &.first {
          &::after {
            height: 38px;
          }
        }
        &.active {
          .title-row {
            .icon {
              width: 10px;
              height: 10px;
              position: absolute;
              left: 0;
              top: 0;
              border: 3px solid #FFBA02;
              border-radius: 100%;
              transform: translate(-22px, 2px);
              z-index: 1;
              background-color: #fff;
            }
          }
          &.last {
            &::after {
              height: calc(200% - 28px);
              transform: translateY(14px) scale(0.5);
            }
          }
          &.first {
            &::after {
              height: 28px;
            }
          }
        }
      }
    }
  }
}
</style>
