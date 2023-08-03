import mf from "@/JS/mFoodSDK";
import { cloneDeep } from 'lodash';

const VIEW_MAX = 6;

export default {
  props: {
    // 樣式風格, 1=默認，2=有張數和一鍵領取
    styleType: {
      type: String,
      default: "1"
    }
  },

  data() {
    return {
      VIEW_MAX,
      max: VIEW_MAX,
      redpacketList: []
    };
  },

  computed: {
    marketNewRedpacket() {
      return this.$store.state.marketHome.marketNewRedpacket?.redpackList || [];
    },

    // 是否新人
    isNewPeople() {
      return this.$store.state.marketHome.marketIsNewUser;
    },

    // 紅包數量
    len() {
      return this.marketNewRedpacket.length;
    },

    showMore() {
      return this.styleType === '1' && this.len > VIEW_MAX;
    },

    // 批量領取按鈕禁用
    batchDisabled() {
      if (!this.isNewPeople) {
        return true;
      }
      return this.redpacketList[0]?.isReceive;
    },

    // 一鍵領取文案
    batchBtnText() {
      if (!this.isNewPeople) {
        return '僅新用戶可領取';
      }
      return this.redpacketList[0]?.isReceive ? '全部已領取' : '一鍵領取';
    }
  },

  watch: {
    marketNewRedpacket: {
      immediate: true,
      handler(value) {
        value = cloneDeep(value);
        const max = this.styleType === '1' ? this.max : undefined;
        this.redpacketList = value.slice(0, max);
      }
    }
  },

  methods: {
    // 跳轉到新人專區
    goNewZonePage(receive) {
      if (this.$route.name !== 'marketIndexNew') {
        this.$router.push({
          name: 'marketIndexNew'
        });
      }
    },

    // 一鍵批量領取
    onBatchReceive(data) {
      // 已領取
      if (data?.isReceive) {
        return this.goNewZonePage();
      }
      const func = () => {
        this.$toast.loading();
        if (!this.batchDisabled) {
          this.$store.dispatch('batchReceiveMarketNewRedpacket', {
            id: this.$store.state.marketHome.marketNewRedpacket.id
          }).then(() => {
            this.$toast({
              message: '領取成功',
              duration: 3000,
              onClose: this.goNewZonePage()
            });
            // 由于异步，本地修改为已领取状态
            const redpacketList = cloneDeep(this.redpacketList).map(item => {
              item.isReceive = true;
              return item;
            });
            this.redpacketList = redpacketList;
          }).catch(e => {
            this.$toast({
              message: e?.response?.data?.note || '領取失敗',
              onClose: this.goNewZonePage()
            });
          });
        } else {
          this.goNewZonePage();
        }
      };

      mf.APPLoginAsync().then(() => {
        // 本来未登录是新人， 这个时候登录了一个老用户需要刷新判断是否新人
        this.$store.dispatch('getMarketNewUser').then(isNewUser => {
          if (isNewUser) {
            func();
          }
        });
      }).catch(err => {
        console.log(err);
        // 需要判断环境
        if (mf.isShare) {
          this.$emit('openBrowser', err);
        }
      });
    }
  }
};
