<template>
  <div class="mainBox">
    <Scene class="sceneBox"/>
    <big-controller class="controlButton"/>
  </div>
</template>

<script setup lang="ts">
import Scene from './components/scene.vue'
import bigController from './components/bigController.vue'
</script>

<style lang="scss" scoped>
.mainBox {
  position: relative;
  width: 100%;
  height: 100vh;
  .sceneBox {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
  .controlButton {
    position: fixed;
    bottom: 2vh;
    left: 50%;
    z-index: 2;
    width: 100%;
    height: 5vh;
    transform: translateX(-50%);
  }
}
</style>
