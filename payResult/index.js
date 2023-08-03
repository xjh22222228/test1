import NavBar from '@/components/2.0.0/nav';
import GoodsGroup from '../components/goods/group/index.vue';
import GoodsItem from '../components/goods/item/index.vue';
import utils from '@/JS/utils';

export default {
  components: {
    NavBar,
    GoodsGroup,
    GoodsItem
  },

  data() {
    return {
      safeClassName: utils.getSafeTopClassName('height'),
      dataList: []
    };
  },

  mounted() {
    this.$toast.clear();
  },

  methods: {
    onNavBack() {
      this.$router.replace('/market/index');
    },

    goOrderList() {
      const { tradeId } = this.$route.query;
      this.$store.commit("orderList", { cache: true });
      this.$router.replace({
        path: '/market/orderList',
        query: {
          redirect: '/market/orderInfo',
          tradeId
        }
      });
    },

    // 获取商品数据
    getGoods(params) {
      if (params.offset === 0) {
        this.$store.dispatch('getGlobalMemberLevel') // 获取全局配置会员等级信息
      }
      return this.$store.dispatch('getMarketGoods', {
        ...params
      });
    }
  }
};
