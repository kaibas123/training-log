<script setup>

import {taskTitle, taskMemo, taskTime, useTask} from "../../reactions.js";

function removeTask(i) {
  taskMemo.value.splice(i, 1);
  taskTime.value.splice(i, 1);
  taskTitle.value.splice(i, 1);
}

function addTask(i) {
  taskMemo.value.push("");
  taskTime.value.push(0);
  taskTitle.value.push("");
}
</script>

<template>
  <div class="col-flex">
    <div class="top flex jcs gap aic mt2">
      <h2 :style="{opacity: useTask ? 1 : 0.5}">과제풀이</h2>
      <input type="checkbox" v-model="useTask">
    </div>

    <div class="tables" v-if="useTask">
      <div class="item" v-for="(v, i) in taskTime">
        <div v-if="i" class="icon delete" @click="removeTask(i)">X</div>
        <div v-if="i === taskTitle.length - 1" class="icon plus" @click="addTask(i)">+</div>

        <div class="sec">
          <div class="form-floating">
            <input type="number" min="0" v-model="taskTime[i]" class="form-control" :id="[`time{i}`]" placeholder="1">
            <label :for="[`time{i}`]">풀이 시간</label>
          </div>
        </div>

        <div class="sec">
          <div class="form-floating" style="width: 100%;">
            <input type="text" v-model="taskTitle[i]" class="form-control" :id="[`title${i}`]" placeholder="1">
            <label :for="[`title${i}`]">과제 제목</label>
          </div>
        </div>

        <div class="sec"><textarea v-model="taskMemo[i]" placeholder="과제에 대한 메모를 입력 해주세요!"></textarea></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tables .item {
    grid-template-columns: 1fr 2fr 3fr;
  }
</style>