import marketFee from '@/views/activity/h5/components/2.4.0/marketBaseStore/deliveryFee/index.vue';
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';
import NoSalePureMark from '@/views/market/components/goods/no-sale/pure-mark';
import NoSaleTextIcon from '@/views/market/components/goods/no-sale/text-icon';
import { isNoSale } from '@/views/market/components/goods/no-sale/utils';
import filter from '@/JS/filter.js';
import { Image as VanImage } from 'vant';
import mf from '@/JS/mFoodSDK';
import VipTag from '@/views/activity/h5/components/vip-tag';

export default {
  components: {
    marketFee,
    TagGroup,
    NoSalePureMark,
    NoSaleTextIcon,
    VipTag,
    [VanImage.name]: VanImage
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      imgCompress: filter.imgCompress
    };
  },

  methods: {
    // 不可售
    isNoSale() {
      return isNoSale(this.data);
    },
    // 跳转到门店
    goStore(storeId, productId) {
      mf.goMarketStore({
        id: storeId
      });
    },
    goStoreProduct(data) {
      mf.goMarketStore({
        id: data.storeId,
        productId: data.id,
        data
      });
    },
    onViewSaleTime() {
      this.$emit('view-sale-time');
    }
  }
};
