<!-- 门店状态，已打烊、接受预定 -->
<template>
  <div class="tag-data-list">
    <div class="reserve" v-if="data.reserveType && data.openingTime">
      <div class="bg">接受預定</div>
      <div class="label">{{ data.openingTime }} 開始配送</div>
    </div>
    <div :class="`close-tag ${!nextDayOpeningTime(data)?'only':''}`" v-if="data.businessType === false && !data.openingTime">
      <div class="tag">已打烊</div>
      <div class="label" v-if="nextDayOpeningTime(data)">{{nextDayOpeningTime(data)}}</div>
      <div class="label" v-else-if="closeText">{{closeText}}</div>
    </div>
  </div>
</template>

<script>
import { nextDayOpeningTime } from './utils';

export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    nextDayOpeningTime() {
      return item => {
        return nextDayOpeningTime(item);
      };
    },
    // 打烊文案
    closeText() {
      const closedType = this.data.closedType;
      const textMap = {
        1: this.$t("STORE_Closed1"),
        2: this.$t("STORE_Closed2"),
        // 3: this.$t("STORE_Closed")
      };
      return textMap[closedType];
    }
  },

  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.tag-data-list{
  display:flex;
  align-items:center;
  .reserve {
    display: inline-flex;
    align-items:center;
    width: fit-content;
    height: 16px;
    color: #64C879;
    border-radius: 4px;
    border: 0.5px solid #64C879;
    font-size: 11px;
    .bg {
      border-radius: 4px 0 0 4px;
      line-height:16px;
      height: 16px;
      padding:0 5px 0 4px;
      background: #64C879;
      color: #fff;
    }
    .label {
      padding:0 4px;
      text-align: center;
    }
  }
  .close-tag{
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
    border: 0.5px solid #DFDFE0;
    border-radius: 4px;
    box-sizing: border-box;
    overflow: hidden;
    font-size: 11px;
    &.only{
      border: 0;
    }
    >.tag {
      background: linear-gradient(90deg, #A2A7B0 0%, #9298A2 100%);
      padding: 0 5px;
      color:#ffFFFF;
      height: 17px;
      line-height: 17px;
      border-radius: 4px 0px 0px 4px;
    }
    >.label{
      color: #9298A2;
      padding: 0 4px;
    }
  }
}
</style>
