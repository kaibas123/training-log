<script setup>

import {useMemo, memo, useWrong} from "../../reactions.js";
</script>

<template>
  <section class="col-flex">
    <div class="top flex jcs gap aic mt2">
      <h2 class="title" :style="{opacity: useMemo ? 1 : 0.5}" @click="useMemo = !useMemo">메모</h2>
      <input type="checkbox" v-model="useMemo">
    </div>

    <textarea v-model="memo" v-if="useMemo" class="memo" placeholder="메모를 입력 해주세요!"></textarea>
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