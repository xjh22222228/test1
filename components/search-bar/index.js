
export default {
  props: {
    backgroundColor: {
      type: String,
      default: '#fff'
    },
    // 白色主题
    light: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
    };
  },

  methods: {
    goSearchPage() {
      this.$router.push({
        path: '/market/search'
      });
    }
  }
};
