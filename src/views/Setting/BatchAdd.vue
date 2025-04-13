<template>
  <div class="batch-add-page">
    <!-- 顶部操作栏 -->
    <div class="row justify-between items-center bg-white q-pa-sm">
      <div class="row items-center">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="primary"
          class="q-mr-sm"
          @click="$router.back()"
        />
        <div class="text-subtitle1">新建货架位 > 批量添加</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn outline color="primary" label="取消" @click="$router.back()" />
        <q-btn
          unelevated
          color="primary"
          label="保存"
          :loading="$store.state.btnLoading"
          @click="handleSubmit"
        />
      </div>
    </div>

    <div class="content">
      <div class="bg-white rounded-borders q-pa-lg">
        <div class="text-subtitle2 q-mb-md">货架位信息</div>
        <q-form @submit="handlePreview" class="location-form">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <div class="form-label">
                  货区类型 <span class="required">*</span>
                </div>
                <q-select
                  outlined
                  dense
                  v-model="area_type"
                  :options="$store.state.areaTypeOptions"
                  placeholder="请选择"
                  @update:model-value="getGoodsAreaList"
                  emit-valu
                  :rules="[(val) => !!val || '请选择货区类型']"
                >
                  <template v-slot:selected>
                    {{
                      $store.state.areaTypeOptions.find(
                        (item) => item.value === area_type.value
                      )?.label || "请选择"
                    }}
                  </template>
                </q-select>
              </div>
            </div>

            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <div class="form-label">
                  货区编号 <span class="required">*</span>
                </div>
                <q-select
                  outlined
                  dense
                  v-model="formData.warehouse_area_id"
                  :options="areaCodeOptions"
                  option-label="code"
                  option-value="id"
                  emit-value
                  placeholder="请选择"
                  :rules="[(val) => !!val || '请选择货区编号']"
                >
                  <template v-slot:selected>
                    {{
                      areaCodeOptions.find(
                        (item) => item.id === formData.warehouse_area_id
                      )?.code || "请选择"
                    }}
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <div class="form-label">
                  货架位 <span class="required">*</span>
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col">
                    <q-input
                      outlined
                      dense
                      v-model="formData.prefix"
                      placeholder="前缀"
                      :rules="[(val) => !!val || '请输入前缀']"
                    />
                  </div>
                  <div class="col">
                    <q-input
                      outlined
                      dense
                      v-model="formData.columns"
                      placeholder="列"
                      :rules="[(val) => !!val || '请输入列']"
                    />
                  </div>
                  <div class="col">
                    <q-input
                      outlined
                      dense
                      v-model="formData.levels"
                      placeholder="行"
                      :rules="[(val) => !!val || '请输入行']"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <div class="form-label">
                  连字符 <span class="required">*</span>
                </div>
                <q-input
                  outlined
                  dense
                  v-model="formData.connector"
                  placeholder="-"
                  :rules="[(val) => !!val || '请输入连字符']"
                />
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <div class="form-label">拣货优先级</div>
                <q-input
                  outlined
                  dense
                  type="number"
                  v-model.number="formData.sort"
                  placeholder="请输入"
                />
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <q-checkbox
                  v-model="formData.allow_mixed_products"
                  label="商品混放"
                  color="primary"
                  class="custom-checkbox"
                  :true-value="1"
                  :false-value="0"
                >
                  <q-icon name="help_outline" class="q-ml-xs cursor-pointer">
                    <q-tooltip
                      >勾选此按钮，则货架位支持多个商品存放，未勾选则货架位只支持单个商品存放</q-tooltip
                    >
                  </q-icon>
                </q-checkbox>
              </div>
            </div>

            <div class="col-xs-12 col-sm-4">
              <div class="form-item">
                <q-checkbox
                  v-model="formData.allow_mixed_batches"
                  label="批次混放"
                  color="primary"
                  class="custom-checkbox"
                  :true-value="1"
                  :false-value="0"
                >
                  <q-icon name="help_outline" class="q-ml-xs cursor-pointer">
                    <q-tooltip
                      >勾选此按钮，则货架位上单个商品多个入库批次支持存放，未勾选则只支持单个商品单个入库批次存放</q-tooltip
                    >
                  </q-icon>
                </q-checkbox>
              </div>
            </div>
          </div>

          <div class="row justify-center q-mt-lg items-center">
            <q-btn
              outline
              color="primary"
              label="预览"
              class="q-px-xl"
              type="submit"
            />
            <div class="q-ml-md">
              货架位编号格式为：前缀-列-层，如A01-01-01，点击“预览”可查看批量创建效果
            </div>
          </div>
        </q-form>

        <!-- 预览区域 -->
        <div v-if="previewList.length" class="preview-section q-mt-xl">
          <div class="text-subtitle2 q-mb-md">预览</div>
          <div class="preview-grid">
            <div
              v-for="(item, index) in previewList"
              :key="index"
              class="grid-item"
            >
              {{ item.code }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import settingApi from "@/api/setting";

const $q = useQuasar();
const router = useRouter();
const area_type = ref("");
// 表单数据
const formData = ref({
  warehouse_area_id: "",
  prefix: "",
  columns: "",
  levels: "",
  connector: "-",
  sort: "",
  allow_mixed_products: 1,
  allow_mixed_batches: 1,
});

// 选项数据
const areaCodeOptions = ref([]);
const specOptions = ref([]);

// 获取货区列表
const getGoodsAreaList = () => {
  settingApi
    .getGoodsAreaList({
      area_type: area_type.value.value,
    })
    .then((res) => {
      if (res.success) {
        areaCodeOptions.value = res.data.items;
      }
    });
};
// 获取货架规格列表
const getShelfSizeList = () => {
  settingApi.getShelfSpecList().then((res) => {
    if (res.success) {
      specOptions.value = res.data;
    }
  });
};

getShelfSizeList();

const previewList = ref([]);

// 生成预览数据
const generatePreviewList = () => {
  const list = [];
  const { prefix, columns, levels, connector } = formData.value;

  for (let r = 1; r <= parseInt(columns); r++) {
    for (let l = 1; l <= parseInt(levels); l++) {
      const code = `${prefix}${connector}${String(r).padStart(
        2,
        "0"
      )}${connector}${String(l).padStart(2, "0")}`;
      list.push({
        code,
        warehouse_area_id: formData.value.warehouse_area_id,
        sort: formData.value.sort,
        allow_mixed_products: formData.value.allow_mixed_products,
        allow_mixed_batches: formData.value.allow_mixed_batches,
      });
    }
  }

  return list;
};

// 预览
const handlePreview = () => {
  if (
    !formData.value.prefix ||
    !formData.value.columns ||
    !formData.value.levels
  ) {
    $q.notify({
      message: "请填写完整的货架位信息",
      color: "negative",
    });
    return;
  }

  previewList.value = generatePreviewList();
};

// 提交
const handleSubmit = () => {
  settingApi.batchCreateShelfLocation(formData.value).then((res) => {
    if (res.success) {
      $q.notify({
        message: "批量创建成功",
        color: "positive",
      });
      router.back();
    }
  });
};
</script>

<style lang="scss" scoped>
.batch-add-page {
  .content {
    margin-top: 20px;
  }

  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      margin-bottom: 8px;
      font-weight: 500;

      .required {
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }

  .custom-checkbox {
    :deep(.q-checkbox__inner) {
      &:before {
        border-radius: 0;
      }

      .q-checkbox__bg {
        border-radius: 0;
      }
    }
  }

  .preview-section {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    padding-top: 24px;

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;

      .grid-item {
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        padding: 12px;
        text-align: center;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
}
</style>