<script setup>
  import {timelineKeyInfo} from "../../constants.js";
  import {ref} from "vue";
  import {timelineKey, timelineValue} from "../../reactions.js";

  function deleteTimeline(index) {
    timelineKey.value.splice(index, 1);
    timelineValue.value.splice(index, 1);
  }

  function addTimeline() {
    timelineKey.value.push(JSON.parse(JSON.stringify(timelineKeyInfo)));
    timelineValue.value.push("");
  }
</script>

<template>
  <h2>훈련 시간표</h2>
  <div class="timeline">
    <div class="item" v-for="(v, i) in timelineKey">
      <div class="sec jcc gap">
        <div class="col-flex">
          <p>시작 시간</p>

          <div class="flex gap2 aic">
            <select v-model="timelineKey[i]['start'][0]" :id="[`startHour${i}`]" class="form-control">
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

            <select v-model="timelineKey[i]['start'][1]" :id="[`startMin${i}`]" class="form-control">
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
            <select v-model="timelineKey[i]['end'][0]" :id="[`endHour${i}`]" class="form-control">
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

            <select v-model="timelineKey[i]['end'][1]" :id="[`endMin${i}`]" class="form-control">
              <option value="00">00</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div class="sec"><textarea v-model="timelineValue[i]"></textarea></div>

      <div v-if="i" class="icon delete" @click="deleteTimeline(i)">X</div>
      <div v-if="i === timelineKey.length - 1" class="icon plus" @click="addTimeline()">+</div>
    </div>
  </div>
</template>

<style scoped>
  h2 {
    margin-top: 1rem;
  }

  .timeline {
    border-radius: 5px;
    overflow: hidden;
  }

  textarea {
    width: 100%;
    border: 0;
    resize: none;
    outline: none;
  }

  p {
    margin: 0;
  }

  .icon {
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: calc(100% + 1rem);
    transform: translateY(-50%);
    font-size: 1.5rem;
    color: gray;
    opacity: .7;
    transition: .3s;
    cursor: pointer;
    font-weight: 700;
  }

  .icon:hover {opacity: 1}

  .plus {
    left: calc(100% + 3rem);
    font-size: 2rem;
    padding-bottom: 4px;
  }

  .item {
    width: 90%;
    display: grid;
    grid-template-columns: 1fr 3fr;
    border-left: 1px solid gray;
    position: relative;
  }

  .item:nth-child(1) {border-top: 1px solid gray;}

  .sec {
    width: 100%;
    border-right: 1px solid gray;
    border-bottom: 1px solid gray;
    display: flex;
    align-items: center;
    padding: .75rem 1rem;
  }
</style>
