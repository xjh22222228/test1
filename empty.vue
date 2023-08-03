<template>
  <div></div>
</template>
<script>
export default {
  created() {
    setTimeout(() => {
      this.$router.replace('/market/index');
    }, 50);
  }
};
</script>
