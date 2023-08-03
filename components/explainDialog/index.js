import { post } from '@/JS/ajax';

const explainMap = {
  // 包裝費說明
  1: [
    '根據澳們特別行政區，第16/2019號法律（限制提供塑膠袋法）與第143/2019號行政長官批示，在零售行為中，就每個所提供的塑膠袋須收取的金額為澳門幣一元。',
    '部分商家因系統接入原因，可能存在小票上載明的包裝費用金額不同的情形，包裝費用具體數額以平台所示金額為準，如有問題請與平台客服取得聯絡。'
  ],
  // 配送費說明
  2: [
    '基礎運費：100kg內，基礎運費MOP1.2。',
    '超重運費：10kg後，每 1kg加收 MOP2。 ',
    '加價運費：三公里運費加價，配送費用受距離、難度、時段、天氣、運力、商品  （體積、重量）等因素影響，門店首頁及商品瀏覽頁展示的配送費僅為預估配送金額最終以提交訂單結算頁面顯示的配送費金額為準。'
  ]
};

export default {
  data() {
    return {
      type: '1', // 1包裝費，2=配送費
      showDialog: false,
      totalAmt: null, // 總計
      baseAmt: null, // 基礎
      weightAmt: null, // 超重運費
      freshDeliveryFee: null, // 生鮮費用
      plusAmt: null, // 加價運費
      plasticBagPrice: null, // 膠袋單價
      plasticBagQty: null, // 膠袋總數量
      basicDeliveryFee: null, // 基礎配送費
      overWeightDeliveryFee: null, // 超重配送費
      deliveryType: '', // 配送类型
      deliveryFreeAmt: null, // 配送减免金额
      overBaseWeight: null, // 超重运费超出kg
      distanceDeliveryFee: null, // 超距配送费
      passBridgeDeliveryFee: null, // 过桥配送费
      msg: {} // 文本内容
    };
  },

  computed: {
    title() {
      switch (Number(this.type)) {
        case 1:
          return '包裝服務說明';
        case 2:
          return '運費說明';
      }
      return '';
    },

    explainList() {
      return explainMap[this.type] || [];
    },

    marketOrderInfo() {
      return this.$store.getters.marketOrderInfo;
    }
  },
  created() {
    post("/orgs/basic/global/get_global_configuration").then(res => {
      this.msg = res;
    });
  },
  methods: {
    open(data) {
      data ||= {};
      const orderInfo = this.marketOrderInfo?.orderInfo;
      this.type = String(data.type || 1);
      this.totalAmt = data.totalAmt ?? null;
      this.baseAmt = data.baseAmt ?? null;
      this.weightAmt = data.weightAmt ?? null;
      this.plusAmt = data.plusAmt ?? null;
      this.freshDeliveryFee = data.freshDeliveryFee ?? null;
      this.plasticBagPrice = data.plasticBagPrice ?? null;
      this.plasticBagQty = data.plasticBagQty ?? null;
      this.basicDeliveryFee = data.basicDeliveryFee ?? null;
      this.overWeightDeliveryFee = data.overWeightDeliveryFee ?? null;
      this.deliveryType = data.deliveryType;
      this.deliveryFreeAmt = data.deliveryFreeAmt;
      this.overBaseWeight = data.overBaseWeight ?? (
        orderInfo?.overWeightFee
          ? Number(((orderInfo?.productWeight || 0) - (orderInfo?.basicWeight || 0)).toFixed(2)) : null
      );
      this.distanceDeliveryFee = data.distanceDeliveryFee ?? orderInfo.distanceDeliveryFee;
      this.passBridgeDeliveryFee = data.passBridgeDeliveryFee ?? orderInfo.passBridgeDeliveryFee;
      this.showDialog = true;

      const mescrollEl = document.querySelector('.mescroll');
      if (mescrollEl) {
        mescrollEl.classList.add('overflow-hide');
      }
    },

    onClose() {
      this.showDialog = false;
      const mescrollEl = document.querySelector('.mescroll');
      if (mescrollEl) {
        mescrollEl.classList.remove('overflow-hide');
      }
    }
  }
};
