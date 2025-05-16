<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">{{ trans("选择标签") }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-select
          v-model="componentData.selectedIds"
          :options="componentData.tagList"
          :label="trans('请选择标签')"
          outlined
          dense
          multiple
          emit-value
          map-options
          style="width: 100%"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" @click="close" />
        <q-btn color="primary" :label="confirmText" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from "vue";
import Message from "@/utils/message.js";
import trans from "@/i18n";

const emit = defineEmits(["confirm"]);

const props = defineProps({
  confirmText: {
    type: String,
    default: trans("确认"),
  },
});

const componentData = reactive({
  visible: false,
  tagList: [],
  selectedIds: [],
});

const open = (tagList = []) => {
  componentData.tagList = tagList;
  componentData.selectedIds = [];
  componentData.visible = true;
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = () => {
  if (componentData.selectedIds.length === 0) {
    Message.notify(trans("请选择标签"));
    return;
  }
  emit("confirm", componentData.selectedIds);
  close();
};

defineExpose({ open });
</script>