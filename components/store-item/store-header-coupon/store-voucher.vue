<template>
  <div class="mk-header-nor-v">
    <div :class="`samevoucher ${item.isReceive?'vnormal':'vborder'}`"
  >
      <div class="norleftv">
        <div class="vprice">
          <div class="vunit">MOP</div>
          <div class="vprice2">{{item.amount||0}}</div>
        </div>
        <div class="vlabel">店鋪券
        </div>
      </div>
      <div class="norrightv">{{item.isReceive?'已領取':'領取'}}</div>
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
  .mk-header-nor-v{
    position: relative;
    flex-shrink:0;
    overflow:hidden;
    .samevoucher{
      display:flex;
      color:#F54747;
      font-size:11px;
      height:25px;
      border-radius:6px;
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
      }
    }

    .vborder{
      border: 1px solid #FCC8C8;
      &:before{
        border: 1px solid #FCC8C8;
      }
      &:after{
        border: 1px solid #FCC8C8;
      }
    }
    .vnormal{
      background: rgba(252, 200, 200, 30%);
      .norleftv{
        .vprice{
          background: rgba(252, 200, 200, 50%);;
        }
      }
      &:before{
            top:-5px;
      }
      &:after{
        bottom:-5px;
      }
    }

    .norleftv{
      display:flex;
      .vprice{
        background: #FCC8C8;
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

    .norrightv{
      text-align:center;
      width:41px;
      border-left:1px dashed #FCC8C8;
      line-height:25px;
    }

  }
</style>
