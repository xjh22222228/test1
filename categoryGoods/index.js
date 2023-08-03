import { mapState } from 'vuex';
import HeaderLocation from '../components/headerLocation/index.vue';
import SearchBar from '../components/search-bar/index.vue';
import GoodsGroup from '../components/goods/group/index.vue';
import GoodsItem from '../components/goods/item/index.vue';
import TabBar from '../components/tabBar/index.vue';
import ScrollBar from '@/components/scrollBar/index.vue';
import GoodsNoData from '../components/goods/no-data';
import filter from '@/JS/filter.js';
import StickyHeader from '../home/components/sticky-header/index.vue';
import GoodsClassify from './classify';

export default {
  components: {
    HeaderLocation,
    SearchBar,
    GoodsGroup,
    GoodsItem,
    TabBar,
    ScrollBar,
    GoodsNoData,
    StickyHeader,
    GoodsClassify
  },

  data() {
    return {
      imgCompress: filter.imgCompress,
      oneClassIdx: -1, // 一级分类激活索引
      twoClassIdx: -1, // 二级分类激活索引
      threeClassIdx: -1, // 三级分类激活索引
      showSticky: false, // 触发黏贴布局
      showClassify: false // 展开分类
    };
  },

  computed: {
    ...mapState({
      // 所有类目树形
      marketCategory: state => state.marketCategory.marketCategory
    }),

    // 当前一级分类
    classifyData() {
      const data = this.marketCategory[this.oneClassIdx];
      return data || {};
    },

    // 二级类目列表
    twoClassifyList() {
      const data = this.marketCategory[this.oneClassIdx];
      if (!data) {
        return [];
      }
      return data.children || [];
    },

    // 三级类目列表
    threeClassifyList() {
      const data = this.twoClassifyList[this.twoClassIdx];
      if (!data) {
        return [];
      }
      return data.children || [];
    }
  },

  watch: {
    showClassify(value) {
      const el = document.querySelector('.mescroll');
      if (el) {
        if (value) {
          el.classList.add('overflow-hide')
        } else {
          el.classList.remove('overflow-hide')
        }
      }
    }
  },

  activated() {
    this.getCategory();
    this.init();
  },

  deactivated() {
    this.destroy();
  },
  destroyed() {
    this.destroy();
  },

  mounted() {
    this.init();
  },

  methods: {
    destroy() {
      const scrollEl = document.querySelector('.mescroll');
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', this.handleScroll);
      }
    },
    init() {
      this.destroy();
      const scrollEl = document.querySelector('.mescroll');
      if (!scrollEl) {
        return;
      }
      scrollEl.addEventListener('scroll', this.handleScroll);
    },

    handleScroll(e) {
      const mainEl = this.$refs.main;
      const secondClassifyEl = this.$refs.second;
      if (!mainEl || !secondClassifyEl?.$el) {
        return;
      }
      const scrollTop = e.target.scrollTop;

      const top = mainEl.getBoundingClientRect().top + secondClassifyEl.$el.offsetHeight;
      if (top <= -30 && !this.showSticky) {
        this.showSticky = true;
      } else if (top >= 80 || scrollTop <= 5) {
        this.showSticky = false;
        this.showClassify = false;
      }
    },

    // 获取类目
    async getCategory() {
      // 适配， 防止类目被删除
      const cb = () => {
        const classify = this.marketCategory;
        const { categoryId } = this.$route.query;

        if (categoryId) {
          let oneIdx = -1;
          let twoIdx = -1;
          let threeIdx = -1;
          classify.forEach((item, idx) => {
            if (Array.isArray(item.children)) {
              item.children.forEach((item2, idx2) => {
                if (Array.isArray(item2.children)) {
                  item2.children.forEach((item3, idx3) => {
                    if (item3.classifyId === categoryId) {
                      oneIdx = idx;
                      twoIdx = idx2;
                      threeIdx = idx3;
                    }
                  });
                }
                if (item2.classifyId === categoryId) {
                  oneIdx = idx;
                  twoIdx = idx2;
                }
              });
            }
            if (item.classifyId === categoryId) {
              oneIdx = idx;
            }
          });
          this.oneClassIdx = oneIdx;
          this.twoClassIdx = twoIdx;
          this.threeClassIdx = threeIdx;
          if (twoIdx === -1 && this.twoClassifyList.length) {
            this.twoClassIdx = 0;
          }
        }
        this.handlePositionClassify();
      };

      return this.$store.dispatch('getMarketCategory')
        .then(() => {
          cb();
          this.$refs.goods.reset();
          return this.$refs.goods.getData(null, true);
        })
        .finally(() => {
          this.$toast.clear();
        });
    },

    // 获取查询类目ID
    getCategoryId() {
      if (this.threeClassIdx === -1) {
        let data = this.twoClassifyList[this.twoClassIdx];
        if (data?.classifyId) {
          return data.classifyId;
        }
        data = this.marketCategory[this.oneClassIdx];
        if (data?.classifyId) {
          return data.classifyId;
        }
      } else {
        return this.threeClassifyList[this.threeClassIdx]?.classifyId;
      }
      return this.classifyData.classifyId;
    },

    // 定位到当前激活的二级类目到可视区域
    handlePositionClassify() {
      const SHOW_NUM = 5; // 一行5个分类
      if (this.marketCategory.length <= SHOW_NUM) {
        return;
      }
      this.$nextTick(() => {
        const classifyEl = this.$refs.classify;
        if (!classifyEl) {
          return;
        }
        const classifyItemEl = this.$refs.classifyItem[this.twoClassIdx];
        if (!classifyItemEl) {
          return;
        }
        // 一行5个，取中间值
        const left = (this.twoClassIdx - (SHOW_NUM - 3)) * classifyItemEl.offsetWidth;
        classifyEl.scrollTo({
          left,
          behavior: 'smooth'
        });
      });
    },

    // 获取商品数据
    getGoodsData(params) {
      if (params.offset === 0) {
        this.$store.dispatch('getGlobalMemberLevel') // 获取全局配置会员等级信息
      }
      return this.$store.dispatch('getMarketGoods', {
        platformCategoryId: this.getCategoryId(),
        ...params
      }).then(res => {
        this.showSticky = false;
        this.showClassify = false;
        if (params.offset === 0) {
          const scrollEl = document.querySelector('.mescroll');
          if (scrollEl) {
            scrollEl.scrollTop = 0;
          }
        }
        return res;
      });
    },

    // 点击二级或三级分类
    handleClickCategory(pIdx, idx) {
      if (pIdx != null) {
        this.twoClassIdx = pIdx;
      }
      this.threeClassIdx = idx ?? -1;
      this.handlePositionClassify();
      this.$refs.goods.reset();
      this.$refs.goods.getData({ showLoading: true }, true);
    },

    onDownCallback(done) {
      this.$refs.goods.reset();
      this.$refs.goods.getData(null, true).finally(() => {
        done && done();
      });
    }
  }
};
