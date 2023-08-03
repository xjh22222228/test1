<!-- 满减促销 -->
<template>
  <van-popup
    :safe-area-inset-bottom="true"
    :value="marketShowFullList"
    position="right"
    class="fullamt2"
    :overlay="false"
    get-container="body"
  >
    <div class="mk-full-parent">
       <div class="position-sticky">
        <nav-bar title="滿額促銷" className="type1" background-color="#fff" :allway-show="true" :delta="true" :back="onBack" :class="safeClass" />
      </div>

      <div class="cls-container" v-if="marketStoreActivity.length > 1">
        <div class="cls-box">
          <div :class="`cls-item ${item.id == activeId?'active':'default'}`" v-for="item of marketStoreActivity" :key="item.id" @click="changeActivity(item)">
            <div class="title">{{item.activityName}}</div>
            <div class="tag">{{activitylabel(item)}}</div>
          </div>
        </div>
      </div>

      <!-- 只有一个分类 -->
      <div class="single-cls" v-if="nowItem">
        <div class="title">{{nowItem.activityName}}{{`(${activityDatas.length})`}}</div>
        <div class="info">{{activityAlllabel(nowItem)}}</div>
      </div>
      <div class="mk-pro-class">
         <virtual-list style="overflow-y: auto;" :style="{height: '100%'}" :data-key="'productId'"
        :data-sources="activityDatas" :data-component="fullProduct"
        ref="virtual" />
      </div>
    </div>
  </van-popup>
</template>

<script>
import { Popup } from "vant";
import NavBar from '@/components/2.0.0/nav';
import utils from '@/JS/utils';
import fullProduct from './full-product.vue';
import event from '@/JS/event';

export default {
  components: {
    NavBar,
    [Popup.name]: Popup
  },
  data() {
    return {
      fullProduct,
      activeId: '',
      safeClass: utils.getSafeTopClassName('padding'),
    };
  },
  activated() {
    // 每次进来设置关闭
    this.$store.commit('marketShowFullList', false);
    event.$on('marketContinueBuy', (id) => {
      this.open(id);
    });
  },
  computed: {
    marketShowFullList() {
      return this.$store.getters.marketShowFullList;
    },
    activityAlllabel() {
      return item => {
        const arr = item?.discountContentList || [];
        return arr.map(it => {
          return item.activityType === 1
            ? `滿${it.fullAtm}減${it.discount}`
            : `滿${it.fullAtm}打${Number((it.discount * 10).toFixed(2))}折`;
        }).join(',');
      };
    },
    activitylabel() {
      return item => {
        const it = _.head(item?.discountContentList || []);
        return item.activityType === 1
          ? `滿${it.fullAtm}減${it.discount}`
          : `滿${it.fullAtm}打${it.discount * 10}折`;
      };
    },
    nowItem() {
      const id = this.activeId;
      const marketStoreActivity = this.marketStoreActivity;
      for (const item of marketStoreActivity) {
        if (item.id == id) {
          return item;
        }
      }
      if (marketStoreActivity.length > 0) {
        return marketStoreActivity[0];
      }
      return null;
    },
    activityDatas() {
      const nowItem = this.nowItem;
      return nowItem?.productData || [];
    },
    marketStoreActivity() {
      return this.$store.getters.marketStoreActivity;
    }
  },
  watch: {
    nowItem(v) {
      if (v?.id && v?.id !== this.activeId) {
        this.activeId = v.id;
      }
    }
  },
  methods: {
    open(id) {
      this.activeId = id;
      this.$store.commit('marketShowFullList', true);
    },

    onBack() {
      this.$store.commit('marketShowFullList', false);
    },
    changeActivity(data) {
      if (data.id === this.activeId) {
        return;
      }
      this.activeId = data.id;
    }
  }
};
</script>

<style lang="less">
.fullamt2 {
  width: 100%;
  height: 100%;
  z-index: 2000 !important;
  .mk-full-parent{
    position: relative;
    height:100%;
    padding-bottom:120px;
    display:flex;
    flex-direction :column;
    .mk-pro-class{
      flex:1;
      overflow:hidden;
      div[role="listitem"]:nth-last-child(1) {
        .mk-full-data {
          border-bottom-color: transparent;
        }
      }
    }
  }
  .cls-container {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 76px;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFFFFF 100%);
      pointer-events: none;
    }
  }
  .cls-box {
    position: relative;
    padding: 12px 0;
    display: flex;
    overflow: hidden;
    overflow-x: auto;
    white-space: nowrap;
    border-bottom: .5px solid #F0F0F0;
    .cls-item {
      position: relative;
      padding: 0 12px;
      text-align: center;
      &:not(&:nth-last-child(1))::after {
        content: "";
        position: absolute;
        top: 10px;
        right: 0;
        width: 1px;
        height: 19px;
        background-color: #F0F0F0;
      }
      &.active {
        .title {
          color: #FF8B1C;
        }
        .tag {
          background: #FF8B1C;
          color: #fff;
        }
      }
    }
    .title {
      font-size: 14px;
      color: #333;
      font-weight:bold;
    }
    .tag {
      margin-top: 2px;
      padding: 0 8px;
      color: #999999;
      font-size: 12px;
      height: 17px;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
  .single-cls {
    padding: 12px;
    .title {
      color: #333;
      font-size: 16px;
      font-weight: bold;
    }
    .info {
      color: #999999;
      font-size: 12px;
    }
  }
}
</style>
