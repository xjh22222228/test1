<template>
  <van-popup position="right" v-model="flag" closeable
             close-icon="arrow-left"
             close-icon-position="top-left"
             get-container="body"
             class="market-point-map-component-class">
    <div class="parent">
      <div id="market-map"></div>
    </div>
    <div class="refresh-class" @click="marker">
      <img :src="refresh"/>
    </div>
    <div class="driver-parent-class" @click="driveToStore">
      <div class="driver">導航到店</div>
    </div>
    <driver-map ref="driver"/>
  </van-popup>
</template>

<script>
import refresh from '@/assets/images/icon_system_refresh@2x.png';
import { Popup } from 'vant';
import mf from "../../../../JS/mFoodSDK";
import driverMap from '@/views/components/2.7.3/map';
export default {
  name: "marketStore",
  components: {
    [Popup.name]: Popup, driverMap
  },
  data() {
    return {
      flag: false,
      map: '',
      tempData: {},
      refresh
    };
  },
  computed: {
    marketStoreDetail() {
      return this.$store.getters.marketStoreDetail;
    },
    geoLocationStatus: function() {
      return this.$store.getters.geoLocationStatus;
    },
    storeDistance: function() {
      return this.$store.getters.storeDistance;
    }
  },
  async created() {
    await this.$store.dispatch('createElementBaidu');
    await this.$store.dispatch("baiduInfoBox");
    await this.$store.dispatch("geoLocation");
    await this.$store.dispatch("getLocation");
    this.show()

  },
  methods: {
    driveToStore() {
      this.$refs.driver.show(this.marketStoreDetail);
    },
    async marker() {
      this.$toast('定位中...');
      // const km = this.$$km(this.marketStoreDetail.distance);
      mf.getCurrentLocationInAll(true).then(async r => {
        const res = await this.$store.dispatch("storeDistance", {
          lat: this.marketStoreDetail.lat,
          lon: this.marketStoreDetail.lon
        });
        this.map.clearOverlays();
        var html = [
          "<a href='http://map.baidu.com' class='infoBoxContent'>",
          "<div class='text'>",
          "<div class='item'>",
          "<span class='title'>" + this.marketStoreDetail.storeName + "</span>",
          this.geoLocationStatus === 1 ? "<span>距離" + this.storeDistance + "</span>" : "",
          "</div>",
          "<div class='item'>" + this.marketStoreDetail.address + "</div>",
          "</div>",
          "<div class='img'>",
          "<img src='" + this.marketStoreDetail.thumbnailHead + "'/>",
          "</div>",
          "</a>"
        ];
        var infoBox = new BMapLib.InfoBox(this.map, html.join(""), {
          boxStyle: { width: "200px" }
        });
        // 启用自动平移
        // infoBox.enableAutoPan();
        // 禁用自动平移
        infoBox.disableAutoPan();
        // 要在哪个marker或者point上打开infobox
        const marketPoint = new BMap.Point(this.marketStoreDetail.lon, this.marketStoreDetail.lat);
        infoBox.open(marketPoint);
        this.map.centerAndZoom(marketPoint, 15);
      }).finally(r => {
        this.$toast.clear();
      });
    },
    async show() {
      this.flag = true;
      const that = this;
      this.$nextTick(() => {
        this.map = new BMap.Map("market-map");
        var point = new BMap.Point(
          this.marketStoreDetail.lon,
          this.marketStoreDetail.lat
        );
        this.map.centerAndZoom(point, 15);
        this.map.disableScrollWheelZoom();
        that.marker();
        // this.map.addEventListener("tilesloaded", function() {
        //   that.marker();
        // });
      });
      // this.tempData = param;
    }
  },

  async mounted() {

  }

};
</script>

<style lang="less">
  /*.market-point-map-component-class{*/
  /*  width: 100vw;*/
  /*  height: 100vh;*/
  /*  position: fixed;*/
  /*  .van-popup__close-icon{*/
  /*    padding: 10px;*/
  /*    color: white;*/
  /*    background: #000000;*/

  /*    border-radius: 8px;*/
  /*    opacity: 0.4;*/
  /*  }*/
  /*  .anchorBL{*/
  /*    display: none;*/
  /*  }*/
  /*  .refresh-class{*/
  /*    background: white;*/
  /*    position: fixed;*/
  /*    right: 12px;*/
  /*    bottom: 81px;*/
  /*    width: 36px;*/
  /*    height: 36px;*/
  /*    display: flex;*/
  /*    align-items: center;*/
  /*    justify-content: center;*/
  /*    border-radius: 12px;*/

  /*    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.16);*/
  /*    >img{*/
  /*      width: 24px;*/
  /*      height: 24px;*/
  /*    }*/
  /*  }*/
  /*  .driver-parent-class{*/
  /*    position: fixed;*/
  /*    left: 0;*/
  /*    bottom: 10px;*/
  /*    width: 100%;*/
  /*    padding: 0 12px;*/
  /*    .driver{*/
  /*      background: #FF8B1D;*/
  /*      border-radius: 8px;*/
  /*      text-align: center;*/
  /*      color: #FFFFFF;*/
  /*      font-size: 18px;*/
  /*      height: 50px;*/
  /*      line-height: 50px;*/
  /*    }*/
  /*  }*/

  /*  .parent{*/
  /*    z-index: 0;*/
  /*    width: 100%;*/
  /*    height: 100%;*/
  /*    position: relative;*/
  /*    #market-map{*/
  /*      width: 100%;*/
  /*      height: 100%;*/
  /*      .infoBox{*/
  /*        >img{*/
  /*          display: none;*/
  /*        }*/
  /*      }*/
  /*      .pointInfoBoxContent{*/
  /*        .img{*/
  /*          width: 52px ;*/
  /*          height: 62px;*/
  /*          background-image: url("./map_profile@2x.png");*/
  /*          background-size: 100% auto;*/
  /*          position: relative;*/
  /*          display: flex;*/
  /*          align-items: center;*/
  /*          justify-content: center;*/
  /*          >img{*/
  /*            width: 34px;*/
  /*            height: 34px;*/
  /*            border-radius: 8px;*/
  /*            overflow: hidden;*/
  /*          }*/
  /*        }*/
  /*      }*/
  /*    }*/
  /*  }*/
  /*}*/
</style>
