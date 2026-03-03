import {ref} from "vue";
import {koreaTime, timelineKeyInfo} from "/constants.js";

export const affil = ref("");
export const dates = ref(koreaTime.toISOString().slice(0, 10));
export const timelineValue = ref(["훈련 준비"]);
export const timelineKey = ref([JSON.parse(JSON.stringify(timelineKeyInfo))]);