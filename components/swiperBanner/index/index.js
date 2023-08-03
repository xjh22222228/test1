import { post } from "@ajax";
import "swiper/swiper-bundle.css";
import { Image as VanImage } from "vant";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import PublicJumpComponents from "@/components/publicJump/index";
import { getPData } from "@/JS/shenceUtils/bannerUtil.js";
import exposureBanner from "@/JS/directives/exposureBanner";

export default {
  components: {
    Swiper,
    SwiperSlide,
    PublicJumpComponents,
    [VanImage.name]: VanImage
  },
  directives: {
    exposureBanner
  },
  props: {
    // 是否阻止自身点击逻辑，只传递到父组件
    stopClick: Boolean,
    state: { type: Boolean, default: false },
    config: { type: Object, default: () => ({}) },
    // 曝光点击类型
    clickType: {
      type: Number,
      default: 1
    },
    from: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      // 当前轮播到的bannerId 供广告弹窗关闭时上报数据使用
      nowId: "",
      //
      data: this.config?.data || [],
      // 是否显示swiper
      status: false,
      // 防止重复点击
      repeatClick: false,
      // swiper对象
      swiper: null,
      // 广告统计
      bannerTotalType: this.config.bannerTotalType || 0,
      // 广告类型
      bannerType: this.config.bannerType || 0,
      // 隐藏分页
      hidePagination: this.config.hidePagination || false,
      // 1.7.1广告新增一个类型，全部 1：banner活动 2：banner门店 3：banner订单
      bannerOrigin: this.config.bannerOrigin || 1,
      // 广告高度
      bannerHeight: (this.config.bannerHeight * 100 || (1 / 3) * 100) + "%",
      // 广告配置
      options: {
        ...{
          // 事件函数，初始化后执行。
          init: false,
          // 设置为true 则开启loop模式。loop模式：会在原本slide前后复制若干个slide(默认一个)并在合适的时候切换，让Swiper看起来是循环的。
          // loop模式在与free模式同用时会产生抖动，因为free模式下没有复制slide的时间点。
          loop: true,
          // 启动动态检查器(OB/观众/观看者)，当改变swiper的样式（例如隐藏/显示）或者修改swiper的子元素时，自动初始化swiper。
          observer: true,
          // 分页
          pagination: { el: ".swiper-pagination" },
          // 设定初始化时slide的索引。Swiper默认初始化时显示第一个slide，有时想初始化时直接显示其他slide，可以做此设置。
          initialSlide: 0,
          // 允许触摸滑动。设为false时，slide无法滑动，只能使用扩展API函数例如slideNext() 或slidePrev()或slideTo()等改变slides滑动。等同于Swiper3.x 的 onlyExternal。
          allowTouchMove: true,
          // 将observe应用于Swiper的父元素。当Swiper的父元素变化时，例如window.resize，Swiper更新。
          observeParents: true,
          // 子slide更新时，swiper是否更新。默认为false不更新。
          observeSlideChildren: true,
          // 设置为true启动自动切换，并使用默认的切换设置。
          autoplay: { delay: 3000, disableOnInteraction: false },
          // 间距
          spaceBetween: this.config.spaceBetween || 0,
          // EVENTS 事件
          on: {
            // 回调函数，当你点击或轻触Swiper 后执行，相当于tap。
            click: this.onSlideClick,
            // 回调函数，过渡结束时触发。可选Swiper实例作为参数。
            slideChangeTransitionEnd: this.onSlideChangeTransitionEnd,
            init: this.onSwiperInit
          }
        },
        // 组件传递进来的参数覆盖
        ...this.config?.swiperType
      },
      intersectionRatio: 0,
      observer: null,
      // swiper组件实例是否初始化
      isSwiperInstanceInit: false
    };
  },
  computed: {
    bannerTotal: function () {
      return this.$store.getters.bannerTotal;
    },
    activityLocation: function () {
      return this.$store.getters.activityLocation;
    },
    // 店铺详情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    exposeData() {
      const config = this.config;
      return item => {
        return {
          ...item,
          ...getPData(config),
          _data_list: this.data
        };
      };
    }
  },
  mounted() {
    // 计算切换图片的比例
    const maxdaterandom = new Date().getTime();
    const ruleName = `afterHeight${maxdaterandom}`;
    this.$refs[this.bannerType].classList.add(ruleName);
    var styleSheets = document.styleSheets[0];
    var index = styleSheets.length;
    if (styleSheets.insertRule) {
      const rule = `.marketSwiperBanner.${this.bannerType} .${ruleName} .van-image::after{padding-bottom:${this.bannerHeight} !important}`;
      styleSheets.insertRule(rule, index);
    } else {
      const name = `.marketSwiperBanner.${this.bannerType} .${ruleName} .van-image::after`;
      const rule = `padding-bottom:${this.bannerHeight} !important`;
      styleSheets.addRule(name, rule, index);
    }
  },
  destroyed() {
    this.destoryObserver();
  },
  activated() {
    // 每次进来页面都会激活一次切换,
    this.onActivated();
  },
  deactivated() {
    // 跳转出去之后,停止切换
    this.onStop();
    this.setOptions();
    this.destoryObserver();
  },
  methods: {
    setOptions() {
      // 记录最后一个slide的realIndex
      this.options = {
        ...this.options,
        initialSlide: this.swiper?.realIndex
      };
    },
    // 侦测曝光
    observerPosition() {
      const el = this.$refs.banner;
      if (!el) {
        return;
      }
      if (this.observer) {
        return;
      }
      this.observer = new IntersectionObserver(entries => {
        this.intersectionRatio = entries[0].intersectionRatio;
      });
      this.observer.observe(el);
    },

    destoryObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    // central广告类型 2：门店首页 3：商超首页新【1.9.5】
    async marketListBanner(type) {
      // 坐标
      await this.$store.dispatch("getPointInAllClient");
      const point = { ...this.activityLocation.point, type, device: 1, storeId: this.marketStoreDetail?.id };
      await post("/market/user_side/central/_get_central_list", point).then(result => {
        _.each(result || [], (i, index) => {
          i.skipParameter = i.skipParameter ? JSON.parse(i.skipParameter) : {};
        });
        this.data = result || [];
      });
    },
    async getMarketHomeTop() {
      // 坐标
      await this.$store.dispatch("getPointInAllClient");
      const point = { ...this.activityLocation.point, type: 2, device: 1 };
      await post("/market/user_side/banner/_get_banner_list", point).then(result => {
        _.each(result || [], (i, index) => {
          i.skipParameter = i.skipParameter ? JSON.parse(i.skipParameter) : {};
        });
        this.data = result || [];
      });
    },
    // 门店首页Banner
    getMarketStoreIndexBanner() {
      return this.$store.dispatch('getPosterClassifyList', {
        type: 4,
        storeId: this.$route.query.id
      }).then(res => {
        res ||= [];
        res = res.map(item => {
          item.bannerImage = item.image;
          return item;
        });
        this.data = res;
        return this.data;
      });
    },
    // 获取数据
    async onAction() {
      this.onStop();
      this.$store.commit("marketSwiperBannerMap", { data: [], config: this.config });
      try {
        switch (this.bannerType) {
          // 门店中通
          case "marketMidBanner":
            await this.marketListBanner(2);
            break;
          case "marketHomeTopBanner":
            await this.getMarketHomeTop();
            break;
          // 首页中通
          case "marketHomeMidBanner":
            await this.marketListBanner(3);
            break;
          // 门店首页Banner
          case "marketStoreIndexBanner":
            await this.getMarketStoreIndexBanner();
            break;
          default:
            this.data = [];
        }
      } catch (error) {
        console.error(error);
      }
      // 如果數量小於1，則不自動切換，不可以拖動
      const len = this.data?.length || 0;
      // 调整切换配置
      this.options = {
        ...this.options,
        loop: len > 1,
        autoplay: len > 1 ? { delay: 3000, disableOnInteraction: false } : false,
        // pagination: len > 1 ? { el: ".swiper-pagination" } : false,
        allowTouchMove: len > 1,
        ...this.config?.swiperType
      };
    },
    // 开始切换（切换页面之后好像无效，最好不在缓存页面中使用）
    onStart() {
      this.swiper?.autoplay?.start();
    },
    // 停止切换（切换页面之后好像无效，最好不在缓存页面中使用）
    onStop() {
      this.swiper?.autoplay?.stop();
    },
    // 跳转到指定的切换位置
    onSlideTo(index = 0) {
      this.swiper?.slideTo(index);
    },
    // 销毁组件
    onDestroy() {
      this.swiper?.destroy();
    },
    // 重置组件
    onReset() {
      this.options = { ...this.options, ...{ initialSlide: 0 } };
      this.onInit();
    },
    // 当其他地方出现异常时，是否需要显示切换，前提是有数据的情况下
    onCatch() {
      this.options = { ...this.options, ...{ initialSlide: 0 } };
      this.onInit();
    },
    // 创建切换组件
    onCreateSwiper() {
      this.$nextTick(async () => {
        this.status = true;
        const el = document.getElementById(this.bannerType);
        if (el) {
          this.swiper = new Swiper(el, this.options);
          this.swiper.init();
          this.observerPosition();
          // loop模式下，swiper首次初始化后realIndex不为0，这里手动置为0
          if (this.options.initialSlide === 0) {
            this.swiper.realIndex = 0
          }
        } else {
          console.log(`swiper: 找不到el`);
        }
      });
    },
    // 当页面激活时，先销毁，后创建，原因在于缓存页面下，这个组件会存在一个bug
    onActivated() {
      if (!this.status) return;
      this.onDestroy();
      this.onCreateSwiper();
    },
    // 移除组件对象
    onRemove() {
      this.status = false;
      this.onDestroy();
    },
    // 初始化切换对象，前提是有数据的情况下
    onInit() {
      if (!this.data.length) return;
      this.onDestroy();
      this.onCreateSwiper();
    },
    // mounted后swiper首次初始化，触发slideChangeTransitionEnd，上报第一个slide的曝光
    onSwiperInit() {
      if (!this.isSwiperInstanceInit) {
        // 首次初始化onCreateSwiper手动重置realIndex需要一些时间。
        setTimeout(() => {
          this.onSlideChangeTransitionEnd()
        }, 300);
        this.isSwiperInstanceInit = true
      }
    },
    // 切换之后回调事件
    onSlideChangeTransitionEnd() {
      if (this.swiper?.realIndex == null) return;
      // 获取数据
      const data = this.data?.[this.swiper?.realIndex];
      const id = data?.id;
      // 没找到数据
      if (!data) return;
      // 上报
      if (this.intersectionRatio > 0) {
        this.$store.commit('setMarketReports', [{
          id,
          clickType: this.clickType, // Banner
          rotationShowNum: 1
        }]);
      }
      this.$emit("expose", data);
      this.nowId = id;
    },
    resetData() {
      this.data = [];
    },
    // 点击事件
    onSlideClick() {
      // 禁止重复点击
      if (this.repeatClick) return;
      // 当前点击的数据
      const data = this.data?.[this.swiper?.realIndex];
      const id = data?.id || 0;
      // 告诉弹窗/父类 出发了点击事件
      this.$emit("click", data);
      if (this.stopClick) {
        return;
      }
      // 未找到数据则返回
      if (!id || !data) return;
      // 上报
      this.$store.commit('setMarketReports', [{
        id,
        clickType: this.clickType, // Banner
        clickNum: 1
      }]);
      // clickWindow(this.exposeData(data));
      // 统计点击数量
      // if (this.bannerTotalType) {
      //   const total = { click: 1, id: id, type: this.bannerTotalType };
      //   this.$store.commit("bannerTotal", total);
      // }
      // 恢复重复点击
      this.repeatClick = false;
      // 跳转
      this.$refs.swiperBannerJump.jump({
        ...data,
        _from: this.from
      });
    }
  }
};
