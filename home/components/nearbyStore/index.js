import mf from '@/JS/mFoodSDK';
import { nextDayOpeningTime } from '../../../near/utils';

export default {
  data() {
    return {
      max: 8
    };
  },

  computed: {
    storeList() {
      return this.$store.state.marketHome.nearbyStores;
    },
    stores() {
      return this.storeList.slice(0, this.max);
    },
    marketHomeStyle() {
      return this.$store.state.marketHome.marketHomeStyle;
    }
  },

  methods: {
    nextDayOpeningTime(storeData) {
      return nextDayOpeningTime(storeData);
    },
    voucherLabel(item) {
      const coupon = _.head(item?.couponList || []);
      if (!coupon) {
        return;
      }
      return `領取MOP${coupon.amount}券`;
    },
    getData() {
      this.$store.dispatch('getMarketNearStore', {
        homePage: true
      });
    },

    goNearPage() {
      this.$router.push('/market/near');
    },

    goStore(data) {
      mf.goMarketStore({
        id: data.id,
        data,
        from: '超市首頁附近商家'
      });
    }
  }
};
