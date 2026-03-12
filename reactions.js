import {ref} from "vue";
import {koreaTime, timelineKeyInfo} from "/constants.js";

export const affil = ref(localStorage['affil'] ?? "");
export const dates = ref(koreaTime.toISOString().slice(0, 10));


export const timelineValue = ref(["훈련 준비"]);
export const timelineKey = ref([[JSON.parse(JSON.stringify(timelineKeyInfo))]]);


export const useMemo = ref(false);
export const memo = ref("");


export const useTask = ref(false);
export const taskTime = ref([0]);
export const taskTitle = ref(['']);
export const taskMemo = ref(['']);

export const useWrong = ref(false);
export const wrongTitle = ref([""]);
export const wrongFeedback = ref([""]);