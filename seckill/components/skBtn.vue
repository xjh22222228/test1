<template>
  <div @click="onClick" :class="['btn', size, { 'disabled':disabled }]">
    {{sellOut?'原價購':'立即搶'}}
  </div>
</template>

<script>
export default {
  props: {
    size: String,
    disabled: Boolean,
    sellOut: Boolean
  },
  components: {},
  data() {
    return {};
  },
  computed: {},

  mounted() {},

  methods: {
    onClick() {
      if (this.disabled) {
        return;
      }
      this.$emit("click");
    }
  }
};
</script>
<style lang="less" scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 20px;
  border-radius: 0 12px 12px 0;
  padding: 0 10px 0 5px;
  margin-left: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  background: #f54747;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -10px;
    display: inline-block;
    // transform: translateX(-15px);
    vertical-align: middle;
    width: 13px;
    height: 20px;
    background: url("../img/btn.png") no-repeat left;
    background-size: cover;
  }
  &.large {
    height: 38px;
    padding: 0 10px 0 15px;
    &::before {
      width: 23px;
      height: 100%;
      background: url("../img/btn_large.png") no-repeat left;
      background-size: cover;
    }
  }
}
</style>
