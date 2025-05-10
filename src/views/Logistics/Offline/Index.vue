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
    <div v-show="currentTab === 'channel'">
      <ChannelList />
    </div>
    <div v-show="currentTab === 'client'"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ChannelList from './ChannelList.vue'; // 物流商渠道列表
import ProviderList from './ProviderList.vue'; // 物流商渠道详情
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
