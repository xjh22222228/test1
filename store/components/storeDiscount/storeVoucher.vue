<template>
<div class="mk-store-v1">
<!-- <div class="share-icon">優惠叠加</div> -->
  <div class="s-v-l">
    <div class="top-price">
      <span class="unit">{{$t('price_unit')}}</span>
      <span class="price">{{item.amount||50}}</span>
    </div>
    <div class="price-label">
    <template v-if="item.limitAmount">
      滿{{item.limitAmount}}可用
    </template>
    <template v-else>
    無門檻
    </template>
    </div>
  </div>
  <div class="s-v-r">
    <div class="r-label">
      <div class="vname ellipsis">{{item.activityName}}</div>
      <div class="v-icon-line">
        <div class="con">{{typeMap[item.activityType] }}</div>
        <!-- 部分商品不可用 -->
      </div>
      <div class="v-tips-label" v-html="item.expireStr">
      </div>
    </div>
    <div :class="`r-btn ${item.isReceive?'receive':'get'}`" >
      {{item.isReceive?'已領取':'領取'}}
    </div>
  </div>
</div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      typeMap: {
        1: '店鋪券'
      }
    };
  }
};
</script>
<style lang="less">
.mk-store-v1{
  position: relative;
  border-radius: 8px;
  padding:10px 16px 10px 12px;
  background: #FFFFFF;
  display:flex;
  .share-icon{
    position: absolute;
    left:0;
    top:0;
    font-size:11px;
    height:16px;
    line-height:16px;
    padding:0 5px;
    color:#F54747;
    border-radius: 8px 0 8px 0;
    background:#FCC8C8;
  }
  .s-v-l{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding: 5px 12px 0 0;

    .top-price{
      color:#F54747;
      font-weight:bold;

      .unit{
        font-size:12px;
        line-height:30px;
      }
      .price{
        font-size:28px;
        line-height:30px;
      }
    }
    .price-label{
      color:#666666;
      font-size:11px;
    }
  }
  .s-v-r{
    flex:1;
    border-left: 1px dashed #F0F0F0;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    padding-left:13px;
    .r-label{
      flex:1;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:flex-start;
      .vname{
        text-align:left;
        width:100%;
        color:#333333;
        font-size:14px;
        font-weight:bold;
      }
      .v-icon-line{
        font-size:11px;
        color:#CCCCCC;
        display:flex;
        width:100%;
        padding:2px 0;
        .con{
          height:16px;
          line-height:16px;
          padding:0 3px;
          color:#F54747;
          border-radius:4px;
          border: 1px solid #FCC8C8;
          margin-right:4px;
        }
      }
      .v-tips-label{
        margin-top:2px;
        color:#999999;
        font-size:11px;
        width:100%;
        text-align:left;
      }
    }
    .r-btn{
      margin-left:10px;
      width: 52px;
      height: 24px;
      border-radius: 100px;
      font-size:11px;
      text-align:center;
      line-height:24px;
      &.get{
        color:#fff;
        background:#FF8B1C;
      }
      &.receive{
        border: 1px solid #E5E5E5;
        color:#999999;
      }
    }
  }
}
</style>
