<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card style="min-width: 380px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">{{ trans("打印拣货车标签") }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col">
            <q-select
              v-model="componentData.form.width"
              :options="componentData.widthOptions"
              :label="trans('标签尺寸宽度')"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col">
            <q-select
              v-model="componentData.form.height"
              :options="componentData.heightOptions"
              :label="trans('标签尺寸高度')"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col">
            <q-select
              v-model="componentData.form.font_size"
              :options="componentData.fontOptions"
              :label="trans('字体')"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="q-mb-md">
          <div class="q-mb-xs">{{ trans("标签纸张") }}</div>
          <q-option-group
            v-model="componentData.form.column"
            :options="componentData.columnOptions"
            type="radio"
            color="primary"
            inline
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" @click="close" />
        <q-btn color="primary" :label="trans('确认')" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from "vue";
import Message from "@/utils/message.js";
import trans from "@/i18n";
const emit = defineEmits(["confirm"]);

const componentData = reactive({
  visible: false,
  form: {
    width: "30",
    height: "30",
    font_size: "10",
    column: "1",
  },
  widthOptions: [
    { label: "30mm", value: "30" },
    { label: "40mm", value: "40" },
    { label: "50mm", value: "50" },
  ],
  heightOptions: [
    { label: "30mm", value: "30" },
    { label: "40mm", value: "40" },
    { label: "50mm", value: "50" },
  ],
  fontOptions: [
    { label: "10pt", value: "10" },
    { label: "12pt", value: "12" },
    { label: "14pt", value: "14" },
  ],
  columnOptions: [
    { label: trans("一列"), value: "1" },
    { label: trans("两列"), value: "2" },
    { label: trans("三列"), value: "3" },
  ],
});

const open = () => {
  Object.assign(componentData.form, {
    width: "30",
    height: "30",
    font_size: "10",
    column: "1",
  });
  componentData.visible = true;
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = () => {
  // 校验
  if (
    !componentData.form.width ||
    !componentData.form.height ||
    !componentData.form.font_size ||
    !componentData.form.column
  ) {
    Message.notify(trans("请填写完整信息"));
    return;
  }
  emit("confirm", { ...componentData.form });
  close();
};

defineExpose({ open });
</script>