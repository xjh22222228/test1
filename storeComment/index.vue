<template>
  <div>
    <headerNav :style="appHeaderStyle" :allwayShow="true" :delta="-1" :title="storeName"/>
    <marketComment  type="store" ref="marketComment"></marketComment>
  </div>
</template>

<script>
import marketComment from "../components/store-item/market-comment/marketComment";
import headerNav from "@/components/headerNav";
import mf from '@/JS/mFoodSDK';
export default {
  components: {
    marketComment,
    headerNav
  },
  data () {
    return {
      storeName:"",
      safeTop: mf.safeTop()
    };
  },
  computed: {
    appHeaderStyle() {
      const safeTop = this.safeTop;
      return {
        paddingTop: safeTop/100 + 'rem'
      };
    }
  },

  mounted() {
    this.$toast.clear();
    if(this.$route.query.storeName){
      this.storeName = this.$route.query.storeName;
    }
    
  },

  methods: {}
};

</script>
<style lang='scss' scoped>
</style>
