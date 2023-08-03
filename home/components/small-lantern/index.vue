<template>
  <div class="small-lantern3" v-if="list.length > 0" :class="{lt6: list.length < 6}" ref="main" @scroll="onScroll">
    <div class="lantern-item" v-for="item of list" :key="item.key" @click="onClick(item)">
      <img :src="item.__img__ | imgCompress('', 100)" />
      <div class="name ellipsis2">{{ item.name }}</div>
    </div>

    <public-jump ref="jump" />
  </div>
</template>

<script>
import PublicJump from '@/components/publicJump';

export default {
  components: {
    PublicJump
  },

  data() {
    return {
      scrollLeft: 0
    };
  },

  computed: {
    list() {
      return (this.$store.state.marketHome.smallLantern?.lanternDetails || []);
    }
  },

  watch: {
    list() {
      const el = this.$refs.main;
      if (el) {
        el.scrollLeft = 0;
      }
    }
  },

  activated() {
    this.$nextTick(() => {
      const el = this.$refs.main;
      if (el) {
        el.scrollLeft = this.scrollLeft;
      }
    });
  },

  methods: {
    onClick(data) {
      this.$refs.jump.jump(data);
    },

    onScroll(e) {
      this.scrollLeft = e.target.scrollLeft;
    }
  }
};
</script>

<style lang="less" scoped>
.small-lantern3 {
  display: flex;
  overflow: hidden;
  overflow-x: auto;
  padding-left: 12px;
  margin-top: 12px;
  &.lt6 {
    justify-content: center;
  }
  .lantern-item {
    margin-right: 8px;
    width: 60px;
    min-width: 60px;
    img {
      width: 38px;
      height: 38px;
    }
    .name {
      width: 100%;
      margin-top: 4px;
      font-size: 12px;
      color: #333;
      word-wrap: break-word;
    }
  }
}
</style>
