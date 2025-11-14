<template>
  <div class="scene" ref="sceneDiv"></div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {CSS3DRenderer, CSS3DSprite} from "three/examples/jsm/renderers/CSS3DRenderer";

type addTextType = {
  element: string,
  position: number[],
  cssObject: typeof CSS3DSprite
  name: string,
  scale: number[]
}
//场景元素DIV
let sceneDiv = ref<HTMLDivElement | null>(null);
//创建场景
const scene = new THREE.Scene();
//创建透视相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
camera.position.set(40, 30, 40); // 相机在(0,5,10)位置，俯视平面
camera.lookAt(0, 0, 0); // 相机朝向原点

// 1. 环境光（照亮整个场景，避免阴影处全黑）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// 2. 方向光（模拟太阳光，产生阴影，让模型有立体感）
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 10, 10); // 光源位置
directionalLight.castShadow = true; // 开启阴影（可选）
scene.add(directionalLight);


// // 4. 创建平面
// // 平面几何体：参数1=宽度，参数2=高度（默认1x1）
// const planeGeometry = new THREE.PlaneGeometry(5, 5); // 5x5大小的平面
// // 基础材质：使用纯色，wireframe=true显示线框（方便观察）
// const planeMaterial = new THREE.MeshBasicMaterial({
//   color: "0xff0000", // 绿色
//   wireframe: true // 显示线框（可改为false显示实心）
// });
// // 网格对象：几何体+材质的组合
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//
// scene.add(plane);

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/model/draco/");
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("/model/model.glb", (gltf: any) => {
  console.log("gltf", gltf);
  scene.add(gltf.scene);
  gltf.scene.traverse((obj: any) => {
    if (obj.name.indexOf("楼顶") > -1) {
      const name = obj.parent.name;
      let position = Object.values(getModelWorldPosition(obj)) as number[];
      position[1] += 2; // 在y轴上方偏移2个单位
      const html = `<div class="floorText-3d animated fadeIn" id="${name}"><p class="text">${name}</p></div>`;
      addText({
        element: html,
        position,
        cssObject: CSS3DSprite,//CSS3DSprite - Three.js 的 CSS3D 渲染器对象，用于在 3D 空间中显示 HTML 元素
        name,
        scale: [1, 1, 1], // 暂时调整为1，看是否出现
        // 不传parent，直接添加到场景
      })
    }
  })
});
/**
 gltfLoader.load("/model/model.glb", (gltf: any) => {
 console.log("gltf", gltf);
 scene.add(gltf.scene);
 gltf.scene.traverse(obj => {
 if (obj.name.indexOf("楼顶") > -1) {
 const name = obj.parent.name;
 const position = Object.values(getModelWorldPosition(obj));
 const html = `<div class="floorText-3d animated fadeIn" id="${name}"><p class="text">${name}</p></div>`;
 addText({
 element: html,
 position,
 cssObject: CSS3DSprite,
 name,
 scale: [0.025, 0.025, 0.025],
 parent: new THREE.Group(),
 })
 }
 })

 });
 */
//初始化渲染器
const renderer = new THREE.WebGLRenderer();
//设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

//初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);
//设置控制器阻尼
controls.enableDamping = true;


// 创建 CSS3D 渲染器
const css3DRenderer = new CSS3DRenderer();
css3DRenderer.setSize(window.innerWidth, window.innerHeight);
css3DRenderer.domElement.style.position = 'absolute';
css3DRenderer.domElement.style.top = '0';
css3DRenderer.domElement.style.left = '0';
css3DRenderer.domElement.style.pointerEvents = 'none'; // 避免遮挡交互
css3DRenderer.domElement.style.zIndex = "101";
css3DRenderer.domElement.style.transformStyle = 'preserve-3d';
document.body.appendChild(css3DRenderer.domElement);


onMounted(() => {
  if (sceneDiv.value) sceneDiv.value.appendChild(renderer.domElement);

  animate();
});

//监听屏幕大小改变的变化，设置渲染的尺寸
window.addEventListener("resize", () => {
  //更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  //更新摄像头的投影矩阵
  camera.updateProjectionMatrix();
  //更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  //设置渲染器的像素比例
  renderer.setPixelRatio(window.devicePixelRatio);
});

const clock = new THREE.Clock();

const animate = () => {
  controls.update();
  // const time = clock.getElapsedTime();
  requestAnimationFrame(animate);
  //使用渲染器渲染相机看这个场景的内容渲染出来
  renderer.render(scene, camera);
  css3DRenderer.render(scene, camera); // CSS3D 画 HTML
};

const getModelWorldPosition = (model) => {
  scene.updateMatrixWorld(true);
  const worldPosition = new THREE.Vector3();
  model.getWorldPosition(worldPosition);
  return worldPosition;
}
const addText = (option: addTextType) => {
  let list = [];
  if (Array.isArray(option)) list = option;// 支持批量添加
  else list.push(option); // 单个对象转为数组

  list.forEach((e) => {
    //insertAdjacentHTML - 将 HTML 插入到页面中，"beforeend" 表示插入到 body 的末尾
    document.body.insertAdjacentHTML("beforeend", e.element);
    // 创建 CSS3D 对象
    const label = new e.cssObject(document.body.lastChild);
    label.userData.isCss23D = true;// 设置用户数据和属性
    label.position.set(...e.position);// 设置 3D 位置
    label.name = e.name;// 设置名称
    if (e.scale) label.scale.set(...e.scale); // 设置缩放
    e.parent ? e.parent.add(label) : scene.add(label);// 添加到场景
  });
}
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

</style>
<style>
.floorText-3d {
  //width: 10px;
  //height: 5px;
  font-size: 4px;
  color: white;
  //background: red;
}
</style>
