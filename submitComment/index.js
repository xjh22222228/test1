import {
  Card,
  Icon,
  Button,
  Toast,
  SubmitBar,
  Switch,
  Lazyload,
  Image as VanImage,
  Rate,
  Checkbox,
  Uploader,
  Dialog
} from "vant";
import mf from '@/JS/mFoodSDK';
import NavComponents from "@components/2.0.0/nav/index";
import pickType from "@/views/components/2.0.0/pick-type/index";
import shence from "@shence";
import { cloneDeep } from "lodash";
import utils from '@/JS/utils';

export default {
  components: {
    NavComponents,
    pickType,
    [Uploader.name]: Uploader,
    [Rate.name]: Rate,
    [Lazyload.name]: Lazyload,
    [Switch.name]: Switch,
    [Checkbox.name]: Checkbox,
    [SubmitBar.name]: SubmitBar,
    [Icon.name]: Icon,
    [Card.name]: Card,
    [Button.name]: Button,
    [Toast.name]: Toast,
    [VanImage.name]: VanImage
  },
  data() {
    return {
      maxUpload: 9,
      safeClass: utils.getSafeTopClassName('height'),
      BASE_URL: process.env.BASE_URL,
      rateMap: {
        1: "非常差",
        2: "差",
        3: "一般",
        4: "滿意",
        5: "非常滿意"
      },
      lock: false,
      mobileType: "",
      formData: {
        aliasType: true,
        labelList: [],
        deliveryFee: 0,
        packMark: 0,
        storeMark: 0,
        tasteMark: 0,
        riderMark: 0,
        riderContent: "",
        imgList: [],
        storeContent: ""
      },
      badTypeOptions: [
        { labelContent: "態度不好", labelType: "comment_tag7" },
        { labelContent: "送達超時", labelType: "comment_tag8" },
        { labelContent: "不送上門", labelType: "comment_tag9" },
        { labelContent: "漏餐", labelType: "comment_tag10" },
        { labelContent: "儀表不整", labelType: "comment_tag11" },
        { labelContent: "騷擾威脅", labelType: "comment_tag12" },
        { labelContent: "送錯餐品", labelType: "comment_tag13" },
        { labelContent: "送達不通知", labelType: "comment_tag14" },
        { labelContent: "提前點送達", labelType: "comment_tag15" }
      ],
      goodTypeOptions: [
        { labelContent: "儀表整潔", labelType: "comment_tag1" },
        { labelContent: "快速準時", labelType: "comment_tag2" },
        { labelContent: "貨品良好", labelType: "comment_tag3" },
        { labelContent: "禮貌熱情", labelType: "comment_tag4" },
        { labelContent: "穿戴工服", labelType: "comment_tag5" },
        { labelContent: "風雨無阻", labelType: "comment_tag6" }
      ],
      storeId: this.$route.query.storeId,
      tradeId: this.$route.query.tradeId,
      finish: !!this.$route.query.finish,
      productList: [],
      commentScoreRule: ''
    };
  },
  computed: {
    reasonPlaceholder() {
      return rate => {
        return rate <= 3
          ? "您的反饋會督促我們做的更好"
          : "告訴騎手，激勵我們做的更好";
      };
    },
    orderRider: function () {
      return this.orderData.riderInfo;
    },
    storeDetail: function () {
      return this.orderData.storeInfo || {};
    },
    orderData: function () {
      return this.$store.getters.marketOrderInfo;
    },
    orderInfo: function () {
      return this.orderData.orderInfo || {};
    },
    disabledBtn() {
      const packMark = this.formData.packMark;
      const storeMark = this.formData.storeMark;
      const tasteMark = this.formData.tasteMark;
      const deliveryType = this.orderInfo.deliveryType;
      const riderMark = this.formData.riderMark;

      return !(
        packMark &&
        storeMark &&
        tasteMark &&
        ([1, 4].includes(deliveryType) ? riderMark : true)
      );
    },
    // 用户本月评论积分规则
    commentScoreInfo() {
      return this.$store.getters.commentScoreInfo || {}
    }
  },
  watch: {
    orderData(v) {
      if (v && v.productList) {
        this.productList = cloneDeep(v.productList);
      }
    }
  },
  methods: {
    toggleGood(type, idx) {
      const productList = cloneDeep(this.productList);
      // 贊
      if (type === 1) {
        productList[idx].up = true;
        productList[idx].down = false;
      } else {
        productList[idx].down = true;
        productList[idx].up = false;
      }
      this.productList = productList;
    },

    onUpload() {
      mf.choosePicsToUpload({
        maxCount: this.maxUpload - this.formData.imgList.length
      }).then(imgs => {
        imgs.forEach(img => {
          this.formData.imgList.push(img);
        });
        this.formData.imgList = this.formData.imgList.slice(0, this.maxUpload);
      });
    },

    removeImg(idx) {
      this.formData.imgList.splice(idx, 1);
    },

    getParam() {
      const param = Object.assign({}, this.formData);
      param.deliveryFee = "";
      param.deliveryType = this.orderInfo.deliveryType;
      const labelType = this.formData.riderMark > 3 ? 1 : 2; // 好評1  差評2
      param.labelList = param.labelList.map(item => {
        item.labelType = labelType;
        return item;
      });
      param.orderId = this.orderInfo.tradeId;
      param.ordernum = this.orderInfo.orderNumber;
      if ([1, 4].includes(this.orderInfo.deliveryType)) {
        param.riderId = this.orderRider.riderId;
      }
      param.storeId = this.storeDetail.storeId;
      param.storeName = this.storeDetail.storeName;
      param.productList = this.productList
        .filter(item => item.up || item.down)
        .map(item => ({
          orderProductId: item.orderProductId,
          commentType: item.up ? 1 : item.down ? 0 : null
        }));
      return param;
    },
    onsubmit() {
      const res = this.validate();
      if (res) {
        if (this.lock) {
          return;
        }
        this.lock = true;
        this.$toast.loading({ duration: 0, message: '提交中...' });
        const params = this.getParam();
        this.$store
          .dispatch("addMarketComment", params)
          .then(res => {
            // shence.comment(params);
            mf.operatedMarketOrder();
            this.$router.replace({
              path: "/finishComment",
              query: {
                rate: this.formData.storeMark,
                reason: this.formData.storeContent
              }
            });
          })
          .catch(e => {
            this.$store.dispatch("notify", e);
          }).finally(r => {
            this.$toast.clear();
            this.lock = false;
          });
      }
    },
    scrollIntoView() {
      if (/Android/gi.test(navigator.userAgent)) {
        window.setTimeout(function () {
          if ("scrollIntoView" in document.activeElement) {
            document.activeElement.scrollIntoView(false);
          } else {
            document.activeElement.scrollIntoViewIfNeeded(false);
          }
        }, 0);
      }
    },
    validate() {
      if ([1, 4].includes(this.orderInfo.deliveryType)) {
        // 校驗轉送
        if (
          this.formData.riderMark <= 3 &&
          this.formData.labelList.length === 0
        ) {
          Toast("請選擇騎手問題");
          return false;
        }
      }
      return true;
    },
    onScoreTipslick() {
      if (!this.commentScoreRule) {
        return
      }
      Dialog.confirm({
        title: this.$t('member.comment_score_rule_title'),
        className: "mfood-h5-bottom-dialog-class",
        message: this.commentScoreRule,
        confirmButtonText: this.$t('common.get_it'),
        allowHtml: true,
        showCancelButton: false
      });
    }
  },
  mounted() {
    this.$store.dispatch("commentScoreUserAvailableInfo").then(res => {
      if (res && res.length) {
        this.$store.dispatch("getCommentScoreRule").then(result => {
          this.commentScoreRule = result?.value || ''
        })
      }
    });
    this.$store
      .dispatch("marketOrderInfo", this.tradeId)
      .then(result => {
        this.mobileType = this.utils.testMobileType();
        this.$toast.clear();
      });
  }
};
