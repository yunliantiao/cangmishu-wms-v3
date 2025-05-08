<template>
  <q-dialog v-model="componentData.visible">
    <q-card class="material-form-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ componentData.form.id ? "编辑包材" : "新建包材" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>
      <q-separator />

      <q-card-section>
        <div class="row">
          <!-- 图片上传占位 -->
          <div class="col-3">
            <Image v-model="componentData.form.image"></Image>
          </div>
          <div class="col-9 q-pl-lg">
            <q-form @submit.prevent="handleConfirm" ref="myForm">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="componentData.form.code"
                    label="包材编号 *"
                    placeholder="请输入"
                    :rules="[(val) => !!val || '必填']"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="componentData.form.name"
                    label="包材名称 *"
                    placeholder="请输入"
                    :rules="[(val) => !!val || '必填']"
                  />
                </div>
                <div class="col-12 pr-hidden">
                  <q-input
                    outlined
                    dense
                    v-model="componentData.form.price"
                    label="售价 *"
                    placeholder="请输入"
                    :rules="[(val) => !!val || '必填']"
                  >
                    <template #append>
                      <q-select
                        v-model="componentData.form.currency"
                        :options="componentData.currencyOptions"
                        dense
                        borderless
                        class="select"
                        style="min-width: 100px"
                        dropdown-icon="arrow_drop_down"
                        emit-value
                        map-options
                        label="货币"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-12">
                  <div class="row items-center" style="gap: 10px">
                    <q-input
                      outlined
                      style="flex: 1"
                      dense
                      v-model="componentData.form.dimensions.length"
                      label="长"
                      type="number"
                      min="0"
                    >
                      <template #append>
                        <span>cm</span>
                      </template>
                    </q-input>
                    <q-input
                      outlined
                      dense
                      style="flex: 1"
                      v-model="componentData.form.dimensions.width"
                      label="宽"
                      type="number"
                      min="0"
                    >
                      <template #append>
                        <span>cm</span>
                      </template>
                    </q-input>
                    <q-input
                      outlined
                      dense
                      style="flex: 1"
                      v-model="componentData.form.dimensions.height"
                      label="高"
                      type="number"
                      min="0"
                    >
                      <template #append>
                        <span>cm</span>
                      </template>
                    </q-input>
                  </div>
                </div>
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="componentData.form.weight"
                    label="重量"
                    placeholder="请输入"
                    type="number"
                    min="0"
                  >
                    <template #append>
                      <span class="text-grey">g</span>
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="q-mt-md text-grey-7" style="font-size: 13px">
                <q-icon
                  name="info"
                  size="16px"
                  color="grey-5"
                  class="q-mr-xs"
                />
                包材售价的货币单位与客户结算货币不一致时，系统将按照跟踪前一天的汇率转换后扣费
              </div>
              <q-card-actions align="right" class="q-mt-md">
                <q-btn flat label="取消" @click="close" />
                <q-btn color="primary" label="确认" type="submit" />
              </q-card-actions>
            </q-form>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import Image from "@/components/Image/Index.vue";
import ProductApi from "@/api/product.js";
import Message from "@/utils/message.js";
import IndexApi from "@/api/index.js";

const emit = defineEmits(["refresh"]);
const myForm = ref(null);

onMounted(() => {
  getCurrency();
});

const getCurrency = async () => {
  let { data } = await IndexApi.getCurrencies();
  console.log("getCurrency", data);

  componentData.currencyOptions = data.map((item) => ({
    label: item.name,
    value: item.code,
  }));
};

const componentData = reactive({
  visible: false,
  form: {
    code: "",
    name: "",
    price: "",
    currency: "CNY",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    weight: "",
    image: "",
  },
  currencyOptions: [],
});

const open = (form = {}) => {
  // 支持外部传参初始化
  Object.assign(componentData.form, {
    code: "",
    name: "",
    price: "",
    currency: "CNY",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    image: "",
    weight: "",
    ...form,
  });
  componentData.visible = true;
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = async () => {
  await myForm.value.validate();

  if (!componentData.form.id) {
    await ProductApi.createMaterial(componentData.form);
    Message.successMessage("操作成功");
  } else {
    await ProductApi.updateMaterial(componentData.form.id, componentData.form);
  }

  emit("refresh");
  close();
};

defineExpose({ open });
</script>


<style scoped lang="scss">
.material-form-dialog {
  min-width: 340px;
}

.pr-hidden {
  :deep(.q-field__control) {
    padding-right: 0;
  }

  .select {
    :deep(.q-field__label) {
      padding-left: 10px;
    }
    :deep(.q-field__native) {
      padding-left: 10px;
      padding-top: 4px;
      padding-bottom: 4px !important;
      min-height: auto;
    }
  }
}
</style>