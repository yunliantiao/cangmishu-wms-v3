<template>
  <div class="logistics-cost">
    <div class="q-mb-md">
      <q-tabs
        v-model="currentTab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="strategy" :label="trans('物流计费策略')" />
        <q-tab name="special" :label="trans('特殊客户物流计费')" />
      </q-tabs>
      <q-separator />
    </div>

    <div v-show="currentTab === 'strategy'">
      <StrategyList />
    </div>
    <div v-show="currentTab === 'special'">
      <SpecialList />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import StrategyList from "./StrategyList.vue"; // 物流计费策略
import SpecialList from "./SpecialList.vue"; // 特殊客户物流计费
import trans from "@/i18n";
const currentTab = ref("strategy");

// 初始化数据
const initData = () => {};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.logistics-cost {
}
</style>
