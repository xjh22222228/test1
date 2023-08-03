import {
  Button,
  Toast,
  Tab,
  Tabs,
  Card,
  Empty,
  Image as VanImage,
  Icon,
  Dialog
} from "vant";
import NavComponents from "@components/headerNav/index";
import DialogComponents from "@components/2.0.0/dialogComponents/index";
import normalRedPacket from "@/components/3.3.0/order-items/normalRedPacket";
import vipRedPacket from "@/components/3.3.0/order-items/vipRedPacket";
import { cloneDeep } from "lodash";

export default {
  components: {
    NavComponents,
    DialogComponents,
    [Card.name]: Card,
    [Empty.name]: Empty,
    [Button.name]: Button,
    [Toast.name]: Toast,
    [Icon.name]: Icon,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [VanImage.name]: VanImage,
    [Dialog.Component.name]: Dialog.Component,
    normalRedPacket,
    vipRedPacket
  },
  data() {
    return {
      empty: require("assets/images/defaultpage_nochat@2x.png"),
      logo: require("assets/images/logo100@2x.png"),
      amtn: this.$route.query.amtn,
      storeId: this.$route.query.storeId,
      show: false,
      tempRed: {},
      configData: {
        content: '',
        confirmButtonText: i18n.t('common.confirm_select'),
        showCancelButton: true
      },
      // 暂存选中的红包，用于未确认返回时恢复数据。
      tempMemberOrderRedpack: {}
    };
  },
  computed: {
    // 红包列表
    marketStoreRedpackList() {
      return this.$store.getters.marketStoreRedpackList;
    },
    // 可用
    effectiveList() {
      const res = this.marketStoreRedpackList;
      if (res.effectiveList) {
        return res.effectiveList;
      }
      return [];
    },
    // 不可用
    invalidList() {
      const res = this.marketStoreRedpackList;
      if (res.invalidList) {
        return res.invalidList;
      }
      return [];
    },
    // 选择的用户红包
    memberOrderRedpack() {
      return this.$store.getters.memberOrderRedpack;
    },
    // 选中的红包数量
    memberOrderRedpackCount() {
      let count = 0
      for (const key in this.memberOrderRedpack) {
        if (this.memberOrderRedpack[key]?.id) {
          count++
        }
      }
      return count
    },
    // 选择的代金券
    memberOrderVoucher() {
      return this.$store.getters.memberOrderVoucher;
    }
  },
  methods: {
    // 使用説明
    onUse(data) {
      return this.$router.push({
        path: "/iframe",
        query: {
          title: "優惠券使用說明",
          url: "https://m.mfoodapp.com/coupon-faq/index.html"
        }
      });
    },
    // 选择红包
    onSelected(data) {
      // 互斥條件，免配紅包和通用紅包判斷的字段不同
      const conditionFlag = data.deliveryRedpack ? !data.useWithVoucherRedpack : data.useType === 0
      // 代金券互斥
      if (
        !this.isChecked(data) && conditionFlag && this.memberOrderVoucher.id
      ) {
        this.$refs.dialogComponents.open();
        const langKey = data.deliveryRedpack ? 'COUPON.delivery_coupon_cannot_be_used_with_voucher' : 'COUPON.coupon_cannot_be_used_with_voucher'
        this.configData = {
          ...this.configData,
          content: this.$t(langKey, { amount: this.memberOrderVoucher.amount })
        }
        this.tempRed = data;
        return
      }
      this.setSelectRedpack(data)
    },
    // 是否選中了當前紅包
    isChecked(data) {
      let isChecked = false
      if (data.deliveryRedpack) {
        isChecked = this.memberOrderRedpack?.delivery?.id === data.id
      } else {
        isChecked = this.memberOrderRedpack?.common?.id === data.id
      }
      return isChecked
    },
    setSelectRedpack(data) {
      let isChecked = false
      // 选中免配红包
      if (data.deliveryRedpack) {
        // 是否已選中
        isChecked = this.memberOrderRedpack?.delivery?.id === data.id
        this.$store.commit('memberOrderRedpack', {
          ...this.memberOrderRedpack,
          delivery: isChecked ? {} : { ...data }
        })
        if (isChecked) return
        if (
          // 不可与普通红包叠加
          (!data.useWithNormalRedpack && ![7, 8].includes(this.memberOrderRedpack?.common.sourceType)) ||
          // 不可与月卡红包叠加
          (!data.useWithMemberRedpack && [7, 8].includes(this.memberOrderRedpack?.common.sourceType))
        ) {
          // 清除不可叠加的通用红包
          this.$store.commit('memberOrderRedpack', {
            ...this.memberOrderRedpack,
            common: {}
          })
        }
      // 选中通用红包
      } else {
        isChecked = this.memberOrderRedpack?.common?.id === data.id
        this.$store.commit('memberOrderRedpack', {
          ...this.memberOrderRedpack,
          common: isChecked ? {} : { ...data }
        })
        if (isChecked) return
        if (
          // 不可与普通红包叠加
          (!this.memberOrderRedpack.delivery?.useWithNormalRedpack && ![7, 8].includes(data.sourceType)) ||
          // 不可与月卡红包叠加
          (!this.memberOrderRedpack.delivery?.useWithMemberRedpack && [7, 8].includes(data.sourceType))
        ) {
          // 清除不可叠加的免配红包
          this.$store.commit('memberOrderRedpack', {
            ...this.memberOrderRedpack,
            delivery: {}
          })
        }
      }
    },
    beforeClose({ action, done }) {
      if (action === "confirm") {
        this.setSelectRedpack(this.tempRed);
      }
      this.$store.commit("SET_DIALOG_SHOW", false);
      this.tempRed = {};
      done();
    },
    onBack() {
      this.$store.commit('memberOrderRedpack', this.tempMemberOrderRedpack)
      this.$store.dispatch('goBack')
    },
    onConfirm() {
      this.tempMemberOrderRedpack = {
        ...this.memberOrderRedpack
      }
      const { common, delivery } = this.memberOrderRedpack
      // 已选红包与代金券互斥
      if (
        ((common?.id && common.useType === 0) ||
        (delivery?.id && !delivery.useWithVoucherRedpack)) &&
        this.memberOrderVoucher.id
      ) {
        this.$store.commit("memberOrderVoucher", {})
      }
      this.$router.back()
    }
  },
  mounted() {
    const query = this.$route.query;
    const params = {
      amtn: parseFloat(query.amtn),
      boxFee: parseFloat(query.boxFee),
      deliveryType: parseInt(query.deliveryType),
      isUseDiscount: query.isUseDiscount ? JSON.parse(query.isUseDiscount) : false,
      isUseSpecial: query.isUseSpecial ? JSON.parse(query.isUseSpecial) : false,
      isUseVoucher: query.isUseVoucher ? JSON.parse(query.isUseVoucher) : false,
      sendType: parseInt(query.sendType),
      storeId: query.storeId,
      usersideDeliveryType: parseInt(query.usersideDeliveryType),
      voucherId: query.voucherId,
      addressId: query.addressId,
      atOnceSend: query.atOnceSend ? JSON.parse(query.atOnceSend) : false,
      sendTime: query.sendTime,
      reduceId: query.reduceId,
      businessTypes: 3, // 适用业务(1:外卖,2:团购,3:商超)
      memberSettingId: query.memberSettingId,
      deliveryFee: query.deliveryFee === '' ? null : parseFloat(query.deliveryFee),
      disDeliveryFee: query.disDeliveryFee === '' ? null : parseFloat(query.disDeliveryFee),
      centerId: query.centerId,
      storeLat: query.storeLat,
      storeLon: query.storeLon,
      stationId: query.stationId
    };
    this.$store
      .dispatch("marketStoreRedpackList", params)
      .then(result => this.$nextTick(() => this.$toast.clear()))
      .catch(e => this.$toast({ message: "獲取紅包失敗", position: "bottom" }));
    // 暂存
    this.tempMemberOrderRedpack = cloneDeep(this.memberOrderRedpack);
  }
};
