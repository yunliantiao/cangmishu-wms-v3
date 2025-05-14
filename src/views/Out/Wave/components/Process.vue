<template>
  <div class="wave-process">
    <div class="row flex justify-between" style="flex: 1">
      <div class="col-2 text-center">
        <q-icon
          name="inventory_2"
          size="2rem"
          :color="step >= 1 ? 'green' : '#dcdfe6'"
          class="process-icon"
        />
        <div class="process-text">{{ trans("待拣货") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="step >= 1 ? 1 : 1"
          :color="step > 1 ? 'green' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <q-icon
          name="assignment"
          size="2rem"
          :color="step >= 2 ? 'green' : 'grey'"
          class="process-icon"
        />
        <div class="process-text">{{ trans("待包装") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="1"
          :color="step > 2 ? 'green' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <q-icon
          name="inventory"
          size="2rem"
          :color="step >= 3 ? 'green' : 'grey'"
          class="process-icon"
        />
        <div class="process-text">{{ trans("包装中") }}</div>
      </div>
      <div class="col-1 process-bar-box">
        <q-linear-progress
          :value="1"
          :color="step > 3 ? 'green' : 'grey-5'"
          class="process-bar"
          track-color="grey-5"
          style="height: 6px"
        />
      </div>
      <div class="col-2 text-center">
        <q-icon
          name="check_circle"
          size="2rem"
          :color="step >= 4 ? 'green' : 'grey'"
          class="process-icon"
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
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .q-col-gutter-lg {
    flex: 1;
  }
}

.process-icon {
  margin-bottom: 8px;
}

.process-text {
  font-size: 14px;
  margin-bottom: 8px;
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
