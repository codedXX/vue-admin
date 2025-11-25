import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { CSS3DRenderer, CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer";

//3D模型类
export default class LoaderModel {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.css3DRenderer = null;
  }

  initModel() {
    return new Promise(resolve => {
      //创建场景
      this.scene = new THREE.Scene();
      //创建透视相机
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);
      this.camera.position.set(40, 30, 40); // 相机在(0,5,10)位置，俯视平面
      this.camera.lookAt(0, 0, 0); // 相机朝向原点

      // 1. 环境光（照亮整个场景，避免阴影处全黑）
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      // 2. 方向光（模拟太阳光，产生阴影，让模型有立体感）
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(10, 10, 10); // 光源位置
      directionalLight.castShadow = true; // 开启阴影（可选）
      this.scene.add(directionalLight);

      //初始化渲染器
      this.renderer = new THREE.WebGLRenderer();
      //设置渲染尺寸大小
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;

      //监听屏幕大小改变的变化，设置渲染的尺寸
      window.addEventListener("resize", () => {
        //更新摄像头
        this.camera.aspect = window.innerWidth / window.innerHeight;
        //更新摄像头的投影矩阵
        this.camera.updateProjectionMatrix();
        //更新渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //设置渲染器的像素比例
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // ★★★ 关键修改：更新 CSS3D 渲染器尺寸 ★★★
        // 如果没有这一步，CSS3D的内容在窗口改变时不会重绘或定位错误
        if (this.css3DRenderer) {
          this.css3DRenderer.setSize(window.innerWidth, window.innerHeight);
        }
      });

      //初始化控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      //设置控制器阻尼
      this.controls.enableDamping = true;

      //加载模型
      const gltfLoader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/model/draco/");
      gltfLoader.setDRACOLoader(dracoLoader);
      gltfLoader.load("/model/model.glb", gltf => {
        console.log("gltf", gltf);
        this.scene.add(gltf.scene);
        gltf.scene.traverse(obj => {
          console.log("obj", obj);
          if (obj.name.indexOf("楼顶") > -1) {
            const name = obj.parent.name;
            let position = Object.values(this.getModelWorldPosition(obj));
            position[1] += 2; // 在y轴上方偏移2个单位
            const html = `<div class="floorText-3d animated fadeIn" id="${name}"><p class="text">${name}</p></div>`;
            this.addText({
              element: html,
              position,
              cssObject: CSS3DSprite, //CSS3DSprite - Three.js 的 CSS3D 渲染器对象，用于在 3D 空间中显示 HTML 元素
              name,
              scale: [1, 1, 1] // 暂时调整为1，看是否出现
              // 不传parent，直接添加到场景
            });

            let floorText = document.querySelector(".floorText-3d");
            floorText.addEventListener("click", function () {
              console.log("你好");
            });
            console.log("试一下", document.querySelector(".floorText-3d"));
          }
        });
      });

      // 创建 CSS3D 渲染器
      this.css3DRenderer = new CSS3DRenderer();
      this.css3DRenderer.setSize(window.innerWidth, window.innerHeight);
      this.css3DRenderer.domElement.style.position = "absolute";
      this.css3DRenderer.domElement.style.top = "0";
      this.css3DRenderer.domElement.style.left = "0";
      this.css3DRenderer.domElement.style.pointerEvents = "none"; // 避免遮挡交互
      this.css3DRenderer.domElement.style.zIndex = "101";
      this.css3DRenderer.domElement.style.transformStyle = "preserve-3d";
      document.body.appendChild(this.css3DRenderer.domElement);
      resolve(1);
    });
  }

  animate() {
    this.controls.update();
    // const time = clock.getElapsedTime();
    requestAnimationFrame(() => this.animate());
    //使用渲染器渲染相机看这个场景的内容渲染出来
    this.renderer.render(this.scene, this.camera);
    this.css3DRenderer.render(this.scene, this.camera); // CSS3D 画 HTML
    // if (this.controls && this.renderer && this.css3DRenderer && this.scene && this.camera) {
    // }
  }

  addText(option) {
    let list = [];
    if (Array.isArray(option)) list = option;
    else list.push(option);

    list.forEach(e => {
      // 1. 创建 DOM 元素
      const wrapper = document.createElement("div");
      wrapper.innerHTML = e.element;
      // 我们需要传入 CSS3DSprite 能够引用的元素
      const element = wrapper.firstElementChild; // 获取到实际的 div.floorText-3d

      if (!element) return; // 安全检查

      // 2. 将元素添加到 CSS3DRenderer 的 DOM 中，由 Three.js 接管
      this.css3DRenderer.domElement.appendChild(element);

      // 3. 创建 CSS3D 对象并引用这个 DOM 元素
      const label = new e.cssObject(element); // 使用 element，而不是 document.body.lastChild
      label.userData.isCss23D = true;
      label.position.set(...e.position);
      label.name = e.name;
      if (e.scale) label.scale.set(...e.scale);

      // 4. 将 CSS3D 对象添加到 Three.js 场景中，使其参与渲染循环
      e.parent ? e.parent.add(label) : this.scene.add(label);
    });
  }

  getModelWorldPosition(model) {
    this.scene.updateMatrixWorld(true);
    const worldPosition = new THREE.Vector3();
    model.getWorldPosition(worldPosition);
    return worldPosition;
  }
}
