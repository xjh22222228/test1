<template>
  <van-popup
    class="cookTimePopup2"
    closeable
    v-model="show"
    position="bottom"
  >
    <h1>{{ title }}</h1>
    <div class="container-box">
      <div class="left">
        <div class="left-item"
          v-for="(item, index) of items"
          :key="item.dateStr"
          :class="{active: index === mainActiveIdx}"
          @click="clickNav(index)"
        >
          {{ item.dateStr }}
        </div>
      </div>
      <div class="right">
        <div
          class="title-item"
          @click="onSelectTime(item, index)"
          :class="{active: index === timeIndex && selectData.sendDate === item.sendDate}"
          :key="item.intervalTime + item.sendEndTime"
          v-for="(item, index) in timeList"
        >
          {{ item.promptlyType ? item.intervalTime : item.sendEndTime ? `${item.intervalTime}~${item.sendEndTime}` : item.intervalTime }}
          <span v-if="!selfPick && item.enoughAmount && !item.overWeight">
            {{'(配送費 MOP'+item.deliveryFee+')'}}
          </span>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { Popup, TreeSelect, CellGroup, Cell } from "vant";

export default {
  components: {
    [Cell.name]: Cell,
    [TreeSelect.name]: TreeSelect,
    [CellGroup.name]: CellGroup,
    [Popup.name]: Popup
  },

  data() {
    return {
      // 配送类型，1=配送，2=自取
      // 是否自取
      show: false,
      selfPick: this.$route.query.deliveryType == 2
    };
  },

  computed: {
    title() {
      if (this.selfPick) {
        return '選擇自取時間';
      }
      return '選擇預計送達時間';
    },

    items() {
      return this.selfPick
        ? this.marketAskforTime
        : this.marketCookTime;
    },

    marketOrderOther() {
      return this.$store.getters.marketOrderOther;
    },

    marketCookTime: function () {
      return this.$store.getters.marketCookTime;
    },
    // 自取]根据商超门店id获取出餐时间
    marketAskforTime: function () {
      return this.$store.getters.marketAskforTime;
    },

    selectData() {
      return this.selfPick
        ? this.marketOrderOther.askforTimeSelectData || {}
        : this.marketOrderOther.cookTimeSelectData || {};
    },

    // 时间列表
    timeList() {
      const _timeList = this.selfPick
        ? this.marketAskforTime
        : this.marketCookTime;
      return (_timeList[this.mainActiveIdx]?.cookTime || []).map(item => {
        return {
          ..._timeList[this.mainActiveIdx],
          ...item
        };
      });
    },

    // 左侧选中索引
    mainActiveIdx() {
      return (this.selfPick
        ? this.marketOrderOther.askforTimeSelectIndex
        : this.marketOrderOther.cookTimeSelectIndex) || 0;
    },

    // 右侧选中索引
    timeIndex() {
      return this.selfPick
        ? this.marketOrderOther.askforTimeIndex
        : this.marketOrderOther.cookTimeIndex;
    }
  },

  methods: {
    open() {
      this.show = true;
    },

    close() {
      this.show = false;
    },

    onSelectTime(item, index) {
      if (this.selfPick) {
        this.$emit('select-askfor-time', item, index);
      } else {
        this.$emit('select-cook-time', item, index);
      }
    },

    clickNav(idx) {
      if (this.selfPick) {
        this.$store.commit("marketOrderOther", { askforTimeSelectIndex: idx });
      } else {
        this.$store.commit("marketOrderOther", { cookTimeSelectIndex: idx });
      }
    }
  }
};
</script>

<style lang="less">
.cookTimePopup2 {
  box-sizing: border-box;
  border-radius: 12px 12px 0 0;
  max-height: 72%;

  .container-box {
    height: 300px;
    display: flex;
    overflow: hidden;
    border-top: .5px solid #ebedf0;
    .left {
      width: 100px;
      border-right: .5px solid #ebedf0;
      overflow: hidden;
      overflow-y: auto;
      font-size: 14px;
      .left-item {
        padding: 12px 0;
        color: #666;
        &.active {
          color: #FF8B1D;
          font-weight: bold;
        }
      }
    }
    .right {
      z-index: 9999;
      position: relative;
      flex: 1;
      overflow: hidden;
      overflow-y: auto;
    }
  }

  h1 {
    font-size: 17px;
    font-weight: bold;
    text-align: center;
    color: #191919FF;
    line-height: 24px;
    margin: 12px 0;
  }

  .title-item {
    z-index: 9999;
    position: relative;
    padding: 12px;
    text-align: left;
    font-size: 14px;
    color: #FF8B1D;
    white-space: nowrap;
    color: #666;
    white-space: nowrap;
    &:not(&:nth-last-child(1)) {
      border-bottom: .5px solid #ebedf0;
    }
    &.active {
      position: relative;
      color: #FF8B1D;
      font-weight: bold;
      &:before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        width: 24px;
        height: 24px;
        background-size: 100% 100%;
        background-image: url("~@/assets/images/tick@2x.png");
      }
    }
    span {
      font-size: 12px;
      display: inline;
      font-weight: normal;
    }
  }
}
</style>
