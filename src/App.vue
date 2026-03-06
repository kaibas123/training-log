<script setup>
  import Menu from "@/components/Menu.vue";
  import Timeline from "@/components/Timeline.vue";
  import Memo from "@/components/Memo.vue";
  import {onMounted} from "vue";
  import {dates, memo, timelineKey, timelineValue, useMemo} from "../reactions.js";

  onMounted(() => {
    if (localStorage['trainingLogData'] && localStorage['trainingLogData'] !== "") {
      let data = JSON.parse(localStorage['trainingLogData']);

      dates.value = data.dates;
      timelineValue.value = data.timelineValue;
      timelineKey.value = data.timelineKey;
      useMemo.value = data.useMemo;
      memo.value = data.memo;
    }
  });
</script>

<template>
  <div class="screen">
    <div class="box gap">
      <Menu />

      <Timeline />

      <Memo />
    </div>
  </div>
</template>

<style scoped>

</style>
