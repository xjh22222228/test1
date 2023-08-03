import mf from '@/JS/mFoodSDK';
import utils from '@/JS/utils';

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    sticky: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String,
      default: '#fff'
    }
  },

  data() {
    return {
      safeClassName: utils.getSafeTopClassName('height'),
      positioning: true,
      location: null,
      isAliPay: mf.isAliPay
    };
  },

  computed: {
    // 用户地址
    memberLocation: function () {
      return this.$store.getters.memberLocation;
    },

    address() {
      const failed = this.$t('LOCATION_Failed');
      return this.memberLocation.address || failed;
    }
  },

  created() {
    this.getCurrentLocation();
  },

  methods: {
    // 获取当前定位
    getCurrentLocation() {
      mf.getHomeLocation()
        .then(location => {
          this.location = location;
          const point = {
            lat: location.point.lat,
            lon: location.point.lng
          };
          location.point = point;
          this.$store.dispatch('memberLocation', location);
        })
        .finally(() => {
          this.positioning = false;
        });
    },

    // 跳转到选择地址
    goAddress() {
      const fullPath = this.$route.fullPath;
      console.log(fullPath, 'fullPath');
      this.$store.commit('enterAddressHomePage', fullPath);
      this.$router.push({
        path: '/address',
        query: {
          from: 'market'
        }
      });
    },

    onBack() {
      if (this.$listeners.back) {
        this.$emit('back');
        return;
      }
      this.$store.dispatch('goBack');
    }
  }
};
