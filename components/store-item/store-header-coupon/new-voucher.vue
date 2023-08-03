<template>
  <div class="mk-header-new-v">
    <div class="vborder">
      <div class="leftv">
        <div class="vprice">
          <div class="vunit">MOP</div>
          <div class="vprice2">{{item.amount||0}}</div>
        </div>
        <div class="vlabel">新人券
        </div>
      </div>
      <div class="rightv">{{item.isReceive ?'已領取':'領取'}}</div>
    </div>
  </div>
</template>
<script >
export default {
  props: {
    item: {
      default: () => ({})
    }
  },
  data() {
    return {

    };
  }
};
</script>
<style lang="less">
  .mk-header-new-v {
    position: relative;
    flex-shrink:0;
    overflow:hidden;

    .vborder{
      border: 1px solid #FCC8C8;
      display:flex;
      background: linear-gradient(135deg, #FFAEAE 0%, #FF7676 100%);
      color:#FFFFFF;
      font-size:11px;
      height:25px;
      border-radius:6px;
      .leftv {
        display:flex;
        .vprice{
          background:rgba(241 ,42 ,42 , 50%);
          border-radius: 4px 0px 12px 4px;
          display:flex;
          font-weight:bold;
          padding:0 4px;
          .vunit{
            font-size:9px;
            margin-right:2px;
            line-height:25px;
          }
          .vprice2{
            font-size:14px;
            line-height:25px;
          }
        }
        .vlabel{
          padding: 0 12px 0 6px;
          line-height:25px;
        }
      }
      .rightv{
        text-align:center;
        width:41px;
        border-left:1px dashed #fff;
        line-height:25px;
      }
      &:before {
        z-index:1;
        content:'';
        position: absolute;
        right:36px;
        top:-6px;
        width:8px;
        height:8px;
        border-radius:50%;
        background:#fff;
        border: 1px solid #FCC8C8;
      }
      &:after {
        z-index:1;
        position: absolute;
        content:'';
        right:36px;
        bottom:-6px;
        width:8px;
        height:8px;
        border-radius:50%;
        background:#fff;
        border: 1px solid #FCC8C8;
      }
    }
  }
</style>
