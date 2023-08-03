import { Dialog, Toast } from "vant"
import utils from "../../../../JS/utils"
export default {
  data() {
    let missProductIndex = localStorage.getItem('remember-miss-product')
    if (missProductIndex) {
      missProductIndex = parseInt(missProductIndex)
    } else {
      missProductIndex = -1
    }
    return {
      remarkPopup: false,
      cookTimeSelectString: "",
      askforTimeSelectString: "",
      // 电话号码
      phone: {
        // 彈出選擇手機號碼區域
        actionIndex: 0,
        actionSheetState: false,
        actionSheetData: [
          { name: "中國澳門", className: "853", subname: "+853" },
          { name: "中國香港", className: "852", subname: "+852" },
          { name: "中國大陸", className: "86", subname: "+86" }
        ]
      },
      askType: {
        type: 1, // 1=立即自取，2=预定自取
        actionSheetState: false
      },
      askTypeFlag: true, // 控制取餐类型
      // 備注
      remarkText: "",
      remarkTag: [
        "不吃辣",
        "少放辣",
        "多放辣",
        "不吃蒜",
        "不吃香菜",
        "不吃蔥"
      ],
      // 餐具
      missProductIndex,
      missProductPopup: false,
      rememberMissProduct: !!localStorage.getItem('remember-miss-product'),
      missProductList: [
        { title: "缺貨原路退回，其他照送，無需電話我", value: 2 },
        { title: "商品缺貨時，電話通知我", value: 1 }
        // { title: "任意商品缺貨全單退，無需聯繫", value: 3 }
      ],
      selfPick: this.$route.query.deliveryType == 2 // 是否自取
    }
  },
  computed: {
    marketCookTime: function () {
      return this.$store.getters.marketCookTime
    },
    // 自取]根据商超门店id获取出餐时间
    marketAskforTime: function () {
      return this.$store.getters.marketAskforTime
    },
    marketPackagePriceData() {
      return this.$store.getters.marketPackagePriceData
    },
    missProductIndexGetters() {
      return this.$store.getters.missProductIndexGetters
    },
    marketOrderOther() {
      return this.$store.getters.marketOrderOther
    },
    // 自取下拉选项
    selfActionSheetData() {
      if (!this.selfPick) {
        return []
      }
      const storeDetail = this.marketStoreDetail
      // 不接受预约，只接受立即自取
      if (!storeDetail.promptlyReserveType) {
        return [
          { name: "立即自取", className: 1 }
        ]
      }
      // 不接受立即自取
      if (!storeDetail.promptlyAskforType) {
        return [
          { name: "預定自取", className: 2 }
        ]
      }
      return [
        { name: "立即自取", className: 1 },
        { name: "預定自取", className: 2 }
      ]
    }
  },
  watch: {
    rememberMissProduct(nv) {
      if (nv) {
        localStorage.setItem('remember-miss-product', this.missProductIndex)
      } else {
        localStorage.removeItem('remember-miss-product')
      }
    },
    // 臨時記錄
    marketRemarkTextGetters: {
      immediate: true,
      handler(data) {
        this.remarkText = data
      }
    },
    missProductIndexGetters: {
      immediate: true,
      handler(data) {
        this.missProductIndex = data
      }
    },
    missProductIndex: {
      immediate: true,
      handler(nv) {
        if (this.rememberMissProduct) {
          localStorage.setItem('remember-miss-product', nv)
        } else {
          localStorage.removeItem('remember-miss-product')
        }
        this.$store.commit("marketOrderOther", { missProductIndex: nv })
      }
    }

  },
  created() {
    let missIndex = localStorage.getItem('remember-miss-product')
    if (missIndex) {
      missIndex = parseInt(missIndex)
      this.missProductIndex = missIndex
      this.$store.commit("marketOrderOther", { missProductIndex: missIndex })
    }
  },

  methods: {
    // 自動備注
    onTag(data) {
      this.remarkText = this.remarkText.length
        ? this.remarkText + "," + data
        : data
      const info = this.remarkText
      const arr = info.split("")
      const str = arr.slice(0, 50).join("")
      this.remarkText = str
    },
    // 自取单提示-外賣邏輯（商超暫無此邏輯）
    onSelfTip() {
      Dialog.confirm({
        allowHtml: true,
        showCancelButton: false,
        confirmButtonText: i18n.t("pointPopupIKnow"),
        className: "mCoinMessage",
        message: "折扣商品不享受自取單折扣優惠"
      })
    },

    onPointTips() {
      Dialog.confirm({
        title: this.$t("pointPopupTitle1"),
        allowHtml: true,
        showCancelButton: false,
        confirmButtonText: this.$t("pointPopupIKnow"),
        className: "mCoinMessage",
        message: `
        <div class="item"><p class="title">${this.$t("pointPopupTitle2")}</p>
        <p class="text">${this.$t("pointPopupText1")}</p>
        </div>
        <div class="item"><p class="title">${this.$t("pointPopupTitle3")}</p>
        <p class="text">${this.$t("pointPopupText2")}</p>
        <div class="item"><p class="title">${this.$t("pointPopupTitle4")}</p>
        <p class="text">${this.$t("pointPopupText3")}</p>
        <p class="text">${this.$t("pointPopupText4")}</p>
        </div>`
      })
    },
    // 點擊備注返回
    remarkBack() {
      this.remarkPopup = !this.remarkPopup
    },
    // 选择电话号码区域
    onActionSheet(action, index) {
      if (this.phone.area != action.className) {
        this.receiverMobile = ""
      }
      this.phone.area = action.className
    },
    // 自取
    onAskTypeAction(action, index) {
      const oldType = this.askType.type
      this.askType.type = action.className
      this.$store.commit('marketOrderOther', {
        askType: this.askType.type
      })
      this.reloadAskforType(oldType !== action.className)
    },
    // 重新請求 自取時間 並初始化默認值
    reloadAskforType(reload = true) {
      if (reload) {
        this.$store.commit("marketOrderOther", {
          askforTimeSelectIndex: 0,
          askforTimeSelectString: "",
          askforTimeIndex: 0,
          askforTimeSelectData: {}
        })
      }
      this.init()
    },
    // 弹出自取选择時間
    onAskforTime() {
      // 立即自取
      if (this.askType.type == 1) {
        return
      }
      const selectIdx = this.marketOrderOther.askforTimeSelectIndex
      // 如果只有一条时间，则不处理
      if (
        this.marketAskforTime.length <= 1 &&
        this.marketAskforTime[selectIdx]?.cookTime?.length <= 1
      ) {
        return this.$toast({
          position: "bottom",
          message: "該門店不接受預訂"
        })
      }

      this.$refs.timeSelect.open()
    },
    showAskType() {
      if (!this.canChangeAskType) {
        return
      }
      this.askType.actionSheetState = true
    },
    // 选中自取時間選項
    onSelectAskforTime(data, index) {
      // 选中的配送时间
      this.$store.commit("marketOrderOther", { askforTimeIndex: index })
      // 关闭弹窗
      this.$refs.timeSelect.close()
      this.init()
    },
    backMenu() {
      this.$store.commit("enterStore", true)
      this.$router.go(-1)
    },

    // 选中换购商品变化
    onChangeExchangeProduct(products) {
      this.checkExchangeProducts = products
    },
    // 选中立即送出時間
    onSelectCookTime(data, index) {
      // 选中的配送时间
      this.$store.commit("marketOrderOther", { cookTimeIndex: index })
      // 关闭弹窗
      this.$refs.timeSelect.close()
      this.init()
    },
    // 點擊立即送出
    onGetCookTime() {
      const marketOrderOther = this.marketOrderOther
      const selectedAddress = marketOrderOther.selectedAddress || {}
      const selectIdx = marketOrderOther.cookTimeSelectIndex
      if (Object.keys(selectedAddress).length === 0) {
        return Toast({ message: "請選擇收貨地址" })
      }
      // 如果只有一条时间，则不处理
      if (
        this.marketCookTime.length <= 1 &&
        this.marketCookTime[selectIdx]?.cookTime?.length <= 1
      ) {
        return this.$toast({
          position: "bottom",
          message: "該門店不接受預訂"
        })
      }
      // 显示配送时间弹窗
      this.$refs.timeSelect.open()
    },
    // 弹出收货地址
    handleOrderAddress(status = false) {
      this.$refs.orderAddress.show()
    },
    // 選擇
    onMissProductIndex(index) {
      this.missProductPopup = !this.missProductPopup
      this.missProductIndex = index
    },
    openExplain(type) {
      switch (type) {
        // 包裝費
        case 1: {
          const { plasticBagFee, pageNum } = this.marketPackagePriceData
          const isPlasticBag = this.marketOrderOther.isPlasticBag// 自备
          this.$refs.explain.open({
            type,
            baseAmt: isPlasticBag ? 0 : plasticBagFee,
            plasticBagQty: isPlasticBag ? 0 : pageNum
          })
          break
        }

        // 配送費
        case 2: {
          if (!this.currentWeightCost.currentPlan) {
            return
          }

          const deliveryFreeAmt = (this.activityDeliveryData?.merchantAmount || 0) + (this.activityDeliveryData?.platformAmount || 0);
          const plan = this.currentWeightCost.currentPlan;
          const totalAmt = utils.filterSecret(
            plan.baseCost +
            plan.freshCost +
            plan.overWeightCost +
            this.currentWeightCost.shippingPriceIncrement +
            (plan.distanceCost || 0) +
            (plan.passBridgeCost || 0) -
            deliveryFreeAmt
          );
          // 配送費
          this.$refs.explain.open({
            type,
            totalAmt: totalAmt < 0 ? 0 : totalAmt,
            deliveryType: this.marketOrderOther?.cookTimeSelectData?.deliveryType,
            baseAmt: plan.baseCost, // 基础运费
            weightAmt: plan.overWeightCost, // 超重运费
            freshDeliveryFee: plan.freshCost, // 生鲜
            // plusAmt: this.currentWeightCost.shippingPriceIncrement, // 應急加价
            plusAmt: this.marketOrderOther?.cookTimeSelectData?.shippingPriceIncrement, // 應急加价
            deliveryFreeAmt,
            overBaseWeight: this.currentWeightCost.overBaseWeight,
            // 超距运费
            distanceDeliveryFee: plan.distanceCost,
            // 夸桥运费
            passBridgeDeliveryFee: plan.passBridgeCost
          })
          break
        }
      }
    }
  }
}
