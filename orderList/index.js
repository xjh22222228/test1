import NavBar from '@/components/2.0.0/nav';
import TabBar from '../components/tabBar/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import utils from '@/JS/utils';
import GoodsEnd from '../components/goods/end/index.vue';
import mf from "@/JS/mFoodSDK";
import TagGroup from '@/views/activity/h5/components/2.4.0/marketBaseStore/tag/group';
import filter from '@/JS/filter.js';
import StoreStatus from '@/views/market/near/store-status.vue';
import { Dialog, Toast } from 'vant';
import { post } from '@/JS/ajax';

export default {
  components: {
    NavBar,
    TabBar,
    ScrollBar,
    GoodsEnd,
    TagGroup,
    StoreStatus
  },

  data() {
    return {
      safeClassName: utils.getSafeTopClassName('padding'),
      orderStatus: -1,
      imgCompress: filter.imgCompress,
      tabList: [
        {
          name: '全部',
          status: -1
        },
        {
          name: '待評價',
          status: 1
        },
        {
          name: '退款',
          status: 2
        }
      ]
    };
  },
  computed: {
    commentScoreInfo() {
      return this.$store.getters.commentScoreInfo
    }
  },
  created() {
    this.loadPage();
  },
  activated() {
    this.loadPage(false);
    this.$toast.clear();
  },

  methods: {
    loadPage(isLoadData = true) {
      const { redirect, ...query } = this.$route.query;
      if (redirect) {
        console.log('redirect-orderList=', redirect)
        this.$router.replace('/market/orderList');
        setTimeout(() => {
          this.$router.push({
            path: redirect,
            query
          });
        });
        return;
      }
      if (mf.isApp) {
        mf.APPLoginAsync().then(() => {
          isLoadData && this.onDownCallback();
        }).catch(e => {
          this.$toast.clear();
          this.$router.replace('/market/index');
          console.log('APPLoginAsync', e);
        });
      } else {
        isLoadData && this.onDownCallback();
      }
    },
    onNavBack() {
      this.$router.replace('/market/index');
    },

    handleClickTab(orderStatus) {
      this.orderStatus = orderStatus;
      this.$refs.goods.reset();
      this.$refs.goods.getData({ showLoading: true }, true);
    },

    onDownCallback(done) {
      if (this.$refs.goods) {
        this.$refs.goods.reset();
        this.$refs.goods.getData(null, true).finally(() => {
          done && done();
          this.$toast.clear();
        });
        // 用户本月评论积分规则
        this.$store.dispatch('commentScoreUserAvailableInfo');
      } else {
        this.$nextTick(() => {
          this.onDownCallback(done);
        });
      }
    },

    getData(params) {
      return this.$store.dispatch('getMarketOrderList', {
        orderStatus: this.orderStatus,
        ...params
      }).finally(() => {
        this.$toast.clear();
      });
    },

    // 再次購買
    async handleBuy(data) {
      this.$toast('請稍後...');
      this.$store.dispatch('getAgainProduct', data.tradeId).then(res => {
        mf.goMarketStore({
          id: data.storeId,
          from: '超市訂單頁',
          tradeId: data.tradeId
        });
      });
    },
    // 跳轉到訂單詳情
    goToOrderInfo(tradeId) {
      this.$router.push({
        path: '/market/orderInfo',
        query: {
          tradeId
        }
      });
    },
    // 跳转到门店
    goStore(data) {
      mf.goMarketStore({
        id: data.storeId,
        from: '超市訂單頁'
      });
    },
    // 跳转到评价页面
    goCommentPage(data) {
      this.$router.push({
        path: '/market/submitComment',
        query: {
          storeId: data.storeId,
          tradeId: data.tradeId
        }
      });
    },

    handleTouchStart(data, idx, e) {
      const text = e.target.innerText.trim();
      if (text === this.$t("ORDERINFO.order_again") || text === this.$t("ORDERINFO.reviews")) return;
      if (e.target.nodeName.toUpperCase() === "BUTTON") return;

      this.touchTimer = setTimeout(() => {
        this.handleDelOrder(data, idx);
      }, 1000);
    },
    handleTouchEnd() {
      clearTimeout(this.touchTimer);
      setTimeout(() => {
        this.userSelectFix();
      }, 50);
    },
    handleTouchMove() {
      clearTimeout(this.touchTimer);
    },
    // 刪除訂單
    handleDelOrder(data, idx) {
      setTimeout(() => {
        this.userSelectFix();
      }, 50);

      Dialog.confirm({
        message: this.$t("ORDERINFO.really_delete_the_order"),
        confirmButtonText: this.$t("common.cancel"),
        confirmButtonColor: "#FA6C16",
        cancelButtonText: this.$t("common.delete"),
        className: "dialog-del-class"
      }).catch(e => {
        // 請求刪除接口
        Toast.loading({ message: this.$t('common.submitting'), duration: 0 });
        post("/market/order/_del-order", {
          tradeId: data.tradeId
        }).then(res => {
          this.$refs.goods.getData(null, null, true);
          Toast.success({
            type: "success",
            message: this.$t("ORDERINFO.deleted_successfully")
          });
        }).catch(e => {
          const msg = e?.response?.data?.note ?? this.$t("ORDERINFO.order_could_not_be_deleted");
          Toast({
            message: msg,
            duration: 2000,
            forbidClick: true,
            transition: "fuulTransition"
          });
        });
      });
    },

    userSelectFix() {
      if (window.getSelection && document.activeElement) {
        const selection = window.getSelection();
        const deleteMe = document.createElement("div");
        deleteMe.setAttribute("style", "display:none");
        const range = document.createRange();

        document.activeElement.insertBefore(deleteMe, document.activeElement.firstChild);
        range.selectNodeContents(deleteMe);
        selection.removeAllRanges();
        selection.addRange(range);
        deleteMe.parentNode.removeChild(deleteMe);
      }
    }
  }
};
