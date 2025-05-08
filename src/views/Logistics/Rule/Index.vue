<template>
  <div class="logistics-rule">
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
        <q-tab name="group" label="物流组" />
        <q-tab name="zones" label="分区规则" />
        <q-tab name="remote" label="偏远地区规则" />
        <q-tab name="fuel" label="燃油规则" />
      </q-tabs>
      <q-separator />
    </div>

    <div v-show="currentTab === 'group'">
      <GroupList />
    </div>
    <div v-show="currentTab === 'zones'">
      <ZonesList />
    </div>
    <div v-show="currentTab === 'remote'">
      <RemoteList />
    </div>
    <div v-show="currentTab === 'fuel'">
      <FuelList />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import FuelList from './FuelList.vue';
import GroupList from './GroupList.vue';
import RemoteList from './RemoteList.vue';
import ZonesList from './ZonesList.vue';

const currentTab = ref('group');

// 初始化数据
const initData = () => {};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.logistics-rule {
}
</style>
