import NavBar from '@/components/2.0.0/nav';
import utils from '@/JS/utils';
import { post } from "@ajax";
import { Empty } from "vant";
import Vue from 'vue/dist/vue.esm';
import mf from "@/JS/mFoodSDK";
import { showRouteLoad } from "@/JS/loading";

export default {
  components: {
    NavBar,
    [Empty.name]: Empty
  },

  data() {
    return {
      activityExpired: require("assets/images/activityExpired.png"),
      empty: require("assets/images/defaultpage_nochat@2x.png"),
      title: 'mFood',
      h5Content: '',
      color: '', // 1.1.0 背景顏色
      safeClass: utils.getSafeTopClassName('height'),
      loading: false,
      navShow: mf.navShow,
      status: false
    };
  },

  mounted() {
    this.loadData();
  },
  watch: {
    $route: function(newVal, oldVal) {
      if (newVal !== oldVal) {
        // this.loadData();
        window.location.reload();
      }
    }
  },

  methods: {
    loadData() {
      showRouteLoad();
      const id = this.$route.query.id;
      if (id) {
        this.loading = true;
        this.getData(id);
      }
    },
    getData(id) {
      post("/market/user_side/paper/_get", { id }).then(res => {
        this.title = res.softTextTitle;
        this.h5Content = res.h5Content;
        this.color = res.color;
        this.status = res.status;
        if (this.status) {
          this.init(res.h5Content);
        }
        this.$forceUpdate();
      }).finally(_ => {
        this.$toast.clear();
        this.loading = false;
      });
    },
    triggerClick(event) {
      // 點擊時，遞歸查找是否有data_href 如果沒有，查找上級dom
      function checkAttr(dom, attr = 'data_href') {
        if (dom.id === 'ql-container') return false;
        if (dom.getAttribute(attr)) {
          return dom.getAttribute(attr);
        } else if (dom.parentNode) {
          return checkAttr(dom.parentNode);
          // if (dom.parentNode.getAttribute(attr)) {
          //   return dom.parentNode.getAttribute(attr);
          // } else {
          //   checkAttr(dom.parentNode.parentNode, 'data_href');
          // }
        }
      }
      const href = checkAttr(event.target);

      if (!href) return false;
      // 判断是否内部链接，如果是就路由跳转，否则调用
      // const [host, path] = href.split("/#");
      // console.log(href);
      // // 本地开发环境
      // const slefUrl = [
      //   "mpay.mfoodapp.com",
      //   "pre.mpay.mfoodapp.com",
      //   "test.web-mfoodapp.com",
      //   "test-o2o-h5.oss-cn-shenzhen.aliyuncs.com",
      //   "test-o2o-h5-1.oss-cn-shenzhen.aliyuncs.com",
      //   "old-test-o2o-h5.oss-cn-shenzhen.aliyuncs.com",
      //   "test-o2o-h5-2.oss-cn-shenzhen.aliyuncs.com",
      //   "test-o2o-h5-3.oss-cn-shenzhen.aliyuncs.com",
      //   "per-mfood-webside.oss-cn-shenzhen.aliyuncs.com",
      //   "per-mfood-webside-1.oss-cn-shenzhen.aliyuncs.com",
      //   "per-mfood-webside-2.oss-cn-shenzhen.aliyuncs.com",
      //   "per-mfood-webside-3.oss-cn-shenzhen.aliyuncs.com",
      //   "christmas.momeplay.cn",
      //   "o2o-web-mpay-1.oss-cn-hongkong.aliyuncs.com",
      //   "o2o-web-mpay-2.oss-cn-hongkong.aliyuncs.com",
      //   "o2o-web-mpay-3.oss-cn-hongkong.aliyuncs.com",
      //   "o2o-web-mpay-4.oss-cn-hongkong.aliyuncs.com"
      // ];
      console.log(mf.getInnerUrl(href));
      // return;
      // for (const i of slefUrl) {
      //   if (host.indexOf(i) >= 0) {
      //     this.$router.push(href);
      //     return;
      //   }
      // }
      const intranet = mf.getInnerUrl(href);
      if (intranet) {
        console.log('内部链接');
        this.$router.push({ path: intranet });
        return;
      }

      console.log('不在上述url裏的情況');
      // 不在上述url裏的情況
      if (process.env.VUE_APP_ENV === "development") {
        window.open(href);
      } else {
        // 正式环境
        // console.log(host);
        if (mf.isApp) {
          // 地址不同调用桥接打开用户浏览器
          mf.openUserBroswer({ url: href });
          // 調用橋接方法
          console.log('openUserBroswer', href);
        } else {
          // 非客戶端
          window.open(href);
        }
      }
    },
    init(h5Content) {
      const t = h5Content.replace(/target="_blank"/g, '');
      var MyComponent = Vue.extend({
        template: `<div>${t}</div>`,
        methods: {
          linkTo(href) {

          }
        }
      });
      var component = new MyComponent().$mount();

      this.$nextTick(() => {
        const d = component.$el;
        var hrefArr = d.getElementsByTagName('a');
        for (var i = 0; i < hrefArr.length; i++) {
          const oldHref = hrefArr[i].href || '';
          hrefArr[i].href = 'javascript:void(0);'; // 修改语句
          hrefArr[i].setAttribute('data_href', oldHref);
        }
        document.getElementById('parent').appendChild(component.$el);
      });
    }
  }
};
