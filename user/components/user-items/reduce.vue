<template>
  <van-card :class="`normal-user-reduce ${disabled?'fail':''}`" >
    <template #desc>
      <div class="details">
        <div class="reduce-img">立減券</div>
        <div class="top">
          <div class="left">
            <div class="name ellipsis">兌換碼：{{item.exchangeCode}}</div>
            <div class="time-limit" >{{item.expireStr}}</div>
          </div>
          <div class="right">
            <span class="price ellipsis"><b class="symbol">MOP</b>{{item.amount}}</span>
            <span class="label ellipsis">{{item.limitAmountStr}}</span>
          </div>

        </div>
        <div class="mid"><div class="son"></div>
        </div>
        <div class="bottom">
            <div :class="`html-class ${hidden?'hidden':'all'}`"  @click="hidden=!hidden">
              <span class="label" ref="label" v-html="item.expireUseExplain"></span>
              <van-icon name="arrow-down" v-if="showMore"/>
            </div>
          <div  :class="`btn ${disabled?'visable':''} ${item.isEnable?'enable':'disable'}`" @click="home">去使用</div>
        </div>
      </div>
    </template>
  </van-card>
</template>

<script>
import { Card, Icon } from "vant";
export default {
  name: "normal-red-packet",
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    item: {
      immediate: true,
      handler(nv) {
        if (!nv?.expireUseExplain) {
          this.showMore = false;
          return;
        }
        this.$nextTick(() => {
          this.showMore = this.$refs.label.getBoundingClientRect().height > 20;
        });
      }
    }
  },
  computed: {
    listData() {
      const d = this.disabled;
      const item = this.item;
      if (d) {
        return item.invalidListData || [];
      } else {
        return item.effectiveListData || [];
      }
    }
  },
  data() {
    return { hidden: true, showMore: false };
  },
  methods: {
    show() {
      this.item.show = !this.item.show;
      this.$forceUpdate();
    },
    isToday(date) {
      const now = new Date();
      const n = new Date(date);
      return now.getDate() === n.getDate();
    },
    home() {
      this.$router.push("/");
    }
  }
};
</script>

<style lang="less">
  .normal-user-reduce{
    width: 100%;
    border-radius: 12px;
    position: relative;
    box-sizing: border-box;
    padding: 0;
    &.fail {
      &:before{
        position: absolute;
        pointer-events: none;
        content: '';
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 12px;
        overflow: hidden;
        z-index: 20;
      }
      .van-card__content{
        .details {
          >.top{
            >.left{
              >.name{
                color: #999;
              }
              >.time-limit{
                color: #999;
              }
            }
            >.right{
              >.price{
                color: #999999;
                >.symbol {
                  color: #999999;
                }
              }
              >.label {
                color: #999999;
              }

            }

          }
          >.bottom{
            >.right{
              >.btn{
                display: none;
              }
            }
          }
        }
      }

    }

    .van-card__content {
      > div {
        width: 100%;
        height: 100%;
      }
      text-align: left;
      position: relative;
      box-sizing: border-box;

      div.details {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        border-radius:12px;
        overflow: hidden;
        background: #FFFFFF;
        .reduce-img{
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 20px;
          line-height: 20px;
          border-radius: 12px 0px 12px 0px;
          color: white;
          font-size: 12px;
          text-align: center;
          background: linear-gradient(135deg, #FF9127 0%, #FE5900 100%);
        }
        >.top {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          padding:16px;
          overflow: hidden;

          >.left{
            flex: 1;
            overflow: hidden;
            >.name {
              color: #333333;
              font-size: 12px;
              font-weight: bold;
            }
            >.time-limit {
              display: flex;
              align-items: center;
              align-content: center;
              font-size: 12px;
              font-weight: 400;
              color: #333333;
              margin-top: 8px;
            }
          }
          >.right {
            flex-shrink: 0;
            display: flex;
            flex-flow: column;
            justify-content: center;
            align-items: flex-end;
            position: relative;
            width: 90px;
            overflow: hidden;
            >.price {
              font-size: 32px;
              font-weight: bold;
              color: #F54747;

              b.symbol {
                font-size: 16px;
                font-weight: bold;
                color: #F54747;
                margin-right: 2px;
                vertical-align: 1px;
              }
            }
            >.label{
              color:#333333;
              font-size: 12px;
              font-weight: bold;
            }

          }
        }
        .mid{
          padding: 0 16px;
          width: 100%;
          .son{
            height:1px;
            border-bottom: 1px dashed #F0F0F0;
          }
        }
        .bottom{
          padding:8px 16px;
          display: flex;
          justify-content: space-between;
          overflow: hidden;
          .html-class{
            margin-top: 4px;
            flex:1;
            width: 100%;
            color: #999999;
            font-size: 12px;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            overflow: hidden;
            .label{
              max-width: 80%;
              overflow: hidden;
              word-break: break-all;
            }
            .van-icon{
              margin: 2px 5px 0 2px;
              flex-shrink: 0;
            }
            &.hidden{
              height: 16px;
            }
            &.all{
              height: auto;
              .van-icon{
                transform: rotate(180deg);
              }
            }
          }
          >.btn{
            flex-shrink: 0;
            margin-left: 10px;
            border-radius: 4px;
            width: 52px;
            height: 24px;
            font-size: 12px;
            line-height: 24px;
            text-align: center;
            color: white;
            &.visable{
              visibility: hidden;
            }
            &.enable{
              background: #FA6C17;
            }
            &.disable{
              pointer-events: none;
              background: #E5E5E5;
            }
          }
        }
      }
    }
  }
  </style>
