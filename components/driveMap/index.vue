<template>
  <van-popup position="right" v-model="flag" closeable
              close-icon-position="top-left" class="point-map-component-class3">
    <div class="parent">
      <div id="point-map"></div>
    </div>
  </van-popup>
</template>

<script>
import { Popup } from 'vant';
import avatar from '@/assets/images/default_avatar2.png';
export default {
  name: "mapPoint",
  components: {
    [Popup.name]: Popup
  },
  data() {
    return {
      flag: false,
      tempParam: {},
      map: '',
      avatar
    };
  },
  computed: {
    activityLocation() {
      return this.$store.getters.activityLocation.point;
    }
  },
  created() {
    ;(async () => {
      await this.$store.dispatch('getPointInAllClient');
      await this.$store.dispatch('createElementBaiduGl');
    })();
  },
  methods: {
    show(param) {
      this.flag = true;
      this.tempParam = param;
      this.$nextTick(() => {
        this.map = new BMapGL.Map("point-map");
        const activityLocation = this.activityLocation;
        // var pointNow = new BMapGL.Point(activityLocation.lon, activityLocation.lat);
        var pointReceive = new BMapGL.Point(this.tempParam.lon, this.tempParam.lat);
        this.map.centerAndZoom(pointReceive, 15);
        this.map.disableScrollWheelZoom();
        // this.map.addEventListener("tilesloaded", function() {
        //   that.marker();
        // });
        var driving = new BMapGL.DrivingRoute(this.map, { renderOptions: { map: this.map, autoViewport: true } });
        const rp = new BMapGL.Point(param.lon, param.lat);
        const np = new BMapGL.Point(activityLocation.lon, activityLocation.lat);
        // console.log(BMapGL, driving, rp, np);
        driving.search(np, rp);
      });
    }
  }
};
</script>

<style lang="less">
.point-map-component-class3 {
  width: 100vw;
  height: 100vh;
  position: absolute;
  .parent{
    z-index: 0;
    width: 100%;
    height: 100%;
    position: relative;
    #point-map{
      width: 100%;
      height: 100%;
      .infoBox{
        >img{
          display: none;
        }
      }
      .pointInfoBoxContent{
       .img{
         width: 52px ;
         height: 62px;
         background-image: url("./map_profile@2x.png");
         background-size: 100% auto;
         position: relative;
         display: flex;
         align-items: center;
         justify-content: center;
         >img{
           width: 34px;
           height: 34px;
            border-radius: 8px;
           overflow: hidden;
         }
       }
      }
    }
  }
}
</style>
