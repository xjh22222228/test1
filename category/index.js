import HeaderLocation from '../components/headerLocation/index.vue';
import SearchBar from '../components/search-bar/index.vue';
import TabBar from '../components/tabBar/index.vue';
import { cloneDeep, debounce } from 'lodash';
import filter from '@/JS/filter.js'
export default {
  components: {
    HeaderLocation,
    SearchBar,
    TabBar
  },

  data() {
    return {
      topbarHeight: 0, // 顶部栏高度px
      sidebarActiveIdx: 0, // 侧边栏当前选中
      categoryList: [],
      positions: [], // 记录类目位置
      isTriggerScroll: true, // 触发滚动事件
      sidebarTop: 0, // 记录离开后的滚动距离
      containerTop: 0,
      imgCompress: filter.imgCompress
    };
  },
  activated() {
    this.getCategory();
    this.getTopbarHeight();

    // 定位上一次位置
    this.$nextTick(() => {
      const sidebarEl = this.$refs.sidebar;
      const containerEl = this.$refs.container;
      if (sidebarEl) {
        sidebarEl.scrollTop = this.sidebarTop;
      }
      if (containerEl) {
        this.isTriggerScroll = false;
        containerEl.scrollTop = this.containerTop;
      }

      if (this.marketCategory.length > 0) {
        this.$toast.clear();
      }
    });
  },

  computed: {
    marketCategory() {
      return this.$store.state.marketCategory.marketCategory;
    }
  },

  watch: {
    marketCategory: {
      immediate: true,
      handler(category) {
        if (this.$route.name !== 'marketCategory') {
          return;
        }
        if (category.length <= 0) {
          return;
        }
        this.categoryList = cloneDeep(category).map(item => {
          // 当一级下没有二级则将一级放到二级
          if (!item.children || item.children.length <= 0) {
            item.children = [{
              ...item,
              children: undefined
            }];
          }
          return item;
        });
        this.getPositions();
      }
    }
  },

  methods: {
    onBack() {
      this.$router.replace('/market/index');
    },

    // 计算头部烂高度
    getTopbarHeight() {
      const topbarRef = this.$refs.topbar;
      if (!topbarRef) {
        return;
      }
      const h = topbarRef.offsetHeight;
      this.topbarHeight = h;
    },

    // 获取每个类目位置范围
    getPositions() {
      this.$nextTick(() => {
        const itemsEl = this.$refs.containerItem;
        if (!itemsEl) {
          return;
        }

        const positions = [];
        itemsEl.forEach((item, idx) => {
          const start = idx === 0 ? 0 : (positions[positions.length - 1].end);
          positions.push({
            start,
            end: item.offsetHeight + start,
            content: item.innerText
          });
        });
        this.positions = positions;
      });
    },

    onScroll: debounce(function (e) {
      if (!this.isTriggerScroll) {
        this.isTriggerScroll = true;
        return;
      }
      const top = e.target.scrollTop + 10;
      this.positionSidebar(top, 'smooth');
    }, 60),

    // 侧边栏定位
    positionSidebar(top, behavior) {
      if (!top) {
        const contaierEl = this.$refs.container;
        if (!contaierEl) {
          return;
        }
        top = contaierEl.scrollTop;
      }
      this.containerTop = top;
      const index = this.positions.findIndex(item => {
        return top >= item.start && top < item.end;
      });
      if (index >= 0) {
        this.sidebarActiveIdx = index;
        const baritemEl = this.$refs.baritem[index];
        if (baritemEl) {
          const sidebarEl = this.$refs.sidebar;
          const top = baritemEl.offsetHeight * index;
          const opts = {
            top
          };
          if (behavior) {
            opts.behavior = behavior;
          }
          sidebarEl.scrollTo(opts);
          this.sidebarTop = top;
        }
      }
    },

    getCategory() {
      this.$store.dispatch('getMarketCategory')
        .then(data => {
          if (this.sidebarActiveIdx > data.length) {
            this.sidebarActiveIdx = 0;
          }
          this.getPositions();
        })
        .finally(() => {
          this.$toast.clear();
        });
    },

    // 点击侧边栏
    onClickSidebar(idx, behavior = 'smooth') {
      this.sidebarActiveIdx = idx;
      const containerEl = this.$refs.container;
      const sidebarEl = this.$refs.sidebar;
      const containerItemEl = document.querySelectorAll('.container2 .citem')[idx];
      if (!containerEl || !containerItemEl) {
        return;
      }
      this.isTriggerScroll = false;
      const top = containerItemEl.offsetTop;
      const opts = {
        top
      };
      if (behavior) {
        opts.behavior = behavior;
      }
      containerEl.scrollTo(opts);
      this.containerTop = top;
      this.sidebarTop = sidebarEl.scrollTop;
    },

    // 跳转到二级分类
    goCategoryGoods(data, childData) {
      this.$router.push({
        name: 'marketCategoryGoods',
        query: {
          categoryId: childData?.classifyId ?? data.classifyId
        }
      });
    }
  }
};
