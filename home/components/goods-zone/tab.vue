<template>
  <div class="g-tab" @scroll="onScroll" ref="tab" :class="{'hide-tab': !tabs.length}">
    <div
      class="g-tab-item"
      :class="{active: item.id === id}"
      v-for="(item, idx) of tabs"
      :key="item.id"
      @click="onClick(item.id, idx)"
    >
      <img v-if="item.image" class="bg3" :src="item.image" />
      <template v-else>
        <div class="name">{{ item.name }}</div>
        <div class="desc">{{ item.description }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import event, { MARKET_TAB } from '@/JS/event';
import { debounce } from 'lodash';

export default {
  data() {
    return {
      id: '',
      scrollLeft: 0,
      isScroll: true // 是否可以触发scroll事件
    };
  },

  computed: {
    tabs() {
      return this.$store.state.marketHome.marketGoodsTabs;
    }
  },

  watch: {
    tabs: {
      immediate: true,
      handler(tabs) {
        if (tabs.length > 0) {
          this.id = tabs[0].id;
          if (this.$refs.tab) {
            this.$refs.tab.scrollLeft = 0;
          }
        }
      }
    }
  },

  activated() {
    this.$nextTick(() => {
      this.fixedPosition();
    });
  },

  methods: {
    onClick(id, index) {
      if (this.id === id) {
        return;
      }
      this.id = id;
      this.isScroll = false;
      event.$emit(MARKET_TAB, id);

      this.$nextTick(() => {
        const tabActive = document.querySelector('#goods-zone .g-tab-item');
        const left = (index - 1) * tabActive.offsetWidth;
        this.fixedPosition(left, 'smooth');
        setTimeout(() => {
          this.isScroll = true;
        }, 300);
      });
    },

    fixedPosition(scrollLeft, behavior) {
      const els = document.querySelectorAll('.g-tab');
      els.forEach(el => {
        el.scroll({
          left: scrollLeft ?? this.scrollLeft,
          behavior: behavior || 'auto'
        })
      });
    },

    onScroll: debounce(function(e) {
      const left = e.target.scrollLeft;
      this.scrollLeft = left;
      if (!this.isScroll) {
        return;
      }
      this.fixedPosition();
    }, 30)
  },

  mounted() {
    // 更新顶部黏贴状态
    event.$on(MARKET_TAB, id => {
      this.id = id;
    });
  }
};
</script>

<style lang="less" scoped>
.g-tab {
  position: relative;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0) 100%);
  border-radius: 8px 8px 0px 0px;
  display: flex;
  justify-content: flex-start;
  padding: 11px 12px 15px 12px;
  overflow: hidden;
  overflow-x: auto;
  .g-tab-item {
    position: relative;
    color: #666;
    width: 100px;
    min-width: 100px;
    height: auto;
    &:not(:nth-last-child(1)) {
      margin-right: 8px;
    }
    &.active {
      .name,
      .desc {
        color: #FF8B1D;
      }
      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        background: url("~@/views/market/store/img/tab.png");
        width: 18px;
        height: 5px;
        background-size: 18px 5px;
        transform: translate(-50%, 0)
      }
    }
    .bg3 {
      width: 100%;
    }
    .name {
      color: #333;
      font-size: 18px;
      font-weight: bold;
    }
    .desc {
      color: #666;
      font-size: 12px;
      margin-top: 2px;
    }
  }
}
</style>
