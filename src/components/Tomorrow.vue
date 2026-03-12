<script setup>

import {useTomorrow, tomorrow} from "../../reactions.js";

function deleteTomorrow(i) {
  tomorrow.value.splice(i - 1, 1);
}

function addTomorrow() {
  tomorrow.value.push("");
}
</script>

<template>
  <div class="col-flex">
    <div class="top flex jcs gap aic mt2">
      <h2 :style="{opacity: useTomorrow ? 1 : 0.5}">내일 할 일</h2>
      <input type="checkbox" v-model="useTomorrow">
    </div>

    <div class="tables" v-if="useTomorrow">
      <div class="item" v-for="i in tomorrow.length">
        <div v-if="i - 1" class="icon delete" @click="deleteTomorrow(i)">X</div>
        <div v-if="i === tomorrow.length" class="icon plus" @click="addTomorrow()">+</div>

        <div class="sec">
          {{ i }}
        </div>

        <div class="sec">
          <textarea v-model="tomorrow[i - 1]" v-if="useTomorrow" placeholder="내일 할 일을 입력 해주세요!"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tables .item {
    grid-template-columns: 1fr 9fr;
  }
</style>