import utils from '@/JS/utils';

export default {
  props: {
    // 样式风格, 1|2
    styleType: {
      type: String,
      default: "1"
    }
  },

  data() {
    return {
      safeClassName: utils.getSafeTopClassName('padding')
    };
  },

  methods: {
    goSearch() {
      this.$router.push({
        path: '/market/search',
        query: {
          from: 'market'
        }
      });
    },

    onBack() {
      if (this.$listeners.back) {
        return this.$emit('back');
      }
      this.$store.dispatch('goBack');
    },

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
    }
  }
};
