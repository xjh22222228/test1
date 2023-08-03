import { Popup } from "vant";
import arrowImg from '@/assets/images/icon_system_arrow_down@2x.png';
import arrowRight from '@/assets/images/icon_system_arrow_mid_right@2x.png';
import storeVoucher from './storeVoucher.vue';
import event from '@/JS/event';
import storeVoucherList from '../storeVoucherList/index.vue';
import mf from '@/JS/mFoodSDK.js';
import VipIcon from '@/views/market/order/components/vip-icon';

export default {
  components: {
    [Popup.name]: Popup,
    storeVoucher,
    storeVoucherList,
    VipIcon
  },

  data() {
    return {
      showPopup: false,
      arrowImg,
      arrowRight,
      observerInstance: null,
      isOver: false, // 是否超出
      showAll: false // 是否展開所有優惠
    };
  },

  deactivated() {
    this.showPopup = false;
    if (this.observerInstance) {
      this.observerInstance.disconnect();
      this.observerInstance = null;
    }
  },

  activated() {
    this.showPopup = false;
    event.$on('marketStoreDiscountOpen', this.open);
    this.observer();
  },

  computed: {
    // 門店優惠信息
    storeDiscount() {
      return this.$store.state.marketStore.marketStoreDiscount;
    },
    // 門店詳情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    // 滿減活動
    marketStoreActivity() {
      return this.$store.state.marketStore.marketRawStoreActivity;
    },
    // 折扣比例
    discountRate() {
      const rate = this.storeDiscount.productDiscountRate;
      if (rate == null) {
        return null;
      }
      return Number((rate * 10).toFixed(2));
    },
    // 旧折扣比例
    oldDiscountRate() {
      const rate = this.storeDiscount.oldProductDiscountRate;
      if (rate == null) {
        return null;
      }
      return Number((rate * 10).toFixed(2));
    },
    // 秒杀折扣
    seckillDiscount() {
      return this.storeDiscount.__seckillDiscount__;
    },
    // 用戶信息
    memberInfo() {
      return this.$store.getters.memberInfo;
    },
    marketStoreVoucher() {
      return this.$store.getters.marketStoreVoucher;
    },
    showList() {
      const list = this.marketStoreVoucher;
      return list.filter((item, index) => index < 6);
    },
    // 买赠活动列表
    giftBuyList() {
      return this.$store.state.marketStore.marketGiftBuyList;
    },
    // 买赠
    buyGiftData() {
      if (this.giftBuyList.length > 0) {
        return this.giftBuyList[0];
      }
      return null
    },
    // 组合价列表
    groupList() {
      return this.$store.state.marketStore.marketGroupList;
    }
  },

  methods: {
    open() {
      this.showPopup = true;
      this.observer();
    },
    showAllVoucher() {
      this.$refs.vl.show();
    },
    // 展開更多優惠
    handleExpand() {
      this.showAll = !this.showAll;
    },
    // 監聽優惠標簽元素變化，是否超出
    observer() {
      const that = this;
      this.$nextTick(() => {
        const tagEl = this.$refs.tag;
        if (!tagEl) {
          return;
        }
        function callback() {
          const children = tagEl.querySelectorAll('.tags-item0');
          that.isOver = children.length > 4;
        }
        callback();
        this.observerInstance = new MutationObserver(callback);
        this.observerInstance.observe(tagEl, {
          attributes: false, childList: true, subtree: false
        });
      });
    },
    // 格式化滿減優惠顯示文案
    formatFullReduceMsg(data) {
      const discountContentList = data.discountContentList;
      return discountContentList
        .map(item => {
          return data.activityType === 1
            ? `滿${item.fullAtm}減${item.discount}`
            : `滿${item.fullAtm}打${Number((item.discount * 10).toFixed(2))}折`;
        })
        .join('；');
    },
    // 點擊領取優惠券
    onReceiveVoucher(data) {
      // 登錄 todo
      if (!this.memberInfo.userId) {
        if (mf.isApp) {
          mf.APPLoginAsync().then(res => {
            console.log(res, 'APPLoginAsync')
            this.onReceiveVoucher(data);
          });
          return;
        } else {
          this.$toast('請先登錄');
          return;
        }
      }
      // 如果已經領取，則返回
      if (data.isReceive === true) return false;
      // 顯示loading
      this.$toast.loading({
        duration: 0
      });
      // // 商家紅包 升級
      // if (data.memberUpMoneyId) {
      //   return this.$refs.upRed.exchangeVan({ ...data, storeId: this.marketStoreDetail.id });
      // }
      // // 著數紅包
      // if (data.isCheap) {
      //   return this.$store
      //     .dispatch("storeReceiveCheapVoucher", {
      //       voucherDetailId: data.voucherDetailId
      //     })
      //     .finally(async () => await this.queryVoucher())
      //     // 處理成功
      //     .then(result => {
      //       this.$toast({
      //         message: "領取成功",
      //         position: "bottom"
      //       });
      //     })
      //     // 處理錯誤
      //     .catch(e => this.$toast({
      //       message: e?.response?.data?.note || "領取失敗",
      //       position: "bottom"
      //     }));
      // }
      // 領取優惠券
      this.$store.dispatch("marketStoreReceiveVoucher", {
        storeId: this.marketStoreDetail.id,
        activityId: data.id
      }).finally(async () => await this.queryVoucher())
        // 處理成功
        .then(result => {
          this.$toast({
            message: "領取成功",
            position: "bottom"
          });
        })
        // 處理錯誤
        .catch(e => {
          this.$toast({
            message: e?.response?.data?.note || "領取失敗",
            position: "bottom"
          });
        });
    },
    queryVoucher() {
      return this.$store.dispatch("marketStoreVoucher", this.marketStoreDetail.id);
    }
  }
};
