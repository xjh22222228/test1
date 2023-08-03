<template>
  <div class="ad9" v-show="marketBanner.show">
    <SwiperBannerComponents
      :click-type="2"
      ref="marketBanner"
      :config.sync="marketBanner"
      from="點餐頁中通廣告"
      :stop-click="true"
      @click="onClick"
    />
  </div>
</template>

<script>
import SwiperBannerComponents from "../../../components/swiperBanner/index";
import { debounce } from 'lodash';

export default {
  components: {
    SwiperBannerComponents
  },

  data() {
    return {
      marketBanner: {
        bannerType: 'marketStoreIndexBanner',
        show: false
      }
    };
  },

  computed: {
    // 是否开启首页装修
    indexStatusOpen() {
      return this.$store.state.marketStore.marketStoreIndexStatus.status;
    }
  },

  watch: {
    indexStatusOpen: {
      immediate: true,
      handler() {
        this.getData();
      }
    }
  },

  activated() {
    this.marketBanner.show = this.$refs.marketBanner?.data?.length > 0;
  },

  methods: {
    getData: debounce(function() {
      if (this.indexStatusOpen) {
        this.$refs.marketBanner?.onAction().then(() => {
          this.$refs.marketBanner.onReset();
          this.marketBanner.show = this.$refs.marketBanner?.data?.length > 0;
        });
      } else {
        this.$refs.marketBanner.resetData();
      }
    }, 50),

    onClick(data) {
      if (data.classifyId) {
        this.$emit('viewAll', { ...data, payloadType: 'ad' })
      }
    }
  }
};
</script>

<style lang="less" scoped>
.ad9 {
  margin: 12px 12px 0 12px;
}
</style>
