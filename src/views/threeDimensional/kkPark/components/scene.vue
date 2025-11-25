<template>
  <div class="scene" ref="sceneDiv"></div>
</template>

<script setup lang="ts">
import LoaderModel from './LoaderModel'
//场景元素DIV
let sceneDiv = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  const loaderModel = new LoaderModel();
  await loaderModel.initModel()
  console.log('dada', loaderModel.controls)
  if (sceneDiv.value) sceneDiv.value.appendChild(loaderModel.renderer.domElement);
  loaderModel.animate();
})
</script>

<style lang="scss" scoped>
.scene {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100vw;
  height: 100vh;
}

// 👇 核心修改：括号内加空格（SCSS 解析友好，Vue3 无警告）
// :deep( .floorText-3d ) {
//  font-size: 2px;
//  color: white;
//  cursor: pointer;
// }
</style>
<style>
.floorText-3d {
  font-size: 2px;
  color: white;
  cursor: pointer;
}
</style>
