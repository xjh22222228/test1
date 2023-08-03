<template>
<div class="recommentCommon">
  <complainCom ref="complainCom"/>
  <div class="cell-card-class " v-if="showType === 'store'">
    <van-card>
      <template #thumb >
        <van-image
          width="100%"
          height="100%"
          fit="cover"
          class="productImage"
          :src="item.userHeadImg || userUrl"
          lazy-load
          show-error
        />
      </template>
      <template #price>
        <span class="small-grey-class">{{item.createTime | dateFormat}}</span>
      </template>
      <template #title>
        <div class="customer-name-class">
          <div class="info-wrapper">
            <span
              class="main-customer-name"
              :class="{ showVip: item.isMember && !item.aliasType }"
            >
              {{ item.alias }}
            </span>
            <svg-icon
              v-if="item.isMember && !item.aliasType"
              icon-class="icon_member"
              class="vip-hat"
            ></svg-icon>
          </div>
          <img class="complain-img" :src="positionImg" @click="complainRecomment(item)"/>
        </div>
      </template>
    </van-card>
    <div class="new-rate-class">
      <van-rate
        allow-half
        color="#FA6C17"
        void-color="#ccc"
        v-model="item.storeMark"
        :icon="BASE_URL + '/icon_system_star_light.svg'"
        :void-icon="BASE_URL + '/icon_system_star_dull.svg'"
        readonly
      >
      </van-rate>
      <span class="small-grey-class">
        {{ item.storeMarkString }}
      </span>

    </div>
    <pre
      :class="`customer-reason-class ${showAll === 1 ? 'hidden' : ''}`"
      v-if="item.storeContent"
      ref="storeContent"
    >{{ item.storeContent }}</pre
    >
    <span
      v-if="showAll"
      class="showAllButton"
      @click="showAll = showAll === 1 ? 2 : 1"
    >
      {{ showAll === 1 ? "全部" : "收起" }}
    </span>
    <div
      class="pic-board-class "
      v-if="item.imgList && item.imgList.length > 0"
    >
      <div
        :class="imgClass(item.imgList, index)"
        v-for="(img, index) in item.imgList"
        :key="index"
      >
        <van-image
          v-if="img"
          lazy-load
          @click="showImgF(item.imgList, index)"
          fit="cover"
          :src="img | imgCompress"
        ></van-image>
      </div>
    </div>
    <div class="merchantRecomment" v-if="item.merchantContent">
      <div class="mainLabel">
        <div class="left">商家回復</div>
        <div class="right" v-if="item.merchantTime">
          {{ item.merchantTime | dateFormat }}
        </div>
      </div>
      <pre
        :class="`merchantRespone ${merchantShowAll === 1 ? 'hidden' : ''}`"
        ref="merchantRecomment"
      >{{ item.merchantContent }}</pre
      >
      <span
        v-if="merchantShowAll"
        class="showAllButton"
        @click="merchantShowAll = merchantShowAll === 1 ? 2 : 1"
      >
        {{ merchantShowAll === 1 ? "全部" : "收起" }}
      </span>
    </div>
    <!-- 商品评价 -->
    <div class="product-good" v-if="commentList.length" ref="good">
      <div
        class="pitem"
        ref="hold"
        style="position:absolute;top:0;opacity:0;"
      >
        <div class="pleft"></div>
        <div class="pmiddle">占位符</div>
        <div class="pright"></div>
      </div>
      <div
        v-for="(p, idx) of commentList"
        :key="idx"
      >
        <div
          class="pitem"
          :class="{
            pitemGray: p.commentType === 0,
            over: p.over,
            expand: p.expand
          }"
          @click="toggleExpand(idx, p)"
        >
          <div class="pleft"></div>
          <div class="pmiddle">{{ p.productName }}</div>
          <div class="pright"></div>
        </div>
      </div>
    </div>
  </div>
 <!--  我的評論  todo -->
  <div class="mine-cell-card-class " v-else>
    <van-card>
      <template #thumb v-if="item.thumbnailHead">
        <van-image
          width="100%"
          height="100%"
          fit="cover"
          class="productImage"
          :src="item.thumbnailHead"
          lazy-load
          show-error
        />
      </template>
      <template #price>
        <span class="small-grey-class">
          <span style="margin-top:3px;">商家：</span>
          <van-rate
            allow-half
            color="#FA6C17"
            void-color="#ccc"
            v-model="item.storeMark"
            :icon="BASE_URL + '/icon_system_star_light.svg'"
            :void-icon="BASE_URL + '/icon_system_star_dull.svg'"
            readonly
          >
          </van-rate>
          <div style="padding-top: 2px;">
            口味 {{ item.tasteMark }}星
            <span style="margin-left: 8px;">包裝 {{ item.packMark }}星</span>
          </div>
        </span>
      </template>
      <template #title>
      <!--  @click="goStore(item)" -->
        <div class="customer-name-class">
          <div class="main-customer-name">
            <span>{{ item.storeName }}</span>
            <svg-icon
              icon-class="icon_system_arrow_mini_right2"
              class="icon-arrow"
            />
          </div>
          <span class="small-grey-class" v-if="item.createTime">{{
            utils.dateFormat(new Date(item.createTime), "yyyy.MM.dd")
          }}</span>
        </div>
      </template>
      <template #bottom> </template>
    </van-card>
    <div class="flexEnd">
      <div class="endData">
        <div
          class="riderRate"
          v-if="[1, 4].includes(item.deliveryType) && item.riderMark"
        >
          <div class="small-grey-class" style="flex-shrink: 0">
            騎手: {{ item.riderMark }}星
          </div>
          <div class="small-grey-class riderRecomments">
            <span v-if="item.labelList && item.labelList.length">
              {{
                item.labelList
                  .filter((item, index) => index < 2)
                  .map(item => item.labelContent)
                  .join(",")
              }}
            </span>
          </div>
        </div>
        <pre class="customer-reason-class"
             v-if="item.storeContent">{{item.storeContent}}</pre>
        <div
          class="pic-board-class "
          v-if="item.imgList && item.imgList.length > 0"
        >
          <div
            :class="imgClass(item.imgList, index)"
            v-for="(img, index) in item.imgList"
            :key="index"
          >
            <van-image
              v-if="img.imgUrl"
              lazy-load
              @click="showImgF(item.imgList, index)"
              fit="cover"
              :src="img.imgUrl"
            ></van-image>
          </div>
        </div>
        <div class="merchantRecomment" v-if="item.merchantContent">
          <div class="merchantRespone">
            <span class="small-grey-class">商家回復: </span>
            <pre class="merchantContent">{{ item.merchantContent }}</pre>
          </div>
          <div class="merchantResponDate" v-if="item.merchantTime">
            {{
            utils.dateFormat(
            new Date(item.merchantTime),
            "yyyy.MM.dd hh:mm:ss"
            )
            }}
          </div>
        </div>

        <!-- 商品评价 -->
        <div class="product-good" v-if="commentList.length " ref="good">
          <div
            class="pitem"
            ref="hold"
            style="position:absolute;top:0;opacity:0;"
          >
            <div class="pleft"></div>
            <div class="pmiddle">占位符</div>
            <div class="pright"></div>
          </div>
          <div
            v-for="(p, idx) of commentList"
            :key="idx"
          >
            <div
              class="pitem"
              :class="{
                pitemGray: p.commentType === 0,
                over: p.over,
                expand: p.expand
              }"
              @click="toggleExpand(idx, p)"
            >
              <div class="pleft"></div>
              <div class="pmiddle">{{ p.productName }}</div>
              <div class="pright"></div>
            </div>
          </div>
        </div>

        <div class="bottomSlot">
          <div>
            <span class="aliasType" v-if="item.aliasType">
              已匿名
            </span>
          </div>
          <div class="deleteRecomment" @click="deleteRecomment(item)">
            <svg-icon icon-class="mf_icon_search_delete" class="icon-del" />
            刪除
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import { post } from "@ajax";
import {
  Card,
  Cell,
  CellGroup,
  Dialog,
  Icon,
  Image as VanImage,
  ImagePreview,
  Rate,
  Toast
} from "vant";
import userUrl from "@/assets/images/default_avatar2.png";
import positionImg from "@/assets/images/icon_system_position.png";
import utils from "@utils";
import complainCom from "@/components/supermarket/complainComponent";
import { cloneDeep } from "lodash";
import mf from '@/JS/mFoodSDK'
export default {
  props: {
    item: {
      type: Object,
      default: () => ({}),
      required: true
    },
    showType: {
      type: String,
      default: "store",
      required: false
    }
  },
  components: {
    [Card.name]: Card,
    [VanImage.name]:VanImage,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Rate.name]: Rate,
    [Icon.name]: Icon,
    complainCom
  },
  data() {
    return {
      BASE_URL: process.env.BASE_URL,
      userUrl,
      utils,
      showAll: false,
      merchantShowAll: false,
      positionImg,
      productList: [],
      commentList: []
    };
  },
  watch: {
    item: {
      handler(nv) {
        if (nv && nv.productList) {
          const up = [];
          const down = [];
          this.productList = cloneDeep(nv.productList);
          this.productList.forEach(item => {
            if (item.commentType === 1) {
              up.push(item.productName);
            } else if (item.commentType === 0) {
              down.push(item.productName);
            }
          });
          this.commentList = [];
          if (up.length) {
            this.commentList.push({
              productName: up.join('、'),
              commentType: 1
            });
          }
          if (down.length) {
            this.commentList.push({
              productName: down.join('、'),
              commentType: 0
            });
          }
        }
        this.showAll = false;
        this.merchantShowAll = false;
        this.triggerOver();
        if (nv?.storeContent && this.showType == "store") {
          this.$nextTick(() => {
            const el = this.$refs.storeContent.getClientRects()[0];
            if (!el) {
              return;
            }
            const height = el.height;
            const countLine = this.$refs.storeContent.innerHTML.length //一行205个字超出
            if (height > 100 && countLine >= 205) {
              this.showAll = 1;
            } else {
              this.showAll = false;
            }
          });
        }
        if (nv?.merchantContent && this.showType == "store") {
          this.$nextTick(() => {
            const el = this.$refs.merchantRecomment.getClientRects()[0];
            if (!el) {
              return;
            }
            const height = el.height;
            if (height > 60) {
              this.merchantShowAll = 1;
            } else {
              this.merchantShowAll = false;
            }
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    // 展开收起商品名称
    toggleExpand(idx, data) {
      if (!data.over) {
        return;
      }
      const commentList = cloneDeep(this.commentList);
      commentList[idx].expand = !commentList[idx].expand;
      this.commentList = commentList;
    },

    triggerOver() {
      this.$nextTick(() => {
        const holdRef = this.$refs.hold;
        const goodRef = this.$refs.good;
        if (!goodRef || !goodRef) {
          return;
        }
        const height = holdRef.clientHeight;
        const items = goodRef.querySelectorAll('.pitem');
        const commentList = cloneDeep(this.commentList);
        for (let i = 1; i < items.length; i++) {
          const elH = items[i].clientHeight;
          if (elH > height) {
            commentList[i - 1].over = true;
          }
        }
        this.commentList = commentList;
      });
    },

    goStore(data) {
      // this.$refs.storeJump.jump({ id: data.storeId });
    },
    deleteRecomment(data) {
      // 此處取消事件為提交刪除
      Dialog.confirm({
        message: "確定刪除這條評價嗎？",
        confirmButtonText: "取消",
        confirmButtonColor: "#FA6C16",
        cancelButtonText: "確定",
        className: "dialog-like-class"
      }).catch(e => {
        // 請求刪除接口
        Toast.loading({ message: "正在提交...", duration: 0 });
        post("/takeouts/comment/_del", data)
          .then(res => {
            Toast.clear();
            Toast.success({
              type: "success",
              message: "刪除成功",
              onClose: () => {
                this.$emit("delSuccess");
              }
            });
          })
          .catch(e => {
            Toast.clear();
            this.$store.dispatch("notify", e);
          });
      });
    },
    showImgF(imgArr, index) {
      function addLogo(img) {
        return (
          img +
          "?x-oss-process=image/watermark,image_bG9nb193YXRlcm1hcmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLFBfMjA=,t_90,g_se,x_16,y_16"
        );
      }
      ImagePreview({
        images: imgArr.map(item => addLogo(item)),
        closeable: true,
        startPosition: index,
        closeIcon: "cross",
        loop: false,
        className: "customer-pic-show-class " + (mf.isApp ?'app':'')
      });
    },
    complainRecomment(item) {
      if(mf.isApp){
        mf.APPLoginAsync().then(res => {
          this.$refs.complainCom.show(item);
        })
      } else {
        this.$refs.complainCom.show(item);
      }
      

      
    }
  },
  computed: {
    imgClass() {
      return (imgList, index) => {
        const len = imgList ? imgList.length : 0;
        const arr = ["img-item-class"];
        if (len > 4) {
          arr.push("img33");
          if ((index + 1) % 3 === 0) {
            arr.push("cleanmargin");
          }
          return arr;
        } else {
          switch (len) {
            case 1: {
              arr.push("img100");
              break;
            }
            case 2: {
              arr.push("img50");
              if ((index + 1) % 2 === 0) {
                arr.push("cleanmargin");
              }
              break;
            }
            case 3: {
              arr.push("img33");
              if ((index + 1) % 3 === 0) {
                arr.push("cleanmargin");
              }
              break;
            }
            case 4: {
              arr.push("img50");
              if ((index + 1) % 2 === 0) {
                arr.push("cleanmargin");
              }
              break;
            }
          }
          return arr;
        }
      };
    }
  }
};
</script>

<style lang="less">
.customer-pic-show-class {
  background: #000000 !important;
  &.app{
      .van-image-preview__index{
        top:46px;
      }
      .van-image-preview__close-icon{
        top:46px;
      }
  }
  .van-image-preview__close-icon--top-right {
    color: #ffffff;
  }
}
.pic-board-class {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding-bottom: 8px;
  .img-item-class {
    margin-top: 6px;
    position: relative;
    overflow: hidden;
    &.cleanmargin {
      margin-right: 0;
    }
    .van-image {
      height: 0;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      padding-bottom: 100%;
      img {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  .img100 {
    width: 60.27%;
  }
  .img50 {
    width: 48.69%;
    margin-right: 2.62%;
  }

  .img33 {
    display: inline-flex;
    width: 31.78%;
    margin-right: 2.33%;
  }
}
.cell-card-class {
  margin-top: 24px;
  padding-bottom: 32px;
  box-sizing: border-box;
  width: 100%;
  border-bottom: 0.5px solid #f0f0f0ff;
  &:last-child {
    border: 0;
    padding-bottom: 0;
  }
  .new-rate-class{
    display: flex;
    align-items: center;
  }
  .van-card .van-card__header .van-card__content > div .customer-name-class {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .complain-img{
      width: 24px;
      height: 24px;
    }
    .info-wrapper {
      display: flex;
      align-items: center;
      width: 50%;
      @vipWidth: 80px;
      .vip-hat {
        width: @vipWidth;
        height: 16px;
        margin-left: 5px;
      }
      .main-customer-name {
        display: inline-block;
        max-width: 100%;
        color: #333333ff;
        line-height: 1.2;
        &.showVip {
          max-width: calc(100% - @vipWidth);
        }
      }
    }
    .main-customer-name {
      font-size: 14px;
      line-height: 1.2;
      font-weight: bold;
      color: #333;
      word-break: break-word;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: left;
      max-width: 50%;
    }
  }
  .van-card {
    background: #ffffff;
    padding: 8px 0;
    .van-card__header {
      display: flex;
      align-items: center;

      .van-card__thumb {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          border-radius: 8px;
        }
      }

      .van-card__content {
        min-height: 40px;

        .van-card__bottom {
          text-align: left;
        }
      }
    }
  }
  .merchantRecomment {
    background: #f5f5f7;
    padding: 10px 12px;
    margin-top: 8px;
    border-radius: 8px;
    overflow: hidden;
    .mainLabel {
      width: 100%;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      .left {
        color: #666666ff;
        line-height: 1.2;
        font-size: 12px;
        font-weight: bold;
      }
      .right {
        color: #999999ff;
        line-height: 1.2;
        font-size: 11px;
      }
    }
  }
}

.recommentCommon {
  width: 100%;
  .product-good {
    text-align: left;
    .pitem {
      padding: 6px 8px 6px 8px;
      background-color: #FEF0E8;
      display: inline-flex;
      align-items: center;
      width: max-content;
      overflow: hidden;
      border-radius: 8px;
      max-width: 100%;
      margin-top: 8px;
      &.pitemGray {
        background-color: #F5F5F7;
        .pleft {
          background-image: url("./img/down.png");
        }
        .pmiddle {
          color: #666666;
        }
        .pright {
          background-image: url("./img/arrow-down.png");
        }
      }
      &.over {
        padding-right: 4px;
        .pmiddle {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pright {
          display: block;
        }
      }
      &.expand {
        align-items: flex-start;
        .pright {
          transform: rotate(180deg);
        }
        .pmiddle {
          white-space: normal;
        }
      }
    }
    .pleft {
      width: 14px;
      height: 14px;
      background-size: 14px;
      background-image: url("./img/up.png");
    }
    .pmiddle {
      font-size: 12px;
      color: #FA6C17;
      margin-left: 4px;
      line-height: 17px;
      flex: 1;
      word-break: break-all;
    }
    .pright {
      display: none;
      width: 16px;
      height: 16px;
      background-size: 16px;
      background-image: url("./img/arrow-up.png");
    }
  }
  .van-icon__image {
    width: 14px;
    height: 14px;
  }
  .showAllButton {
    color: #4f7cafff;
    font-size: 14px;
    line-height: 20px;
    display: flex;
    margin-top: 4px;
  }
  .van-rate .van-rate__item {
    padding-right: 0;
  }
  .van-rate .van-rate__item .van-icon {
    font-size: 14px;
  }
  .van-rate {
    margin-right: 4px;
  }
  .small-grey-class {
    font-size: 12px;
    line-height: 1.2;
    color: #999;
    font-weight: normal;
    display: flex;
    align-items: center;
    text-align: left;
  }
  .riderRate {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 8px;
  }
  .riderRate .riderRecomments {
    flex: 1;
    margin-left: 8px;
  }
  .customer-reason-class {
    margin: 0;
    font-size: 14px;
    color: #333333ff;
    line-height: 20px;
    text-align: left;
    word-break: break-all;
    white-space: pre-wrap;
    &.hidden {
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  .merchantRespone {
    position: relative;
    width: 100%;
    font-size: 12px;
    margin: 8px 0 0 0;
    color: #666666ff;
    line-height: 20px;
    text-align: left;
    word-break: break-all;
    white-space: pre-wrap;
    &.hidden {
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .small-grey-class {
      position: absolute;
      top: 3px;
      left: 0;
    }
  }
}

.mine-cell-card-class {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
  margin-top: 8px;
  &:first-child {
    margin-top: 0;
  }
}
.mine-cell-card-class .flexEnd {
  width: 100%;
  padding-left: 48px;
}
.mine-cell-card-class
  .van-card
  .van-card__header
  .van-card__content
  > div
  .customer-name-class {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  .main-customer-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    line-height: 1.2;
    width: 71%;
    text-align: left;
    display: inline-flex;
    align-items: center;
    > span {
      overflow: hidden;
      word-break: break-word;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: inline-block;
      max-width: calc(100% - 20px);
    }
    .icon-arrow {
      width: 16px;
      height: 16px;
    }
  }
  svg {
    align-self: flex-start;
    font-size: 13px;
  }
}

.mine-cell-card-class .merchantRecomment {
  margin-top: 8px;
  border-top: 0.5px solid rgba(49, 46, 75, 0.1);
  .merchantResponse {
    text-align: left;
  }
  .merchantContent {
    position: relative;
    margin: 0;
    font-size: 12px;
    line-height: 17px;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-all;
    color: #333;
    text-indent: 56px;
  }

  .merchantResponDate {
    width: 100%;
    text-align: left;
    font-size: 11px;
    line-height: 16px;
    margin-top: 4px;
    color: rgba(49, 46, 75, 0.5);
  }
}
.mine-cell-card-class .bottomSlot {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  .aliasType {
    color: #999;
    height: 20px;
    font-size: 14px;
  }
  .deleteRecomment {
    color: #666;
    font-size: 14px;
    padding: 4px 12px 4px 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0.5px solid #ccc;
    border-radius: 4px;
    .icon-del {
      width: 24px;
      height: 24px;
      margin-right: 4px;
    }
  }
}
.mine-cell-card-class .van-card {
  background: #ffffff;
  padding: 0 0 8px 0;
  .van-card__header {
    display: flex;
    align-items: flex-start;
  }
  .van-card__header .van-card__thumb {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .van-card__header .van-card__content {
    min-height: 40px;
    .van-card__bottom {
      text-align: left;
    }
  }
}
.dialog-like-class {
  top: 45% !important;
  .van-dialog__message {
    color: #333;
    font-size: 16px;
    font-weight: bold;
    padding: 24px 20px 20px 20px;
  }
  .van-dialog__content {
    align-items: initial;
    min-height: initial;
  }
  .van-dialog__footer {
    margin-bottom: 20px;
    justify-content: center;
    flex-direction: row-reverse;
    &::after {
      display: none;
    }
  }
  .van-button__content {
    width: 121.5px;
    height: 40px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-weight: bold;
  }
  .van-button {
    width: initial;
    flex: 0;
    &:nth-child(1) {
      margin-left: 6px;
      .van-button__content {
        background: #fa6c17;
        border-color: #fa6c17;
        color: #fff;
      }
    }
    &:nth-child(2) {
      margin-right: 6px;
      .van-button__content {
        color: #666;
      }
    }
  }
}
</style>
