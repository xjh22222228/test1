import NavBar from '@/components/2.0.0/nav';
import mf from '@/JS/mFoodSDK';
import ReasonSelect from './components/reason-select/index.vue';
import utils from '@/JS/utils';
import PhoneCallComponents from "@components/2.0.0/phoneCall";
import ExplainDialog from '../components/explainDialog/index.vue';
import {
  Stepper,
  Toast,
  Dialog
} from "vant";
import { cloneDeep } from 'lodash';
import filter from '@/JS/filter.js';
import ViewGiftPopup from '@/views/market/components/store-item/bottom-cart/view-gift-popup';
import MallCouponPopup from '@/views/components/popupDialog';
import MallCouponList from '@/views/components/3.8.0/mallCoupon/list.vue'

// 虚拟胶带费明细ID
const PLASTIC_BAG_ID = "10000000001";

export default {
  components: {
    NavBar,
    ReasonSelect,
    ExplainDialog,
    ViewGiftPopup,
    [Stepper.name]: Stepper,
    MallCouponPopup,
    MallCouponList,
    [Toast.name]: Toast
  },

  data() {
    return {
      imgCompress: filter.imgCompress,
      PLASTIC_BAG_ID,
      safeClass: utils.getSafeTopClassName('height'),
      maxUpload: 9, // 最多上傳
      imgs: [], // 上傳圖片列表
      reason: '', // 選擇的必填原因
      remark: '', // 退款原因
      tradeId: this.$route.params.tradeId,
      productList: [],
      noProductList: [], // 不支持退款商品
      checkedAll: false,
      disableAll: false,
      returnAmt: 0, // 退款金额
      refundDeliveryAmtn: 0, // 退配送费
      refundConsumptionAmtn: 0, // 退消费金金额
      refundConsumptionQty: 0, // 退消费券数
      submitting: false,
      giftProducts: [], // 勾选了商品赠送的商品
      refundOtherInfo: [],
      // 最近一次的退款参数
      lastRefundParams: null
    };
  },

  computed: {
    // 退款售后詳情信息
    info() {
      return this.$store.state.marketAfterSale.marketAfterSaleInfo;
    },

    // 订单信息
    marketOrderInfo() {
      return this.$store.getters.marketOrderInfo;
    },

    // 平台費信息
    platformCommissionData() {
      return this.marketOrderInfo.orderInfo?.platformCommission || {}
    },

    // 是否支持部分退款
    supportPart() {
      return this.info.isPartRefund;
    },

    // 是否支持退运费
    // 商品全部选中，没有可退的商品把运费加上
    isRefundDelivery() {
      const countTotal = this.productList
        .reduce((acc, cur) => acc + cur.count, 0);
      const qtyTotal = this.productList
        .filter(item => item.__checked__)
        .reduce((acc, cur) => acc + cur.__qty__, 0);
      const noQtyTotal = this.noProductList
        .reduce((acc, cur) => acc + cur.count, 0);

      if ((countTotal + noQtyTotal) === qtyTotal) {
        return true;
      }
      return false;
    },

    // 禁用全选功能
    disabledCheckAll() {
      if (!this.supportPart || this.disableAll) {
        return true;
      }
      if (this.productList.length === 1) {
        if (this.productList[0].count === this.productList[0].__lowQty__) {
          return true;
        }
      }
      return false;
    },
    // 計算退款商品券數量
    refundMallCouponCount() {
      return this.productList.filter(item => {
        return item.isMallCoupon && item.__checked__
      }).length
    }
  },

  watch: {
    // 商品变化重新计算退款金额
    productList() {
      this.getReturnAmt();
    }
  },

  mounted() {
    Promise.all([
      this.getAfterSaleInfo(),
      this.$store.dispatch("marketOrderInfo", this.tradeId)
    ]).finally(() => {
      this.$toast.clear();
    });
  },

  methods: {
    onIconClick() {
      Dialog.confirm({
        title: this.$t('refund.explain_title'),
        className: "mfood-h5-bottom-dialog-class",
        message: this.$t('refund.explain_content'),
        confirmButtonText: this.$t('common.get_it'),
        allowHtml: true,
        showCancelButton: false
      });
    },
    // 计算金额
    getReturnAmt() {
      const params = {
        tradeId: this.tradeId,
        items: this.productList
          .filter(item => item.__checked__)
          .map(item => ({
            orderProductId: item.orderProductId,
            refundCount: item.__qty__
          }))
      };
      this.$store.dispatch('getReturnAmt', params).then(res => {
        this.returnAmt = res.refundAmtn;
        this.refundConsumptionAmtn = res.refundConsumptionAmtn;
        this.refundConsumptionQty = res.refundConsumptionQty;
        const refundBuyGiftInfo = res.refundBuyGiftInfo || [];
        if (
          this.giftProducts.length != refundBuyGiftInfo.length &&
          refundBuyGiftInfo.length > this.giftProducts.length
        ) {
          this.$toast({
            message: '該商品退货達到對應活動門檻所有對應赠送商品都需一并退还'
          });
        }
        this.giftProducts = refundBuyGiftInfo;
      });
    },

    // 禁止减少
    disableMinus(item) {
      if (item.orderProductId === PLASTIC_BAG_ID) {
        const all = this.productList
          .filter(item => item.orderProductId !== PLASTIC_BAG_ID)
          .every(item => item.__checked__ && (item.__qty__ === item.count));
        if (all) {
          return true;
        }
      }

      return false;
    },

    // 点击减号
    onMinus() {
      this.getReturnAmt();
      this.checkedAll = false;
    },

    // 点击+号
    onPlus(idx) {
      const productList = cloneDeep(this.productList);
      productList[idx].__checked__ = true;
      if (!productList[idx].__flagClick__) {
        productList[idx].__flagClick__ = true;
        productList[idx].__qty__ = 1;
      }
      if (productList[idx].orderProductId !== PLASTIC_BAG_ID) {
        const all = productList
          .filter(item => item.orderProductId !== PLASTIC_BAG_ID)
          .every(item => item.__checked__ && (item.__qty__ === item.count));
        if (all) {
          const bagIdx = productList.findIndex(item => item.orderProductId === PLASTIC_BAG_ID);
          if (bagIdx >= 0) {
            productList[bagIdx].__checked__ = true;
            productList[bagIdx].__flagClick__ = true;
            productList[bagIdx].__qty__ = productList[bagIdx].count;
          }
        }
      }
      const isCheckAll = productList.every(item => item.__checked__);
      this.checkedAll = isCheckAll;
      this.productList = productList;
    },

    // 全選/反選
    onCheckAll() {
      if (this.disabledCheckAll) {
        return;
      }
      this.checkedAll = !this.checkedAll;
      const productList = cloneDeep(this.productList).map(item => {
        item.__checked__ = this.checkedAll;
        if (this.checkedAll) {
          item.__flagClick__ = true;
          item.__qty__ = item.count;
        }
        return item;
      });
      this.productList = productList;
    },

    // 选中/反选商品
    onCheck(idx) {
      const { __qty__, __checked__ } = this.productList[idx];
      if (__qty__ <= 0) {
        this.$set(this.productList[idx], "__qty__", 1);
      }

      const productList = cloneDeep(this.productList);
      // 胶带费, 如果只剩下最后一个商品&数量已选最大，禁止取消选中
      if (
        productList[idx].orderProductId === PLASTIC_BAG_ID &&
        productList[idx].__checked__
      ) {
        const all = productList
          .filter(item => item.orderProductId !== PLASTIC_BAG_ID)
          .every(item => item.__checked__ && (item.__qty__ === item.count));
        if (all) {
          return;
        }
      }

      productList[idx].__checked__ = !__checked__;
      // 选中&未点击过
      if (!productList[idx].__flagClick__ && productList[idx].__checked__) {
        productList[idx].__flagClick__ = true;
        productList[idx].__qty__ = productList[idx].count;
      }

      // 取消选中操作
      if (!productList[idx].__checked__) {
        productList[idx].__flagClick__ = false;
        productList[idx].__qty__ = 1;
      }

      // 退整单操作
      // 剩余最后一个菜品时需要默认勾选胶带费
      // 当前选中的不是胶带费
      if (productList[idx].orderProductId !== PLASTIC_BAG_ID && productList[idx].__checked__) {
        const all = productList
          .filter(item => item.orderProductId !== PLASTIC_BAG_ID)
          .every(item => item.__checked__ && (item.__qty__ === item.count));
        if (all) {
          const bagIdx = productList.findIndex(item => item.orderProductId === PLASTIC_BAG_ID);
          if (bagIdx >= 0) {
            productList[bagIdx].__checked__ = productList[idx].__checked__;
            productList[bagIdx].__flagClick__ = true;
            productList[bagIdx].__qty__ = productList[bagIdx].count;
          }
        }
      }

      // 检测是否已全部选中
      const isCheckAll = productList.every(item => item.__checked__);
      this.checkedAll = isCheckAll;
      this.productList = productList;
    },

    // 获取退款信息
    getAfterSaleInfo() {
      return this.$store.dispatch('getAfterSaleInfo', {
        tradeId: this.tradeId
      })
        .then(res => {
          if (Array.isArray(res?.items)) {
            const productList = cloneDeep(res.items);
            this.noProductList = productList.filter(item => item.isSupport === false);
            const items = productList
              .filter(item => (item.isSupport || item.isSupport == null))
              .map(item => {
                item.__qty__ = 1;
                item.__lowQty__ = 1; // 最低退款數量
                item.__disabled__ = false;
                item.__checked__ = false;
                item.__flagClick__ = false; // 记录是否点击过+按钮

                // 只有一個商品 & 数量只有1件
                if (
                  (productList.length === 1 &&
                    (productList[0].count === productList[0].__lowQty__))
                ) {
                  item.__checked__ = true;
                  item.__disable__ = true;
                  item.__qty__ = item.count;
                }

                // 最低限购数量
                if (item.count === item.__lowQty__) {
                  item.__qty__ = item.count;
                }

                // 不支持部分退款， 全部选中
                if (!this.supportPart) {
                  item.__checked__ = true;
                  item.__disable__ = true;
                  item.__qty__ = item.count;
                }
                return item;
              });
            this.productList = items;
          }

          const isCheckAll = this.productList.every(item => item.__checked__);
          if (isCheckAll) {
            this.checkedAll = isCheckAll;
            // 必须只有一个商品才禁用全选，因为有可能一个商品一个胶带费
            if (this.productList.length === 1) {
              this.disableAll = isCheckAll;
            }
          }
        })
        .catch(e => {
          this.$toast(e?.response?.data?.note);
        });
    },

    onTextareaFocus() {
      const textEl = this.$refs.textarea;
      if (textEl) {
        textEl.scrollIntoView();
      }
    },

    removeImg(idx) {
      this.imgs.splice(idx, 1);
    },

    onUpload() {
      mf.choosePicsToUpload({
        maxCount: this.maxUpload - this.imgs.length
      }).then(imgs => {
        imgs.forEach(img => {
          this.imgs.push(img);
        });
        this.imgs = this.imgs.slice(0, this.maxUpload);
      });
    },

    openReason() {
      this.$refs.reason.open(this.reason);
    },

    handleOkReason(value) {
      this.reason = value;
    },

    handlePhoneCall() {
      const data = [];
      if (this.info.storePhone) {
        data.push({
          name: `呼叫 +${this.info.storePhone}`,
          className: this.info.storePhone.replace('-', '')
        });
      }
      if (this.info.storeMobile) {
        data.push({
          name: `呼叫 +${this.info.storeMobile}`,
          className: this.info.storeMobile.replace('-', '')
        });
      }
      PhoneCallComponents({
        data,
        title: "致電商家",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    },

    openExplain(type) {
      const { orderInfo } = this.marketOrderInfo;

      switch (type) {
        // 包裝費
        case 1:
          this.$refs.explain.open({
            type,
            totalAmt: orderInfo.plasticBagFee,
            plasticBagQty: orderInfo.plasticBagQty
          });
          break;
        // 配送費
        case 2:
          this.$refs.explain.open({
            type,
            totalAmt: orderInfo.deliveryFee,
            baseAmt: orderInfo.basicDeliveryFee,
            weightAmt: orderInfo.overWeightFee,
            freshDeliveryFee: orderInfo.freshDeliveryFee,
            plusAmt: orderInfo.incrementDeliveryFee,
            deliveryType: orderInfo.deliveryType,
            basicDeliveryFee: this.info.basicDeliveryFee,
            overWeightDeliveryFee: this.info.overWeightDeliveryFee,
            deliveryFreeAmt: (orderInfo?.disDeliveryAmtn || 0) + (orderInfo?.disMerchantDeliveryAmtn || 0)
          });
          break;
      }
    },

    // 查看买赠商品
    onViewGift() {
      if (!this.$refs.viewGift) {
        return;
      }
      this.$refs.viewGift.open(this.giftProducts);
    },

    // 提交申請退款原因
    async submitReturn() {
      if (this.submitting) {
        return;
      }

      const items = this.productList
        .filter(item => item.__checked__)
        .map(item => ({
          orderProductId: item.orderProductId,
          refundCount: item.__qty__
        }));
      if (items.length <= 0) {
        return this.$toast('請選擇退款商品');
      }

      if (process.env.NODE_ENV === 'development') {
        this.imgs = ['https://test-o2o-storage-public.oss-cn-shenzhen.aliyuncs.com/fc1bb5b4-23f7-4509-87a6-a10fd92340b6.jpg'];
      }
      if (!this.reason) {
        return this.$toast('請選擇退款原因');
      }
      if (!this.remark) {
        return this.$toast('請輸入退款原因');
      }
      if (this.remark.length < 10) {
        return this.$toast('退款原因至少10個字');
      }
      if (this.imgs.length <= 0) {
        return this.$toast('請上傳圖片');
      }

      const params = {
        afsType: 2, // 售后类型[1:仅退款，2：退款退货]
        imgUrl: this.imgs.join(','),
        items,
        tradeId: this.tradeId,
        buyerRepairReason: this.remark, // 補充退款原因
        reason: this.reason,
        refundAmtn: this.returnAmt
      };
      try {
        const otherInfo = await this.$store.dispatch("getMarketRefundOtherInfo", params)
        this.refundOtherInfo = otherInfo
        if (otherInfo.length) {
          this.$refs.mallCouponPopup.show()
          this.lastRefundParams = params
          return
        }
        this.submitting = true
        this.$toast.loading({ message: this.$t('refund.submiting'), duration: 0, forbidClick: true });
        this.$store.dispatch('submitMarketApplyReturn', params)
          .then(() => {
            this.$toast({
              message: '退款申請成功'
            });
            setTimeout(() => {
              this.$router.replace({
                path: '/market/afterSaleDetail',
                query: {
                  tradeId: this.tradeId
                }
              });
            }, 2000);
          })
          .catch(error => {
            this.$toast(utils.errorMsg(error));
          })
          .finally(() => {
            this.submitting = false;
          });
      } catch (error) {
        Toast.fail(error, this.$t('refund.refundFail'))
      }
    },
    // 商品券有效期提醒弹窗中繼續退款逻辑
    handleMallCouponPopupConfirm() {
      const params = this.lastRefundParams
      if (!params) return
      this.submitting = true
      Toast.loading({ message: this.$t('refund.submiting'), duration: 0, forbidClick: true });
      this.$store.dispatch('submitMarketApplyReturn', params)
        .then(() => {
          this.$toast({
            message: '退款申請成功'
          });
          setTimeout(() => {
            this.$router.replace({
              path: '/market/afterSaleDetail',
              query: {
                tradeId: this.tradeId
              }
            });
          }, 2000);
        })
        .catch(error => {
          this.$toast(utils.errorMsg(error));
        })
        .finally(() => {
          this.submitting = false;
        });
      this.lastRefundParams = null;
    },
    handleMallCouponPopupCancel() {
      this.lastRefundParams = null
    }
  }
};
