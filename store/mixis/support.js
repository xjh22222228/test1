import PhoneCallComponents from "@components/phoneCall";
export default {
  components: { PhoneCallComponents },
  data() {
    return {
      // 已售罄特价和折扣状态
      selloutDiscount: false,
      marketDetailDialog: {
        state: false
      },
      // 商品非可售时间
      classifyHideBtnMap: {}, // 分類是否顯示  展开收起 按鈕
      classifyHideBtnStatusMap: {} // 每個分類的 展開收起 狀態       true  是已收起  false  是已展開
    };
  },
  computed: {
    classifyHideBtnStatus() {
      const smap = this.classifyHideBtnStatusMap;
      return item => {
        return smap[item.classifyId];
      };
    },
    classifyHideBtn() {
      const map = this.classifyHideBtnMap;
      return item => {
        return map[item.classifyId] || (item.isDiscountClassify && this.selloutDiscount);
      };
    },
    // 店鋪代金券
    marketStoreVoucher: function () {
      return this.$store.getters.marketStoreVoucher;
    }
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    hasArrayItem(arr) {
      return Array.isArray(arr) && !!arr.length;
    },
    findClassifyIndex(productId) {
      let index = -1;
      for (const classify of this.marketStoreProduct) {
        index++;
        if (!Array.isArray(classify.products)) {
          continue;
        }
        for (const proItem of classify.products) {
          if (proItem.productId == productId) {
            return index;
          }
        }
      }
    },
    sellTime(product) {
      const now = new Date();
      let today = new Date();
      let todayStr = this.utils.fomatDate(today, "yyyy-MM-dd ");
      const day = now.getDay(); // 周日  0
      let findNextDay = false;
      let nearDay = false;
      const dayMap = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
      if (product.takeoutTime) {
        for (const weekDay of product.takeoutTime) {
          if (findNextDay) {
            today = new Date(today.getTime() + 86400000);
            todayStr = this.utils.fomatDate(today, "yyyy-MM-dd ");
            for (const sTime of weekDay.storeTime) {
              const starTime = +new Date(todayStr + sTime.startDate + ':00');
              if (starTime > now.getTime()) {
                return '明日' + sTime.startDate + '可售';
              }
            }
            findNextDay = false;// 明天沒有找到
            nearDay = true;
          }
          if (nearDay) { //
            today = new Date(today.getTime() + 86400000);
            todayStr = this.utils.fomatDate(today, "yyyy-MM-dd ");
            for (const sTime of weekDay.storeTime) {
              const starTime = +new Date(todayStr + sTime.startDate + ':00');
              if (starTime > now.getTime()) {
                return '周' + dayMap[weekDay.weekDays] + sTime.startDate + '可售';
              }
            }
          }
          if (weekDay.weekDays == `${day}`) {
            for (const sTime of weekDay.storeTime) {
              const starTime = +new Date(todayStr + sTime.startDate + ':00');
              if (starTime > now.getTime()) {
                return sTime.startDate + '可售';
              }
            }
            findNextDay = true;
          }
        }
        //
        for (const weekDay of product.takeoutTime) {
          today = new Date(today.getTime() + 86400000);
          todayStr = this.utils.fomatDate(today, "yyyy-MM-dd ");
          for (const sTime of weekDay.storeTime) {
            const starTime = +new Date(todayStr + sTime.startDate + ':00');
            if (starTime > now.getTime()) {
              return '周' + dayMap[weekDay.weekDays] + sTime.startDate + '可售';
            }
          }
        }
      }
    },

    // 致電商家
    handlePhoneCall() {
      const data = [];
      // 第一个号码
      if (this.marketStoreDetail?.phonePre && this.marketStoreDetail?.phone) {
        const phone = this.marketStoreDetail.phone;
        const per = this.marketStoreDetail.phonePre;
        data.push({
          name: `呼叫 +${per} ${phone}`,
          className: per + phone
        });
      }
      // 第二个号码
      if (this.marketStoreDetail?.telPre && this.marketStoreDetail?.tel) {
        const tel = this.marketStoreDetail.tel;
        const per = this.marketStoreDetail.telPre;
        data.push({
          name: `呼叫 +${per} ${tel}`,
          className: per + tel
        });
      }
      PhoneCallComponents({
        data: data,
        title: "致電商家",
        onCall: number => this.$store.dispatch("appCallPhone", number)
      });
    },
    // 非可售时间
    onAvailableType(data) {
      if (!data.availableTime) {
        // 没有时间返回时为不可售
        return;
      }
      const { commit } = this.$store;
      commit('storeTakeoutTimeData', data?.takeoutTime || []);
      commit('storeTakeoutTimeState', true);
    },
    // 點擊更多
    onMarketDetail() {
      this.marketDetailDialog = {
        ...this.marketDetailDialog,
        state: true
      };
      if (this.id) {
        this.$store.dispatch("marketStoreDetail", this.id);
      }
    }
  }
};
