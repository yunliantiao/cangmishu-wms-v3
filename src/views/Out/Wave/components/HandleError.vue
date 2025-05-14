<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card class="handle-error-dialog">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">{{ trans("标记异常") }}</div>
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-mb-md">
          <div class="q-mb-xs">
            <span>{{ trans("异常原因") }}</span>
            <span class="text-negative">*</span>
          </div>
          <q-select
            v-model="componentData.reason"
            :options="componentData.reasonOptions"
            :label="trans('请选择')"
            dense
            outlined
            emit-value
            map-options
            class="full-width"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mt-md">
        <q-btn flat :label="trans('取消')" @click="close" />
        <q-btn
          color="primary"
          :label="trans('确认')"
          @click="handleConfirmClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import WaveApi from "@/api/wave.js";
import NotifyUtils from "@/utils/message.js";
import trans from "@/i18n";

const emit = defineEmits(["handleConfirm"]);

const componentData = reactive({
  visible: false,
  reason: "",
  waveId: "",
  ids: [],
  reasonOptions: [
    { label: trans("商品损坏"), value: "product_damaged" },
    { label: trans("拣货错误"), value: "picking_error" },
    { label: trans("商品缺货"), value: "out_of_stock" },
    { label: trans("包装错误"), value: "packing_error" },
    { label: trans("面单打印失败"), value: "label_print_failed" },
    { label: trans("客户取消"), value: "customer_cancel" },
    { label: trans("称重异常"), value: "weight_error" },
    { label: trans("其他"), value: "other" },
  ],
});

const close = () => {
  componentData.visible = false;
  componentData.reason = "";
};

const handleConfirmClick = async () => {
  if (!componentData.reason) {
    NotifyUtils.notify(trans("请选择理由"));

    return;
  }
  let params = {
    package_ids: componentData.ids,
    exception_type: componentData.reason,
  };
  await WaveApi.removePackage(componentData.waveId, params);
  // 删除成功了  但是接口还是返回了包裹数据 在这里做一下延时
  emit("handleConfirm");
  close();
};

const open = (waveId, ids) => {
  componentData.waveId = waveId;
  componentData.ids = ids;
  componentData.visible = true;
};

defineExpose({
  open,
});
</script>

<style scoped>
.handle-error-dialog {
  min-width: 400px;
  max-width: 90vw;
}
</style>
