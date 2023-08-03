import { Popup, Image as VanImage } from "vant";
import PhoneCallComponents from "@components/2.0.0/phoneCall";
export default {
  components: {
    [Popup.name]: Popup,
    [VanImage.name]: VanImage,
    PhoneCallComponents
  },
  data() {
    return {
      state: false,
      registerMsgMap: {
        1: "外賣食品活動場所登記編號",
        2: "飲食或飲料場所編號",
        3: "其他牌照編號"
      }
    };
  },
  computed: {
    marketStoreDetail: function() {
      return this.$store.getters.marketStoreDetail;
    }
  },
  async mounted() {
    // let {commit, dispatch} = this.$store;
    // let bannerImage = this.banner?.bannerImage;
    // if (!bannerImage) {
    //   await dispatch("banner");
    //   bannerImage = this.banner?.bannerImage;
    // }
    // if (this.bannerState === "" && bannerImage) {
    //   commit("bannerState", true);
    // }
    // this.state = !!this.bannerState;
  },
  methods: {
    // 打開地圖
    openLocation(address) {
      this.$store.dispatch("openLocationMap", address);
    },
    // 點擊跳轉地圖
    handleMap() {
      this.$router.push({ path: "/storeMap", query: { id: this.id } });
    },
    // 致電商家
    handlePhoneCall() {
      const data = [];
      // 第一個號碼
      if (this.marketStoreDetail?.phonePre && this.marketStoreDetail?.phone) {
        const phone = this.marketStoreDetail.phone;
        const per = this.marketStoreDetail.phonePre;
        data.push({ name: `+${per} ${phone}`, className: per + phone });
      }
      // 第二個號碼
      if (this.marketStoreDetail?.telPre && this.marketStoreDetail?.tel) {
        const tel = this.marketStoreDetail.tel;
        const per = this.marketStoreDetail.telPre;
        data.push({ name: `+${per} ${tel}`, className: per + tel });
      }
      PhoneCallComponents({
        data: data,
        title: "致電商家",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    }
  }
};
