import indexImg from "./img/index.png";
import indexActiveImg from "./img/index-active.png";
import tagImg from "./img/tag.png";
import orderImg from "./img/order.png";
import myImg from "./img/my.png";
import { indexGif, tabGif, orderActive, myGif } from "./indexGif";
import mf from "@/JS/mFoodSDK";
import shareMixins from "@/views/share/shareMixins.js";
import event from "@/JS/event";

export default {
  mixins: [shareMixins],
  props: {
    openBrowser: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      indexImgGif: indexGif,
      tabList: [],
      screenHeight: 700,
      showHomeActive: false,
    };
  },
  watch: {
    openBrowser(val) {
      this.openBrowserVisible = val;
    },
    openBrowserVisible(val) {
      this.$emit("update:openBrowser", val);
    },
  },
  computed: {
    activeIdx() {
      const path = this.$route.path;
      return this.tabList.findIndex((item) => path.startsWith(item.path));
    },
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
    init() {
      this.destroy();
      this.tabList = [
        {
          icon: indexImg,
          iconActive: indexActiveImg,
          text: "首頁",
          path: "/market/index",
        },
        {
          icon: tagImg,
          iconActive: tabGif,
          text: "分類",
          path: "/market/category",
        },
        {
          icon: orderImg,
          iconActive: orderActive,
          text: "訂單",
          path: "/market/orderList",
        },
        {
          icon: myImg,
          iconActive: myGif,
          text: "我的",
          path: "/market/user/useful",
        },
      ];

      // 首页
      if (this.$route.path.includes("/market/index")) {
        const scrollEl = document.querySelector(".mescroll");
        if (!scrollEl) {
          return;
        }
        this.screenHeight = window.screen.height;
        this.showHomeActive = scrollEl.scrollTop > this.screenHeight;
        scrollEl.addEventListener("scroll", this.handleScroll);
      }
    },

    destroy() {
      const scrollEl = document.querySelector(".mescroll");
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", this.handleScroll);
      }
    },

    handleScroll(e) {
      const top = e.target.scrollTop;
      this.showHomeActive = top > this.screenHeight;
    },

    goPage(data) {
      if (!data.path) {
        return;
      }
      if (data.path === this.$route.path) {
        // 首页, 小火箭状态
        if (data.path.includes("/market/index")) {
          event.$emit("refreshMarketIndexOrder");
          if (this.showHomeActive) {
            const el = document.querySelector(".mescroll");
            if (el) {
              el.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }
        }
        return;
      }
      if (data.path == "/market/user/useful") {
        return mf.goUserUseful();
      }
      this.$router.push({
        path: data.path,
        query: {},
      });
    },
  },
};
