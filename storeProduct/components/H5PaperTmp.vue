<template>
  <div>
    <p>{{H5Paper.softTextTitle}}</p>
    <div class="h5Content" v-lazy-container="{ selector: 'img' }" v-html="H5Paper.h5Content"></div>
  </div>
</template>

<script>
export default {
  name: "H5Paper",
  props: {
    linkId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      H5Paper: {}
    };
  },
  methods: {
    getH5Paper() {
      this.$store.dispatch("getH5Paper", { id: this.linkId }).then(res => {
        const introTemplate = res.h5Content.replace(/src=/g, 'data-src=');
        res.h5Content = introTemplate;
        this.H5Paper = res;
      });
    }
  },
  mounted() {
    this.getH5Paper();
  }
};
</script>

<style scoped="scoped" lang="less">
  .h5Content{
    white-space: pre-wrap;
    word-break: break-word;
    /deep/img{
      max-width: 100%;
    }
    /deep/ p,div,ul,li,dl{
          max-width: 100%;
          // white-space: pre-wrap;
          // word-break: break-word;
    }
  }
</style>
