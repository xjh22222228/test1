import { Popup, Cell } from "vant";
export default {
  name: "out-delivery-area",
  components: {
    [Popup.name]: Popup,
    [Cell.name]: Cell

  },
  data() {
    return {
      addressPopup: false
    };
  },
  methods: {
    show() {
      this.addressPopup = true;
    },
    hide() {
      this.addressPopup = false;
    },
    onEditAddress(id) {
      this.$store.dispatch("memberAddressInfo", { id }).then(result => {
        this.$router.push({ path: "/addressSave" });
      });
    },
    onSelectAddress(item) {
      // 保存收货地址
      this.$store.commit("marketOrderOther", { selectedAddress: item,cookTimeSelectData:{} });
      this.$emit("success", item);
      this.addressPopup = false;
    },
    // 点击添加地址
    onAddAddress() {
      this.$store.commit("memberAddressInfo", {});
      this.$router.push({ path: "/addressSave" });
    }
  },
  computed: {
    marketOrderOther() {
      return this.$store.getters.marketOrderOther;
    },
    // 根據門店id获取用户地址列表，配送范围加不在配送范围
    marketOrderAddressData() {
      return this.$store.getters.marketOrderAddressData;
    }
  },
  mounted() {

  }
};
