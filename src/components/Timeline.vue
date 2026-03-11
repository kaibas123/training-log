<script setup>
  import {timelineKeyInfo} from "../../constants.js";
  import {ref} from "vue";
  import {timelineKey, timelineValue} from "../../reactions.js";

  function deleteTimeline(index) {
    timelineKey.value.splice(index, 1);
    timelineValue.value.splice(index, 1);
  }

  function addTimeline() {
    let info = JSON.parse(JSON.stringify(timelineKeyInfo));
    let now = timelineKey.value[timelineKey.value.length - 1];

    info.start = [...now[now.length - 1]['end']];
    info.start = info.start[0] === "12" ? info.start = ['13', "00"] : (info.start[0] === "18" ? ["18", "40"] : info.start);
    info.end = [String(info.start[0] * 1 + 1).padStart(2, "0"), "00"];
    timelineKey.value.push([info]);
    timelineValue.value.push("");
  }

  function divineCell(index, index2) {
    timelineKey.value[index].push(...timelineKey.value[index2]);
    timelineValue.value.splice(index2, 1);
    timelineKey.value.splice(index2, 1);
  }

  function splitCell(index, cellIndex) {
    let minus = timelineKey.value[index].splice(cellIndex, 1);
    timelineKey.value.splice(index + 1, 0, minus);
    timelineKey.value.splice(index + 1, 0, "");
  }
</script>

<template>
  <h2 class="mt2">훈련 시간표</h2>
  <div class="tables">
    <div class="item" v-for="(v, i) in timelineKey">
      <div v-if="i" class="icon delete" @click="deleteTimeline(i)">X</div>
      <div v-if="i !== timelineKey.length - 1" class="icon divine" @click="divineCell(i, i + 1)">↕</div>
      <div v-if="i === timelineKey.length - 1" class="icon plus" @click="addTimeline()">+</div>

      <div class="col-flex">
        <div class="sec jcc gap por" v-for="(va, id) in v">
          <div class="col-flex">
            <p>시작 시간</p>

            <div class="flex gap2 aic">
              <select v-model="va['start'][0]" :id="[`startHour${i}${id}`]" class="form-control">
                  <option value="00">00</option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="13">13</option>
                  <option value="14">14</option>
                  <option value="15">15</option>
                  <option value="16">16</option>
                  <option value="17">17</option>
                  <option value="18">18</option>
                  <option value="19">19</option>
                  <option value="20">20</option>
                  <option value="21">21</option>
                  <option value="22">22</option>
                  <option value="23">23</option>
                </select>

              <p>:</p>

              <select v-model="va['start'][1]" :id="[`startMin${i}${id}`]" class="form-control">
                <option value="00">00</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <p style="margin-top: 1.25rem">~</p>

          <div class="col-flex">
            <p>종료 시간</p>

            <div class="flex gap2 aic">
              <select v-model="va['end'][0]" :id="[`endHour${i}${id}`]" class="form-control">
                <option value="00">00</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
              </select>

              <p>:</p>

              <select v-model="va['end'][1]" :id="[`endMin${i}${id}`]" class="form-control">
                <option value="00">00</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div v-if="id !== v.length - 1" class="icon split" @click="splitCell(i, id + 1)">-</div>
        </div>
      </div>

      <div class="sec"><textarea v-model="timelineValue[i]" placeholder="일지 내용을 입력 해주세요!"></textarea></div>
    </div>
  </div>
</template>

<style scoped>
  p {
    margin: 0;
  }

  .divine {
    top: 100%;
    left: auto;
    right: calc(100% + .85rem);
    font-size: 1rem;
  }

  .split {
    top: 100%;
    left: auto;
    right: calc(100% + .85rem);
    font-size: 1rem;
  }
</style>
