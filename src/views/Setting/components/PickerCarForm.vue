<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card style="min-width: 500px; max-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ componentData.form.id ? "编辑拣货车" : "新建拣货车" }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="handleConfirm" ref="formRef">
          <q-input
            outlined
            dense
            v-model="componentData.form.code"
            label="拣货车编号 *"
            :rules="[(val) => !!val || '必填']"
            class="q-mb-md"
            maxlength="32"
            clearable
          />
          <q-input
            outlined
            dense
            v-model="componentData.form.name"
            label="名称 *"
            :rules="[(val) => !!val || '必填']"
            class="q-mb-md"
            maxlength="32"
            clearable
          />
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col">
              <q-input
                outlined
                dense
                v-model.number="componentData.form.size_length"
                label="长 (cm) *"
                type="number"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) || '必填',
                ]"
                min="0"
                clearable
              />
            </div>
            <div class="col">
              <q-input
                outlined
                dense
                v-model.number="componentData.form.size_width"
                label="宽 (cm) *"
                type="number"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) || '必填',
                ]"
                min="0"
                clearable
              />
            </div>
            <div class="col">
              <q-input
                outlined
                dense
                v-model.number="componentData.form.size_height"
                label="高 (cm) *"
                type="number"
                :rules="[
                  (val) =>
                    (val !== '' && val !== null && val !== undefined) || '必填',
                ]"
                min="0"
                clearable
              />
            </div>
          </div>
          <q-input
            outlined
            dense
            v-model.number="componentData.form.max_weight"
            label="最大重量 (kg)"
            type="number"
            min="0"
            class="q-mb-md"
            clearable
          />
          <q-input
            outlined
            dense
            v-model="componentData.form.description"
            label="描述"
            type="textarea"
            autogrow
            maxlength="200"
            clearable
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="close" />
        <q-btn color="primary" label="确认" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive, ref, nextTick } from "vue";
import { useQuasar } from "quasar";
import SettingApi from "@/api/setting";

const $q = useQuasar();

const emit = defineEmits(["refresh"]);
const formRef = ref(null);

const componentData = reactive({
  visible: false,
  form: {
    id: "",
    code: "",
    name: "",
    size_length: "",
    size_width: "",
    size_height: "",
    max_weight: "",
    description: "",
  },
});

const open = (form = {}) => {
  // 初始化表单，编辑时带入数据
  Object.assign(componentData.form, {
    id: "",
    code: "",
    name: "",
    size_length: "",
    size_width: "",
    size_height: "",
    max_weight: "",
    description: "",
    ...form,
  });
  componentData.visible = true;
  nextTick(() => {
    formRef.value && formRef.value.resetValidation();
  });
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = async () => {
  // 校验表单
  const valid = await formRef.value.validate();
  if (!valid) return;
  if (componentData.form.id) {
    await SettingApi.updatePickCar(componentData.form.id, componentData.form);
  } else {
    await SettingApi.createPickCar(componentData.form);
  }
  emit("refresh");
  close();
};

defineExpose({ open });
</script>