<template>
  <van-popup :safe-area-inset-bottom="true"
             v-model="marketDetailDialog.state"
             closeable
             position="bottom"
             class="marketVoucherDetailPopup270"
             get-container="body">
    <h2 class="ellipsis2">門店信息</h2>
    <div class="data-class">
      <div class="card-class" v-if="marketStoreDetail.descr">
        <div class="title">門店公告</div>
        <pre class="descr-content" >{{marketStoreDetail.descr}}</pre>
      </div>
      <div class="card-class">
        <div class="title border">門店信息</div>
        <div class="kv-class">
          <div class="key">商家名稱</div>
          <div class="value ellipsis2">{{marketStoreDetail.storeName}}</div>
        </div>
        <div class="kv-class">
          <div class="key">商品數量</div>
          <div class="value ellipsis2">{{marketStoreDetail.productCount||0}}件</div>
        </div>
        <div class="kv-class">
          <div class="key">營業時間</div>
          <div class="value ">
            <div class="dayTime" v-html="todayTime"></div>
          </div>
        </div>
        <div class="kv-class">
          <div class="key">地址</div>
          <div class="value ellipsis2" @click="showStore">{{marketStoreDetail.address}}</div>
        </div>
        <div class="kv-class">
          <div class="key">門店電話</div>
          <div class="value " @click="callMerchant"><img class="phone" :src="phone"/></div>
        </div>
      </div>
      <div class="card-class" v-if="recommendPage.storeMarkNum && recommendPage.commentSwitch">
        <div class="title border">店鋪評價</div>
        <div class="rate-class">
          <div class="rate">
            <div class="top">{{recommendPage.storeMarkNum}}</div>
            <div class="bottom">綜合評分</div>
          </div>
          <div class="mid"></div>
          <div class="rate">
            <div class="top">{{ recommendPage.commentNum> 99999 ?'99999+':recommendPage.commentNum }}</div>
            <div class="bottom">評論數</div>
          </div>
        </div>
        <div class="recommend-class" v-if="recommendPage.result && recommendPage.result.length">
          <template v-for="(recommend,index) in recommendPage.result">
            <img :key="index" class="image" v-if="recommend.userHeadImg" :src="recommend.userHeadImg|imgCompress"/>
            <img :key="index + 1" class="image" v-else :src="userUrl"/>
            <div :key="index + 3" class="label">
              <div class="top">
                <div class="name ellipsis">{{recommend.alias}}</div>
                <div class="time">{{recommend.createTime|dateFormat}}</div>
              </div>
              <div class="bottom ellipsis">{{recommend.storeContent}}</div>
            </div>
          </template>
        </div>
        <div class="see-more-recommend" @click="seeAll">查看全部評論></div>
      </div>
    </div>
  </van-popup>
</template>
<script>
import { Popup } from "vant";
import { post } from "@ajax";
import userUrl from "@/assets/images/default_avatar2.png";
import PhoneCallComponents from "@components/2.0.0/phoneCall";
import phone from '@/assets/images/icon_system_phone_b.png';
import mf from "@/JS/mFoodSDK";
export default {
  name: "store-detail",
  props: ["marketDetailDialog"],
  components: {
    [Popup.name]: Popup
  },
  watch: {
    'marketDetailDialog.state'(nv) {
      if (nv) {
        this.nowTime = Date.now();
        this.commentParam.storeId = this.marketStoreDetail.id;
        post("/market/comment/store_comment_list", this.commentParam).then(res => {
          this.recommendPage = res;
        });
      }
    }
  },
  methods: {
    seeAll() {
      this.$router.push({
        path: "/market/store/comment",
        query: {
          id: this.marketStoreDetail.id,
          storeName: this.marketStoreDetail.storeName
        }
      });
    },
    showStore() {
      if (mf.isApp) {
        const marketStoreDetail = this.marketStoreDetail;
        const param = {
          lat: marketStoreDetail.lat,
          lon: marketStoreDetail.lon,
          address: marketStoreDetail.address,
          storeName: marketStoreDetail.storeName,
          thumbnailHead: marketStoreDetail.thumbnailHead
        };
        console.log(JSON.stringify(param));
        mf.navigateToStore(param);
      } else {
        this.$router.push('/market/storeMap');
      }
    },
    callMerchant() {
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
    }
  },
  data() {
    return {
      userUrl,
      recommendPage: {},
      phone,
      nowTime: Date.now(),
      commentParam: { offset: 0, isImg: 0, size: 1, storeId: '' }
    };
  },

  computed: {
    // 店鋪詳情
    marketStoreDetail: function() {
      return this.$store.getters.marketStoreDetail;
    },
    todayTime() {
      const nowTime = this.nowTime;
      const detail = this.marketStoreDetail;
      const day = new Date(nowTime).getDay();
      const timeList = detail.listMap ? detail.listMap[day] : [];
      return timeList.map(item => {
        return `<span>${item.startTime}-${item.endTime}</span>`;
      }).join(' ');
    }
  }
};
</script>

<style scoped lang="less" >
  .marketVoucherDetailPopup270 {
    padding: 12px 0;
    box-sizing: border-box;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 72%;
    /deep/.van-popup__close-icon{
      top:10px;
      font-size: 20px;
    }
    >h2 {
      font-size: 17px;
      line-height:22px;
      font-weight: bold;
      color: #191919FF;
      text-align: center;
      margin-bottom: 20px;
      padding:0 50px;
      flex-shrink: 0;
    }
    .data-class {
      flex:1;
      background: #F5F5F7;
      padding: 12px;
      overflow: auto;
      .card-class{
        padding: 12px;
        background: white;
        margin-bottom: 12px;
        border-radius: 12px;
        .title{
          font-size: 16px;
          font-weight: bold;
          color: #333333;
          padding-bottom: 10px;
          &.border{
            border-bottom: 0.5px solid #F0F0F0;
          }
        }
        .see-more-recommend{
          padding-top: 14px ;
          text-align:center;
          color: #666666;
          font-size: 12px;
        }
        // 評論
        .recommend-class{
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 0.5px solid #F0F0F0;
          .image{
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 4px;
          }
          .label{
            flex:1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .top{
              display: flex;
              justify-content: space-between;
              align-items: center;
              .name{
                flex: 1;
                text-align: left;
                color:#666666;
                font-size: 12px;
                margin-right: 10px;
              }
              .time{
                flex-shrink: 0;
                text-align: left;
                color: #999999;
                font-size: 11px;
              }
            }
            .bottom{
              text-align: left;
              color: #999999;
              font-size: 11px;
            }

          }
        }
        // 評分
        .rate-class{
          display:flex;
          align-items: center;
          justify-content: space-between;
          .mid{
            flex-shrink: 0;
            background: #F0F0F0;
            width: 1px;
            height: 44px;
          }
          >.rate{
            padding: 11px 0 ;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
           >.top{
             color: #333333;
             font-size: 32px;
             font-weight: bold;
           }
            >.bottom{
              font-size: 12px;
              color: #666666;

            }
          }
        }
        .descr-content{
          color: #666666;
          font-size: 13px;
          line-height: 20px;
          margin:5px 0 0 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .kv-class{
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-top:12px ;
          margin-bottom: 12px;
          font-size: 14px;
          .key{
            flex-shrink: 0;
            color: #666666;
            margin-right: 20px;
          }
          .value{
            flex:1;
            flex-shrink: 0;
            text-align: right;
            word-break: break-all;
            color: #333333;
            .dayTime{
              float: right;
              width: 180px;
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-end;
              column-gap: 10px;
              flex: none;
              >span{
                margin-right: 10px;
              }
            }
            .phone{
              width: 24px;
              height: 24px;
              /*color: #5581B2;*/
            }
          }
        }
      }

    }
    div.voucher {
      width: 100%;
      display: flex;
      overflow-x:scroll ;
      padding: 0 12px;
      margin-bottom: 12px;
      .empty-voucher{
        flex-shrink: 0;
        width: 12px;
        height: 5px;
      }
    }
    .tag {
      flex: 1;
      box-sizing: border-box;
      display: flex;
      align-items: baseline;
      flex-flow: wrap;
      font-size: 12px;
      line-height: 17px;
      color: #666666FF;
    }
    /*.descr{*/
    /*  flex: 1;*/
    /*  overflow: hidden;*/
    /*  font-size: 12px;*/
    /*  line-height: 17px;*/
    /*  color: #666666FF;*/
    /*  pre{*/
    /*    margin: 0;*/
    /*    white-space:pre-wrap;*/
    /*    white-space:-moz-pre-wrap;*/
    /*    white-space:-pre-wrap; !* Opera 4-6 *!*/
    /*    white-space:-o-pre-wrap; !* Opera 7 *!*/
    /*    word-wrap:break-word;*/
    /*  }*/
    /*}*/

  }
</style>
