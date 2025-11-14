<template>
  <div class="mainBox">
    <div class="buttonList">
      <div class="button" @click="changeButton(index)" :class="{'buttonActive' : currentIndex === index}"
           v-for="(item,index) in buttonList"
           :key="item.label">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type buttonListType = {
  label: string
  value: string
}
const currentIndex = ref<number>(0);
const buttonList = ref<buttonListType[]>([
  {
    label: '1',
    value: '首页'
  },
  {
    label: '2',
    value: '楼层管理'
  },
  {
    label: '3',
    value: '电力检测'
  },
  {
    label: '4',
    value: '水利检测'
  },
])
const changeButton = (index: number) => {
  currentIndex.value = index;
}
</script>

<style scoped lang="scss">
.mainBox {
  display: flex;
  justify-content: center;
  .buttonList {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 50%;
    .button {
      font-size: 25px;
      color: #414181;
      cursor: pointer;
    }
    .buttonActive {
      color: white;
    }
  }
}
</style>


