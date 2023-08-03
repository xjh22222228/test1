import { post } from "@ajax";
import GoodsEnd from '../end/index.vue';
import GoodsLoading from '../loading';
import event from './event';
import StoreTakeoutTimeComponents from "@components/storeTakeoutTime";
import { debounce } from 'lodash';

export default {
  components: {
    GoodsEnd,
    GoodsLoading,
    StoreTakeoutTimeComponents
  },

  props: {
    // 请求地址，如果有则忽略http
    url: {
      type: String,
      default: ""
    },
    queryParams: {
      type: Object,
      default: () => ({})
    },

    // HTTP请求
    http: {
      type: Function,
      default: undefined
    },
    pageSize: {
      type: Number,
      default: 20
    },
    // 是否每次进入页面重置回初始数据（如果是keep-alive需要设置为false）
    init: {
      type: Boolean,
      default: true
    },

    // 是否组件载入立刻加载数据
    immediate: {
      type: Boolean,
      default: true
    },

    // 瀑布流
    flow: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      next: true,
      loading: false,
      pageNo: 0,
      dataList: [],
      observer: null
    };
  },

  deactivated() {
    this.destoryObserver();
  },

  destroyed() {
    this.destoryObserver();
  },

  activated() {
    if (this.init) {
      this.reset(this.init);
    }
    if (this.immediate) {
      this.observerPagination();
    }
    this.$nextTick(() => {
      this.reWaterfallFlow();
    })
  },

  mounted() {
    if (this.immediate) {
      this.observerPagination();
    }
    event.$on('clickTag', this.reWaterfallFlow);
  },

  methods: {
    reset(isClear) {
      this.pageNo = 0;
      this.next = true;
      if (isClear) {
        this.dataList = [];
        this.$refs.parent.style.height = 'auto';
      }
    },

    handleBaseDishesIntersect(entries) {
      if (entries[0].intersectionRatio <= 0) {
        return;
      }
      this.getData();
    },

    // 侦测翻页
    observerPagination() {
      const el = this.$refs.node;
      if (!el) {
        return;
      }
      if (this.observer) {
        return;
      }
      this.observer = new IntersectionObserver(entries => {
        this.handleBaseDishesIntersect(entries);
      });
      this.observer.observe(el);
    },

    destoryObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    // 获取数据
    getData: debounce(async function (queryParams = {}, isClear) {
      queryParams ||= {};
      const callback = queryParams.callback;
      delete queryParams.callback;
      if (this.loading || !this.next) {
        return;
      }
      this.observerPagination();

      let http;
      const q = {
        ...this.queryParams,
        ...queryParams,
        offset: this.pageNo * this.pageSize,
        size: this.pageSize
      };
      if (this.url) {
        http = post(this.url, q);
      } else if (this.http) {
        http = this.http(q);
      }

      if (!http) {
        return;
      }

      this.loading = true;
      return http
        .then(res => {
          this.$emit('finish', q); // 用于记录首次请求
          if (!res) {
            return;
          }

          if (this.pageNo <= 0 || isClear) {
            this.dataList = [];
          }
          if (res.result) {
            this.dataList = [
              ...this.dataList,
              ...res.result
            ];
          }
          this.pageNo += 1;
          this.$emit('list', this.dataList);
          this.reWaterfallFlow();
          if (!res.next) {
            this.next = false;
            this.destoryObserver();
          }
          return res;
        })
        .catch(() => {
          if (this.pageNo <= 0 || isClear) {
            this.dataList = [];
            this.next = false;
          }
        })
        .finally(() => {
          callback?.();
          this.loading = false;
        });
    }, 100),

    // 触发瀑布流
    reWaterfallFlow() {
      this.$nextTick(() => {
        const parent = this.$refs.parent;
        if (!parent) {
          return;
        }
        const childNodes = parent.querySelectorAll('.goods-item9');
        if (childNodes.length <= 0) {
          parent.style.height = 'initial';
          return;
        }
        let leftHeight = 0;
        let rightHeigt = 0;
        for (let i = 0; i < childNodes.length; i++) {
          const node = childNodes[i];
          // 8=底部距离
          const h = node.offsetHeight + 12;
          if (i % 2 === 0) {
            node.style.top = leftHeight + 'px';
            leftHeight += h;
          } else {
            node.style.top = rightHeigt + 'px';
            rightHeigt += h;
          }
        }
        const maxH = Math.max(leftHeight, rightHeigt);
        parent.style.height = maxH + 'px';
      });
    }
  }
};
