import {
  Image as VanImage
} from "vant";
import md5 from "js-md5";
import notice from "@components/2.0.0/notice";
import StoreTakeoutTimeComponents from "@components/storeTakeoutTime";
import OutDeliveryAreaComponents from "@components/2.5.0/outDeliveryArea";
import SwiperBannerComponents from "../components/swiperBanner/index";
import marketComment from "../components/store-item/market-comment/marketComment";
import marketInfo from "../components/store-item/market-info/index.vue";
import productBlock from '../components/store-item/product-block';
import BottomCart from "../components/store-item/bottom-cart/index.vue";
import marketHeader from "../components/store-item/market-header-card/index.vue";
import marketStoreDetail from "../components/store-item/market-detail";
import BrowseItem from '@/views/memberMission/browseItem.vue'
import { showRequestLoad, hideRequestLoad } from "@/JS/loading";
import navHeader from '../components/store-item/nav-header/index.vue';
import nearStore from "../components/store-item/near-store";
import OutDeliveryArea from "../components/store-item/OutDeliveryArea/index.vue";
import VirtualList from 'vue-virtual-scroll-list';
import { debounce, unionBy } from 'lodash';
import { isNoSale } from '@/views/market/components/goods/no-sale/utils';
import shence from '@/JS/shence';
import pageAnimation from "./mixis/pageAnimation";
import activityMixins from './mixis/activity';
import supportMixins from "./mixis/support";
import dialogMixins from "./mixis/dialog";
import storeAndOrderCommon from "./mixis/storeAndOrderCommon";
import productMixins from './mixis/product';
import shareBtn from "@/views/activity/components/shareBtn";
import event from '@/JS/event';
import ClassifyIndex from './components/classify-index/index.vue';
import AdBannerIndex from './components/ad-banner-index/index.vue';
import RecommendIndex from './components/recommend-index/index.vue';
import GoodsIndex from './components/goods-index/index.vue';
import TabComponent from './components/tab/index.vue';
import AllRecommendGoods from './components/all-recommend-goods/index.vue';
import mf from '@/JS/mFoodSDK';

const errorIcon = require("assets/images/default_dishes_pic.png");

export default {
  mixins: [
    pageAnimation, activityMixins,
    supportMixins, storeAndOrderCommon,
    dialogMixins, productMixins
  ],
  components: {
    notice,
    VirtualList,
    productBlock,
    marketInfo,
    marketComment,
    BottomCart,
    marketHeader,
    marketStoreDetail,
    SwiperBannerComponents,
    OutDeliveryAreaComponents,
    StoreTakeoutTimeComponents,
    [VanImage.name]: VanImage,
    navHeader,
    nearStore,
    OutDeliveryArea,
    shareBtn,
    BrowseItem,
    ClassifyIndex,
    AdBannerIndex,
    RecommendIndex,
    GoodsIndex,
    TabComponent,
    AllRecommendGoods
  },
  data() {
    return {
      isApp: mf.isApp,
      refreshKey: Date.now(),
      itemComponent: productBlock,
      isFirst: false,
      fromSearch: false, // 來源 搜索頁
      // 商品图片缺省
      errorIcon,
      availWidth: 0,
      availHeight: 0,
      id: "", // 门店ID
      // 查詢門店時候是否重新查詢門店的配送費優惠信息，如果是從訂單頁過來，并且選擇了配送時間此時不再查詢
      searchMarketStoreDelivery: true,
      isBack: false,
      isTriggerScroll: true, // 是否需要触发滚动事件，当点击三级分类时不应该触发滚动事件
      tabType: 1 // 1=首页，2=全部商品
    };
  },

  computed: {
    // 左侧菜单列表
    menuList() {
      return this.$store.state.marketStore.marketStoreMenu;
    },
    // 配送费
    marketStoreDelivery: function () {
      return this.$store.getters.marketStoreDelivery;
    },
    // 是否進入門店
    enterStore() {
      return this.$store.getters.enterStore;
    },
    showPop() {
      const router = this.$route.path;
      return ["/market/store"].includes(router);
    },
    marketStoreProductArr() {
      return this.$store.state.marketStore.marketStoreProductArr;
    },
    // 门店加载
    marketStoreLoading() {
      return this.$store.state.marketStore.marketStoreLoading;
    },
    marketStoreDiscountActivityMap() {
      return this.$store.getters.marketStoreDiscountActivityMap;
    },
    // 分类菜单Map
    marketStoreProductInMenu() {
      return this.$store.state.marketStore.marketStoreProductInMenu;
    },
    // 当前菜单选中的分类ID
    currentClassifyId() {
      return this.$store.getters.marketCurrentClassifyId;
    },
    // 当前选中的折扣分类限购数量（只用于样式展示判断，不能用于业务逻辑判断）
    discountLimit() {
      const menu = this.menuList[this.selectedIndex];
      if (!menu?.isDiscount && !menu?.isOldDiscount) {
        return -1;
      }
      const product = this.marketStoreProductInMenu[this.currentClassifyId]?.[0]?.products?.[0];
      // 旧的折扣活动
      if (product?.isOldDiscount) {
        return this.$store.getters.marketDiscountOrderLimit;
      }
      const id = product?.discountActivityId;
      return this.marketStoreDiscountActivityMap[id]?.discountOrderLimit ?? -1;
    },
    // 当前选中的菜单是否秒杀
    isSeckillMenu() {
      const menu = this.menuList[this.selectedIndex];
      return menu?.isSeckill;
    },
    // 当前选中的菜单是否折扣
    isDiscountMenu() {
      const menu = this.menuList[this.selectedIndex];
      return menu?.isDiscount ?? menu?.isOldDiscount;
    },
    // 是否开启首页装修
    indexStatusOpen() {
      return this.$store.state.marketStore.marketStoreIndexStatus.status;
    },
    // 首页今日推荐列表
    recommendList() {
      return this.$store.state.marketStore.marketStoreIndexRecommendList;
    },
    appSafeTop() {
      return this.$store.state.marketHome.appSafeTop;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.fromSearch = false;
      vm.refreshKey = Date.now();
      if (from.path === "/market/search") {
        vm.fromSearch = true;
      }
      const pathArr = ["/market/order", '/market/storeProduct', '/market/storeSearch'];
      if (pathArr.includes(from.path)) { // 訂單頁  商品詳情   門店搜索頁
        vm.$store.commit('marketSearchReady', false);
        vm.$store.commit('marketDetailReady', false);
        vm.isBack = true;
        if (Object.keys(vm.marketOrderOther?.cookTimeSelectData).length > 0) {
          vm.searchMarketStoreDelivery = false;
        }
        // 订单返回
        if (vm.marketOrderOther?.requiredClassify) {
          vm.$store.commit("marketOrderOther", {
            requiredClassify: ""
          });
          vm.$nextTick(() => {
            vm.scrollRequiredClassify();
          });
        }
        // 重置消費金使用列表
        vm.$store.commit("resetGoldUseChangeData");
        if (vm.marketOrderOther?.needInit) {
          vm.$store.commit("marketOrderOther", { needInit: '' });
          vm.$nextTick(() => {
            vm.init();
          });
        }
      } else { // 其他頁面
        vm.isBack = false;
        if (from.path !== "/deliveryAddress") {
          vm.$store.commit("marketOrderOther", { selectedAddress: {} });
        } else { // deliveryAddress
          vm.searchMarketStoreDelivery = true;
          vm.loadPage();
        }
      }
    });
  },

  watch: {
    // 在门店页面跳转到其他门店
    '$route.query.id': {
      immediate: true,
      handler(newData, oldData) {
        if (newData && oldData && newData != oldData && this.$route.path == "/market/store") {
          this.loadPage();
        }
      }
    },
    marketStoreLoading: {
      immediate: true,
      handler(loading) {
        if (loading) {
          showRequestLoad();
        } else {
          hideRequestLoad();
        }
      }
    },
    // 监听首页开关状态
    indexStatusOpen: {
      immediate: true,
      handler(status) {
        this.tabChange(status ? 1 : 2);
      }
    }
  },
  activated() {
    if (this.enterStore) {
      this.id = "";
      this.$store.commit("enterStore", false);
      this.leaveScroll = 0;
    } else {
      // 从订单页返回回来重新计算
      this.$store.dispatch('marketFullDetails', { isTip: false });
      this.$refs.store.scrollTop = this.leaveScroll;
      this.$toast.clear();
    }
    const oldId = this.id || "-";
    const newId = this.$route.query.id || "-";
    if (oldId !== newId) {
      this.id = newId;
      this.loadPage();
    }
  },
  methods: {
    async init(queryDetail = true) {
      // 判断门店状态是否下架
      // const storeState = await this.$store.dispatch("storeState", this.id);
      // if (!storeState.operatingState) {
      //   this.$router.replace('/errorPage?errorCode=404');
      //   return false;
      // }
      this.availWidth = window.screen.availWidth * 0.8;
      this.availHeight = this.availWidth / 1.777;
      const { commit, dispatch } = this.$store;
      commit('marketRequiredClassify', '');
      this.marketDetailDialog.state = false;
      dispatch("memberBasicInfo");
      await dispatch("marketStoreDetailProduct", {
        time: this.refreshKey,
        id: this.id,
        searchMarketStoreDelivery: this.searchMarketStoreDelivery
      }).then(async result => {
        const arr = [
          dispatch('marketMerchantDeliveryFreeInfo', {
            storeId: this.id,
            deliveryType:
              this.marketOrderOther?.cookTimeSelectData?.deliveryType ??
              this.marketStoreDetail.deliveryType ?? 0,
            sendType: this.marketOrderOther?.cookTimeSelectData?.sendType ?? 1
          }) // 获取商家配送费减免信息
        ];

        await Promise.all(arr);
        this.$nextTick(async () => {
          // 門店詳情
          const detail = this.marketStoreDetail;
          // 用戶地址是否在配送範圍
          commit("marketStoreDetail", detail);
          // 检测是否在配送范围
          setTimeout(() => {
            // 計算頁面高度
            this.restPageHeight();

            if (this.isFirst) {
              return;
            }
            this.isFirst = true;
            // 打烊
            if (detail.businessType == false) {
              // this.$refs.nearStore?.show(); 2023-06-06产品要求去掉
              // 不在配送範圍 有配送能力
            } else if (detail?.rangType === false && detail?.delivery) {
              this.$refs.outArea?.show();
              // shence.unableToDeliver();
            } else {
              this.$refs.outArea?.hide();
              // this.$refs.nearStore?.hide();
            }
          });

          // 是否選擇自取
          if (this.marketOrderOther.deliveryType != "") {
            commit('marketSelfCollection', this.marketOrderOther.deliveryType);
          }
          // 记录原来的起送价
          commit('marketOldSendPrice', this.marketStoreDetail.__sendPrice__);
          dispatch('marketFullDetails', { isTip: false });
        });
      }).catch(e => {
        console.warn(e);
        this.$toast({
          position: "bottom",
          message: "網絡請求失敗"
        });
      });
    },
    // 再來一單
    againOrderProductArr() {
      const { query, path } = this.$route;
      const tradeId = query.tradeId;
      if (!tradeId) {
        return [];
      }
      const detail = this.marketStoreDetail;
      // 打烊
      if (detail.businessType === false) {
        return [];
      }
      this.$router.replace({
        path,
        query: {
          ...query,
          tradeId: undefined,
          again: '1'
        }
      });
      const { commit, state } = this.$store;
      commit('marketFailShopCart', []);
      commit('marketShoppingCart', []);
      return (state.marketStore.againOrderProductMap[tradeId] || []).filter(item => {
        return !isNoSale(item);
      });
    },
    // 查詢歷史商超購物車和失效列表
    findHistoryMarketShopCart() {
      const marketOrderHistory = _.head(_.filter(this.marketOrderHistory, { id: this.id }));
      const marketFailOrderHistory = _.head(_.filter(this.marketFailOrderHistory, { id: this.id }));
      if (marketOrderHistory?.data) {
        this.$store.commit('marketShoppingCart', marketOrderHistory.data);
      } else {
        this.$store.commit('marketShoppingCart', []);
      }

      if (marketFailOrderHistory?.data) {
        this.$store.commit('marketFailShopCart', marketFailOrderHistory.data);
      } else {
        this.$store.commit('marketFailShopCart', []);
      }
    },
    // 構造購物車所需要的對象
    createProductParam(current) {
      const res = {
        ...current,
        productImg: current?.productImg,
        multiSku: current?.multiSku,
        productId: current?.productId,
        quantity: current?.quantity,
        skuId: current?.defaultSku?.skuId,
        price: current?.defaultSku?.skuPrice,
        maxPurchase: current?.maxPurchase,
        productName: current?.productName,
        volume: current?.volume,
        weight: current?.weight,
        defaultSku: current?.defaultSku,
        selected: true,
        isFresh: current?.isFresh,
        isDiscount: current?.isDiscount,
        discountStock: current?.discountStock,
        limitCount: current?.limitCount,
        required: current?.required,
        merchantCategoryId: current?.merchantCategoryId
      };
      res.uuid = this.creatUUid(res);
      return res;
    },
    //  創建uuid
    creatUUid(data) {
      const keyList = ['maxPurchase', 'multiSku', 'price', 'productId', 'productImg', 'productName', 'skuId', 'volume', 'weight', 'isFresh'];
      const temp = {};
      for (const key of keyList) {
        temp[key] = data[key];
      }
      const uuid = md5(JSON.stringify(temp));
      return uuid;
    },
    // 根據再來一單的商品數據結構 生成購物車的商品數據結構
    createCartProductByAgain(againProduct) {
      const maxPurchase = againProduct.maxPurchase ?? 999;
      let quantity = againProduct.buyQty;
      if (quantity > maxPurchase) {
        quantity = maxPurchase;
      }
      return {
        ...this.createProductParam(againProduct),
        quantity: quantity ?? 1
      };
    },
    // 处理购物车状态与再来一单
    handleAgainOrder(result, againArr) {
      // 处理本地购物车正常商品和失效商品的检测与转换
      const storeDetail = this.marketStoreDetail;
      const { commit } = this.$store;
      commit('marketWacthCart', true); // 开放监听
      const stockMap = {}; // 记录库存
      const list = result?.list || [];
      const normalList = list
        .filter(item => {
          commit('addProductStockMap', item); // 记录商品库存
          stockMap[item.productId] = item.canUseStock;
          return item.status === 1;
        })
        .map(item => item.productId);
      const cart = [];
      let failList = [];
      if (this.marketShoppingCart.length || this.marketFailShopCart.length) {
        // 将正常商品和失效商品合并
        const allProduct = unionBy([
          ...this.marketShoppingCart,
          ...this.marketFailShopCart
        ], 'productId');
        allProduct.forEach(item => {
          // 判断是否正常商品
          const data = list.find(p => p.productId === item.productId);
          const params = {
            ...item,
            ...data
          };
          // 校验可用库存，不能大于加购数量
          if (params.canUseStock != null && params.quantity > params.canUseStock) {
            params.quantity = params.canUseStock;
          }
          // 商品券不校验状态
          if (data?.status === 1 || item.isMallCoupon) {
            cart.push(params);
          } else {
            failList.push(params);
          }
        });
      }

      // 接着处理再来一单加入到购物车
      if (!againArr?.length) {
        failList = failList.sort((a, b) => a.status - b.status);
        commit('marketShoppingCart', cart);
        commit('marketFailShopCart', failList);
        return;
      }
      for (const aproduct of againArr) {
        const productData = this.createCartProductByAgain(aproduct);
        if (normalList.includes(aproduct.productId)) {
          const idx = cart.findIndex(item => item.productId === aproduct.productId);
          // 累加库存
          if (idx >= 0) {
            cart[idx].quantity += productData.quantity;
            const stock = stockMap[cart[idx].productId];
            if (stock != null && !cart[idx].required) {
              if (cart[idx].quantity > stock) {
                cart[idx].quantity = stock;
              }
            }
          } else {
            const stock = stockMap[productData.productId];
            if (stock != null && !productData.required) {
              if (productData.quantity > stock) {
                productData.quantity = stock;
              }
            }
            cart.push(productData);
          }
        } else {
          // 累加库存
          const idx = failList.findIndex(item => item.productId === aproduct.productId);
          if (idx >= 0) {
            failList[idx].quantity += productData.quantity;
            const stock = stockMap[failList[idx].productId];
            if (stock != null && !failList[idx].required) {
              if (failList[idx].quantity > stock) {
                failList[idx].quantity = stock;
              }
            }
          } else {
            const sItem = list.find(sItem => sItem.productId === aproduct.productId);
            const data = {
              ...productData,
              ...sItem
            };
            const stock = stockMap[data.productId];
            if (stock != null && !data.required) {
              if (data.quantity > stock) {
                data.quantity = stock;
              }
            }
            failList.push(data);
          }
        }
      }
      failList = failList.sort((a, b) => a.status - b.status);
      commit('marketShoppingCart', cart);
      commit('marketFailShopCart', failList);
      // 在配送范围把购物车弹出来
      if (storeDetail.rangType) {
        commit('marketSubmitBar', { show: true, overlay: true });
      }
    },
    // 重置初始化数据
    resetData() {
      const { commit } = this.$store;
      const { query } = this.$route;
      const selectedAddress = this.marketOrderOther.selectedAddress; // 记录超出配送范围选中的地址
      commit('marketOrderOtherReset');
      commit('marketStoreDetail', {});
      commit('selectedIndex', -2);
      commit('secondSelectedIndex', -1);
      commit('thirdSelectedIndex', -1);
      commit('marketSortProductType', 0);
      commit('setMarketStoreLoading', true);
      commit('marketWacthCart', false);
      commit("marketRemarkTextGetters", '');
      commit("missProductIndexGetters", localStorage.getItem('remember-miss-product') || -1);
      commit('resetOutStockTipsMap');
      commit('productStockMap', {}); // 清空记录库存
      commit('marketStoreProduct', []);
      commit('marketStoreProductArr', []);
      commit('setMarketStoreMenu', []);
      commit('setMarketStoreMenuProduct', []);
      commit("memberOrderVoucher", {});
      commit("resetMemberOrderRedpack");
      // 重置消費金使用列表
      commit("resetGoldUseChangeData");
      commit('showOverWeightToast', false);
      commit('marketFailShopCart', []);
      commit('marketShoppingCart', []);
      commit('setMarketRawStoreActivity', []);
      commit('setMarketStoreActivity', []);
      commit('setMarketGiftBuyList', []);
      commit('setMarketStoreProductId', null);
      commit('setMarketStoreProductInMenu', null);
      commit('setMarketStoreIndexClassList', []);
      commit('setMarketStoreStatus', {});
      commit('setMarketStoreIndexRecommendList', []);
      commit('setMarketGroupList', []);
      commit('setMarketStoreGroupProducts', []);
      this.id = query.id;
      this.classifyHideBtnMap = {};
      this.closeClassify = false;
      this.cardRgba = 0;
      commit('marketSubmitBar', {
        overlay: false,
        closeReserve: false
      });
      this.isFirst = false;
      window.__ALL_MENU_PRODUCT__ = [];
      window.__LAST_CLASSIFYID__ = -1;
      this.isShowHeaderTab = false;
      if (window.__deliveryAddress__) {
        window.__deliveryAddress__ = false;
        commit('marketOrderOther', { selectedAddress });
      }
    },
    async loadPage() {
      if (this.marketStoreLoading) {
        return;
      }
      const { commit, dispatch } = this.$store;
      const { query } = this.$route;
      const { tradeId } = query;
      // 处理客户端跳转到门店页面再来一单
      if (tradeId && query.againOne) {
        await this.$store.dispatch('getAgainProduct', query.tradeId);
      }
      this.resetData();
      if (!this.id) {
        this.$router.replace('/market/index?noId');
        return;
      }
      this.$store.dispatch("marketStoreVoucher", this.id);
      await dispatch("marketStoreDetail", this.id).then(res => {
        commit('marketOldSendPrice', res.sendPrice);
        // 商家開啟了商家會員號碼功能
        if (res.isMemberNo) {
          commit('setMarketMemberNo', res.memberNo);
        } else {
          commit('setMarketMemberNo', '');
        }
        if (!this.isBack) {
          this.$refs.storeNotice.show(this.marketStoreDetail.meno);
        }
        this.$toast.clear();
      });
      this.$refs.detail?.close();
      this.$refs.outArea?.hide();
      // this.$refs.nearStore?.hide();
      const againProductArr = this.againOrderProductArr();
      this.findHistoryMarketShopCart();

      // 校验购物车商品, 商品券不校验状态
      let productIds = this.marketShoppingCart.map(item => {
        if (item.isMallCoupon) {
          return null;
        }
        return item.productId;
      });
      productIds = productIds.concat(this.marketFailShopCart.map(item => item.productId));
      productIds = productIds.concat(againProductArr.map(item => item.productId));
      productIds = [...new Set(productIds.filter(Boolean))];
      const getCartProductStatus = new Promise((resolve, reject) => {
        if (!productIds.length) {
          return resolve({ list: [] });
        }
        this.$store.dispatch('getCartProductStatus', {
          storeId: this.id,
          productIds
        }).then(res => {
          resolve(res);
        }).catch(e => {
          resolve({});
        });
      });

      // banner切换广告
      this.$refs?.marketBanner?.onAction().then(result => {
        this.$refs?.marketBanner.onReset();
        this.marketBanner = {
          ...this.marketBanner,
          show: this.$refs?.marketBanner?.data?.length > 0
        };
        this.restPageHeight();
      });

      getCartProductStatus.then(res => {
        // 如果是再來一單商品
        this.handleAgainOrder(res, againProductArr);
        // 初始化
        this.init(false).then(async result => {
          this.$toast.clear();
          commit('setMarketStoreLoading', false);
          // 神策 上報埋點
          shence.marketViewShop(this);
          if (this.fromSearch) {
            this.fromSearch = false;
          }
          setTimeout(() => {
            this.scrollProduct();
            this.initTouch();
          }, 500);
        });
      });
    },
    goSearch() {
      this.$router.push({
        path: '/market/storeSearch',
        query: {
          from: 'store',
          mode: 'inStore',
          storeId: this.id
        }
      });
    },
    share() {
      this.$refs.share.share({
        shareTitle: this.marketStoreDetail.storeName,
        shareRemark: '我在mFood超市發現一家不錯的店，推薦給你',
        shareImage: this.marketStoreDetail.thumbnailHead
      });
    },

    // 右侧菜品滚动触发，定位一二三级类目
    onScrollContainer: debounce(function () {
      if (!this.isTriggerScroll) {
        this.isTriggerScroll = true;
        return;
      }
      const virtualRef = this.$refs.virtual;
      if (!virtualRef) {
        return;
      }
      // 当前滚动的距离
      const offset = virtualRef.getOffset();
      const els = document.querySelectorAll('.market-product');
      let activeEl;
      for (let i = 0; i < els.length; i += 1) {
        const el = els[i];
        const top = el.offsetTop;
        if (top >= offset) {
          activeEl = el;
          break;
        }
      }
      const { commit } = this.$store;
      if (activeEl) {
        const classId = activeEl.dataset.id;
        const parentId = activeEl.dataset.parentId;
        let selectedIndex = -1;
        let secondSelectedIndex = -1;
        for (let i = 0; i < this.menuList.length; i++) {
          const item = this.menuList[i];
          const children = item.children || [];
          const id = item.parentId || item.classifyId;
          if (id === parentId || id === classId) {
            selectedIndex = i;
            if (!children.length) {
              break;
            }
          }
          for (let j = 0; j < children.length; j++) {
            const item = children[j];
            const id = item.classifyId;
            if (id === parentId || id === classId) {
              selectedIndex = i;
              secondSelectedIndex = j;
              break;
            }
          }
        }
        const idx = this.thirdClassifyList.findIndex(item => item.classifyId === classId);
        if (idx >= 0) {
          commit('thirdSelectedIndex', idx);
        }
        // 点击不是同一个分类
        const isNoSame = this.selectedIndex !== selectedIndex ||
          this.secondSelectedIndex !== secondSelectedIndex
        if (isNoSame) {
          commit("marketSortProductType", 0);
        }
        commit('selectedIndex', selectedIndex);
        commit('secondSelectedIndex', secondSelectedIndex);
        isNoSame && this.updateMenuPosition();
      }
    }, 30),

    // 打开店铺优惠弹窗
    openDiscount() {
      event.$emit('marketStoreDiscountOpen');
    },

    // Tab改变
    tabChange(tabType, callback) {
      tabType ??= 1;
      this.tabType = tabType;
      this.isShowHeaderTab = false;
      const storeEl = this.$refs.store;
      if (storeEl) {
        storeEl.scrollTop = 0;
      }
      this.$nextTick(() => {
        this.restPageHeight();
        if (tabType === 2) {
          this.handleMutationObserver();
        }
        callback && callback();
      });
    },
    // 点击首页分类
    handleClickClassIndex(data) {
      this.getMenuIdxById(data.classifyId, true);
    },
    onRecommendViewAll(data) {
      this.$refs.allRecGoods.show(data)
    }
  },

  deactivated() {
    this.$store.commit('marketCartProductId', 0);
    this.$store.commit('setMarketStoreLoading', false);
  }
};
