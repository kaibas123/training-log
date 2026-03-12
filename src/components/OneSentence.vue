<script setup>

import {useOne, one, useWrong} from "../../reactions.js";
</script>

<template>
  <section class="col-flex">
    <div class="top flex jcs gap aic mt2">
      <h2 class="title" :style="{opacity: useOne ? 1 : 0.5}" @click="useOne = !useOne">한 줄 요약</h2>
      <input type="checkbox" v-model="useOne">
    </div>

    <div class="form-floating" v-if="useOne">
      <input type="text" v-model="one" id="one" class="form-control" placeholder="1">
      <label for="one">오늘 있었던 일을 한 줄로 요약 해보세요!</label>
    </div>
  </section>
</template>

<style scoped>
textarea {
  width: 100%;
  height: 250px;
  resize: none;
  border-radius: 5px;
  outline: 0;
  border: 0;
  box-shadow: 0 0 3px #0005;
  padding: .75rem 1rem;
}
</style>