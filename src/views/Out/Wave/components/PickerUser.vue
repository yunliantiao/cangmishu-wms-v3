<template>
  <q-dialog v-model="componentData.isOpen" persistent>
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="row items-center">
        <div class="text-h6">分配拣货员</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <div class="row items-center">
              <div class="col-3">
                <span class="text-subtitle2">拣货员</span>
              </div>
              <div class="col-9">
                <q-select
                  outlined
                  dense
                  label="请选择拣货员"
                  v-model="componentData.selectedPicker"
                  :options="props.pickerOptions"
                  option-label="label"
                  option-value="value"
                  map-options
                  emit-value
                  class="full-width"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn unelevated label="确认" color="primary" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive, defineProps, defineEmits, defineExpose } from "vue";

const props = defineProps({
  pickerOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["confirm"]);

const componentData = reactive({
  isOpen: false,
  selectedPicker: null,
});

// 打开弹窗的方法
const openDialog = () => {
  componentData.isOpen = true;
  componentData.selectedPicker = null;
};

// 确认选择
const handleConfirm = () => {
  if (!componentData.selectedPicker) {
    // 可以添加提示，要求选择拣货员
    return;
  }

  emit("confirm", componentData.selectedPicker);
  componentData.isOpen = false;
};

// 暴露方法供外部调用
defineExpose({
  openDialog,
});
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
