<template>
  <div class="sk-module" v-if="todayData.seckillProductVoList&&todayData.seckillProductVoList.length">
    <div class="head">
      <div class="l-side">
        <div class="title"></div>
        <countDown v-if="remainTime" type="type1" :time="remainTime" />
      </div>
      <div class="btn" v-if="hasCategoryRecommend" @click="toDetail">查看更多</div>
    </div>
    <div class="body">
      <!-- <div class="scroll-view">
        <div
          class="item"
          v-for="(item, index) of list"
          :key="index"
        >
          <van-image class="img" :src="getProductImg(item.productImage)">
            <van-image class="log" :src="item.storeLogo" />
          </van-image>
          <div class="foot">
            <div class="price">
              MOP <span class="num">{{ item.seckillPrice }}</span>
            </div>
            <skBtn :sellOut="item.sellOut" @click="toStore(item)"/>
          </div>
        </div>
      </div> -->
      <scrollItem :list="todayData.seckillProductVoList"></scrollItem>
    </div>
  </div>
</template>

<script>
import skmixin from "./skmixin";
import scrollItem from "./components/scroll-item.vue"
export default {
  mixins: [skmixin],
  components: {
    scrollItem
  },
  data() {
    return {
      // todayData: {
      //   seckillProductVoList: [],
      //   seckillRemainTime: 0
      // }
    };
  },
  computed: {
    todayData() {
      return this.$store.state.marketHome.seckillProductData
    },
    hasCategoryRecommend() {
      return this.todayData?.hasCategoryRecommend
    },
    remainTime() {
      const time = this.todayData?.seckillRemainTime
      return (
        time &&
        time * 1000
      );
    },
    list() {
      return this.todayData?.seckillProductVoList || [];
    }
  },

  mounted() {
  },

  methods: {
    toDetail() {
      this.$router.push({ path: "/market/seckill" });
    }
  }
};
</script>
<style lang="less" scoped>
.sk-module {
  position: relative;
  // height: 195px;
  background: linear-gradient(360deg, #f54747 0%, #ff5e5e 100%);
  border-radius: 12px;
  padding: 14px 12px;
  margin: 12px 12px;
  &::before {
    position: absolute;
    content: "";
    z-index: 0;
    width: 116px;
    top: 0;
    right: 25px;
    height: 69px;
    background: url("./img/clock_bg.png");
    background-size: cover;
  }
  .head {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding-right: 5px;
    z-index: 1;
    .l-side {
      display: flex;
      align-items: center;
      .title {
        width: 70px;
        height: 18px;
        background: url("./img/sk-title.png");
        background-size: cover;
        margin-right: 8px;
      }
    }
    .btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #f54747;
      background: linear-gradient(180deg, #ffd94d 0%, #ffc740 100%);
      border-radius: 13px;
      border: 1px solid rgba(255, 241, 184, 1);
    }
  }

  // .body {
  //   width: 100%;
  //   overflow: auto;
  //   padding-top: 14px;
  //   .scroll-view {
  //     display: flex;

  //     .item {
  //       width: 90px;
  //       // height: 137px;
  //       padding: 6px 0 6px;
  //       flex-shrink: 0;
  //       text-align: center;
  //       background: #ffffff;
  //       margin-right: 8px;
  //       border-radius: 8px;
  //       & > .img {
  //         display: block;
  //         width: 82px;
  //         height: 82px;
  //         overflow: hidden;
  //         border-radius: 4px;
  //         margin: 0 auto 5px;
  //         .log {
  //           position: absolute;
  //           width: 20px;
  //           height: 20px;
  //           border-radius: 4px;
  //           overflow: hidden;
  //           top: 1px;
  //           right: 1px;
  //         }
  //       }
  //       .price {
  //         font-size: 12px;
  //         font-weight: 600;
  //         margin-bottom: 4px;
  //         color: #f54747;
  //       }
  //     }
  //   }
  // }
  .body{
    width: 100%;
    overflow: auto;
    padding-top: 14px;
    ::v-deep .item{
      padding:5px;
      text-align: center;
      border-radius: 8px;
    }
  }
}
</style>
