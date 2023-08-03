import filter from '@/JS/filter.js';
export default {
  props: {
    over: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      imgCompress: filter.imgCompress,
      pageNo: 0,
      pageSize: 8,
      productList: [], // 原始商品列表
      dataList: [], // 适配后的商品列表，三维数组
      loading: false,
      next: true,
      showMore: false
    };
  },

  mounted() {
    this.getData();
  },

  watch: {
    // 适配
    productList: {
      immediate: true,
      handler(values) {
        if (values.length <= 0) {
          this.dataList = [];
          return;
        }
        const dataList = [];
        const page = Math.ceil(values.length / 4);
        let idx = 0;
        for (let i = 0; i < page; i++) {
          dataList.push([]);
        }

        for (let i = 0; i < dataList.length; i++) {
          for (let j = 0; j < 2; j++) {
            dataList[i].push([]);
          }
        }
        for (let i = 0; i < dataList.length; i++) {
          const item = dataList[i];
          for (let j = 0; j < item.length; j++) {
            let data = values[idx++] || undefined;
            if (data) {
              item[j].push(data);
            }
            data = values[idx++] || undefined;
            if (data) {
              item[j].push(data);
            }
          }
        }
        this.dataList = dataList;
      }
    }
  },

  computed: {
    // 新人红包
    redpacket() {
      return this.$store.state.marketHome.marketNewRedpacket?.redpackList || [];
    },
    // 最大金额红包
    maxAmtRedpacket() {
      const amt = this.redpacket.map(item => item.amount);
      amt.push(0);
      return Math.max(...amt);
    }
  },

  methods: {
    getAmt(data) {
      return data.discountCommonPrice || data.oldDiscountAmt || data.seckillPrice || data.storeSalePrice;
    },

    reset() {
      this.pageNo = 0;
      this.loading = false;
      this.next = true;
    },

    getData(queryParams, isClear) {
      if (this.loading) {
        return;
      }

      this.loading = true;

      const params = {
        offset: this.pageNo,
        size: this.pageSize + 1,
        ...queryParams,
        productSkuIds: []
      };
      this.$store.dispatch('getNewMarketGoods', params)
        .then(res => {
          if (!res) {
            this.productList = [];
            return;
          }
          if (isClear || this.pageNo === 0) {
            this.productList = [];
          }
          this.next = res.next;
          this.productList = res.result.slice(0, this.pageSize);
          this.showMore = res.result.length > this.pageSize;
          if (this.pageNo == 0) {
            // 保存首页数据
            if (res.result) {
              sessionStorage.setItem('newProductSkuIds', res.result.map(e => e.id));
            }
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    goNewUserPage(productSkuId) {
      if (this.$route.name !== 'marketIndexNew') {
        this.$router.push({
          name: 'marketIndexNew',
          params: {
            productSkuId
          }
        });
      }
    },

    onMore() {
      this.pageNo += 1;
      this.getData();
    }
  }
};
