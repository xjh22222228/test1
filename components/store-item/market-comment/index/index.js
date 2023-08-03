import { Rate, Grid, GridItem, List } from "vant";
import PolymerizationComponents from "@components/polymerization/index";
import { post } from "@ajax";

import mfoodUrl from "@/assets/images/logo_down@2x.png";
import nocomment from "@/assets/images/defaultpage_nocomment@2x.png";
import RecommentData from "../recommentData";
import complainCom from "@/components/supermarket/complainComponent";
// import headerNav from "@/components/headerNav";
export default {
  props: {
    type: {
      default: "store", //
      type: String,
      required: true
    }
  },
  components: {
    [Rate.name]: Rate,
    PolymerizationComponents,
    RecommentData,
    complainCom,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [List.name]: List,
    // headerNav

  },
  data() {
    return {
      // userUrl,
      BASE_URL: process.env.BASE_URL,
      mfoodUrl,
      nocomment,
      orderListUp: {
        scroll: 0,
        background: "#FFFFFF",
        up: {
          isLock: true,
          warpId: "orderListUp",
          empty: {
            tip: 4,
            icon: 4,
            warpId: "orderListUp"
          }
        },
        down: {
          isLock: true
        }
      },
      param: {
        isImg: 0, // pic
        size: 20,
        offset: 0,
        storeId: "",
        imgoffset: 0,
        next: true,
        imgnext: true
      },
      commentData: {
        finish: false, // 加載完成
        total: 0,
        clear: true,
        commentList: [],
        picCommentList: [],
        storeMarkNum: 0,
        tasteMarkNum: 0,
        packMarkNum: 0,
        loading: false,
        commentFlag: 0
      }
    };
  },
  // watch: {
  //   marketStoreDetail: {
  //     handler(nv, ov) {
  //       if (!nv?.id || (nv?.id === ov?.id)) {
  //         return;
  //       }
  //       this.param.storeId = nv.id;
  //       this.resetAction();
  //     },
  //     immediate: true
  //   }
  // },

  computed: {
    // 門店詳情
    marketStoreDetail: function () {
      return this.$store.getters.marketStoreDetail;
    },
    commentList() {
      const param = this.param;
      if (param.isImg) {
        return this.commentData.picCommentList;
      } else {
        return this.commentData.commentList;
      }
    },

    computeParam() {
      const param = this.param;
      if (param.isImg) {
        return {
          next: param.imgnext,
          offset: param.imgoffset,
          isImg: param.isImg,
          size: 20,
          storeId: param.storeId
        };
      } else {
        return {
          next: param.next,
          offset: param.offset,
          isImg: param.isImg,
          size: 20,
          storeId: param.storeId
        };
      }
    }

  },
  // activated() {
  //   if (this.commentData.commentList.length == 0) {
  //     this.param.storeId = this.$route.query.id;
  //     this.$nextTick(() => {
  //       this.changeType();
  //     });
  //   } else {
  //     this.commentData.loading = false;
  //     this.commentData.finish = true;
  //   }
  // },
  created() {

  },
  mounted() {
    this.param.storeId = this.$route.query.id;
    this.resetAction();
  },
  methods: {
    changeType(isImg) {
      if (this.param.isImg === isImg) {
        return;
      }
      this.param.isImg = isImg;
      this.commentData.finish = false;
      this.searchAction(isImg);
    },
    resetAction(isImg) {
      this.param.isImg = isImg || 0;
      this.param.offset = 0;
      this.param.imgoffset = 0;
      this.commentData.clear = true;
      this.commentData.finish = false;
      this.param.next = true;
      this.param.imgnext = true;
      this.commentData.loading = false;
      this.$nextTick(() => {
        this.searchAction();
      });
    },
    searchAction() {
      const that = this;
      if (!that.computeParam.next) {
        that.commentData.finish = true;
        that.commentData.loading = false;
        return;
      }
      post("/market/comment/store_comment_list", that.computeParam).then(res => {
        that.commentData.commentNum = res.commentNum;
        that.commentData.tasteMarkNum = res.tasteMarkNum;
        that.commentData.storeMarkNum = res.storeMarkNum;
        that.commentData.packMarkNum = res.packMarkNum;
        that.commentData.commentSwitch = res.commentSwitch;
        if (that.param.isImg) {
          if (that.commentData.clear) {
            that.commentData.picCommentList = [];
            that.commentData.clear = false;
          }
          that.commentData.picCommentList = that.commentData.picCommentList.concat(res.result);
          that.commentData.total = that.commentData.picCommentList.length;
          that.param.imgnext = res.next;
          that.param.imgoffset = res.nextOffset;
        } else {
          if (that.commentData.clear) {
            that.commentData.commentList = [];
            that.commentData.clear = false;
          }
          that.commentData.commentList = that.commentData.commentList.concat(res.result);
          that.commentData.total = that.commentData.commentList.length;
          // this.commentData.showComment = this.commentData.total >= 10;
          that.commentData.showComment = true;
          that.param.next = res.next;
          that.param.offset = res.nextOffset;
        }
        that.commentData.commentFlag = 0;
        if (!res.storeMarkNum && !res.tasteMarkNum && !res.packMarkNum) {
          that.commentData.commentFlag = 1;
        } else if (res.storeMarkNum || res.tasteMarkNum || res.packMarkNum) {
          that.commentData.commentFlag = 2;
        }
        that.$nextTick(() => {
          that.commentData.loading = false;
          that.commentData.finish = true;
        });
      }).catch(e => {
        that.commentData.loading = false;
        that.computeParam.next = false;
        that.$store.dispatch("notify", e);
      });
    }
  }
};
