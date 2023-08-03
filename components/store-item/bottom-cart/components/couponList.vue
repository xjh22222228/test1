<template>
  <div>
    <!-- ui : https://lanhuapp.com/web/#/item/project/stage?pid=0837b11c-8c3d-4e01-a7f2-77d908c30bbb&image_id=168778a6-8178-4985-a839-39f7611fcfa4&tid=33903ac2-64db-46c3-94c3-dd127d2eff1c -->
    <van-popup
      class="market-coupon123"
      v-model="show"
      closeable
      close-icon="close"
      get-container="body"
      safe-area-inset-bottom
      round
      position="bottom"
    >
      <div class="head">
        <span class="l">您共有{{ marketMemberCoupon.length }}張商品券</span>
        <span class="r">選擇商品並下單後即表示使用商品券</span>
      </div>
      <div class="list">
        <div class="item" v-for="item of marketMemberCoupon" :key="item.mallCouponUserId">
          <van-image class="img" :src="item.productImg" />
          <div class="content">
            <p class="name ellipsis">{{ item.productName }}</p>
            <p class="ex-time">{{item.validTimeStr}}</p>
            <div class="price-wrap">
              <div class="tag">券後價</div>
              <div class="prize">
                <span class="unit">MOP</span>{{item.__price__}}
              </div>
              <del>MOP{{ item.defaultSku.skuPrice }}</del>

              <div class="stepper">
                <van-stepper
                  v-if="item.availableType"
                  @minus="onMinus(item)"
                  @plus="onPlus(item)"
                  :default-value="0"
                  :value="(cartProductMap[item.mallCouponUserId] && cartProductMap[item.mallCouponUserId].quantity) || 0"
                  theme="round"
                  button-size="22"
                  disable-input
                  :show-minus="(cartProductMap[item.mallCouponUserId] && cartProductMap[item.mallCouponUserId].quantity) > 0"
                  :show-input="(cartProductMap[item.mallCouponUserId] && cartProductMap[item.mallCouponUserId].quantity) > 0"
                  :min="0"
                  :max="1"
                />
                <div v-else class="unsold" @click="showSaleTime(item.saleTime)">
                  {{item.availableTime}}<van-icon size=".14rem" name="question-o" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
import { Popup, Image as VanImage, Stepper, Dialog, Icon } from "vant";

export default {
  components: {
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [VanImage.name]: VanImage,
    [Stepper.name]: Stepper,
    [Dialog.Component.name]: Dialog.Component
  },
  data() {
    return {
      show: false
    };
  },
  computed: {
    // 共有多少張商品券
    marketMemberCoupon() {
      return this.$store.getters.marketMemberCoupon
    },
    cartProductMap() {
      return this.$store.getters.marketCartProductMap
    }
  },

  methods: {
    popupShow() {
      this.show = true;
    },
    onMinus(data) {
      // 移除操作
      this.$store.dispatch('minusCoupon', data);
    },
    onPlus(data) {
      // 加購操作
      this.$store.dispatch('plusCoupon', data);
    },
    showSaleTime(saleTime) {
      const { commit } = this.$store;
      commit('storeTakeoutTimeData', saleTime);
      commit('storeTakeoutTimeState', true);
    }
  }
};
</script>
<style lang="less">
.market-coupon123 {
  max-height: 59vh;
  display: flex;
  flex-direction: column;
  overflow: initial;
  padding: 12px;
  .van-popup__close-icon {
    position: absolute;
    top: -36px;
    font-size: 24px;
    color: #fff;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
    .l {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
    }
    .r {
      font-size: 12px;
      font-weight: 400;
      color: #666666;
    }
  }
  .list {
    flex: 1;
    overflow: auto;
    .item {
      margin-bottom: 20px;
      display: flex;
      .img {
        margin-right: 6px;
        width: 94px;
        height: 94px;
        overflow: hidden;
        border-radius: 8px;
      }
      .content {
        display: flex;
        flex: 1;
        flex-direction: column;
        .name {
          font-size: 16px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 6px;
        }
        .ex-time {
          font-size: 11px;
          font-weight: 400;
          color: #666666;
        }
        .price-wrap {
          display: flex;
          // align-items: baseline;
          align-items: center;
          width: 100%;
          margin: auto 0 0 0;
          .tag {
            word-break: keep-all;
            font-size: 10px;
            font-weight: 400;
            color: #f54747;
            border-radius: 6px;
            border: 1px solid #fcc8c8;
            padding: 1px 4px;
            margin-right: 4px;
          }
          .prize {
            font-size: 16px;
            font-weight: 600;
            color: #f54747;
            margin-right: 4px;
            .unit {
              font-size: 9px;
            }
          }
          del {
            font-size: 9px;
            font-weight: 400;
            color: #999999;
          }
        }

        .stepper {
          margin: 0 0 0 auto;
          .van-stepper__input {
            width: 12px;
            height: 20px;
            background: transparent;
            font-size: 12px;
            font-weight: bold;
            color: #333333ff;
          }

          .van-stepper__minus {
            color: #fa6c17ff;
            width: 20px;
            height: 20px;
            background: #ffffff;
            overflow: hidden;
            border-radius: 50%;
            border: 1px #fa6c17ff solid;

            &.van-stepper__minus--disabled {
              opacity: 0.5;
            }
          }

          .van-stepper__plus {
            color: #ffffff;
            background: #fa6c17ff;
            width: 20px;
            height: 20px;
            overflow: hidden;
            border-radius: 50%;

            &.van-stepper__plus--disabled {
              opacity: 0.5;
            }
          }
          .unsold {
            font-size: 8px;
            font-weight: 500;
            color: #999999;
            .van-icon {
              font-size: 14px;
              margin-left: 2px;
              vertical-align: bottom;
            }
          }
        }
      }
    }
  }
}
</style>
