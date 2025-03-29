<template>
  <div class="app-container">
    <h1 style="text-align: center; color: #2c3e50;">Trilobyte Trawling</h1>
    <router-view></router-view>
    <UploadJSON />
  </div>
</template>

<script>
import UploadJSON from './components/UploadJSON.vue';

export default {
  components: { UploadJSON },
};
</script>