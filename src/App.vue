<script setup>
  import Menu from "@/components/Menu.vue";
  import Timeline from "@/components/Timeline.vue";
  import Memo from "@/components/Memo.vue";
  import {onMounted} from "vue";
  import {
    dates,
    memo, one,
    taskMemo,
    taskTime,
    taskTitle,
    timelineKey,
    timelineValue, tomorrow,
    useMemo, useOne,
    useTask, useTomorrow, useWrong, wrongFeedback, wrongTitle
  } from "../reactions.js";
  import Task from "@/components/Task.vue";
  import Wrong from "@/components/Wrong.vue";
  import Tomorrow from "@/components/Tomorrow.vue";
  import OneSentence from "@/components/OneSentence.vue";

  onMounted(() => {
    if (localStorage['trainingLogData'] && localStorage['trainingLogData'] !== "") {
      let data = JSON.parse(localStorage['trainingLogData']);

      dates.value = data.dates;

      timelineValue.value = data.timelineValue;
      timelineKey.value = data.timelineKey;

      useMemo.value = data.useMemo;
      memo.value = data.memo;

      useTask.value = data.useTask;
      taskTitle.value = data.taskTitle;
      taskTime.value = data.taskTime;
      taskMemo.value = data.taskMemo;

      useWrong.value = data.useWrong;
      wrongTitle.value = data.wrongTitle;
      wrongFeedback.value = data.wrongFeedback;

      useTomorrow.value = data.useTomorrow;
      tomorrow.value = data.tomorrow;
      useOne.value = data.useOne;
      one.value = data.one;
    }
  });
</script>

<template>
  <div class="screen">
    <div class="box gap">
      <Menu />

      <Timeline />

      <Memo />

      <Task />

      <Wrong />

      <Tomorrow />

      <OneSentence />
    </div>
  </div>
</template>

<style scoped>

</style>
