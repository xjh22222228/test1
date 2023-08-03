<template>
  <van-count-down @finish="finish" :time="time" :class="[type, 'count-down']">
    <template #default="timeData">
      <span class="time-block">{{ (timeData.hours+'').padStart(2,'0') }}</span>
      <span class="colon">:</span>
      <span class="time-block">{{ (timeData.minutes+'').padStart(2,'0') }}</span>
      <span class="colon">:</span>
      <span class="time-block">{{ (timeData.seconds+'').padStart(2,'0') }}</span>
    </template>
  </van-count-down>
</template>

<script>
import { CountDown } from "vant";
export default {
  props: {
    time: {
      default: 0
    },
    type: {
      default: "type0"
    }
  },
  components: {
    [CountDown.name]: CountDown
  },
  data() {
    return {};
  },
  computed: {},

  mounted() {},

  methods: {
    finish() {
      this.$store.dispatch('getMarketTodaySeckill');
    }
  }
};
</script>
<style lang="less" scoped>
.count-down {
  .colon {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    margin: 0 4px;
    color: #f54747;
  }
  .time-block {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    border-radius: 4px;
    background-color: #f54747;
  }
  &.type1 {
    .colon {
      color: #fff;
    }
    .time-block {
      color: #f54747;
      background-color: #fff;
    }
  }
}
</style>
