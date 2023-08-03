<template>
  <!-- UI地址 https://lanhuapp.com/web/#/item/project/stage?tid=33903ac2-64db-46c3-94c3-dd127d2eff1c&pid=2133b9a3-dc02-494d-8f24-f0cf36627ade -->
  <scroll-bar
    id="main-page"
    :down-callback="onDownCallback"
    :init="false"
    ref="scrollBar"
    v-slot:default="{ list, loading }"
    :http="getData"
    logo
    @end="onEnd"
    :pageSize="16"
  >
    <div>
      <!-- <van-sticky> -->
      <div class="headBg position-sticky" id="sk-nav">
        <div class="safe-head" :class="safeClassName"></div>
        <NavBar title="限時秒殺" :class="['header-bar']"></NavBar>
      </div>
      <!-- </van-sticky> -->
      <div class="page"><van-image class="main-bg" id="mainBg" :src="mainBg"/>
        <div class="top-sk-box" v-if="todayData.seckillProductVoList&&todayData.seckillProductVoList.length">
          <div class="title">
            <div class="l">mFood超市推薦</div>
            <div class="r" v-if="remainTime || !todayData.seckillProductVoList">
              <svg-icon class="icon" icon-class="icon_sk_clock" />
              <span v-if="!remainTime"> 已结束 </span>
              <template v-else>
                <countDown :time="remainTime" />
              </template>
            </div>
          </div>
          <div class="body" v-if="todayData.seckillProductVoList">
            <!-- <div class="scroll-view">
              <div
                class="item"
                :class="{'sellOut':item.sellOut}"
                v-for="(item, index) of todayData.seckillProductVoList"
                :key="index"
              >
                <van-image class="img" :src="getProductImg(item.productImage)">
                  <div>
                    <div class="sell-out-tag" v-if="item.sellOut">已搶光</div>
                    <van-image class="log" :src="item.storeLogo" />
                  </div>
                </van-image>
                <div class="name ellipsis2">{{ item.productName }}</div>
                <div class="foot">
                  <del>MOP{{ item.productPrice }}</del>
                  <div class="price">
                    MOP <span class="num">{{ item.seckillPrice }}</span>
                  </div>
                  <skBtn :sellOut="item.sellOut" @click="toStore(item)" />
                </div>
              </div>
            </div> -->
            <scrollItem :list="todayData.seckillProductVoList"></scrollItem>
          </div>
        </div>
      </div>
      <div id="tabs-row"></div>
      <van-sticky @change="tabIsFixed" class="tab-sticky" :offset-top="tabsOffSetTop">
        <div class="sk-tabs" >
          <div class="tabs">
            <van-tabs
              @change="tabsChange"
              v-model="tabActive"
              title-inactive-color="#999"
              title-active-color="#FF8B1D"
              line-width=".18rem"
              line-height=".05rem"
            >
              <van-tab
                :title="item.categoryName"
                v-for="(item, index) in [
                  { categoryId: null, categoryName: '精選' },
                  ...screenCategoryList,
                ]"
                :key="index"
              ></van-tab>
            </van-tabs>
          </div>
          <div class="dropDown">
            <van-dropdown-menu active-color="#FF8B1D">
              <van-dropdown-item @opened="dropDownItemOpen" title="篩選" ref="dropDownItem">
                <div class="content">
                  <p class="title">附近商家</p>
                  <div class="tags-box">
                    <van-row type="flex">
                      <van-col span="8">
                        <div
                          @click="screenSelect({}, 'merchant')"
                          class="tag ellipsis"
                          :class="{
                            active: !params.merchantId,
                          }"
                        >
                          全部商家
                        </div>
                      </van-col>
                      <van-col
                        span="8"
                        v-for="(item, index) of merchantList"
                        :key="index"
                      >
                        <div
                          @click="screenSelect(item, 'merchant')"
                          class="tag ellipsis"
                          :class="{
                            active: params.merchantId == item.merchantId,
                          }"
                        >
                          {{ item.merchantName }}
                        </div>
                      </van-col>
                    </van-row>
                  </div>
                  <p class="title">秒殺分類</p>
                  <div class="tags-box">
                    <van-row type="flex">
                      <van-col span="8">
                        <div
                          @click="screenSelect({}, 'category')"
                          class="tag ellipsis"
                          :class="{
                            active: !params.categoryId,
                          }"
                        >
                          精選
                        </div>
                      </van-col>
                      <van-col
                        span="8"
                        v-for="(item, index) of screenCategoryList"
                        :key="index"
                      >
                        <div
                          @click="screenSelect(item, 'category')"
                          class="tag"
                          :class="{
                            active: params.categoryId == item.categoryId,
                          }"
                        >
                          {{ item.categoryName }}
                        </div>
                      </van-col>
                    </van-row>
                  </div>
                </div>
                <div class="foot">
                  <van-row gutter="10">
                    <van-col span="12">
                      <div class="btn-defalut" @click="reset">重置</div>
                    </van-col>
                    <van-col span="12">
                      <div class="btn-primary" @click="search">確定</div>
                    </van-col>
                  </van-row>
                </div>
              </van-dropdown-item>
            </van-dropdown-menu>
          </div>
        </div>
      </van-sticky>
      <div class="product-list-col">
        <div class="item" v-for="(item, index) of list" :key="index">
          <van-image :class="{'sellOut':item.sellOut}" class="img" :src="getProductImg(item.productImage)">
            <div>
              <div class="sell-out-tag" v-if="item.sellOut">已搶光</div>
              <div class="bottom">
                <van-image class="logo" :src="item.storeLogo" />
                <div class="ellipsis">{{ item.storeName }}</div>
              </div>
              <div class="discount">
                <p>秒殺</p>
                <b>{{ Math.floor((item.discount * 10) * 100) / 100 }}折</b>
              </div>
            </div>
          </van-image>
          <div class="right">
            <div class="ellipsis2 name">{{ item.productName }}</div>
            <!-- <div class="tips">90天最低價</div> -->

            <div class="mid">
              <div class="progress">
                <div
                  class="bar"
                  :style="`width:${getPercent(item.purchasePercent)}%`"
                >
                  已搶{{ getPercent(item.purchasePercent) }}%
                </div>
              </div>
              <div class="foot">
                <div class="l">
                  <div class="tag">秒殺價<span class="limit" v-if="item.limitNum && item.limitNum !==-1">限{{ item.limitNum }}份</span></div>
                  <div class="price">
                    <div>
                      MOP<span class="num">{{ item.seckillPrice }}</span>
                    </div>
                    <del>MOP{{ item.productPrice }}</del>
                  </div>
                </div>
                <div class="r">
                  <skBtn :sellOut="item.sellOut" @click="toStore(item,'category')" size="large" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <van-empty
          :image="require('./img/empty.png')"
          description="秒殺商品，正在補貨中！"
          v-if="!list.length && !loading"
        >
        </van-empty>
      </div>
    </div>
  </scroll-bar>
</template>

<script>
import {
  ApiGetSkProduct,
  ApiGetSkCategory,
  ApiGetScreenList
} from "./api";
import ScrollBar from "@/components/scrollBar/index.vue";
import NavBar from "@/components/2.0.0/nav";
import skBtn from "./components/skBtn";
import utils from "@/JS/utils";
import countDown from "./components/countDown.vue";
import mf from "@/JS/mFoodSDK";
import {
  Sticky,
  Icon,
  Tab,
  Tabs,
  DropdownMenu,
  DropdownItem,
  Col,
  Row,
  Empty,
  Toast
} from "vant";
import skmixin from "./skmixin";
import scrollItem from "./components/scroll-item.vue"
let loadtimer = null
/**
 * 定時更新，以整點/整時/整分為基準按固定間隔循環執行
 * @param {function} task   需要要執行的方法
 * @param {string} type     類型：時、分、秒
 * @param {number} interval 間隔：時（1-24）、分（1-60）、秒（1-60）
 * @param {number} offset   偏移
 *
 */
function minUpdate(task, type = '分', interval = 1, offset = 0) {
  let target
  const now = new Date()
  switch (type) {
    case '時':
      target =
        (interval - (now.getHours() % interval)) * 60 * 60 * 1000 -
        (now.getTime() % (60 * 60 * 1000))
      break
    case '分':
      target =
        (interval - (now.getMinutes() % interval)) * 60 * 1000 -
        (now.getTime() % (60 * 1000))
      break
    case '秒':
    default:
      target =
        (interval - (now.getSeconds() % interval)) * 1000 -
        (now.getTime() % 1000)
      break
  }
  loadtimer = setTimeout(() => {
    minUpdate(task, type, interval)
    task.call()
  }, target + offset)
}
export default {
  mixins: [skmixin],
  components: {
    ScrollBar,
    [Sticky.name]: Sticky,
    [Empty.name]: Empty,
    [Icon.name]: Icon,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Col.name]: Col,
    [Row.name]: Row,
    NavBar,
    skBtn,
    countDown,
    scrollItem
  },
  data() {
    return {
      mainBg: require('./img/main-bg.png'),
      safeClassName: utils.getSafeTopClassName("padding"),
      tabsOffSetTop: 46,
      params: {
        merchantId: "",
        categoryId: "",
        storeIds: null
      },

      categoryListAll: [],
      merchantList: [],
      storeList: [],
      // categoryId: "",
      isFixed: false
    };
  },
  computed: {
    todayData() {
      return this.$store.state.marketHome.seckillProductData
    },
    remainTime() {
      return (
        this.todayData?.seckillRemainTime &&
        this.todayData.seckillRemainTime * 1000
      );
    },
    screenCategoryList() {
      if (!this.params.merchantId) {
        return this.categoryListAll;
      } else {
        const merchant = this.merchantList.find(
          (e) => e.merchantId == this.params.merchantId
        );
        return merchant.categoryList;
      }
    },
    tabActive: {
      get() {
        let index = 0;
        if (this.params.categoryId) {
          index =
            this.screenCategoryList.findIndex(
              (e) => e.categoryId == this.params.categoryId
            ) + 1;
        }
        return index;
      },
      set(v) {
        if (v == 0) {
          this.screenSelect({}, 'merchant')
        } else {
          const index = v - 1;
          this.params.categoryId = this.screenCategoryList[index].categoryId;
        }
      }
    }
  },

  mounted() {
    mf.hideTopbar();
    // this.getBase();
    // this.loadData();
    this.$nextTick(() => {
      const navDom = document.getElementById("sk-nav");
      this.tabsOffSetTop = navDom ? navDom.clientHeight - 2 : 46;
    });
  },
  activated () {
    // document.getElementById('mainBg').scrollIntoView({
    //   block: 'start',
    //   behavior: "smooth"
    // });
    this.getBase().then(_ => this.loadData());
    this.$toast.clear();
    minUpdate(
      () => {
        this.getBase().then(_ => this.loadData());
      },
      '分',
      1,
      200
    )
  },
  deactivated() {
    clearTimeout(loadtimer)
  },
  methods: {
    tabIsFixed(boolean) {
      this.isFixed = boolean
    },
    dropDownItemOpen() {
      const dom = document.getElementById('tabs-row')
      if (dom && !this.isFixed) {
        dom.scrollIntoView({
          block: 'start',
          behavior: "smooth"
        });
      }
    },
    tabsChange() {
      this.loadData();
    },
    search() {
      this.$refs.dropDownItem.toggle(false);
      this.loadData();
    },
    reset() {
      this.$refs.dropDownItem.toggle(false);
      this.screenSelect({}, "merchant");
      this.loadData();
    },
    screenSelect({ merchantId, storeIds, categoryId }, type) {
      if (type === "merchant") {
        this.params.merchantId =
          this.params.merchantId == merchantId ? null : merchantId;
        this.params.storeIds = this.params.merchantId ? storeIds : null;
        this.params.categoryId = null;
      } else if (type == "category") {
        this.params.categoryId =
          this.params.categoryId == categoryId ? null : categoryId;
      }
    },
    onEnd() {},
    loadData(done) {
      this.$refs.scrollBar?.reset();

      this.$refs.scrollBar?.getData(null, true).then(_ => {
        Toast.clear();
      }).catch(e => {
        // if (e.message.includes('timeout') || e.message.includes('Network Error')) {
        //   this.$toast('網絡開小差了，請檢查您的設備網絡設置～')
        // }
      }).finally(() => {
        // clearTimeout(timer)
        // done && done();
      });
    },
    onDownCallback(done) {
      this.getBase(done).then(_ => {
        this.loadData();
      })
    },
    getBase(done) {
      const toast = Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true,
        message: '加載中...'
      });
      const timer = setTimeout(() => {
        toast.message = '秒殺商品數據加載中，請稍等一陣~'
      }, 3000);
      this.$store.dispatch('getMarketTodaySeckill');
      // ApiGetSkCategory().then((res) => {
      //   this.categoryListAll = res;
      // });
      // ApiGetScreenList().then((res) => {
      //   this.merchantList = res;
      // });
      return new Promise((resolve, reject) => {
        Promise.all([ApiGetSkCategory(), ApiGetScreenList()]).then(resList => {
          [this.categoryListAll, this.merchantList] = resList
          resolve(resList)
        }).catch(e => {
          if (e.message.includes('timeout') || e.message.includes('Network Error')) {
            this.$toast('網絡開小差了，請檢查您的設備網絡設置～')
          }
          reject(e)
        }).finally(() => {
          clearTimeout(timer)
          done && done();
        });
      })
    },
    getData(params) {
      if (this.params.categoryId && this.categoryListAll.every(e => e.categoryId !== this.params.categoryId)) {
        // 发现当前选中的分类id 不存在时 ，取默认参数
        this.params = {
          merchantId: "",
          categoryId: "",
          storeIds: null
        }
      }
      return ApiGetSkProduct({ ...params, ...this.params });
    },
    getPercent(n) {
      return n == -1 ? 10 : n;
    }
  }
};
</script>
<style lang="less" scoped>
::v-deep .van-empty__image {
  width: 122px;
  height: 90px;
}
.headBg {
  // height: 88px;
  background: linear-gradient(360deg, #f54747 0%, #fa6d6d 100%);
  .header-bar {
    ::v-deep .van-nav-bar__title {
      margin-left: 50px;
    }
  }
}
.sell-out-tag{
  position: absolute;
  padding: 3px 14px;
  font-size: 12px;
  font-weight: 400;
  width: 65px;
  color: #FFFFFF;
  background: rgba(0,0,0,0.5);
  border-radius: 11px;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}
.page {
  background: #f54747;
  padding-bottom:1px;
  .main-bg {
    // width: 100%;
    // height: 120px;
    margin: 0 auto -5px;
    // background: url("./img/main-bg.png") center;
    // background-size: cover;
  }

  .top-sk-box {
    width: 351px;
    margin: 0 auto 16px;
    border-radius: 12px;
    background: #fff;
    padding: 12px;
    .title {
      display: flex;
      justify-content: space-between;
      .l {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
      }
      .r {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        .icon {
          font-size: 20px;
          margin-right: 6px;
        }
      }
    }
    .body {
      margin-top: 12px;
      width: 100%;
      overflow: auto;
      .scroll-view {
        display: flex;
        .item {
          display: flex;
          flex-direction: column;
          width: 90px;
          margin-right: 8px;
          font-weight: 400;
          text-align: left;
          font-size: 10px;
          &.sellOut{
            .img {
              opacity: .6;
            }
          }
          .img {
            width: 90px;
            height: 90px;
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid #ededed;
            padding: 5px;
            .log {
              width: 20px;
              height: 20px;
              position: absolute;
              border-radius: 4px;
              overflow: hidden;
              right: 2px;
              top: 2px;
            }
          }
          .name {
            font-size: 11px;
            color: #333333;
            margin: 4px 0;
          }
          del {
            color: #cccccc;
            margin-bottom: 3px;
          }
          .price {
            color: #f54747;
            margin-bottom: 4px;
            .num {
              font-weight: 600;
              font-size: 14px;
            }
          }
          .foot {
            margin: auto 0 0;
          }
        }
      }
    }
  }
}
.tab-sticky {
  ::v-deep .van-sticky {
    background: #f54747;
  }
}
.sk-tabs {
  overflow: hidden;
  display: flex;
  width: 100vw;
  border-radius: 8px 8px 0px 0px;
  // margin-top: -6px;
  background: #fff;
  ::v-deep.van-tabs {
    .van-tabs__line {
      background: url("./img/tab_bottom_line.png");
      background-size: cover;
    }
    .van-tabs__wrap {
      padding-bottom: 5px;
      .van-tabs__nav {
        .van-tab {
          &.van-tab--active {
            font-weight: 600;
          }
        }
      }
    }
  }
  .tabs {
    width: calc(100vw - 65px);
    padding-top: 4px;
  }
  .dropDown {
    width: 65px;
    ::v-deep .van-dropdown-menu {
      .van-dropdown-item__content {
        border-radius: 0 0 12px 12px;
      }
      .van-dropdown-menu__title {
        font-size: 12px;
        font-weight: 400;
        color: #666666;
        margin: 0 auto 2px 10px;
      }
      .van-dropdown-menu__bar {
        box-shadow: -4px -10px 10px 5px rgba(100, 101, 102, 0.12);
      }
      .van-dropdown-item {
        .title {
          font-size: 14px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 8px;
        }
        .content {
          text-align: left;
          padding: 8px 12px 0;
          .van-col {
            padding: 0 5px;
          }
          .tags-box {
            margin: 0 -5px 12px;

            .tag {
              font-size: 12px;
              font-weight: 400;
              color: #999999;
              background: #f0f0f0;
              border-radius: 4px;
              padding: 6px 0;
              width: 100%;
              text-align: center;
              margin-bottom: 8px;
              border: 1px solid transparent;
              &.active {
                color: #ff8b1c;
                background: rgba(255, 141, 32, 0.1);
                border-color: #ff8b1c;
              }
            }
          }
        }
        .foot {
          border-top: 1px solid #f0f0f0;
          padding: 12px 12px;
          .btn-defalut {
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            font-weight: 400;
            text-align: center;
            padding: 8px 0;
            color: #333333;
          }
          .btn-primary {
            background: #ff8b1d;
            border-radius: 4px;
            font-weight: 400;
            text-align: center;
            padding: 8px 0;
            color: #fff;
          }
        }
      }
    }
  }
}

.product-list-col {
  padding-top: 12px;
  min-height: calc(100vh - 46px - 48px - 59px );
  // min-height: calc(300vh - 46px - 48px - 59px );
  .item {
    display: flex;
    padding: 0 12px;
    margin-bottom: 23px;

    & > .img {
      width: 138px;
      height: 138px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #ededed;
      flex-shrink: 0;
      overflow: hidden;
      ::v-deep &.sellOut>img{
        opacity: .6;
      }
      .discount {
        position: absolute;
        padding-top: 2px;
        top: 0;
        left: 0;
        z-index: 5;
        width: 49px;
        height: 40px;
        background: url("./img/tag.png");
        background-size: cover;
        text-align: center;
        font-size: 11px;
        font-weight: 400;
        color: #d11717;
        b {
          font-size: 12px;
          font-weight: 600;
        }
      }
      .bottom {
        display: flex;
        align-items: center;
        font-size: 11px;
        position: absolute;
        width: 100%;
        color: #fff;
        height: 20px;
        padding: 0px 5px;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        .logo {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          margin-right: 4px;
          overflow: hidden;
        }
      }
    }
    .right {
      display: flex;
      flex-direction: column;
      text-align: left;
      margin-left: 8px;
      overflow: hidden;
      flex: 1;
      .name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }
      .tips {
        font-size: 12px;
        font-weight: 400;
        color: #999;
      }

      .mid {
        margin: auto 0 0;
        padding-right: 5px;
        .progress {
          position: relative;
          width: 205px;
          height: 16px;
          background: url("./img/progress.png");
          background-size: cover;
          border-radius: 9px;
          overflow: initial;
          margin: 0 5px 12px 0;
          & > .bar {
            position: absolute;
            background: #f54747;
            display: flex;
            align-items: center;
            border-radius: 9px;
            font-size: 8px;
            height: 100%;
            min-width:fit-content;
            color: #fff;
            padding-left: 6px;
            padding-right: 22px;
            &::after {
              position: absolute;
              display: block;
              content: "";
              width: 23px;
              height: 22px;
              top: -3px;
              right: 0px;
              background: url("./img/bar_icon.png") center no-repeat;
              background-size: contain;
            }
          }
        }
      }
      .foot {
        display: flex;
        justify-content: space-between;
        align-items: end;
        .tag {
          position: relative;
          display: inline-block;
          background: #f54747;
          border-radius: 4px;
          font-size: 12px;
          padding: 2px 4px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 5px;
          &::after {
            position: absolute;
            content: "";
            left: 6px;
            bottom: -7px;
            width: 0;
            height: 0;
            border-right: 4px solid transparent;
            border-bottom: 4px solid transparent;
            border-left: 4px solid transparent;
            border-top: 4px solid #f54747;
          }
          .limit{
            border-left: 1px solid #fff;
            padding-left: 5px;
            margin-left: 4px;
          }
        }
      }
      .price {
        font-weight: 400;
        font-size: 12px;
        color: #f54747;
        padding-bottom: 0px;
        .num {
          font-weight: 600;
          font-size: 18px;
          margin: 0 4px 0 2px;
        }
        del {
          display: block;
          font-size: 11px;
          margin-top: 1px;
          color: #999;
        }
      }
    }
  }
}
</style>
