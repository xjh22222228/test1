export default {
  methods: {
    // 點擊領取優惠券
    onReceiveVoucher(data) {
      // 如果已經領取，則返回
      if (data.isReceive === true) return false;
      // 顯示loading
      this.$toast.loading({
        duration: 0
      });
      // 商家紅包 升級
      if (data.memberUpMoneyId) {
        // 商超暂无涨金红包功能
        // return this.$refs.upRed.upgradeRedpacket({ ...data, storeId: this.marketStoreDetail.id });
      }
      // 著數紅包
      if (data.isCheap) {
        return this.$store
          .dispatch("storeReceiveCheapVoucher", {
            voucherDetailId: data.voucherDetailId
          })
          .finally(async () => await this.queryVoucher())
          // 處理成功
          .then(result => {
            // storeReceiveVoucher(data);
            this.$toast({
              message: "領取成功",
              position: "bottom"
            });
          })
          // 處理錯誤
          .catch(e => this.$toast({
            message: e?.response?.data?.note || "領取失敗",
            position: "bottom"
          }));
      }
      // 領取優惠券
      this.$store
        .dispatch("storeReceiveVoucher", {
          storeId: this.id,
          voucherDetailId: data.voucherDetailId
        })
        .finally(async () => await this.queryVoucher())
        // 處理成功
        .then(result => {
          // storeReceiveVoucher(data);
          this.$toast({
            message: "領取成功",
            position: "bottom"
          });
        })
        // 處理錯誤
        .catch(e => this.$toast({
          message: e?.response?.data?.note || "領取失敗",
          position: "bottom"
        }));
    }
  }
};
