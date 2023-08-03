import NormalZone from './normalZone/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import NewZone from './newZone/index.vue';
import WindowActive from '../components/window/active';
import WindowCollarRoll from '../components/window/collarRoll';
import WindowNewFresh from '../components/window/newFresh/index.vue';
import mf from '@/JS/mFoodSDK';
import TabBar from '../components/tabBar/index.vue';
import event from '@/JS/event';
import { isEqual } from 'lodash';

export default {
  components: {
    NormalZone,
    ScrollBar,
    NewZone,
    WindowActive,
    WindowCollarRoll,
    WindowNewFresh,
    TabBar
  },

  data() {
    return {
      hasChangeAddress: false
    };
  },

  created() {
    this.initAppSDK();
  },
  computed: {
    // 是否新人
    isNewPeople() {
      return this.$store.state.marketHome.marketIsNewUser;
    },
    // 用户地址
    memberLocation() {
      return this.$store.getters.memberLocation;
    },
    marketVistorDialogShow() {
      return this.$store.getters.marketVistorDialogShow;
    },
    marketDialogShow() {
      return this.$store.getters.marketDialogShow;
    }
  },
  watch: {
    // 监听用户坐标是否变化
    memberLocation: {
      immediate: false,
      handler(v, nv) {
        const rName = this.$route.name;
        if (['Address', 'marketIndex', 'addressSearch'].includes(rName)) {
          if (v?.point && !isEqual(v?.point, nv?.point)) {
            this.hasChangeAddress = true;
            if (rName === 'marketIndex') {
              this.getAllData();
            }
          }
        }
      }
    },
    "$route.query.redirect"(nv) {
      const path = this.$route.path;
      if (path.indexOf('/market/index') === -1) {
        return;
      }
      const { redirect, ...query } = this.$route.query;
      if (redirect) {
        this.$router.replace('/market/index');
        this.$router.push({
          path: redirect,
          query
        });
      }
    }
  },
  activated() {
    this.initAppSDK();
    this.$toast.clear();
    if (this.hasChangeAddress) {
      this.onDownCallback();
      this.hasChangeAddress = false;
    }
  },
  mounted() {
    this.getAllData(!mf.isApp);// 是APP直接 请求弹窗
  },
  methods: {
    initAppSDK() {
      const that = this;
      mf.h5RouterPush(url => {
        that.$router.push(url);
      });

      mf.h5RouterReplace(url => {
        // replace
        that.$router.replace(url);
      });

      mf.marketInnerVisit(url => {
        if (!url) {
          return;
        }
        mf.safeJumpUrl(url, 1);
      });
      mf.apiReady(['marketInnerVisit']);
    },

    onDownCallback(done) {
      event.$emit('clearMarketIndexTabCache');
      this.getAllData(true).finally(() => {
        done && done();
      });
    },
    async getAllData(isPull) {
      mf.getAppToken();
      this.$store.dispatch('getLanternList', { type: 2 }); // 大灯笼
      this.$store.dispatch('getLanternList', { type: 3 }); // 小灯笼
      this.$store.dispatch('getMarketPorcelainAd');
      this.$store.dispatch('getMarketCategory');
      this.$store.dispatch('getMarketHomeStyle');
      this.$store.dispatch('getMarketTodaySeckill');
      this.$store.dispatch('getGlobalMemberLevel'); // 获取全局配置会员等级信息
      await Promise.allSettled([
        this.$store.dispatch('getMarketGoodsTabs'), // 商品Tabs栏目
        this.$store.dispatch('getMarketNewUser'),
        this.$store.dispatch('getMarketComponents') // 组件排序列表
      ]).finally(async () => {
        this.$nextTick(async () => {
          this.$toast.clear();
          this.$refs.home?.getAllData();
          if (this.hasChangeAddress) {
            isPull = false;
          }
          if (!isPull) {
            const token = mf.getToken();
            // 已經顯示過彈窗
            if (token && this.marketDialogShow) {
              console.log('登陸後已顯示');
              return;
            } else if (!token && this.marketVistorDialogShow) {
              console.log('未登錄已顯示');
              return;
            }
            this.$store.commit('marketResetShowIndex');
            if (this.isNewPeople) {
              await this.$refs.fresh.initData();
            }
            await this.$refs.active.initData();
            this.$refs.roll.initData();
          }
        });
      });
    }
  }
};
