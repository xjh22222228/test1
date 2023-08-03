import countDown from "./components/countDown.vue";
import { Image as VanImage } from "vant";
import skBtn from "./components/skBtn";
import mf from "@/JS/mFoodSDK"
export default {
  components: {
    [VanImage.name]: VanImage,
    countDown,
    skBtn
  },
  methods: {
    async toStore (obj, network) {
      let storeId = ''
      /* 不確定服務端返回的是數組還是單個門店id */
      if (Array.isArray(obj.storeIds) && obj.storeIds.length) {
        storeId = obj.storeIds[0]
      } else if (obj.storeId) {
        storeId = obj.storeId
      }
      if (storeId) {
        const oSellOut = obj.sellOut
        let nItem = null
        if (network == 'today') {
          const newTodayDataList = await this.$store.dispatch('getMarketTodaySeckill');
          nItem = newTodayDataList?.seckillProductVoList.find(e => e.productId == obj.productId)
        } else if (network == 'category') {
          await this.$refs.scrollBar?.getData(null, true, true).then(res => {
            nItem = res?.result.find(e => e.productId == obj.productId)
          })
        }
        console.log(nItem);
        let errCode = null
        if (nItem == null || (oSellOut == false && nItem.sellOut == true)) {
          // 加载时未卖完，點擊時被賣完，跳門店（加载新的分类id）加购并弹提示
          errCode = '100000005-1'
        }
        mf.goMarketStore({
          data: nItem,
          id: storeId,
          productId: nItem?.productId,
          query: {
            addCart: '1',
            errCode
          }
        });
      }
    },
    getProductImg (s) {
      let img = null;
      if (s && typeof s == "string") {
        const arr = JSON.parse(s);
        if (Array.isArray(arr) && arr.length) {
          img = arr[0];
        }
      }
      return img;
    }
  }
}
