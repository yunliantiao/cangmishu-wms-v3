<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">
          以下包裹打印面单失败，结束作业后，包裹状态置为“异常”
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="componentData.list"
          :columns="componentData.columns"
          row-key="id"
          flat
          bordered
          hide-bottom
          class="pack-table"
        >
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="close" />
        <q-btn color="primary" label="确认" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from "vue";
import Message from "@/utils/message.js";

const emit = defineEmits(["confirm"]);

const componentData = reactive({
  visible: false,
  list: [],
  columns: [
    {
      name: "package_number",
      label: "包裹号/运单号",
      field: "package_number",
      align: "left",
    },
    {
      name: "package_number",
      label: "运单号",
      field: "package_number",
      align: "left",
    },
    {
      name: "package_number",
      label: "物流方式",
      field: "package_number",
      align: "left",
    },
  ],
});

const open = (list = []) => {
  componentData.list = list;
  componentData.visible = true;
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = () => {
  emit("confirm");
  close();
};

defineExpose({ open });
</script>