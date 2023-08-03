<template>
  <div class="guide" @touchmove.stop v-if="visible">
    <div class="tips-wrapper">
      <img class="tips-icon" src="../img/guide_tips.png" alt="">
      <div class="btn" @click="close">{{ $t('common.got_it') }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuidePopup',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    show() {
      this.$emit('update:visible', true)
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="less" scoped>
.guide {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 100;
  background: rgba(0,0,0,0.65);
  .tips-wrapper {
    position: absolute;
    top: 32%;
    left: 50%;
    transform: translateX(-50%);
    .tips-icon {
      width: 190px;
      height: 154px;
    }
    .btn {
      width: 163px;
      height: 40px;
      border-radius: 20px;
      opacity: 1;
      border: 1px solid #FFFFFF;
      margin: 20px auto;
      font-size: 14px;
      color: #fff;
      line-height: 40px;
      text-align: center;
    }
  }
}
</style>
