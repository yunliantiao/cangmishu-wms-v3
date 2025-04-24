<template>
  <Dialog
    v-model="visible"
    :persistent="persistent"
    :cancelShow="cancelShow"
    :width="width"
    @confirm="handleSubmit"
    :title="formTitle"
  >
    <div class="warehouse-form q-pa-md">
      <q-form @submit="handleSubmit">
        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4 pb-20">
                仓库名称 <span class="required">*</span>
              </div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.name"
                  placeholder="请输入"
                  :rules="[(val) => !!val || '请输入仓库名称']"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4 pb-20">
                仓库编号 <span class="required">*</span>
              </div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.code"
                  placeholder="请输入"
                  :rules="[(val) => !!val || '请输入仓库编号']"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <!-- <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4 pb-20">
                仓库类型 <span class="required">*</span>
              </div>
              <div class="form-input col-sm-8">
                <q-select
                  outlined
                  dense
                  v-model="warehouseForm.type"
                  :options="warehouseTypes"
                  option-value="type"
                  option-label="name"
                  emit-value
                  placeholder="请选择"
                  :rules="[(val) => !!val || '请选择仓库类型']"
                >
                  <template v-slot:selected>
                    <span v-if="warehouseForm.type">
                      {{
                        warehouseTypes.find((o) => o.type === warehouseForm.type)
                          ?.name || "请选择"
                      }}
                    </span>
                  </template>
                </q-select>
              </div>
            </div>
          </div> -->
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4 pb-20">
                域名 <span class="required">*</span>
              </div>
              <div class="form-input col-sm-8">
                <div class="row items-center domain-input-group">
                  <div class="prefix text-grey-7">https://</div>
                  <div class="input-wrapper">
                    <q-input
                      outlined
                      dense
                      :disable="editMode"
                      v-model="warehouseForm.domain"
                      placeholder="请输入仓库域名"
                      class="domain-input"
                      bg-color="white"
                    />
                  </div>
                  <div class="suffix text-grey-7">.cangmishu.com</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">
                国家/地区 <span class="required">*</span>
              </div>
              <div class="form-input col-sm-8">
                <q-select
                  outlined
                  dense
                  v-model="warehouseForm.country_code"
                  :options="filteredCountries"
                  option-value="code"
                  option-label="name"
                  placeholder="搜索"
                  map-options
                  emit-value
                  use-input
                  input-debounce="300"
                  @filter="filterCountries"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        未找到匹配的国家/地区
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">省</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.province"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">市/州</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.city"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">街道</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.street"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">门牌号</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.door_no"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">邮编</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.postcode"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">时区</div>
              <div class="form-input col-sm-8">
                <q-select
                  outlined
                  dense
                  v-model="warehouseForm.timezone"
                  :options="filteredTimezones"
                  option-value="value"
                  option-label="label"
                  emit-value
                  placeholder="搜索"
                  use-input
                  input-debounce="300"
                  @filter="filterTimezone"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        未找到匹配的时区
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12">
            <div class="form-item row items-start">
              <div class="form-label col-sm-2">地址</div>
              <div class="form-input col-sm-10">
                <q-input
                  outlined
                  type="textarea"
                  rows="3"
                  v-model="warehouseForm.address"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">联系人</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.contact_user"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">联系电话</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.contact_phone"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-mb-md">
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">联系邮箱</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.contact_email"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-item row items-center">
              <div class="form-label col-sm-4">币种</div>
              <div class="form-input col-sm-8">
                <q-input
                  outlined
                  dense
                  v-model="warehouseForm.currency"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <div class="form-item row items-start">
              <div class="form-label col-sm-2">备注</div>
              <div class="form-input col-sm-10">
                <q-input
                  outlined
                  type="textarea"
                  rows="3"
                  v-model="warehouseForm.remark"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>
        </div>
      </q-form>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch, computed } from "vue";
import { useQuasar } from "quasar";
import Dialog from "@/components/Dialog.vue";
import warehouseApi from "@/api/warehouse";
import { useStore } from "vuex";
import api from "@/api";

const store = useStore();
const $q = useQuasar();
const emit = defineEmits(["update:modelValue", "created", "updated"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  warehouseData: {
    type: Object,
    default: () => ({}),
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  cancelShow: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "800px",
  },
});

// 表单标题
const formTitle = computed(() => (props.editMode ? "编辑仓库" : "新建仓库"));

// 控制对话框显示
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 仓库表单数据
const warehouseForm = ref({
  name: "",
  type: "1",
  domain: "",
  code: "",
  country_code: "CN",
  province: "",
  city: "",
  street: "",
  door_no: "",
  postcode: "",
  address: "",
  contact_user: "",
  contact_phone: "",
  contact_email: "",
  timezone: "",
  currency: "",
  remark: "",
});

// 下拉选项

const filteredCountries = ref([]);
const countries = ref([]);
const filteredTimezones = ref([]);
const timezoneOptions = ref([]);

const filterCountries = (val, update) => {
  if (!val || val === "") {
    filteredCountries.value = countries.value;
    update();
    return;
  }

  const needle = val.toLowerCase();
  filteredCountries.value = countries.value.filter(
    (v) =>
      v.name.toLowerCase().includes(needle) ||
      v.code.toLowerCase().includes(needle)
  );
  update();
};

const filterTimezone = (val, update) => {
  if (!val || val === "") {
    filteredTimezones.value = timezoneOptions.value;
    update();
    return;
  }

  const needle = val.toLowerCase();
  filteredTimezones.value = timezoneOptions.value.filter(
    (v) =>
      v.label.toLowerCase().includes(needle) ||
      v.value.toLowerCase().includes(needle)
  );
  update();
};

const getCountries = () => {
  api.getCountries().then((res) => {
    if (res.success) {
      store.commit("SET_COUNTRIES", res.data);
      filteredCountries.value = res.data;
      countries.value = res.data;
    }
  });
};
const getTimezones = () => {
  api.getTimezones().then((res) => {
    if (res.success) {
      store.commit("SET_TIMEZONES", res.data);
      filteredTimezones.value = res.data;
      timezoneOptions.value = res.data;
    }
  });
};
getTimezones();
getCountries();

// 表单提交
const handleSubmit = () => {
  // 表单验证
  if (!warehouseForm.value.name) {
    $q.notify({
      message: "请输入仓库名称",
      color: "negative",
    });
    return;
  } else if (!warehouseForm.value.code) {
    $q.notify({
      message: "请输入仓库编号",
      color: "negative",
    });
    return;
  } else if (!warehouseForm.value.domain) {
    $q.notify({
      message: "请输入仓库域名",
      color: "negative",
    });
    return;
  } else if (!warehouseForm.value.country_code) {
    $q.notify({
      message: "请选择国家/地区",
      color: "negative",
    });
    return;
  }

  if (props.editMode) {
    // 编辑模式，调用更新API
    warehouseApi
      .updateWarehouse(props.warehouseData.id, {
        ...warehouseForm.value,
        type: 1,
      })
      .then((res) => {
        if (res.success) {
          visible.value = false;
          $q.notify({
            message: "仓库更新成功",
            color: "positive",
          });
          emit("updated", res.data);
        }
      });
  } else {
    // 新建模式，调用创建API
    warehouseApi
      .checkDomain({
        domain: warehouseForm.value.domain,
      })
      .then((res) => {
        if (res.success) {
          warehouseApi.createWarehouse(warehouseForm.value).then((res) => {
            if (res.success) {
              visible.value = false;
              $q.notify({
                message: "仓库创建成功",
                color: "positive",
              });
              emit("created", res.data);
            }
          });
        }
      });
  }
};

// 当处于编辑模式时，用传入的数据填充表单
watch(
  () => [props.editMode, props.warehouseData],
  () => {
    if (props.editMode && props.warehouseData) {
      warehouseForm.value = { ...props.warehouseData };
    }
  },
  { immediate: true }
);

// 对话框打开时重置表单
watch(
  () => visible.value,
  (val) => {
    if (val && !props.editMode) {
      warehouseForm.value = {
        name: "",
        type: "1",
        code: "",
        country_code: "",
        province: "",
        city: "",
        street: "",
        door_no: "",
        postcode: "",
        address: "",
        contact_user: "",
        contact_phone: "",
        contact_email: "",
        timezone: "",
        currency: "",
        remark: "",
      };
    }
  }
);
</script>

<style lang="scss" scoped>
// 仓库表单样式
.warehouse-form {
  font-size: 14px;
  .pb-20 {
    padding-bottom: 20px;
  }
  .form-label {
    color: #606266;
    text-align: right;
    padding-right: 12px;
    font-size: 14px;

    .required {
      color: #f44336;
      margin-left: 2px;
    }

    @media (max-width: 575px) {
      text-align: left;
      padding-bottom: 8px;
    }
  }

  .domain-input-group {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    height: 36px;
    padding: 0;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c0c4cc;
    }

    &:focus-within {
      border-color: var(--q-primary);
      box-shadow: 0 0 0 2px rgba(var(--q-primary), 0.1);
    }

    .prefix,
    .suffix {
      padding: 0 8px;
      font-size: 13px;
      color: #606266;
      background: #f2f3f5;
      height: 100%;
      display: flex;
      align-items: center;
      user-select: none;
    }

    .prefix {
      border-right: 1px solid #e5e7eb;
      border-radius: 4px 0 0 4px;
    }

    .suffix {
      border-left: 1px solid #e5e7eb;
      border-radius: 0 4px 4px 0;
    }

    .input-wrapper {
      flex: 1;

      :deep(.domain-input) {
        height: 34px;

        .q-field__control {
          height: 34px;
          min-height: 34px;
          padding: 0 8px;
          background: transparent;
          box-shadow: none !important;
        }

        .q-field__native {
          padding: 0;
        }

        input {
          font-size: 13px;
          color: #2c3e50;
        }

        &.q-field--outlined {
          .q-field__control {
            border: none;

            &:before,
            &:after {
              display: none;
            }
          }
        }
      }
    }
  }

  .form-input {
    :deep(.q-field__control) {
      height: 36px;
    }

    :deep(.q-field__marginal) {
      height: 36px;
    }
  }

  // 文本域高度调整
  :deep(.q-textarea) .q-field__control {
    height: auto;
  }

  // 移动端适配
  @media (max-width: 575px) {
    .form-item {
      flex-direction: column;
      align-items: flex-start !important;

      .form-label,
      .form-input {
        width: 100%;
      }
    }
  }
}
</style> 