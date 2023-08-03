import marketFee from '@/views/activity/h5/components/2.4.0/marketBaseStore/deliveryFee/index.vue';
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';
import event from '../group/event';
import NoSaleMark from '../no-sale/mark';
import { isNoSale } from '../no-sale/utils';
import filter from '@/JS/filter.js';
import { Image as VanImage } from 'vant';
import mf from '@/JS/mFoodSDK';
import VipTag from '@/views/activity/h5/components/vip-tag';
import SelloutComponent from './sellout.vue';

const ptage = require("@/assets/images/ptage.png");

export default {
  components: {
    marketFee,
    TagGroup,
    NoSaleMark,
    VipTag,
    [VanImage.name]: VanImage,
    SelloutComponent
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    // 新用户
    newUser: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      ptage,
      imgCompress: filter.imgCompress
    };
  },

  computed: {
    // 新人红包
    redpacket() {
      return this.$store.state.marketHome.marketNewRedpacket?.redpackList || [];
    },
    // 最大金额红包
    maxAmtRedpacket() {
      const amt = this.redpacket.map(item => item.amount);
      amt.push(0);
      return Math.max(...amt);
    }
  },

  methods: {
    // 不可售
    isNoSale() {
      return isNoSale(this.data);
    },

    getAmt(data) {
      return data.discountCommonPrice || data.oldDiscountAmt || data.seckillPrice || data.storeSalePrice;
    },

    // 跳转到门店
    goStore(data, isProduct) {
      mf.goMarketStore({
        id: data.storeId,
        productId: isProduct === false ? undefined : data.id,
        data
      });
      // 统计
      if (data.productId) {
        this.$store.dispatch('browseStatistic', { id: data.productId });
      }
    },

    clickTag() {
      event.$emit('clickTag');
    }
  }
};
