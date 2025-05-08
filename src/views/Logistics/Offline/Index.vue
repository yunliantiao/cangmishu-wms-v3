<template>
  <div class="logistics-manage">
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
        <q-tab name="provider" label="物流商" />
        <q-tab name="channel" label="物流商渠道" />
        <q-tab name="client" label="客户物流渠道" />
      </q-tabs>
      <q-separator />
    </div>

    <div v-show="currentTab === 'provider'">
      <ProviderList />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ProviderList from './ProviderList.vue';
const currentTab = ref('provider');

// 初始化数据
const initData = () => {};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.logistics-manage {
}
</style>
