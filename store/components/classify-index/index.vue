<template>
  <div class="classify3">
    <tab-component :tab-type="tabType" @tabchange="tabChange" />

    <div class="category-main2" :class="{showProgress: showProgress}">
      <div
        class="category-swiper3"
        :class="{lte10: lanternList.length <= 10}"
        @scroll="onScroll"
        ref="container"
      >
        <div ref="swipe" class="swip-slide" :style="{width: width}" >
          <div class="screen-item">
            <div
              class="c-item"
              v-for="(c, idx) of lanternList.slice(0, 10)"
              :key="idx"
              @click="onClick(c)"
            >
              <div class="c-img" :style="{backgroundImage: `url(${c.image})`}"></div>
              <div class="c-name">{{ c.name }}</div>
            </div>
          </div>
          <div class="screen-item" v-if="lanternList.length > 10">
            <div
              class="c-item"
              v-for="(c, idx) of lanternList.slice(10, 20)"
              :key="idx"
              @click="onClick(c)"
            >
              <div class="c-img" :style="{backgroundImage: `url(${c.image})`}"></div>
              <div class="c-name">{{ c.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="progress" ref="progress" v-if="showProgress">
        <div class="bar" ref="bar"></div>
      </div>
    </div>
  </div>
</template>

<script>
import TabComponent from '../tab/index.vue';
import allImg from '../../img/all.png';

export default {
  props: {
    tabType: {
      type: Number,
      default: 1
    }
  },

  components: {
    TabComponent
  },

  data() {
    return {};
  },

  computed: {
    lanternList() {
      const list = this.$store.state.marketStore.marketStoreIndexClassList;
      return [...list].concat({
        name: '全部',
        image: allImg
      });
    },
    width() {
      if (this.lanternList.length > 10) {
        const len = 10;
        return (len * 0.61) + ((len + 1) * 0.12) + 'rem';
      }
      return null;
    },

    // 显示进度条
    showProgress() {
      return this.lanternList.length > 10;
    }
  },

  activated() {
    this.resetScroll();
  },
  mounted() {
    this.resetScroll();
  },

  methods: {
    // 重新设置滚动位置
    resetScroll() {
      this.$nextTick(() => {
        const el = this.$refs.swipe;
        if (el) {
          el.scrollLeft = 0;
        }
        const barEl = this.$refs.bar;
        if (barEl) {
          barEl.style.left = 0;
        }
      });
    },

    tabChange(tabType) {
      this.$emit('tabchange', tabType);
    },

    onScroll(e) {
      if (!this.showProgress) {
        return;
      }
      const scrollLeft = e.target.scrollLeft;
      const barEl = this.$refs.bar;
      const containerEl = this.$refs.container;
      const swipeEl = this.$refs.swipe;
      const progressEl = this.$refs.progress;
      if (!barEl) {
        return;
      }
      const barWidth = barEl.offsetWidth;
      const diff = swipeEl.offsetWidth - containerEl.offsetWidth;
      const left = scrollLeft / diff;
      const w = progressEl.offsetWidth - barWidth;
      barEl.style.left = w * left + 'px';
    },

    onClick(data) {
      this.$emit('click', data);
    }
  }
};
</script>

<style lang="less" scoped>
.classify3 {
  padding: 0 0 12px 0;
  background-color: #fff;
  .category-swiper3 {
    position: relative;
    overflow: hidden;
    overflow-x: auto;
    .swip-slide {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      .screen-item {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        &:nth-child(1),
        &:nth-child(2) {
          .c-item {
            margin-right: 12px;
            &:nth-child(1),
            &:nth-child(5) {
              margin-left: 0 !important;
            }
            &:nth-child(5),
            &:nth-child(10) {
              margin-right: 0 !important;
            }
          }
        }
      }
    }
    .swip-slide {
      padding-left: 12px;
      display: flex;
      overflow: hidden;
      overflow-x: auto;
      .c-item {
        width: 61px;
        font-size: 12px;
        margin-top: 12px;
        margin-right: 12px;
        color: #333;
        text-align: center;
        word-break: break-all;
      }
      .c-empty {
        width: .5px;
        min-width: .5px;
        max-width: .5px;
      }
      .c-img {
        width: 61px;
        height: 61px;
        background-size: 100%;
        background-repeat: no-repeat;
      }
      .c-name {
        margin-top: 3px;
        font-size: 12px;
        line-height: 17px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .category-main2 {
    position: relative;
    &.showProgress {
      margin-bottom: 20px;
    }
    .progress {
      width: 26px;
      height: 3px;
      border-radius: 2px;
      background-color: #E5E5E5;
      overflow: hidden;
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translate(-50%, 0);
      .bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 13px;
        height: 100%;
        background-color: #FA6C17;
      }
    }
  }
}
</style>
