import NavBar from '@/components/2.0.0/nav';
import TabBar from '../../components/tabBar/index.vue';
import SearchBar from '../../components/search-bar/index.vue';
import GoodsZone from '../components/goods-zone/index.vue';
import SwiperBannerComponent from "../../components/swiperBanner/index";
import NewCoupon from '../components/new-coupon/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import utils from '@/JS/utils';
import shareBtn from "@/views/activity/components/shareBtn";
import shareMixins from "@/views/share/shareMixins.js";
import HistoryOrderFloat from '../../components/historyOrderFloat/index.vue';
import { debounce } from 'lodash';

export default {
  mixins: [shareMixins],
  components: {
    GoodsZone,
    NavBar,
    TabBar,
    SearchBar,
    SwiperBannerComponent,
    NewCoupon,
    ScrollBar,
    shareBtn,
    HistoryOrderFloat
  },

  data() {
    return {
      openBrowserVisible: false,
      safeClassName: utils.getSafeTopClassName('padding'),
      marketBanner: {
        bannerType: "marketHomeTopBanner"
      },
      headerHeight: 46,
      stickyTop: false,
      loading: true
    };
  },

  computed: {
    memberInfo: function() {
      return this.$store.getters.memberInfo;
    },
    marketHomeStyle() {
      return this.$store.state.marketHome.marketHomeStyle;
    },

    // 背景图片
    imageUrl() {
      return this.$store.state.marketHome.marketNewRedpacket?.imageUrl;
    },

    marketNewRedpacket() {
      return this.$store.state.marketHome.marketNewRedpacket;
    },

    redpackList() {
      return this.marketNewRedpacket?.redpackList || [];
    },
    partakeInfo() {
      return this.$store.state.marketHome.marketNewRedpacket || {};
    },

    // 活动已结束
    isOver() {
      return (this.marketNewRedpacket?.id == null || this.redpackList.length <= 0) &&
        !this.loading;
    },
    isShare() {
      return this.$route.query.isShare;
    }
  },

  watch: {
    isOver() {
      this.$nextTick(() => {
        this.getAllData();
      });
    }
  },

  deactivated() {
    this.destroy();
  },
  destroyed() {
    this.destroy();
  },

  mounted() {
    this.$nextTick(() => {
      this.getAllData();
      this.init();
    });
  },

  methods: {
    destroy() {
      const mainEl = document.querySelector('.mescroll');
      if (mainEl) {
        mainEl.removeEventListener('scroll', this.onScroll);
      }
    },

    init() {
      this.destroy();
      const mainEl = document.querySelector('.mescroll');
      if (mainEl) {
        mainEl.addEventListener('scroll', this.onScroll);
      }
      const headerEl = this.$refs.header;
      if (!headerEl) return;
      this.headerHeight = headerEl.offsetHeight;
      this.stickyTop = mainEl.scrollTop > this.headerHeight;
    },

    onDownCallback(done) {
      this.getAllData().finally(() => {
        done && done();
      });
    },

    onScroll(e) {
      const top = e.target.scrollTop;
      this.stickyTop = top > this.headerHeight;
    },

    getGoodsData(params) {
      const productSkuIds = sessionStorage.getItem('newProductSkuIds');
      // sessionStorage.removeItem('newProductSkuIds'); // 移除，避免下次重复传递
      return this.$store.dispatch('getNewMarketGoods', {
        ...params,
        // 这里需要传参，把首页的新人专区id参数传过去
        ids: productSkuIds ? productSkuIds.split(',') : null
      }).then(res => {
        if (params?.offset === 0) {
          const mainEl = document.querySelector('.mescroll');
          if (mainEl) {
            mainEl.scrollTop = 0;
          }
        }
        return res;
      });
    },

    getAllData: debounce(async function () {
      this.$store.dispatch('getMarketNewUser').finally(() => {
        this.loading = false;
      });
      this.$refs.history.getData();
      await Promise.all([
        this.$refs.goods?.getGoodsData(),
        this.$store.dispatch('getMarketNewRedpacket')
      ]);
      this.$toast.clear();
    }, 300),

    goHomePage() {
      this.$router.replace('/market/index');
    },

    share() {
      this.$refs.share.share({
        shareTitle: this.partakeInfo.shareTitel || `mFood用戶-邀請你領取新人紅包`,
        shareRemark: this.partakeInfo.shareRemark || '',
        shareImage: this.partakeInfo.smallImage || null
      });
    },
    openBrowser() {
      if (this.isWechat) {
        this.openBrowserVisible = true;
      } else {
        this.openApp();
      }
    }
  }
};
