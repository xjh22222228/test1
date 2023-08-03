<template>
  <div class="scroll-view">
    <!-- 橫向滾動 -->
    <div
      class="item"
      :class="{ sellOut: item.sellOut }"
      v-for="(item, index) of list"
      :key="index"
    >
      <van-image class="img" :src="getProductImg(item.productImage)">
        <div>
          <div class="sell-out-tag" v-if="item.sellOut">已搶光</div>
          <van-image class="log" :src="item.storeLogo" />
        </div>
      </van-image>
      <!-- <div class="content"> -->
        <div class="name ellipsis">{{ item.productName }}</div>
        <div class="foot">
          <del>MOP{{ item.productPrice }}</del>
          <div class="price">
            MOP <span class="num">{{ item.seckillPrice }}</span>
          </div>
          <skBtn :sellOut="item.sellOut" @click="toStore(item,'today')" />
        </div>
      <!-- </div> -->
    </div>
  </div>
</template>

<script>
import skmixin from "../skmixin";
export default {
  props: ["list"],
  mixins: [skmixin],
  components: {},
  data() {
    return {};
  },
  computed: {},

  mounted() {},

  methods: {}
};
</script>
<style lang="less" scoped>
.sell-out-tag{
  position: absolute;
  padding: 3px 14px;
  font-size: 12px;
  font-weight: 400;
  width: 65px;
  color: #FFFFFF;
  background: rgba(0,0,0,0.5);
  border-radius: 11px;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}
.scroll-view {
  display: flex;
  .item {
    display: flex;
    flex-direction: column;
    width: 90px;
    box-sizing: content-box;
    margin-right: 8px;
    font-weight: 400;
    text-align: left;
    font-size: 10px;
    background: #fff;
    // border-radius: 8px;
    flex-shrink: 0;
    overflow: hidden;
    &.sellOut {
      .img {
        opacity: 0.6;
      }
    }
    .img {
      width: 90px;
      height: 90px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #ededed;
      padding: 5px;
      .log {
        width: 20px;
        height: 20px;
        position: absolute;
        border-radius: 4px;
        overflow: hidden;
        right: 2px;
        top: 2px;
      }
    }
    .name {
      font-size: 11px;
      color: #333333;
      margin: 4px 0;
      text-align: left;
    }
    del {
      display: block;
      color: #cccccc;
      text-align: left;
      margin-bottom: 3px;
    }
    .price {
      color: #f54747;
      text-align: left;
      margin-bottom: 4px;
      .num {
        font-weight: 600;
        font-size: 14px;
      }
    }
    .foot {
      margin: auto 0 0;
    }
  }
}
</style>
