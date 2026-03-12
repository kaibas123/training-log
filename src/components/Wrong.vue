<script setup>

import {useWrong, wrongFeedback, wrongTitle} from "../../reactions.js";

function addWrong() {
  wrongTitle.value.push("");
  wrongFeedback.value.push("");
}

function deleteWrong(i) {
  wrongTitle.value.splice(i, 1);
  wrongFeedback.value.splice(i, 1);
}
</script>

<template>
  <section class="col-flex">
    <div class="top flex jcs gap aic mt2">
      <h2 class="title" :style="{opacity: useWrong ? 1 : 0.5}" @click="useWrong = !useWrong">오답 노트</h2>
      <input type="checkbox" v-model="useWrong">
    </div>

    <div class="tables" v-if="useWrong">
      <div class="item" v-for="(v, i) in wrongTitle">
        <div v-if="i" class="icon delete" @click="deleteWrong(i)">X</div>
        <div v-if="i === wrongTitle.length - 1" class="icon plus" @click="addWrong()">+</div>

        <div class="sec">
          <div class="form-floating">
            <input type="text" class="form-control" v-model="wrongTitle[i]" :id="[`wronTitle${i}`]" placeholder="1">
            <label :for="[`wrongTitle${i}`]">틀리거나 아쉬웠던 부분</label>
          </div>
        </div>

        <div class="sec"><textarea v-model="wrongFeedback[i]" placeholder="틀리거나 아쉬웠던 부분에 대한 해결 방법이나 앞으로의 계획을 입력 해주세요!"></textarea></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>