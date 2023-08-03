import HeaderLocation from '../../components/headerLocation/index.vue';
import SearchBar from '../../components/search-bar/index.vue';
import LanternSwiper from '../components/lanternSwiper/index.vue';
import GoodsZone from '../components/goods-zone/index.vue';
import SwiperBannerComponent from "../../components/swiperBanner/index";
import NewCoupon from '../components/new-coupon/index.vue';
import CenterAd from '../components/centerAd/index.vue';
import GoodsHorizontal from '../components/goods-horizontal/index.vue';
import StickyHeader from '../components/sticky-header/index.vue';
import newZoneImg from './img/bg.png';
import bgAnimateImg from './img/bg-animate.png';
import NearbyStore from '../components/nearbyStore/index.vue';
import GoodsTab from '../components/goods-zone/tab';
import Seckill from "../../seckill/module.vue"
import HistoryOrderFloat from '../../components/historyOrderFloat/index.vue';
import SmallLantern from '../components/small-lantern/index.vue';

export default {
  components: {
    GoodsZone,
    HeaderLocation,
    SearchBar,
    LanternSwiper,
    SwiperBannerComponent,
    NewCoupon,
    CenterAd,
    GoodsHorizontal,
    StickyHeader,
    NearbyStore,
    GoodsTab,
    Seckill,
    HistoryOrderFloat,
    SmallLantern
  },

  data() {
    return {
      marketBanner: {
        bannerType: "marketHomeTopBanner"
      },
      // 中通
      marketHomeMidBanner: {
        bannerType: "marketHomeMidBanner"
      },
      showStickyHeader: false,
      showGoodsTab: false,
      topHeight: 88,
      scrollTop: 0, // 当前滚动位置
      bgAnimateImg
    };
  },

  computed: {
    styleConf() {
      return this.$store.state.marketHome.marketHomeStyle;
    },
    marketNewRedpacket() {
      return this.$store.state.marketHome.marketNewRedpacket;
    },

    redpackList() {
      return this.marketNewRedpacket?.redpackList || [];
    },
    // 活动结束
    isOver() {
      return this.marketNewRedpacket?.id == null || this.redpackList.length <= 0;
    },
    bgImage() {
      return this.isOver ? this.styleConf.backgroundImageUrl : newZoneImg;
    },
    appSafeTop() {
      return this.$store.state.marketHome.appSafeTop;
    },
    // 组件列表
    marketComponents() {
      return this.$store.state.marketHome.marketComponents;
    }
  },

  activated() {
    this.init();
  },

  deactivated() {
    this.destroy();
  },
  destroyed() {
    this.destroy();
  },

  mounted() {
    this.init();
  },

  methods: {
    destroy() {
      this.bgAnimateImg = null;
      const scrollEl = document.querySelector('.mescroll');
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', this.handleScroll);
      }
    },
    init() {
      this.destroy();
      this.bgAnimateImg = bgAnimateImg;
      const topEl = this.$refs.top;
      const scrollEl = document.querySelector('.mescroll');
      if (!topEl || !scrollEl) {
        return;
      }
      this.topHeight = topEl.offsetHeight;
      scrollEl.addEventListener('scroll', this.handleScroll);
      this.handleScroll();
    },

    handleScroll(e) {
      const top = e?.target?.scrollTop ?? this.scrollTop;
      this.showStickyHeader = top > 0;
      const goodsEl = document.getElementById('goods-zone');
      if (goodsEl) {
        const top = goodsEl.getBoundingClientRect().top;
        const heightEl = document.querySelector('.market-home-sticky');
        const headerTabHeight = document.getElementById('header-tab')?.offsetHeight || 0;
        this.showGoodsTab = top + headerTabHeight - (heightEl.offsetHeight || 0) <= 0;
      }
      this.scrollTop = top;
    },

    getAllData() {
      this.$nextTick(() => {
        this.$refs.goods?.[0]?.onTab?.();
        this.$refs.history.getData();
        this.$store.dispatch('getMarketNewRedpacket');
        this.$refs.near?.[0]?.getData?.();
        this.$refs.marketBanner?.[0]?.onAction()?.then(result => {
          this.$refs.marketBanner[0]?.onReset?.();
          this.marketBanner = {
            ...this.marketBanner,
            show: this.$refs?.marketBanner[0]?.data?.length
          };
        });
        this.$refs.marketHomeMidBanner?.[0]?.onAction()?.then(result => {
          this.$refs.marketHomeMidBanner[0].onReset();
          this.marketHomeMidBanner = {
            ...this.marketHomeMidBanner,
            show: this.$refs?.marketHomeMidBanner[0].data.length
          };
        });
        if (this.$refs.newGoods) {
          this.$refs.newGoods.reset();
          this.$refs.newGoods.getData(null, true);
        }
      });
    },

    onBack() {
      this.$store.dispatch('goBack');
    }
  }
};
