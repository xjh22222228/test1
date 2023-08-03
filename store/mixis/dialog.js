
export default {
  data() {
    return {
      headerBar: true,
      requestLoading: false,
      // 用來測試用的
      marketBanner: {
        // 切换的比例显示
        bannerHeight: 1 / 3,
        // 切换的数据来源
        bannerType: "marketMidBanner",
        // 切换的数据来源类型
        bannerOrigin: 2,
        // 广告曝光来源
        bannerTotalType: 5
      }
    };
  },
  methods: {
    closeProduct() {
      this.headerBar = true;
    },
    async showProduct(data) {
      if (this.requestLoading) {
        return;
      }
      this.requestLoading = true;
      this.$toast({ message: '正在打開...', duration: 0 });
      const param = await this.$store.dispatch('findProductById', data);
      this.$store.dispatch('marketStoreProductDetail', { productId: param.productId, skuId: param?.defaultSku?.skuId }).then(res => {
        param.sellout = res.sellout;
        this.$refs.detail.show(param.productId);
        this.headerBar = false;
      }).finally(e => {
        this.$toast.clear();
        this.requestLoading = false;
      });
    }
  }
};
