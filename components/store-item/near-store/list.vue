<template>
  <div class="store-list">
    <StoreItem :key="index" :item="item" v-for="(item, index) of storeList" />
  </div>
</template>

<script>
import { Image as VanImage, Icon } from "vant";
import { post } from "@ajax";
import mf from "@/JS/mFoodSDK";
import StoreItem from './storeItem.vue';

export default {
  props: {
    notIn: {
      type: String,
      default: ''
    }
  },
  components: {
    [VanImage.name]: VanImage,
    [Icon.name]: Icon,
    StoreItem
  },
  data() {
    return {
      starIcon: require("./icon_system_star_light@2x.png"),
      storeList: []
    };
  },
  computed: {
    nextDayOpeningTime() {
      return item => {
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
      };
    },
    openingTime() {
      return item => {
        return item.openingTime;
      };
    }
  },

  mounted() {
  },

  methods: {
    goStore(data) {
      mf.goMarketStore({ id: data.id, data });
    },
    getData() {
      post("/market/store/near/_list", {
        // 排除當前門店
        notIn: [this.notIn || this.$route.query.id || null]
      }).then((res) => {
        this.storeList = res.result;
        const list = res.result || [];
        if (list.length) {
          this.$emit('show');
        }
      });
    }
  }
};
</script>
<style lang='less' scoped>
.store-list {
  max-height: 40vh;
  overflow: auto;
  padding: 12px 0;
  margin-top: 12px;
}
</style>
