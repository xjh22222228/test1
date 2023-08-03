// 页面动画的类
import { debounce, cloneDeep } from "lodash";
import storeAndOrderCommon from "./storeAndOrderCommon";
import event from '@/JS/event';

export default {
  mixins: [storeAndOrderCommon],
  data() {
    return {
      headerBarHeight: 0,
      clientHeight: 0,
      submitHeight: 0,

      thirdItemExpand: false,
      selectMenuLock: false, // 选中菜单，定位商品时的锁 用来阻止onTabScroll
      closeClassify: false,
      expandThird: false,
      topItemHeight: 150,
      storeHeight: 0,
      tabsMenuHeight: 0,
      tabHeight: 0, // 首页全部商品Tab高度
      // 頂部漸變角度
      cardRgba: 0,
      leaveScroll: 0,
      showThirdExpand: false,
      touchstartPageY: 0, // 记录触摸时位置
      storeScrollTop: 0, // 记录门店滚动条位置
      scrollHeight: 0, // 虚拟列表高度
      isNext: true, // 是否允许下一页
      isPrev: true, // 是否允许上一页
      isShowHeaderTab: false // 是否显示头部Tab
    };
  },
  // 离开页面
  destroyed() {
    this.destroyTouch();
    this.destoryObserver();
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  },
  watch: {
    // 选中三级分类，选中分类滚到最左侧
    thirdSelectedIndex(nv) {
      if (nv === -1) {
        return;
      }
      this.$nextTick(() => {
        this.scrollThird();
      });
    },
    marketStoreProductArr() {
      this.observerPagination();
    }
  },
  computed: {
    marketSortProductType() {
      return this.$store.getters.marketSortProductType;
    },
    secondSelectedIndex() {
      return this.$store.getters.secondSelectedIndex;
    },
    thirdSelectedIndex() {
      return this.$store.getters.thirdSelectedIndex;
    },
    selectedIndex() {
      return this.$store.getters.selectedIndex;
    },
    marketStoreProductArr() {
      return this.$store.state.marketStore.marketStoreProductArr;
    },
    headerStyle() {
      const cardRgba = this.cardRgba;
      if (cardRgba === 1 || this.isShowHeaderTab) {
        return "background: white";
      } else {
        return {
          background: `rgb(255, 255, 255,${cardRgba})`
        };
      }
    },
    stickyTopStyle() {
      const headerBarHeight = this.headerBarHeight;
      return {
        top: headerBarHeight + "px"
      };
    },
    // 当前三级分类列表
    thirdClassifyList() {
      return (
        this.menuList[this.selectedIndex]?.children?.[this.secondSelectedIndex]
          ?.children || []
      );
    }
  },
  activated() {
    event.$on('marketResetPageHeight', this.restPageHeight);
    this.updateMenuPosition({ behavior: 'auto' });
  },
  methods: {
    // 获取菜单商品
    getMenuProduct: debounce(async function (params) {
      if (
        (this.selectedIndex === -1 &&
        this.secondSelectedIndex === -1 &&
        this.thirdSelectedIndex === -1) ||
        window.__DISABLE_REQ__
      ) {
        return;
      }
      return this.$store.dispatch('getProductByMenu', {
        storeId: this.id,
        ...params
      });
    }, 150),

    // 检查是否有上一页和下一页
    checkNext: debounce(function () {
      this.$nextTick(() => {
        const isNext = this.handleNext(true) !== false;
        const isPrev = this.handlePrev(true) !== false;
        this.isNext = isNext;
        this.isPrev = isPrev;
        this.$store.commit("setMarketStoreIsNext", isNext);
        this.$store.commit("setMarketStoreIsPrev", isPrev);
      });
    }, 100),

    // 当点击一级、二级分类触发滚动商品至顶部
    goProductTop() {
      this.restPageHeight();
      const virtualRef = this.$refs.virtual;
      if (!virtualRef) {
        return;
      }
      virtualRef.$el.scrollTop = 0;
    },
    scrollThird(index) {
      if (this.thirdSelectedIndex === -1) {
        return;
      }
      const tagListEl = this.$refs.tagList;
      if (!tagListEl) {
        return;
      }
      const activeEl = tagListEl.querySelector(".active");
      const left = activeEl.offsetLeft;
      tagListEl.scrollTo({ left, behavior: "smooth" });
    },
    // 計算頁面高度
    expandThirdClassify() {
      const safeTop = this.topItemHeight + 20 - this.headerBarHeight;
      if (this.$refs.store.scrollTop < safeTop) {
        this.$refs.store.scrollTop = safeTop;
      }
      setTimeout(() => {
        this.expandThird = !this.expandThird;
      }, 50);
    },
    // 点击三級類目滚动相应节点
    onSelectedThirdMenu(tIndex, data) {
      const classifyId = data?.classifyId;
      const virtualRef = this.$refs.virtual;
      if (!classifyId || !virtualRef) {
        return;
      }
      this.isTriggerScroll = false;
      const { commit } = this.$store;
      commit("thirdSelectedIndex", tIndex);
      let index = -1;
      for (let i = 0; i < this.marketStoreProductArr.length; i++) {
        const item = this.marketStoreProductArr[i];
        index += 1;
        if (item.classifyId === classifyId) {
          break;
        }
      }
      virtualRef.scrollToIndex(index);
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${classifyId}"]`);
        if (!el) {
          return;
        }
        const tagHeight = this.$refs.wrapper?.offsetHeight || 0;
        virtualRef.$el.scroll({
          top: el.offsetTop - tagHeight
        });
      }, 33);
    },
    // 點擊某個排序   1 根據 力度  2 根據銷量  根據價格  3 最低的在前面  4 最高在前面
    sortProduct(type) {
      const { commit } = this.$store;
      const virtualRef = this.$refs.virtual;
      switch (type) {
        // 力度排序
        case "discount": {
          commit("marketSortProductType", 1);
          break;
        }
        // 销量排序
        case "sale": {
          commit("marketSortProductType", 2);
          break;
        }
        // 价格排序
        case "price": {
          if (this.marketSortProductType == 3) {
            commit("marketSortProductType", 4);
          } else {
            commit("marketSortProductType", 3);
          }
          break;
        }
      }
      this.goProductTop();
      this.$store.dispatch("marketStoreProductSort");
      // 滚动到对应分类
      for (let i = 0; i < this.marketStoreProductArr.length; i++) {
        const item = this.marketStoreProductArr[i];
        if (
          item.parentId === this.currentClassifyId ||
          item.classifyId === this.currentClassifyId
        ) {
          if (virtualRef) {
            virtualRef.scrollToIndex(item.uid);
          }
          break;
        }
      }
    },
    // 二級類目
    onSelectedSecondMenu({ index, scrollBottom = true }) {
      const { commit } = this.$store;
      scrollBottom && this.storeGoBottom();
      if (this.secondSelectedIndex !== index) {
        this.isTriggerScroll = false;
        window.__ALL_MENU_PRODUCT__ = [];
        window.__LAST_CLASSIFYID__ = -1;
        const thirdSelectedIndex = this.menuList[this.selectedIndex].children?.[
          index
        ]?.children?.[0]?.classifyId
          ? 0
          : -1;
        commit("marketSortProductType", 0);
        commit("secondSelectedIndex", index);
        commit("thirdSelectedIndex", thirdSelectedIndex);
        this.expandThird = false;
        this.goProductTop();
        this.updateMenuPosition();
        this.getMenuProduct();
        this.getMarketGiftBuyList()
      }
    },
    getMarketGiftBuyList() {
      this.$store.dispatch("getMarketGiftBuyList", { storeId: this.id });
    },
    restPageHeight() {
      try {
        this.clientHeight = document.body.clientHeight;
        if (!this.$refs.store || !this.$refs.headerBar) {
          return;
        }
        this.storeHeight = this.$refs.store?.offsetHeight;
        this.headerBarHeight = this.$refs.headerBar.$el?.offsetHeight || 55;
        const selectedId = ".marketSubmitPopup";
        this.submitHeight =
          document.querySelector(selectedId)?.offsetHeight || 56;
        if (this.indexStatusOpen) {
          this.tabHeight = document.querySelector('.tab9')?.offsetHeight || 0;
        } else {
          this.tabHeight = 0;
        }
        this.tabsMenuHeight =
          this.clientHeight - this.headerBarHeight - this.submitHeight - this.tabHeight - this.appSafeTop;
      } catch (error) {
        console.error(error);
      }
    },
    // 顶部渐变
    renderHeader(scrollTop) {
      if (!scrollTop) {
        scrollTop = this.$refs.store?.scrollTop;
      }
      const headerCard = this.$refs.headerCard.$el.scrollHeight;
      this.cardRgba = scrollTop / headerCard;
      this.cardRgba = this.cardRgba > 1 ? 1 : this.cardRgba;
    },

    // 将门店滚动到底部
    storeGoBottom(config) {
      const storeEl = this.$refs.store;
      if (storeEl) {
        storeEl.scroll({
          top: 99999,
          behavior: 'smooth',
          ...config
        });
      }
    },
    // 觸發粘性
    onStoreScroll(e) {
      let scrollTop = e?.target?.scrollTop;
      if (scrollTop == null) {
        scrollTop = this.$refs.store.scrollTop;
      }
      this.leaveScroll = scrollTop;

      // 开启首页状态，处理tab sticky
      if (this.indexStatusOpen) {
        const tabEl = this.tabType === 1
          ? document.querySelector('.classify3 .tab9')
          : document.querySelector('.container-box .tab9');
        if (tabEl) {
          if (tabEl.getBoundingClientRect().top - this.appSafeTop <= this.headerBarHeight) {
            this.isShowHeaderTab = true;
          } else {
            this.isShowHeaderTab = false;
          }
        }
      }
      if (this.selectMenuLock) {
        return;
      }
      if (scrollTop == null) {
        return;
      }
      // 顶部渐变
      this.renderHeader(scrollTop);
    },

    // 定位到某个商品
    scrollProduct() {
      window.__DISABLE_REQ__ = false;
      const replacePath = () => {
        this.$router.replace({
          path: "/market/store",
          query: {
            ...this.$route.query,
            productId: undefined,
            skuId: undefined,
            classifyId: undefined,
            addCart: undefined,
            errCode: undefined
          }
        });
      };
      this.$nextTick(async () => {
        if (this.$route.query.errCode) {
          // 外部活動進來，直接傳錯誤碼，這裏報錯就行
          let msg = ''
          switch (this.$route.query.errCode) {
            case '100000005-1':
              msg = '很抱歉您選擇的秒殺商品已搶光，選購其他現時秒殺商品吧！'
              break;
            default:
              break;
          }
          if (msg) this.$toast(msg)
        }

        // 分享端由商品詳情跳轉到門店再跳轉到詳情
        if (this.$route.query.goProduct) {
          const product = {
            productId: this.$route.query.goProduct,
            skuId: this.$route.query.skuId,
            storeId: this.$route.query.id
          };
          const newQuery = JSON.parse(JSON.stringify(this.$route.query)); // 深拷贝
          delete newQuery.goProduct;
          this.$router.replace({ query: newQuery });
          this.goMarketProduct(product);
          return;
        }
        const productId = this.$route.query.productId;
        const classifyId = this.$route.query.classifyId;
        const addCart = this.$route.query.addCart; // 是否要加入到购物车
        const virtualRef = this.$refs.virtual;
        if (!virtualRef || !classifyId) {
          return;
        }
        this.$store.commit('setMarketStoreProductId', productId);
        // 一级分类
        const {
          selectedIndex,
          secondSelectedIndex
        } = this.getMenuIdxById(classifyId);
        if (selectedIndex === -1) {
          replacePath();
          return;
        }
        this.tabChange(2);
        await this.utils.sleep(100); // 有门店装修的情况下门店头部会脱离文档流
        window.__DISABLE_REQ__ = true;
        this.onSelectedMenu({ index: selectedIndex, isExpand: true });
        // 有可能有二级分类
        if (secondSelectedIndex !== -1) {
          this.onSelectedSecondMenu({ index: secondSelectedIndex });
        }
        this.$store.dispatch('getProductByMenu', {
          storeId: this.id
        }).then(async res => {
          await this.$nextTick();
          if (productId) {
            for (let i = 0; i < this.marketStoreProductArr.length; i += 1) {
              const item = this.marketStoreProductArr[i];
              if (Array.isArray(item.products)) {
                // 找到对应商品所在的三级分类
                const idx = item.products.findIndex(item => item.productId === productId);
                if (idx !== -1) {
                  // 加入到购物车
                  if (addCart) {
                    this.$store.dispatch("plus", item.products[idx]);
                  }
                  // 将找到的商品移至分类的第一个商品，否则不好定位
                  const copyArr = cloneDeep(this.marketStoreProductArr);
                  const parentIdx = copyArr.findIndex(e => (e.classifyId === item.classifyId) && e.isParent);
                  const firstTemp = copyArr[parentIdx + 1].products[0];
                  const copyItem = copyArr[i].products[idx];
                  copyArr[parentIdx + 1].products[0] = copyItem;
                  copyArr[i].products[idx] = firstTemp;
                  this.$store.commit('marketStoreProductArr', copyArr);
                  // 选中三级分类
                  const threeIdx = this.thirdClassifyList
                    .findIndex(el => el.classifyId === item.classifyId);
                  if (threeIdx !== -1) {
                    this.onSelectedThirdMenu(threeIdx, this.thirdClassifyList[threeIdx]);
                    setTimeout(() => {
                      this.onSelectedThirdMenu(threeIdx, this.thirdClassifyList[threeIdx]);
                    }, 50);
                  }
                  break;
                }
              }
            }
          }
          this.storeGoBottom();
          replacePath();
          window.__DISABLE_REQ__ = false;
          this.observerPagination();
        });
      });
    },
    // 统一处理 必选商品的方法
    scrollRequiredClassify() {
      this.tabType = 2;
      setTimeout(() => {
        const requiredIndex = this.menuList.findIndex(
          (item) => item.isRequiredClassify
        );
        if (requiredIndex < 0) {
          this.init();
          return;
        }
        this.onSelectedMenu({ index: requiredIndex });
      }, 100);
    },
    // 传入分类ID获取一二级索引，找不到会自动适配
    getMenuIdxById(id, isSelected) {
      const menuList = this.menuList;
      let selectedIndex = -1; // 一级
      let secondSelectedIndex = -1; // 二级
      let thirdSelectedIndex = -1; // 三级
      for (let i = 0; i < menuList.length; i++) {
        const item = menuList[i];
        if (Array.isArray(item.children)) {
          for (let j = 0; j < item.children.length; j++) {
            const jItem = item.children[j];
            if (jItem.classifyId === id) {
              secondSelectedIndex = j;
              selectedIndex = i;
              break;
            }
            if (Array.isArray(jItem.children)) {
              for (let c = 0; c < jItem.children.length; c++) {
                const cItem = jItem.children[c];
                if (cItem.classifyId === id) {
                  secondSelectedIndex = j;
                  selectedIndex = i;
                  thirdSelectedIndex = c;
                  break;
                }
              }
            }
          }
        }
        if (item.classifyId === id) {
          selectedIndex = i;
          break;
        }
      }
      // 找不到，容错第一个分类
      if (selectedIndex === -1 && menuList.length) {
        selectedIndex = 0;
        secondSelectedIndex = menuList[0].children?.[0]?.classifyId ? 0 : -1;
      }
      // 是否需要选中
      if (isSelected) {
        this.$store.commit("marketSortProductType", 0);
        this.tabChange(2, () => {
          setTimeout(() => {
            this.onSelectedMenu({ index: selectedIndex, isExpand: true });
            this.onSelectedSecondMenu({ index: secondSelectedIndex });
          }, 100);
        });
      }
      return {
        selectedIndex,
        secondSelectedIndex,
        thirdSelectedIndex
      };
    },
    // 左边导航滾動位置
    updateMenuPosition: debounce(function (payload = {}) {
      if (!this.menuList.length) {
        return;
      }
      this.$nextTick(() => {
        const tabsMenuEl = this.$refs.tabsMenu;
        if (!tabsMenuEl) {
          return;
        }
        const firstItemEls = tabsMenuEl.querySelectorAll(".firstItem");
        const classifyEl = tabsMenuEl.querySelector(".classify");
        let top = 0;
        let itemHeight = 0; // 计算分类的高度
        if (classifyEl) {
          itemHeight = classifyEl.offsetHeight;
        }
        for (const el of firstItemEls) {
          if (el.classList.contains("active")) {
            const childEls = el.querySelectorAll(".classify");
            if (childEls.length > 0) {
              for (let i = 0; i < childEls.length; i++) {
                const cel = childEls[i];
                if (cel.classList.contains("active")) {
                  break;
                }
                top += cel.offsetHeight;
              }
            } else {
              top += el.offsetHeight;
            }
            break;
          } else {
            top += el.offsetHeight;
          }
        }
        let scrollTop = top - tabsMenuEl.offsetHeight / 2 + itemHeight; // 预留一定的空位，不置顶

        // 选中第一个分类
        if (
          (this.selectedIndex === 0 && this.secondSelectedIndex === 0) ||
          (this.selectedIndex === 0 && this.secondSelectedIndex === -1)
        ) {
          scrollTop = 0;
        }
        const config = {
          top: scrollTop,
          behavior: payload.behavior || "smooth"
        };
        tabsMenuEl.scroll(config);
        queueMicrotask(() => {
          tabsMenuEl.scroll(config);
        });
      });
    }, 30),
    // 点击左边一级导航
    onSelectedMenu(payload = {}) {
      const { index, isExpand, scrollBottom = true } = payload;
      const { commit } = this.$store;
      if (this.selectMenuLock) {
        return;
      }
      this.expandThird = false;
      this.cardRgba = 1;
      // 点击同一个分类
      if (this.selectedIndex === index) {
        if (isExpand) {
          this.closeClassify = false;
        } else {
          this.closeClassify = !this.closeClassify;
        }
      } else {
        this.closeClassify = false;
      }

      // 点击不是同一个分类并且展开的情况下触发
      scrollBottom && this.storeGoBottom();
      if (this.selectedIndex !== index) {
        if (!this.closeClassify) {
          this.isTriggerScroll = false;
          const secondSelectedIndex =
            this.menuList[index].children?.[0]?.classifyId;
          const thirdSelectedIndex =
            this.menuList[index].children?.[0]?.children?.[0]?.classifyId;
          window.__ALL_MENU_PRODUCT__ = [];
          window.__LAST_CLASSIFYID__ = -1;
          this.goProductTop();
          commit("marketSortProductType", 0);
          commit("secondSelectedIndex", secondSelectedIndex ? 0 : -1);
          commit("selectedIndex", index);
          commit("thirdSelectedIndex", thirdSelectedIndex ? 0 : -1);
          this.updateMenuPosition();
          this.getMenuProduct();
          this.getMarketGiftBuyList()
        }
      }
    },

    // 加载上一个分类，如果没有则返回false，否则不返回
    // check 是否只是检测是否有上一页而不是加载
    handlePrev(check) {
      const twoIdx = this.secondSelectedIndex - 1;
      let hasPrev = this.menuList[this.selectedIndex]?.children?.[twoIdx];
      if (hasPrev) {
        if (!check) {
          this.onSelectedSecondMenu({ index: twoIdx, scrollBottom: false });
        } else {
          // 静默请求上一个分类数据
          this.$store.dispatch("getProductByMenu", {
            static: true,
            storeId: this.id,
            classifyId:
              hasPrev?.children?.[0]?.classifyId || hasPrev?.classifyId,
          });
        }
        return;
      }
      const oneIdx = this.selectedIndex - 1;
      hasPrev = this.menuList[oneIdx];
      if (hasPrev) {
        if (!check) {
          this.onSelectedMenu({ index: oneIdx, scrollBottom: false });
          const childLen = this.menuList[oneIdx]?.children?.length;
          if (childLen > 0) {
            this.onSelectedSecondMenu({ index: childLen - 1, scrollBottom: false });
          }
        } else {
          // 静默请求上一个分类数据
          this.$store.dispatch("getProductByMenu", {
            static: true,
            storeId: this.id,
            classifyId:
              hasPrev?.children?.[0]?.classifyId || hasPrev?.classifyId,
          });
        }
        return;
      }
      return false;
    },

    // 加载下一个分类，如果没有则返回false，否则不返回
    // check 是否只是检测是否有下一页而不是加载
    handleNext(check) {
      const twoIdx = this.secondSelectedIndex + 1;
      let hasNext = this.menuList[this.selectedIndex]?.children?.[twoIdx];
      if (hasNext) {
        if (!check) {
          this.onSelectedSecondMenu({ index: twoIdx });
        } else {
          // 静默请求下一个分类数据
          const classifyId = hasNext?.children?.[0]?.classifyId || hasNext?.classifyId;
          // this.$store.dispatch("getProductByMenu", {
          //   static: true,
          //   storeId: this.id,
          //   classifyId
          // });
          return classifyId;
        }
        return;
      }
      const oneIdx = this.selectedIndex + 1;
      hasNext = this.menuList[oneIdx];
      if (hasNext) {
        if (!check) {
          this.onSelectedMenu({ index: oneIdx });
        } else {
          // 静默请求下一个分类数据
          const classifyId = hasNext?.children?.[0]?.classifyId || hasNext?.classifyId;
          // this.$store.dispatch("getProductByMenu", {
          //   static: true,
          //   storeId: this.id,
          //   classifyId
          // });
          return classifyId;
        }
        return;
      }
      return false;
    },

    handleTouchstart(e) {
      const { pageY } = e.touches[0];
      this.touchstartPageY = pageY;
      this.storeScrollTop = this.$refs.store.scrollTop;
      this.scrollHeight = this.$refs.virtual.$el.scrollHeight;
      document.addEventListener("touchmove", this.handleTouchmove);
      document.addEventListener("touchend", this.handleMouseup);
    },

    // 手势放开
    handleMouseup(e) {
      this.$store.commit("setMarketStoreIsOpen", false);
      document.removeEventListener("touchmove", this.handleTouchmove);
      document.removeEventListener("touchend", this.handleMouseup);

      const virtualRef = this.$refs.virtual;
      const storeEl = this.$refs.store;
      const virtualEl = virtualRef?.$el;
      if (!virtualEl) {
        return;
      }
      virtualEl.style.transform = "translateY(0)";
      const { pageY } = e.changedTouches[0];
      const diff = pageY - this.touchstartPageY;
      // 向上滚动
      if (diff < 0) {
        // pass
        // if (this.isNext) {
        //   const scrollTop = virtualRef.getOffset();
        //   const clientHeight = virtualEl.clientHeight;
        //   const isScrollBottom =
        //     scrollTop + clientHeight + 2 >= this.scrollHeight;
        //   // 滚动条已经到最底部 && 往上滑了一段距离
        //   if (isScrollBottom && diff < -100) {
        //     this.handleNext();
        //   }
        // }
        this.storeGoBottom();
      } else {
        // 向下滚动
        // 如果菜品容器已经到顶了，并且向下滑
        const top = virtualEl.scrollTop;
        if (top <= 0 && diff > 100 && storeEl.scrollTop <= 0) {
          this.handlePrev();
        }
        if (top <= 0 && diff > 60) {
          this.storeGoBottom({ top: 0 });
        }
      }
    },

    handleTouchmove(e) {
      const storeEl = this.$refs.store;
      if (!storeEl) {
        return;
      }
      const virtualRef = this.$refs.virtual;
      const virtualEl = virtualRef?.$el;
      if (!virtualEl) {
        return;
      }
      const { pageY } = e.touches[0];
      let diff = pageY - this.touchstartPageY;
      // 向上拉
      if (diff < 0) {
        // pass
        // storeEl.scrollTop = this.storeScrollTop + Math.abs(diff);
        // if (this.isNext) {
        //   const scrollTop = virtualRef.getOffset();
        //   const clientHeight = virtualEl.clientHeight;
        //   const isScrollBottom =
        //     scrollTop + clientHeight + 2 >= this.scrollHeight;
        //   // 滚动条已经到最底部 && 往上滑了一段距离
        //   if (isScrollBottom && diff < -100) {
        //     this.$store.commit("setMarketStoreIsOpen", true);
        //   } else {
        //     this.$store.commit("setMarketStoreIsOpen", false);
        //   }
        // }
      } else {
        // 向下拉
        const virtualEl = virtualRef?.$el;
        if (virtualEl) {
          // 如果菜品容器已经到顶了，并且向下滑
          const top = virtualEl.scrollTop;
          if (top <= 0) {
            diff = Math.abs(diff);
            diff = diff * 0.8;
            storeEl.scrollTop = this.storeScrollTop - diff;
            if (storeEl.scrollTop <= 0 && this.selectedIndex > 0) {
              diff = diff > 50 ? 50 + diff * 0.1 : diff;
              virtualEl.style.transform = `translateY(${diff}px)`;
            }
          }
        }
      }
    },

    // 销毁事件
    destroyTouch() {
      document.removeEventListener("touchmove", this.handleTouchmove);
      document.removeEventListener("touchend", this.handleMouseup);
      const virtualEl = this.$refs.virtual;
      if (virtualEl) {
        virtualEl.$el.removeEventListener("touchstart", this.handleTouchstart);
      }
    },

    // 初始化touch事件
    initTouch() {
      const virtualEl = this.$refs.virtual;
      if (!virtualEl) {
        return;
      }
      this.destroyTouch();
      virtualEl.$el.addEventListener("touchstart", this.handleTouchstart);
      this.handleMutationObserver();
    },
    // 侦测菜品列表元素变化
    handleMutationObserver() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }
      // 监听元素变化翻页
      this.$nextTick(() => {
        const targetNode = document.querySelector('#virtual > div');
        if (targetNode) {
          const config = { attributes: true, childList: true, subtree: true };
          this.mutationObserver = new MutationObserver(() => {
            this.observerPagination();
          });
          this.mutationObserver.observe(targetNode, config);
        }
      });
    },

    // 侦测翻页
    observerPagination() {
      this.$nextTick(() => {
        this.destoryObserver();
        const els = document.querySelectorAll('#virtual div[role="listitem"]');
        const el = els[els.length - 1];
        if (!el) {
          return;
        }
        if (this.observer) {
          return;
        }
        this.observer = new IntersectionObserver(entries => {
          if (entries[0].intersectionRatio <= 0) {
            return;
          }
          // 找到下一个分类ID
          let classifyId;
          for (let i = 0; i < this.menuList.length; i++) {
            const item = this.menuList[i];
            const children = item.children || [];
            for (let j = 0; j < children.length; j++) {
              const c = children[j];
              if (c.classifyId === window.__LAST_CLASSIFYID__) {
                classifyId = children?.[j + 1]?.classifyId ||
                  this.menuList?.[i + 1]?.children?.[0]?.classifyId ||
                  this.menuList?.[i + 1]?.classifyId;
              }
            }
            // 第一层分类
            if (item.classifyId === window.__LAST_CLASSIFYID__) {
              classifyId = item?.children?.[0]?.classifyId ||
                this.menuList?.[i + 1]?.children?.[0]?.classifyId ||
                this.menuList?.[i + 1]?.classifyId;
            }
          }
          if (classifyId) {
            this.getMenuProduct({
              showLoading: false,
              classifyId
            });
          }
        });
        this.observer.observe(el);
      });
    },

    destoryObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
  }
};
