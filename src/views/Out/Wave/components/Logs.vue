<template>
  <q-drawer
    v-model="componentData.visible"
    side="right"
    overlay
    behavior="mobile"
    width="500"
    :breakpoint="0"
  >
    <div class="logs-drawer">
      <div class="logs-title">分拣记录</div>
      <q-table
        :rows="componentData.list"
        :columns="componentData.columns"
        row-key="id"
        flat
        bordered
        hide-bottom
        class="logs-table"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <span class="text-grey">No Data</span>
          </div>
        </template>
      </q-table>
    </div>
  </q-drawer>
</template>

<script setup>
import { reactive } from "vue";

const componentData = reactive({
  visible: false,
  list: [],
  columns: [
    { name: "index", label: "分拣框", field: "index", align: "left" },
    { name: "code", label: "商品标签", field: "code", align: "left" },
    { name: "qty", label: "数量", field: "qty", align: "left" },
  ],
});

const open = (list = []) => {
  componentData.list = list;
  componentData.visible = true;
};

defineExpose({ open });
</script>

<style scoped lang="scss">
.logs-drawer {
  padding: 16px;
  background: #fff;
  height: 100%;
  .logs-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .logs-table {
    :deep(.q-table th) {
      font-weight: 500;
      font-size: 14px;
      color: #222;
      background: #fafbfc;
    }
    :deep(.q-table td) {
      font-size: 14px;
      color: #222;
      padding: 8px 16px;
    }
  }
}
</style>