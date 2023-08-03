<template>
  <div class="store-tag0" v-if="discountNumber" @click="onClickArrow">
    <div class="left" ref="left">
      <span class="titem full-tag" v-if="discountData.rate != null">
        {{discountData.rate}}折{{discountData.multiple ? '起' : null}}
      </span>
      <span class="titem mt8" v-if="seckillDiscount != null">限时秒杀 {{seckillDiscount}}折起</span>
      <!-- 滿減優惠內容 -->
      <!-- <span class="titem" v-if="marketStoreActivity.length > 0">
        <span class="full-tag">{{marketStoreActivity[0].activityType === 1 ? '滿減' : '滿折'}}</span>{{fullReduceMsg}}
      </span> -->

      <!-- 买赠 -->
      <span class="titem" v-if="buyGiftData">
        <span class="full-tag">買贈</span>購買指定商品得贈品（贈完即止）
      </span>

      <!-- 组合价 -->
      <span class="titem" v-if="groupList.length > 0">
        <span class="full-tag">組合</span>{{ groupList[0].activityName }}
      </span>
    </div>
    <div class="right">
      全部 {{ discountNumber }} 個優惠
      <div class="arrow-icon"></div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  data() {
    return {
    };
  },

  computed: {
    // 計算總共有多少個優惠
    discountNumber() {
      let discountNumber = 0;
      if (this.storeDiscount.productDiscountRate != null) {
        discountNumber += 1;
      }
      if (this.storeDiscount.oldProductDiscountRate != null) {
        discountNumber += 1;
      }
      if (this.storeDiscount.seckillDiscount != null) {
        discountNumber += 1;
      }
      if (this.giftBuyList.length > 0) {
        discountNumber += 1;
      }
      discountNumber += this.groupList.length;
      // discountNumber += this.marketStoreActivity.length;
      return discountNumber;
    },

    // 門店優惠信息
    storeDiscount() {
      return this.$store.state.marketStore.marketStoreDiscount;
    },

    // 秒杀折扣
    seckillDiscount() {
      return this.storeDiscount.__seckillDiscount__;
    },

    // 折扣比例（兼容新旧）
    discountData() {
      const data = {};
      const rate = this.storeDiscount.productDiscountRate;
      const oldRate = this.storeDiscount.oldProductDiscountRate;
      if (rate == null && oldRate == null) {
        return data;
      }
      let minRate = rate ?? oldRate;
      data.multiple = this.storeDiscount.multiple || this.storeDiscount.oldMultiple;
      if (rate != null && oldRate != null && oldRate < rate) {
        minRate = oldRate;
      }
      data.rate = Number((minRate * 10).toFixed(2));
      return data;
    },

    // 滿減活動
    marketStoreActivity() {
      return this.$store.state.marketStore.marketRawStoreActivity;
    },

    // 滿減優惠文案
    fullReduceMsg() {
      const msgArr = [];
      this.marketStoreActivity.forEach(act => {
        msgArr.push(act.activityName);
        act.discountContentList.forEach((disc, idx) => {
          const msg = act.activityType === 1
            ? `滿 ${disc.fullAtm} 減 ${disc.discount}`
            : `滿 ${disc.fullAtm} 打 ${disc.discount * 10} 折`;
          if (idx === 0) {
            msgArr[msgArr.length - 1] += msg;
          } else {
            msgArr.push(msg);
          }
        });
      });
      return msgArr.join('，');
    },

    // 买赠活动列表
    giftBuyList() {
      return this.$store.state.marketStore.marketGiftBuyList;
    },

    // 买赠
    buyGiftData() {
      if (this.giftBuyList.length > 0) {
        return this.giftBuyList[0];
      }
      return null
    },

    // 组合价列表
    groupList() {
      return this.$store.state.marketStore.marketGroupList;
    }
  },

  watch: {
    '$route.query.id'(n, o) {
      if (n !== o) {
        this.getDiscountInfo();
      }
    },
    discountNumber: {
      immediate: true,
      handler() {
        this.watchOver();
      }
    }
  },

  methods: {
    // 监听超出
    watchOver() {
      this.$nextTick(() => {
        const leftEl = this.$refs.left;
        if (!leftEl) {
          return;
        }
        const tagEls = leftEl.querySelectorAll('.titem');
        const containerWidth = leftEl.offsetWidth - 30;
        for (let i = 0; i < tagEls.length; i++) {
          const tagEl = tagEls[i];
          const offsetLeft = tagEl.offsetLeft;
          if (offsetLeft > containerWidth) {
            tagEl.style.opacity = '0';
          } else {
            tagEl.style.opacity = '1';
          }
        }
      });
    },

    onClickArrow() {
      this.getDiscountInfo();
      this.$emit('click');
    },
    // 獲取優惠信息
    getDiscountInfo: debounce(function() {
      if (this.$route.name === 'marketStore') {
        this.$store.dispatch('getMarketStoreDiscount');
      }
    }, 100)
  },

  activated() {
    this.getDiscountInfo();
  }
};
</script>

<style lang="less" scoped>
.store-tag0 {
  text-align: left;
  margin-top: 7px;
  display: flex;
  align-items: center;
  .left {
    flex: 1;
    font-size: 11px;
    color: #666;
    padding: 2px 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .full-tag {
      height: 16px;
      border-radius: 4px;
      padding: 0 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #FCC8C8;
      color: #F54747;
      font-size: 11px;
      margin-right: 8px;
    }
    .mt8 {
      margin-right: 8px;
    }
  }
  .right {
    font-size: 11px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 30px;
    .arrow-icon {
      z-index: 9;
      position: relative;
      width: 12px;
      height: 12px;
      background-image: url("./arrow.png");
      background-size: 12px;
    }
  }
}
</style>
