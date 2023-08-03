<template>
  <div class="sellout3">
    <div class="sellout-txt">補貨中</div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
.sellout3 {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    opacity: .8;
  }

  .sellout-txt {
    z-index: 2;
    position: relative;
    width: 65px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    font-size: 14px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5000);
    opacity: 1;
  }
}
</style>
