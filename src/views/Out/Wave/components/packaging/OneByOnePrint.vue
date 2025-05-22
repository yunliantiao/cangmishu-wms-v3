<template>
  <div>
    <div>
      <q-input v-model="pageData.wave_number" label="波次号" />
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const pageData = reactive({
  wave_number: "",
});
</script>
