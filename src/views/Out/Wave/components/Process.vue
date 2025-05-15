<template>
  <div class="wave-process">
    <div class="row flex justify-between" style="flex: 1">
      <div class="col-2 text-center">
        <!-- <q-icon
          name="inventory_2"
          size="2rem"
          :color="step >= 1 ? 'green' : '#dcdfe6'"
          class="process-icon"
        /> -->
        <img
          v-if="step >= 1"
          src="@/assets/images/info/step-1-active.png"
          class="process-icon"
          alt=""
        />
        <img
          v-else
          src="@/assets/images/info/step-1.png"
          class="process-icon"
          alt=""
        />
        <div class="process-text">{{ trans("待拣货") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="step >= 1 ? 1 : 1"
          :color="step > 1 ? '#5745C5' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <!-- <q-icon
          name="assignment"
          size="2rem"
          :color="step >= 2 ? 'green' : 'grey'"
          class="process-icon"
        /> -->

        <img
          v-if="step >= 2"
          src="@/assets/images/info/step-2-active.png"
          class="process-icon"
          alt=""
        />
        <img
          v-else
          src="@/assets/images/info/step-2.png"
          class="process-icon"
          alt=""
        />
        <div class="process-text">{{ trans("待包装") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="1"
          :color="step > 2 ? '#5745C5' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <!-- <q-icon
          name="inventory"
          size="2rem"
          :color="step >= 3 ? 'green' : 'grey'"
          class="process-icon"
        /> -->

        <img
          v-if="step >= 3"
          src="@/assets/images/info/step-3-active.png"
          class="process-icon"
          alt=""
        />
        <img
          v-else
          src="@/assets/images/info/step-3.png"
          class="process-icon"
          alt=""
        />
        <div class="process-text">{{ trans("包装中") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="1"
          :color="step > 3 ? '#5745C5' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <!-- <q-icon
          name="check_circle"
          size="2rem"
          :color="step >= 4 ? 'green' : 'grey'"
          class="process-icon"
        /> -->
        <img
          v-if="step >= 4"
          src="@/assets/images/info/step-4-active.png"
          class="process-icon"
          alt=""
        />
        <img
          v-else
          src="@/assets/images/info/step-4.png"
          class="process-icon"
          alt=""
        />
        <div class="process-text">{{ trans("已结束") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import trans from "@/i18n";

const props = defineProps({
  step: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 4,
  },
});
</script>

<style scoped lang="scss">
.wave-process {
  margin: 32px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .q-col-gutter-lg {
    flex: 1;
  }
}

.process-icon {
  width: 50px;
  height: 50px;
}

.process-text {
  font-weight: 500;
  font-size: 14px;
  color: #1f1f1f;
  line-height: 16px;
}

.process-bar {
  height: 6px !important;
  overflow: hidden;
  border-radius: 3px;
}
.process-bar-box {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
.col-2 {
  padding: 0 !important;
}
</style>
