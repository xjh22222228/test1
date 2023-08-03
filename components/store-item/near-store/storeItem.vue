<template>
    <div class="market-store-item-class"  @click="goStore(item)">
      <div class="img">
        <van-image radius="8" :src="item.thumbnailHead" />
      </div>
      <div class="detail">
        <div class="name-data-list">
          <div class="name ellipsis2">{{ item.name }}</div>
          <div class="faraway-icon" v-if="item.isFaraway">超遠送</div>
          <div class="delivery" v-else-if="item.qualityDelivery">mFood送</div>
        </div>
        <div class="tag-data-list">
          <div class="reserve" v-if="item.reserveType && item.openingTime">
            <div class="bg">接受預定</div>
            <div class="label">{{ openingTime}} 開始配送</div>
          </div>
          <div :class="`close-tag ${!nextDayOpeningTime?'only':''}`" v-if="!item.businessType && !item.openingTime">
            <div class="tag">已打烊</div>
            <div class="label" v-if="nextDayOpeningTime">{{nextDayOpeningTime}}</div>
          </div>
        </div>
       <div class="point mg-b-5" v-if="item.commentSwitch">
          <div class="flex ai-center">
            <svg-icon :icon-class="item.score?'icon_system_star_light':'icon_system_star_dull'"
                      class="size16" />
            <span :class="{default:!item.score}">{{ item.score||'暫無' }}</span>
          </div>
        </div>
        <div class="flex-sb mg-b-5">
          <div class="default-label fee-label" >
          <marketFee :data="item"/>
          </div>
          <div class="default-label">{{ $$km(item.distance) }}</div>
        </div>
        <!-- 标签 -->
        <tag-group :data="item" store :show-delivery="false"></tag-group>
      </div>
    </div>
</template>

<script>
import marketFee from '@/views/activity/h5/components/2.4.0/marketBaseStore/deliveryFee/index.vue';
import { Image as VanImage, Icon } from "vant";
import mf from "@/JS/mFoodSDK";
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';

export default {
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    [VanImage.name]: VanImage,
    [Icon.name]: Icon,
    marketFee,
    TagGroup
  },
  data() {
    return {
      starIcon: require("./icon_system_star_light@2x.png"),
      storeList: []
    };
  },
  computed: {
    nextDayOpeningTime() {
      const item = this.item;
      const listMap = item.listMap;
      if (!listMap) { return; }
      const date = new Date();
      const day = date.getDay();
      const time = listMap[day];
      if (time) {
        for (const tt of time) {
          const ft = this.utils.dateFormat(date, 'hh:mm');
          if (tt.startTime > ft) {
            return tt.startTime + '營業';
          }
        }
      }
      for (let index = 1; index <= 7; index++) {
        const nextday = (day + index) % 7;
        const time = listMap[nextday];
        if (!time) {
          continue;
        }
        if (time[0]) {
          const pre = index === 1 ? '明天' : this.utils.parseWeekDayLabel(nextday);
          return pre + time[0].startTime + '營業';
        }
      }
      return '';
    },
    openingTime() {
      const item = this.item;
      return item.openingTime;
    }
  },

  mounted() {
  },

  methods: {
    goStore(data) {
      mf.goMarketStore({ id: data.id, data });
    }
  }
};
</script>
<style lang='less' scoped>
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
.market-store-item-class {
  padding: 12px;
  display: flex;
  background:white;
  border-radius:12px;
  margin-top:10px;
  .img {
    width: 28%;
    max-width: 88px;
    display: block;
    flex-shrink: 0;
  }
  .detail {
    flex-grow: 1;
    margin-left: 8px;
    overflow: hidden;
    .tag-data-list{
      display:flex;
      align-items:center;
    }
    .fee-label {
      flex:1;
      overflow:hidden;
      margin-right:10px;
    }
    .default-label {
      font-size: 12px;
      color: #999;
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
        border-radius: 3px 2px 8px 3px;
      }
      >.label{
        color: #9298A2;
        padding: 0 4px;
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
        font-size: 17px;
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

    .reserve {
      display: inline-flex;
      align-items:center;
      width: fit-content;
      height: 16px;
      font-size: 11px;
      color: #5d87ee;
      border-radius: 4px;
      border: 0.5px solid #C8CCFC;
      .bg {
        border-radius: 4px 2px 8px 4px;
        background: linear-gradient(90deg, #5994F8 0%, #4786F2 100%);
        color: #fff;
        padding:0 5px 0 4px;
        line-height:16px;
        height: 16px;
      }
      .label {
        padding:0 4px;
        text-align: center;
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
      }
      .delivery {
        font-size: 11px;
        padding: 1px 8px;
        border-radius: 4px;
        background: #fef0e8;
      }
    }

    .tag-discount {
      display: flex;
      align-items: center;
      margin-right: 8px;
      color: #f54747;
      font-size: 11px;
      padding: 1px 4px;
      border-radius: 4px;
      border: 1px solid #efbebe;
      .side {
        border-left: 1px dotted #f54747;
        margin-left: 4px;
        background: #fff6f6;
        padding: 1px 2px;
        margin-right: -4px;
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
