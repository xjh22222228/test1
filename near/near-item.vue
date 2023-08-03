<template>
  <div class="near-box3">
    <div class="near-item2" @click="goStore(item)">
      <div class="img">
        <van-image radius="8" :src="item.thumbnailHead" />
      </div>
      <div class="detail">
        <div class="name-data-list">
          <div class="name ellipsis2">{{ item.name }}</div>
        </div>

        <!-- 门店状态 -->
        <store-status :data="item" />

        <div class="point mg-b-5" v-if="item.commentSwitch">
          <div class="flex ai-center">
            <svg-icon :icon-class="item.score?'icon_system_star_light':'icon_system_star_dull'"
                      class="size16" />
            <span :class="{default:!item.score}">{{ item.score||'暫無' }}</span>
          </div>
          <div class="faraway-icon" v-if="item.isFaraway">超遠送</div>
          <div class="delivery" v-else-if="item.qualityDelivery">mFood送</div>
        </div>

        <div class="flex-sb">
          <div class="default-label fee-label" >
            <marketFee :data="item"/>
          </div>
          <div class="default-label">{{ $$km(item.distance) }}</div>
        </div>
        <!-- 标签 -->
        <tag-group :data="item" store :show-delivery="false"></tag-group>
      </div>
    </div>

    <!-- 展示商品 -->
    <div class="products" v-if="productCount !== -1 && item.products && item.products.length >= productCount">
      <div class="pitem" v-for="data of item.products" :key="data.productId" @click="goStoreProduct(data)">
        <div class="top" :style="{backgroundImage: `url(${data.productImg})`}">
          <img v-if="data.iconUrl" class="left-top-img" :src="data.iconUrl | imgCompress" />

          <div class="rate" v-if="data.discountCommonRate && data.isDiscount && data.discountCommonPrice != null && !data.isDiscountMember">{{ fixed1(data.productDiscountRate) }}</div>
          <!-- 会员价标签 -->
          <vip-tag :data="data" :type="4" v-else-if="data.discountMemberPrice" />

          <!-- 售罄 -->
          <sellout-component v-if="data.sellout" />
          <!-- 不可售 -->
          <no-sale-mark v-else :data="data" />
        </div>
        <div class="pname ellipsis">{{data.productName}}</div>

        <div class="price">
          <span class="unit">MOP</span>
          <span class="amt">{{data.discountCommonPrice || data.oldDiscountAmt || data.seckillPrice || data.storeSalePrice}}</span>
          <del class="del" v-if="data.discountCommonPrice != null || data.oldDiscountAmt != null || data.seckillPrice != null">MOP{{ data.storeSalePrice }}</del>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Image as VanImage, Icon } from "vant";
import marketFee from '@/views/activity/h5/components/2.4.0/marketBaseStore/deliveryFee/index.vue';
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';
import VipTag from '@/views/activity/h5/components/vip-tag/index.vue';
import SelloutComponent from '@/views/market/components/goods/item/sellout.vue';
import mf from "@/JS/mFoodSDK";
import NoSaleMark from '@/views/market/components/goods/no-sale/mark';
import StoreStatus from './store-status.vue';

export default {
  props: {
    // 商品大于等于多少个时才显示商品列表, -1 不显示
    productCount: {
      type: Number,
      default: 3
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    [VanImage.name]: VanImage,
    [Icon.name]: Icon,
    marketFee,
    TagGroup,
    VipTag,
    SelloutComponent,
    NoSaleMark,
    StoreStatus
  },
  data() {
    return {
      starIcon: require("@/views/market/components/store-item/near-store/icon_system_star_light@2x.png"),
    };
  },
  methods: {
    fixed1(number) {
      if (!number) {
        return '0.0';
      }
      return parseFloat(number).toFixed(1);
    },
    goStore(data) {
      if (this.$listeners.click) {
        this.$emit('click', data);
      } else {
        mf.goMarketStore({
          id: data.id,
          data: {
            ...data
          }
        });
      }
    },
    // 跳转到门店并定位到商品
    goStoreProduct(data) {
      mf.goMarketStore({
        id: data.storeId,
        productId: data.id,
        data
      });
    }
  }
};
</script>
<style lang='less' scoped>
.near-box3 {
  width: 100%;
  background-color: #fff;
  margin-top: 8px;
  border-radius: 12px;
  padding-bottom: 12px;
  .products {
    display: flex;
    margin-top: 7px;
    overflow: hidden;
    overflow-x: auto;
    padding-left: 12px;
    padding-top: 2px;
    .pitem {
      width: 104px;
      min-width: 104px;
      margin-right: 8px;
      &:nth-last-child(1) {
        margin-right: 12px;
      }
    }
    .top {
      position: relative;
      width: 100%;
      height: 78px;
      border: .5px solid #E5E5E5;
      border-radius: 8px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      .left-top-img {
        top: -2px;
        left: -2px;
        z-index: 11;
        position: absolute;
        height: 18px;
        width: auto;
      }
      .rate {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 11px;
        color: #fff;
        background: #FF666A;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border-radius: 0px 8px 0px 8px;
      }
    }
    .pname {
      color: #333;
      font-size: 12px;
      text-align: left;
    }
    .price {
      position: relative;
      display: flex;
      color: #F54747;
      align-items: flex-end;
      overflow: hidden;
      margin-top: 2px;
      &::after {
        content: "";
        width: 4px;
        height: 100%;
        background: linear-gradient(270deg, #FFFFFF 0%, rgba(255,255,255,0) 100%);
        position: absolute;
        top: 0;
        right: 0;
      }
      del {
        color: #999;
        font-size: 9px;
        margin-left: 2px;
      }
      .unit {
        font-size: 9px;
        font-weight: bold;
      }
      .amt {
        font-weight: bold;
        font-size: 16px;
        line-height: 1;
      }
    }
  }
}
.near-item2 {
  width: 100%;
  display: flex;
  background-color: #fff;
  overflow: hidden;
  padding: 12px 12px 0 12px;
  border-radius: 12px 12px 0 0;
  .size16{
    font-size: 16px;
  }
  .flex {
    display: flex;
  }
  .flex-sb {
    display: flex;
    justify-content: space-between;
  }
  .ai-center {
    align-items: center;
  }
  .mg-b-5 {
    margin-bottom: 5px;
  }
  .img {
    width: 56px;
    display: block;
    flex-shrink: 0;
  }
  .detail {
    flex-grow: 1;
    margin-left: 8px;
    overflow: hidden;
    .fee-label {
      flex:1;
      overflow:hidden;
      margin-right:10px;
    }
    .default-label {
      font-size: 11px;
      color: #999;
      .del-amt {
        margin-left: 8px;
        text-decoration: line-through;
      }
    }
    .name-data-list{
      display:flex;
      justify-content: space-between;
      align-items:flex-start;
      .name {
        color: #333;
        font-weight: bold;
        text-align: left;
        font-size: 16px;
        margin-bottom: 4px;
      }
      .delivery {
        margin-left:10px;
        margin-top:2px;
        flex-shrink:0;
        color: #fa6c17;
        font-size: 11px;
        padding: 0px 8px;
        height:18px;
        line-height:18px;
        border-radius: 4px;
        background: #fef0e8;
      }
      .faraway-icon {
        margin-left:10px;
        margin-top:2px;
        flex-shrink: 0;
        padding: 0px 8px;
        text-align: center;
        height:18px;
        line-height:18px;
        font-size: 11px;
        background: #EFF9F1;
        border-radius: 4px;
        color: #64C879;
      }
    }
    .point {
      display: flex;
      margin-top: 4px;
      justify-content: space-between;
      color: #fa6c17;
      font-size: 12px;
      .svg-icon{
        transform:translate(0,-1px);
      }
      .default{
        color: #999999;
        line-height:20px;
      }

    }
    .tag-full {
      color: #fff;
      background: linear-gradient(90deg, #fb6d5f 0%, #e05346 100%);
      border-radius: 4px;
      margin-right: 5px;
      padding: 2px 4px;
      font-size: 11px;
    }
  }
}
</style>
