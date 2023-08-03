import NavBar from '@/components/2.0.0/nav';
import utils from '@/JS/utils';
import MarketTimeSteps from '../components/market-time-steps/index.vue';

export default {
  name: 'marketOrderActions',
  components: {
    NavBar,
    MarketTimeSteps
  },

  data() {
    return {
      safeClass: utils.getSafeTopClassName('padding'),
      tradeId: this.$route.query.tradeId
    };
  },
  computed: {
    marketOrderInfo() {
      return this.$store.getters.marketOrderInfo;
    }
  },
  mounted() {
    this.$toast.clear();
    this.getData();
  },

  methods: {
    // 获取退款信息
    getData() {
      return this.$store.dispatch('marketOrderInfo', this.tradeId).finally(() => {
        this.$toast.clear();
      });
    },
    // 上一个路由地址是订单详情，可能由app跳转过来，默认dispatch goBack会关闭webview
    handleNavBack() {
      this.$router.go(-1);
    }
  }
};
