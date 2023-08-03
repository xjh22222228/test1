<template>
  <header class="market-store-main msm01">
    <div class="card">
      <van-card>
        <div class="market-store-title-info" slot="title" @click="$emit('onMarketDetail')">
          <van-image lazy-load :src="marketStoreDetail.thumbnailHead|imgCompress" slot="thumb"></van-image>
          <div class="right-title">
            <p class="title ellipsis">{{$$(marketStoreDetail,'storeName')}}</p>
            <div class="infoBox">
              <div class="storeInfo">
                <store-status :data="marketStoreDetail" />
                <div class="send-tag" v-if="sendPrice">
                  <svg-icon icon-class="icon_system_courier" class="size12"/>
                  <span>{{$t('MARKET_Send_Price')}}MOP{{sendPrice}}</span>
                </div>
                <!-- 配送费信息 砍了-->
                <!--
                <div class="delivery-info2">
                  <span
                    v-if="marketStoreDetail.shippingPriceHtml"
                    class="del-icon"
                    :style="{background: deliveryInfo.bgColor}"
                  >
                    {{ deliveryInfo.text }}
                  </span>
                  <span class="del-msg">{{ marketStoreDetail.shippingPriceHtml }}</span>
                  <span class="del-amt">{{ marketStoreDetail.shippingPriceOld }}</span>
                </div>
                -->
              </div>
            </div>
          </div>
        </div>

        <div slot="footer" class="market-footer" @click="handleShowDiscountPopup">
          <storeHeaderCoupon :list="marketStoreVoucher"/>
          <div class="voucher-list-fix"></div>
          <store-tag  />
        </div>
      </van-card>
    </div>
    <store-discount ref="storeDiscount" />
  </header>
</template>

<script>
import { Card, Icon, Image as VanImage, Tag } from "vant";
import normalVip from "@/assets/images/vip_order_top_nor@2x.png";
import receiveVip from "@/assets/images/vip_order_top_sel@2x.png";
import storeHeaderCoupon from '../store-header-coupon/index.vue';
import StoreDiscount from '../../../store/components/storeDiscount/index.vue';
import StoreTag from './store-tag';
import event from '@/JS/event';
import StoreStatus from '@/views/market/near/store-status.vue';

export default {
  name: "store-heard",
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
    [VanImage.name]: VanImage,
    StoreDiscount,
    StoreTag,
    [VanImage.name]: VanImage,
    storeHeaderCoupon,
    StoreStatus
  },
  data() {
    return {
      sendPrice: 0, // 配送费
      normalVip,
      receiveVip
    };
  },
  computed: {
    // 店鋪詳情
    marketStoreDetail: function() {
      return this.$store.getters.marketStoreDetail;
    },
    // 商品折扣
    storeDiscount: function() {
      return this.$store.getters.storeDiscount;
    },
    // 店鋪代金券
    marketStoreVoucher: function() {
      return this.$store.getters.marketStoreVoucher.filter((item, index) => {
        return index < 6
      });
    },
    // 店铺满赠内容
    storeFullGift() {
      return this.$store.state.storePreferre.storeFullGift;
    },
    // 第一個贈品
    firstGift() {
      if (this.storeFullGift.fullGiftDetails?.length > 0) {
        return this.storeFullGift.fullGiftDetails[0];
      }
      return {};
    },
    // 自取折扣优惠率
    storeSelfDiscount() {
      const selfTakeOrderDiscount = this.$store.state.storePreferre.storeSelfDiscount.selfTakeOrderDiscount;
      if (selfTakeOrderDiscount == null) {
        return null;
      }
      return selfTakeOrderDiscount;
    },
    // 店铺滿返活動
    storeFullReturn() {
      return this.$store.state.storePreferre.storeFullReturn;
    },
    // 配送信息 icon 判断
    deliveryInfo() {
      const params = {};
      const detail = this.marketStoreDetail;
      if (detail.shippingPriceAllFree) {
        params.text = '免';
        params.bgColor = '#53B175';
      } else if (detail.isDeliveryActivity) {
        params.text = '減';
        params.bgColor = 'linear-gradient(90deg, #FB6D5F 0%, #E05346 100%)';
      } else {
        params.text = '運';
        params.bgColor = 'linear-gradient(90deg, #75ABFF 0%, #1FA2F2 100%)';
      }
      return params;
    }
  },

  activated() {
    event.$on('storeSendPrice', sendPrice => {
      this.sendPrice = sendPrice;
    });
  },
  deactivated() {
    event.$off('storeSendPrice');
  },
  methods: {
    // 显示优惠弹窗
    handleShowDiscountPopup() {
      this.$refs.storeDiscount.open();
    }
  }
};
</script>

<style scoped lang="less">
.market-store-main {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 2px 12px 0px rgba(0,0,0,0.11);

  >.card {
    z-index: 3;
    width: 100%;
    background: #ffffff;

    >.van-card {
      overflow: hidden;
      border-radius: 12px;
      z-index: 5;
      padding: 12px;
      background: #ffffff;
    }
  }
  .van-card__thumb {
    width: 60px;
    height: 60px;
    img {
      width: 100%;
      height: auto;
      border-radius: 4px;
    }
  }

  div.van-card__content {
    min-height: inherit;

    > div {
      flex: 1;
      display: flex;
      flex-flow: column;
      justify-content: space-between;
    }

    div.market-store-title-info {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .right-title{
        margin-left: 8px;
        display: flex;
        flex:1;
        overflow: hidden;
        flex-direction: column;
        justify-content: space-between;
        p.title {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          text-align: left;
        }

        div.infoBox {
          display: inline-flex;
          flex-flow: row;
          align-items: center;
          div.storeInfo {
            flex: 1;
            display: flex;
            flex-flow: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            .size16 {
              font-size: 16px;
            }
            .size12{
              font-size: 12px;
            }
            div.star {
              display: flex;
              align-items: center;
              span {
                font-size: 12px;
                font-weight: bold;
                color: #fa6c17;
                margin-left: 3px;
                display: flex;
                align-items: center;
                &.not {
                  font-size: 12px;
                  font-weight: normal;
                  color: #999999FF;
                }
              }
            }
            div.send-tag{
              flex: none;
              color:#666666;
              margin-right: 4px;
              margin-left: 5px;
              >span {
                font-size: 11px;
                margin-left: 4px;
                color:#666666FF;
              }
            }
            .delivery-info2 {
              font-size: 11px;
              .del-icon {
                width: 12px;
                height: 12px;
                margin-right: 2px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                border-radius: 4px;
              }
              .del-msg {
                color: #666;
                font-size: 11px;
              }
              .del-amt {
                margin-left: 2px;
                color: #ccc;
                text-decoration: line-through;
              }
            }
          }
        }
      }
      .van-image{
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
      }
    }
  }
  .market-footer{
    position:relative;overflow:hidden;
    .voucher-list-fix{
      position: absolute;
      top:0;
      right:0;
      width:8px;
      height:41px;
      background: linear-gradient(90deg, rgba(255,255,255,0.83) 0%, #FFFFFF 100%);
    }
  }
}
</style>
