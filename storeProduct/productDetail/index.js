import {
  Popup,
  Icon,
  Image as VanImage,
  ImagePreview,
  Stepper,
  Swipe,
  SwipeItem,
} from "vant";
import navHeader from "../../components/store-item/nav-header";
import phone from "@/assets/images/market_phone.png";
import locationImg from "@/assets/images/market_location.png";
import PhoneCallComponents from "@components/2.0.0/phoneCall";
import productMixins from "@/views/market/store/mixis/product";
import mf from "@/JS/mFoodSDK";
import "quill/dist/quill.snow.css";
import BottomCart from "@/views/market/components/store-item/bottom-cart";
import { debounce } from "lodash";
import topImg from "@/assets/images/icon_product_arrow_down.png";
import utils from "@/JS/utils";
import shareBtn from "@/views/activity/components/shareBtn";
import shareMixins from "@/views/share/shareMixins.js";
import NoSaleTextIcon from "@/views/market/components/goods/no-sale/text-icon";
import StoreTakeoutTimeComponents from "@components/storeTakeoutTime";
import { isNoSale } from "@/views/market/components/goods/no-sale/utils";
import StoreDiscount from "../components/discount";
import event from "@/JS/event";
import shence from "@/JS/shence";
import VipTag from '@/views/activity/h5/components/vip-tag';

export default {
  name: "product-detail-popup",
  mixins: [productMixins, shareMixins],
  components: {
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    [VanImage.name]: VanImage,
    [Stepper.name]: Stepper,
    [ImagePreview.Component.name]: ImagePreview.Component,
    navHeader,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    BottomCart,
    shareBtn,
    NoSaleTextIcon,
    StoreTakeoutTimeComponents,
    StoreDiscount,
    VipTag
  },
  data() {
    return {
      flag: false,
      showImage: false,
      images: [],
      cardRgba: 0,
      current: 0,
      emitObject: {},
      phone,
      locationImg,
      safeTop: mf.safeTop(50),
      isApp: mf.isApp,
      isAliPay: mf.isAliPay,
      paddingTopClass: utils.getSafeTopClassName("padding"),
      showScrollTop: false,
      topImg,
      activeTab: "",
      headerHeight: 0,
    };
  },
  activated() {
    this.cardRgba = 0;
    this.activeTab = "";
    this.getData();
  },
  created() {
    this.getData();
  },
  methods: {
    // 不可售
    isNoSale(data) {
      return isNoSale(data);
    },

    // 跳转到满额促销
    goFull(data) {
      const id = data.fullReduce?.id;
      if (id) {
        event.$emit("marketContinueBuy", id);
      }
    },

    async getData() {
      if (this.isReadonly) {
        // 被分享出去，加載門店詳情
        const storeId = this.$route.query.storeId;
        if (storeId) {
          await this.$store.dispatch("marketStoreDetail", storeId);
        }
        this.show();
      } else {
        if (this.marketEnterProductDetail) {
          this.flag = false;
          this.show();
          this.$store.commit("marketEnterProductDetail", "");
        } else {
          this.$toast.clear();
        }
      }
    },
    scrollTab(tab) {
      if (tab == this.activeTab) {
        return;
      }
      if (tab == 1) {
        this.backTop();
      } else {
        const detail = document.getElementById("detail-parent");
        const rect = detail.getBoundingClientRect();
        const scrollTop = this.$refs.detail.scrollTop;
        this.$refs.detail.scrollTop = rect.top + scrollTop + 2;
      }
    },
    backTop() {
      this.$refs.detail.scrollTop = 0;
    },
    imageChange(value) {
      this.current = value;
    },
    onTabScroll: debounce(function () {
      const scrollTop = this.$refs.detail.scrollTop;
      if (scrollTop !== undefined) {
        this.renderHeader(scrollTop);
      }
      const clientHeight = document.body.clientHeight / 3;
      if (scrollTop > clientHeight) {
        this.showScrollTop = true;
      } else {
        this.showScrollTop = false;
      }
      const detail = document.getElementById("detail-parent");
      const rect = detail.getBoundingClientRect();
      this.activeTab = rect.top > 0 ? 1 : 2;
    }, 30),
    renderHeader(scrollTop) {
      if (!scrollTop) {
        scrollTop = this.$refs.detail?.scrollTop;
      }
      const headerCard = this.$refs.headerCard.$el.scrollHeight;
      this.cardRgba = scrollTop / headerCard;
      this.cardRgba = this.cardRgba > 1 ? 1 : this.cardRgba;
    },
    changeBottom(flag) {
      this.$store.commit("marketSubmitBar", { show: flag });
    },
    seeImage() {
      this.images = this.item.productImgs || [];
      this.showImage = true;
      this.changeBottom(false);
    },
    async show() {
      const query = this.$route.query;
      this.current = 0;
      this.showImage = false;
      this.showScrollTop = false;
      this.cardRgba = 0;
      const { dispatch } = this.$store;
      await dispatch("marketStoreProductDetail", query);
      await dispatch("findProductById", query).then(async (res) => {
        const marketStoreProductDetail = this.marketStoreProductDetail;
        // 检查最新商品是否与当前商品不一致
        function checkProduct(old, nv) {
          // 非APP环境不更新，因为下不了单
          if (!mf.isApp) {
            return true;
          }
          const skuItem = _.head(nv.skus);
          if (old?.defaultSku?.skuPrice !== skuItem?.skuPrice) {
            return false;
          }
          if (old.productName !== nv.productName) {
            return false;
          }
          if (old.productDiscountAmt != null && (old.productDiscountAmt !== nv.productDiscountAmt)) {
            return false;
          }
          return true;
        }

        const isSafe = checkProduct(res, marketStoreProductDetail);
        if (!isSafe) {
          const storeId = this.marketStoreDetail.id;
          await dispatch("getMarketStoreMenu", storeId);
          await dispatch("marketRequiredProductList");
          await dispatch("updateCartByMenu");
          await dispatch("marketFullDetails");
        }
        this.emitObject = res;
        this.$toast.clear();
        this.flag = true;
        this.$store.commit("marketDetailReady", true);
      });
      this.headerHeight = this.$refs.headerCard.$el.clientHeight;
      shence.marketMallActiveProduct(this.item);
    },

    inputClass(qty) {
      const className = "input-";
      if (!qty) {
        return className + 1;
      } else {
        const res = qty + "";
        return className + res.length;
      }
    },
    async plus() {
      await this.$store.dispatch("plus", this.emitObject);
    },
    async overlimit(res) {
      const item = this.item;
      if (res == "plus") {
        const maxPurchase = item.maxPurchase || 1000;
        if (!item.required) {
          const stock = await this.$store.dispatch("queryProductStock", item);
          const quantity = item.quantity;

          // 商品
          if (stock <= quantity && stock < maxPurchase) {
            return this.$toast({
              message: `商品已達庫存上限`,
              className: "storeToast",
            });
          }
        }
        this.$toast(`商品已達限購上限，限購${this.item.maxPurchase}件`);
      }
    },
    async minus() {
      await this.$store.dispatch("minus", this.emitObject);
    },
    async fakeStepper() {
      if (this.canNotSell) return;
      await this.plus();
    },
    close() {
      this.flag = false;
    },
    showStore() {
      if (mf.isApp) {
        const marketStoreDetail = this.marketStoreDetail;
        const param = {
          lat: marketStoreDetail.lat,
          lon: marketStoreDetail.lon,
          address: marketStoreDetail.address,
          storeName: marketStoreDetail.storeName,
          thumbnailHead: marketStoreDetail.thumbnailHead,
        };
        mf.navigateToStore(param);
      } else {
        this.$router.push("/market/storeMap");
      }
    },
    callMerchant() {
      const data = [];
      // 第一個號碼
      if (this.marketStoreDetail?.phonePre && this.marketStoreDetail?.phone) {
        const phone = this.marketStoreDetail.phone;
        const per = this.marketStoreDetail.phonePre;
        data.push({
          name: `呼叫 +${per} ${phone}`,
          className: per + phone,
        });
      }
      // 第二個號碼
      if (this.marketStoreDetail?.telPre && this.marketStoreDetail?.tel) {
        const tel = this.marketStoreDetail.tel;
        const per = this.marketStoreDetail.telPre;
        data.push({
          name: `呼叫 +${per} ${tel}`,
          className: per + tel,
        });
      }
      PhoneCallComponents({
        data: data,
        title: "致電商家",
        onCall: (number) => this.$store.dispatch("appCallPhone", number),
      });
    },
    share() {
      const productDetail = this.marketStoreProductDetail;
      const marketStoreDetail = this.marketStoreDetail;
      this.$refs.share.share({
        shareTitle: productDetail.shareTitle
          ? productDetail.shareTitle
          : productDetail.productName,
        shareRemark: productDetail.shareDesc
          ? productDetail.shareDesc
          : `僅售 MOP ${this.item.defaultSku.skuPrice} (${marketStoreDetail.storeName})`,
        shareImage: productDetail.productImgs.length
          ? productDetail.productImgs[0]
          : null,
      });
    },
  },
  computed: {
    canNotSell() {
      return this.item.status === 1 || this.item.status === 3;
    },
    // 只读模式
    isReadonly() {
      return this.$route.query.isShare;
    },
    productStockMap() {
      return this.$store.getters.productStockMap;
    },
    maxLimit() {
      const productStockMap = this.productStockMap;
      const item = this.item;
      let tmax = 1000;
      if (!item.required) {
        if (typeof productStockMap[item.productId] === "number") {
          const stock = productStockMap[item.productId];
          if (stock < tmax) {
            tmax = stock;
          }
        }
      }
      if (typeof item.maxPurchase === "number") {
        if (item.maxPurchase < tmax) {
          tmax = item.maxPurchase;
        }
      }
      return tmax;
    },
    showPop() {
      const path = this.$route.path;
      return path == "/market/storeProduct";
    },
    marketProductDetailFrom() {
      return this.$store.getters.marketProductDetailFrom;
    },
    detailSubmitPage() {
      const from = this.marketProductDetailFrom; // storeSearch  store
      return from == "store" ? "storeDetail" : "searchDetail";
    },
    marketEnterProductDetail() {
      return this.$store.getters.marketEnterProductDetail;
    },
    showMarketBar() {
      return this.$store.getters.showMarketBar;
    },
    marketStoreProductDetail() {
      return this.$store.getters.marketStoreProductDetail;
    },
    marketShoppingCart() {
      return this.$store.getters.marketShoppingCart;
    },
    item() {
      const marketStoreProductDetail = this.marketStoreProductDetail;
      if (!this.emitObject) {
        return {
          ...marketStoreProductDetail,
          defaultSku: {
            skuPrice: _.head(marketStoreProductDetail.skus).skuPrice,
          },
        };
      }

      const { marketProductMaps } = this.$store.getters;
      const data = marketProductMaps[this.emitObject.productId] || {};
      const shopCart = this.marketShoppingCart;
      let quantity = 0;
      for (const cartItem of shopCart) {
        if (cartItem.productId === data.productId) {
          quantity = cartItem.quantity;
          break;
        }
      }
      return {
        ...data,
        quantity,
        productImgs: marketStoreProductDetail.productImgs || [],
        productVideo: marketStoreProductDetail.productVideo,
        status: marketStoreProductDetail.status,
      };
    },
    appHeaderStyle() {
      const safeTop = this.safeTop;
      return {
        paddingTop: safeTop / 100 + "rem",
      };
    },
    headerStyle() {
      const cardRgba = this.cardRgba;
      return {
        background: `rgb(255, 255, 255,${cardRgba})`,
      };
    },
    showDiscount() {
      const data = this.item;
      return (
        (data?.defaultSku?.isDiscount ||
          data?.defaultSku?.isFlash ||
          data.minPurchase > 1) &&
        !data?.sellout
      );
    },
    // 商超店鋪商品
    marketStoreProduct: function () {
      const list = this.$store.getters.marketStoreProduct;
      return list;
    },
    // 商超詳情
    marketStoreDetail() {
      return this.$store.getters.marketStoreDetail;
    },
    // marketDetailReady
    marketDetailReady() {
      return this.$store.getters.marketDetailReady;
    },
  },
};
