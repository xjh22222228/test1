<template>
  <van-popup :safe-area-inset-bottom="true"  :duration="0"
  v-model="showPopup"  position="bottom" class="mk-order-vrList"
    get-container="body">
    <div :class="safeClass"></div>
      <NavComponents
      className="type1"
      class="nav"
      title="商家代金券"
      :back="()=>showPopup = false"
      right-title="使用説明"
      @rightClick="onUse"
    />
    <div class="content">
      <van-empty
          class="custom-image"
          :image="empty"
          description="暫無可用商家代金券"
          v-if="!effectiveList.length && !invalidList.length"
        />
        <normalVoucher :item="item" @click.native="onSelected(item)"
                      :key="item.id" v-for="item of effectiveList"/>
        <div class="disabled-red-packet-label-class" v-if="invalidList.length">
          不可用代金券
        </div>
        <normalVoucher :item="item" :disabled="true" :key="item.id" v-for="item of invalidList"/>
      </div>
      <div class="bottom" v-if="effectiveList.length ">
        <van-button class="loginButton" block @click="onRestSelected">
          <span>不使用代金券</span>
        </van-button>
      </div>
    </div>
    <DialogComponents
      ref="dialogComponents"
      :configData="configData"
      @beforeClose="beforeClose"
    />
  </van-popup>

</template>
<script>
import {
  Button,
  Toast,
  Tab,
  Tabs,
  Card,
  Empty,
  Popup,
  Image as VanImage,
  Dialog
} from "vant";
import NavComponents from "@components/2.0.0/nav/index";
import DialogComponents from "@components/2.0.0/dialogComponents/index";
import normalVoucher from "@components/2.7.0/order-items/normalVoucher";
import utils from '@/JS/utils';
export default {
  components: {
    [Popup.name]: Popup,
    NavComponents,
    DialogComponents,
    [Card.name]: Card,
    [Empty.name]: Empty,
    [Button.name]: Button,
    [Toast.name]: Toast,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [VanImage.name]: VanImage,
    [Dialog.Component.name]: Dialog.Component,
    normalVoucher
  },
  data() {
    return {
      empty: require("assets/images/defaultpage_nochat@2x.png"),
      logo: require("assets/images/logo100@2x.png"),
      safeClass: utils.getSafeTopClassName('height'),
      showPopup: false,
      tempRed: {},
      configData: {}
    };
  },
  watch: {
    '$route.path'(nv) {
      if (this.showPopup && nv !== '/market/order') {
        this.showPopup = false;
      }
    }
  },
  methods: {
    show(flag = true) {
      this.showPopup = flag;
    },
    // 使用説明
    onUse(data) {
      return this.$router.push({
        path: "/iframe",
        query: {
          title: this.$t('COUPON.coupon_instructions'),
          url: "https://m.mfoodapp.com/coupon-faq/index.html"
        }
      });
    },
    onSelected(data) {
      // 第二次選自己 取消
      // if (data.id === this.memberOrderVoucher.id) {
      //   this.$store.commit("memberOrderVoucher", {});
      //   return;
      // }
      // 是否有商家代金券 是否共享
      if (this.memberOrderRedpack.id && this.memberOrderRedpack.useType === 0) {
        this.$refs.dialogComponents.open();
        this.$set(this, "configData", {
          content: this.$t('userVoucher.voucher_cannot_be_used_with_coupon', { amount: this.memberOrderRedpack.amount }),
          showCancelButton: true
        });
        this.tempRed = data;
        return;
      }
      this.$store.commit("memberOrderVoucher", data);
      this.success();
    },
    beforeClose({ action, done }) {
      if (action === "confirm") {
        this.$store.commit("resetMemberOrderRedpack");
        this.$store.commit("memberOrderVoucher", this.tempRed);
      }
      this.tempRed = {};
      done();
      this.success();
    },
    // 不使用紅包
    onRestSelected() {
      this.$store.commit("memberOrderVoucher", {});
      this.success();
    },
    success() {
      this.showPopup = false;
      this.$emit('reload');
    }
  },
  computed: {
    // 是否選中
    isSelect() {
      return item => {
        const arr = ["cart"];
        if (item.id === this.memberOrderVoucher.id) {
          arr.push("select");
        }
        return arr;
      };
    },
    marketStoreVoucherList() {
      return this.$store.getters.marketStoreVoucherList
    },
    // 可用
    effectiveList() {
      const res = this.marketStoreVoucherList;
      return res?.effectiveList || [];
    },
    // 不可用
    invalidList() {
      const res = this.marketStoreVoucherList;
      return res?.invalidList || [];
    },
    // 選擇的用戶紅包
    memberOrderRedpack: function() {
      return this.$store.getters.memberOrderRedpack;
    },
    // 選擇的代金券
    memberOrderVoucher: function() {
      return this.$store.getters.memberOrderVoucher;
    }
  }
};
</script>

<style lang="less">
.mk-order-vrList{
  height:100%;
  display:flex;
  flex-direction:column;
  .navBar2 .van-nav-bar__right .van-nav-bar__text{
    color:#333333 ;
  }
  .content{
    flex:1;
    // height: calc(100% - 119px);
    background:#F5F5F7;
    display: flex;
    overflow: scroll;
    flex-flow: column;
    padding: 12px;
    box-sizing: border-box;
     .disabled-red-packet-label-class {
      text-align: left;
      font-weight: bold;
      font-size: 16px;
      //font-family: "PingFangSC-Semibold, PingFang SC";
      color: #333333;
      line-height: 22px;
      margin-top: 8px;
      margin-bottom: 20px;
    }
  }
  .cart {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    background: #FFFFFF;
    margin-bottom: 16px;
    box-sizing: border-box;
    box-shadow: 0 2px 6px 0 rgba(49, 46, 75, 0.08);

    &.select {
      border: 1px solid #FA6C17;
      background: #FFF9F6;
    }

    &.disabled {
      background: rgba(255, 255, 255, 0.8);

      .header {
        .number {
          span:first-child {
            b:first-child {
              color: rgba(153, 153, 153, 1);
            }

            b:last-child {
              color: rgba(153, 153, 153, 1);
            }
          }

          span:last-child {
            color: rgba(153, 153, 153, 1);
          }
        }

        .info {
          span:first-child {
            color: rgba(153, 153, 153, 1);
          }
        }
      }
    }

    .header {
      width: 100%;
      display: flex;
      flex-flow: row;

      .number {
        width: 73px;
        height: 53px;
        display: flex;
        flex-flow: column;
        align-items: center;
        align-content: center;
        justify-content: space-around;
        position: relative;

        &::after {
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          content: ' ';
          position: absolute;
          border-right: rgba(240, 240, 240, 1) dashed 1px;
        }

        span:first-child {
          display: flex;
          align-items: flex-end;
          align-content: flex-end;
          justify-content: flex-end;

          b:first-child {
            line-height: 1;
            color: rgba(245, 71, 71, 1);
            font-size: 16px;
            font-weight: bold;
            margin-right: 2px;
            margin-bottom: 3px;
          }

          b:last-child {
            line-height: 1;
            color: #FF261D;
            font-size: 32px;
            font-weight: bold;
          }
        }

        span:last-child {
          color: #333333;
          font-size: 12px;
          font-weight: bold;
        }
      }

      .info {
        flex: 1;
        width: 0;
        display: flex;
        text-align: left;
        flex-flow: column;
        padding-left: 16px;
        box-sizing: border-box;
        justify-content: space-between;

        span:first-child {
          font-size: 16px;
          font-weight: bold;
          // 隱藏
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          // 隱藏
          color: #333333;
        }

        span:last-child {
          font-size: 11px;
          margin-top: 12px;
          color: rgba(153, 153, 153, 1)
        }
      }
    }

    .footer {
      margin-top: 15px;
      padding-top: 15px;
      text-align: left;
      position: relative;
      display: flex;
      flex-flow: row;
      align-items: flex-start;
      align-content: center;

      .van-icon {
        line-height: 1;
        color: #FA6C17;
        font-size: 13px;
        margin-right: 5px;
        margin-bottom: 1px;
      }

      .disabled-class {
        width: 100%;
        color: #333333;
        font-size: 11px;
        line-height: 16px;
      }

      &::after {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        content: ' ';
        position: absolute;
        border-top: rgba(240, 240, 240, 1) dashed 1px;
      }
    }
  }

  .bottom {
    padding: 12px;
    box-sizing: border-box;
    // height: 73px;
    background: #FFFFFF;

    .van-button--block {
      height: 49px;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid #FA6C17;
    }
    .text{
      margin: 12px 0 18px;
      color:#666;
      font-size: 12px;
    }

    span {
      font-size: 18px;
      font-family: "PingFangSC-Regular, PingFang SC";
      color: #FA6C17;
      line-height: 25px;
    }
  }

  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;
    align-content: center;
    justify-content: center;

    .van-image__img {
      width: 50%;
      height: auto;
    }

    p {
      margin-top: 16px;
      font-size: 14px;
      text-align: center;
      color: rgba(49, 46, 75, 0.5);
      line-height: 20px;
    }
  }
}
</style>
