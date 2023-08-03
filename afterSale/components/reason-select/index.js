import { Popup } from "vant";

export default {
  components: {
    [Popup.name]: Popup
  },

  data() {
    return {
      showDialog: false,
      reasonValue: '',
      reasontList: [
        '計劃有變，我不想要了',
        '商家聯繫我說沒貨了',
        '我買錯了/買多了/買少了',
        '填錯收貨信息',
        '忘記使用優惠券',
        '忘記備註信息',
        '其他個人原因'
      ]
    };
  },

  methods: {
    open(reason) {
      this.reasonValue = typeof reason === 'string' ? reason.trim() : '';
      this.showDialog = true;
    },

    close() {
      this.showDialog = false;
    },

    onCheck(reason) {
      this.reasonValue = reason;
      this.$emit('ok', reason);
      this.close();
    }
  }
};
