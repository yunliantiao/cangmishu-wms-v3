<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ isEdit ? trans("编辑标记") : trans("新增标记") }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="form-container q-gutter-y-md">
          <div class="form-row">
            <div class="form-label">
              <span class="text-subtitle2"
                >{{ trans("标记名称") }} <span class="text-red">*</span></span
              >
            </div>
            <div class="form-field">
              <div class="row items-center">
                <div class="col">
                  <q-input
                    outlined
                    dense
                    v-model="formData.name"
                    :placeholder="trans('请输入')"
                    :rules="[(val) => !!val || trans('标记名称不能为空')]"
                  />
                </div>
                <div class="col-auto q-ml-sm">
                  <q-select
                    outlined
                    dense
                    v-model="formData.style"
                    :options="colorOptions"
                    style="width: 80px"
                  >
                    <template v-slot:selected>
                      <q-icon name="bookmark" :color="formData.color" />
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-icon name="bookmark" :color="scope.opt" />
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </div>
          </div>

          <div class="form-row" style="margin-top: 30px">
            <div class="form-label form-label-top">
              <span class="text-subtitle2">{{ trans("备注") }}</span>
            </div>
            <div class="form-field">
              <q-input
                outlined
                v-model="formData.description"
                type="textarea"
                rows="4"
                :placeholder="trans('请输入备注信息')"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          :label="trans('确认')"
          color="primary"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import trans from "@/i18n";
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["update:visible", "submit"]);

const isOpen = ref(false);
const isEdit = ref(false);

// 监听visible属性变化
watch(
  () => props.visible,
  (val) => {
    isOpen.value = val;
    if (val && props.editData && props.editData.id) {
      isEdit.value = true;
      formData.value = { ...props.editData };
    } else if (val) {
      isEdit.value = false;
      resetForm();
    }
  }
);

// 监听对话框关闭
watch(
  () => isOpen.value,
  (val) => {
    if (!val) {
      emit("update:visible", false);
    }
  }
);

// 表单数据
const formData = ref({
  name: "",
  style: "amber",
  description: "",
  id: "",
});

// 颜色选项
const colorOptions = [
  "amber",
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "teal",
];

// 重置表单
const resetForm = () => {
  formData.value = {
    name: "",
    style: "amber",
    description: "",
  };
};

// 提交表单
const onSubmit = () => {
  if (!formData.value.name) {
    return;
  }

  emit("submit", { ...formData.value });
  isOpen.value = false;
};
</script>

<style scoped>
.text-red {
  color: red;
}

.form-container {
  width: 100%;
}

.form-row {
  display: flex;
  width: 100%;
}

.form-label {
  width: 25%;
  display: flex;
  align-items: center;
}

.form-label-top {
  align-items: flex-start;
  padding-top: 12px;
}

.form-field {
  width: 75%;
}

:deep(.q-field--with-bottom) {
  padding-bottom: 0px;
}
</style>
