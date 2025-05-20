<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="print-dialog-card">
      <q-card-section class="dialog-header q-pb-none flex flex-between">
        <div class="text-h6 flex-1">{{ trans("打印标签") }}</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-md dialog-content">
          <!-- 左侧参数设置 -->
          <div class="col-4 left-form">
            <div class="form-section">
              <div class="section-title">{{ trans("打印参数设置") }}</div>

              <div class="q-mb-md">
                <div class="field-label">
                  {{ trans("模板名称") }} <span class="text-red">*</span>
                </div>
                <q-select
                  v-model="form.template_id"
                  :options="templateList"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="field-input"
                />
              </div>

              <div class="q-mb-md">
                <div class="field-label">
                  {{ trans("纸张类型") }} <span class="text-red">*</span>
                </div>
                <div class="row">
                  <q-radio
                    v-model="form.paper_type"
                    val="roll"
                    :label="trans('卷纸')"
                    class="col-6"
                  />
                  <q-radio
                    v-model="form.paper_type"
                    val="flat"
                    :label="trans('平面纸')"
                    class="col-6"
                  />
                </div>
              </div>

              <template v-if="form.paper_type === 'roll'">
                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("排") }}<span class="text-red">*</span>
                  </div>
                  <q-input
                    v-model.number="form.columns"
                    type="number"
                    outlined
                    dense
                    min="1"
                    class="field-input"
                  />
                </div>

                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("边距") }}
                  </div>
                  <q-input
                    v-model.number="form.margin"
                    type="number"
                    outlined
                    dense
                    min="0"
                    class="field-input"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("水平间距") }}
                  </div>
                  <q-input
                    v-model.number="form.horizontal_spacing"
                    type="number"
                    outlined
                    dense
                    min="0"
                    class="field-input"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>
              </template>

              <template v-else>
                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("纸张宽度") }}<span class="text-red">*</span>
                  </div>
                  <q-input
                    v-model.number="form.paper_width"
                    type="number"
                    outlined
                    dense
                    min="1"
                    class="field-input"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("纸张高度") }}<span class="text-red">*</span>
                  </div>
                  <q-input
                    v-model.number="form.paper_height"
                    type="number"
                    outlined
                    dense
                    min="1"
                    class="field-input"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="field-label">
                    {{ trans("边距") }}
                  </div>
                  <q-input
                    v-model.number="form.margin"
                    type="number"
                    outlined
                    dense
                    min="0"
                    class="field-input"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>
              </template>
            </div>

            <div class="preview-box q-mt-lg">
              <div class="section-title">{{ trans("预览") }}</div>
              <div class="preview-content" :class="form.paper_type">
                <template v-if="form.paper_type === 'roll'">
                  <div class="roll-preview">
                    <div
                      class="margin-container"
                      :style="{
                        padding: `${form.margin * 0.3}px`,
                        backgroundColor:
                          form.margin > 0 ? '#e6f0fc' : 'transparent',
                      }"
                    >
                      <div class="labels-container">
                        <template
                          v-for="row in Math.ceil(form.columns / 2)"
                          :key="row"
                        >
                          <div class="label-row">
                            <div class="label-box" />
                            <div
                              v-if="(row - 1) * 2 + 2 <= form.columns"
                              class="horizontal-spacing"
                              :style="{
                                width: `${form.horizontal_spacing * 0.3}px`,
                                backgroundColor:
                                  form.horizontal_spacing > 0
                                    ? '#e6f0fc'
                                    : 'transparent',
                              }"
                            />
                            <div
                              v-if="(row - 1) * 2 + 2 <= form.columns"
                              class="label-box"
                            />
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="flat-preview"
                    :style="{
                      backgroundColor: '#e6f0fc',
                      padding: `${form.margin * 0.3}px`,
                    }"
                  >
                    <div
                      class="preview-content"
                      :style="{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                      }"
                    >
                      <div class="label-row">
                        <template v-for="col in getPreviewColumns" :key="col">
                          <div
                            class="label-box"
                            :style="{
                              width: '40px',
                              minWidth: '40px',
                            }"
                          />
                          <div
                            v-if="col < getPreviewColumns"
                            class="label-spacing"
                            :style="{
                              width: `${getLabelSpacing * 0.3}px`,
                              backgroundColor: '#e6f0fc',
                            }"
                          />
                        </template>
                      </div>

                      <div
                        class="row-spacing"
                        :style="{
                          width: '100%',
                          height: '3px',
                          backgroundColor: '#e6f0fc',
                        }"
                      />

                      <div class="label-row">
                        <template v-for="col in getPreviewColumns" :key="col">
                          <div
                            class="label-box"
                            :style="{
                              width: '40px',
                              minWidth: '40px',
                            }"
                          />

                          <div
                            v-if="col < getPreviewColumns"
                            class="label-spacing"
                            :style="{
                              width: `${getLabelSpacing * 0.3}px`,
                              backgroundColor: '#e6f0fc',
                            }"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 右侧商品列表 -->
          <div class="col-8 right-table">
            <div class="section-title">{{ trans("打印项目") }}</div>

            <!-- 货架位打印表格 -->
            <q-table
              v-if="printType == 'goods_allocation'"
              :rows="form.specs"
              :columns="goodsAllocationColumns"
              row-key="code"
              bordered
              flat
              :pagination="{ rowsPerPage: 0 }"
              :loading="loading"
              hide-bottom
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    class="table-icon"
                    @click="removePrintItem(props.rowIndex)"
                  >
                    <img src="@/assets/images/del.png" />
                    <q-tooltip>
                      {{ trans("删除") }}
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:body-cell-qty="props">
                <q-td :props="props" class="text-center">
                  <div class="flex justify-center">
                    <q-input
                      v-model.number="props.row.qty"
                      type="number"
                      outlined
                      dense
                      min="1"
                      class="qty-input"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>

            <!-- 入库打印表格 -->
            <div v-if="printType == 'inbound'">
              <!-- <div class="batch-buttons q-mb-sm">
                <span class="q-mr-md">{{ trans("打印数量") }}:</span>
                <q-btn
                  outline
                  color="primary"
                  :label="trans('填入收货数量')"
                  dense
                  size="sm"
                  class="q-mr-sm"
                  @click="fillAllReceivedQuantity"
                />
                <q-btn
                  outline
                  color="primary"
                  :label="trans('填入待收货数量')"
                  dense
                  size="sm"
                  @click="fillAllPendingQuantity"
                />
                <q-btn
                  outline
                  color="primary"
                  :label="trans('批量设置')"
                  dense
                  size="sm"
                  class="q-ml-sm"
                  @click="batch"
                />
              </div> -->

              <q-table
                :rows="form.specs"
                :columns="inboundColumns"
                row-key="sku"
                bordered
                flat
                :pagination="{ rowsPerPage: 0 }"
                :loading="loading"
                hide-bottom
              >
                <template v-slot:header-cell-pending_quantity="props">
                  <q-th :props="props">
                    {{ trans("待收货数量") }}
                    <div
                      @click="fillAllPendingQuantity"
                      class="primary-text-btn"
                    >
                      ({{ trans("全部") }})
                    </div>
                  </q-th>
                </template>

                <template v-slot:header-cell-received_quantity="props">
                  <q-th :props="props">
                    {{ trans("收货数量") }}
                    <div
                      @click="fillAllReceivedQuantity"
                      class="primary-text-btn"
                    >
                      ({{ trans("全部") }})
                    </div>
                  </q-th>
                </template>

                <template v-slot:header-cell-qty="props">
                  <q-th :props="props">
                    {{ trans("打印数量") }}
                    <div @click="batch" class="primary-text-btn">
                      ({{ trans("批量设置") }})
                    </div>
                  </q-th>
                </template>

                <!-- 商品信息 -->
                <template v-slot:body-cell-product="props">
                  <q-td :props="props">
                    <div class="row items-center">
                      <q-img
                        :src="props.row.product_spec_image"
                        @error="imgError"
                        style="width: 40px; height: 40px; margin-right: 8px"
                      />
                      <div style="width: 150px; text-align: left">
                        <div class="text-weight-medium">
                          {{ props.row.sku }}
                        </div>
                        <div class="text-caption text-grey-8">
                          {{ props.row.product_name }}
                        </div>
                        <div class="text-caption">{{ props.row.name }}</div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-qty="props">
                  <q-td :props="props" class="text-center">
                    <q-input
                      v-model.number="props.row.qty"
                      type="number"
                      outlined
                      dense
                      min="0"
                      class="qty-input"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="text-center">
                    <q-btn
                      flat
                      round
                      color="grey-7"
                      class="table-icon"
                      @click="removePrintItem(props.rowIndex)"
                    >
                      <img src="@/assets/images/del.png" />
                      <q-tooltip>
                        {{ trans("删除") }}
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>

            <!-- SKU打印表格 -->
            <q-table
              v-if="printType == 'print_sku'"
              :rows="form.specs"
              :columns="skuColumns"
              row-key="sku"
              bordered
              flat
              :pagination="{ rowsPerPage: 0 }"
              :loading="loading"
              hide-bottom
            >
              <template v-slot:header-cell-qty="props">
                <q-th :props="props">
                  {{ trans("打印数量") }}
                  <div @click="batch" class="primary-text-btn">
                    ({{ trans("批量设置") }})
                  </div>
                </q-th>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <q-img
                      :src="props.row.product_spec_image"
                      @error="imgError"
                      style="width: 40px; height: 40px; margin-right: 8px"
                    />
                    <div style="width: 150px; text-align: left">
                      <div>
                        {{ props.row.sku }}
                      </div>
                      <div class="text-overflow-2">
                        {{ props.row.name }}
                      </div>

                      <div>
                        {{ props.row.product_name }}
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-qty="props">
                <q-td :props="props" align="center">
                  <div class="flex justify-center">
                    <q-input
                      v-model.number="props.row.qty"
                      type="number"
                      outlined
                      dense
                      min="1"
                      class="qty-input"
                    />
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    flat
                    round
                    size="sm"
                    class="table-icon"
                    @click="removePrintItem(props.rowIndex)"
                  >
                    <img src="@/assets/images/del.png" />
                    <q-tooltip>
                      {{ trans("删除") }}
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
        <q-btn
          :label="trans('打印')"
          color="primary"
          :loading="loading"
          :disable="!form.specs.length"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 批量设置数量 -->
  <BatchSkuQty ref="batchSkuQtyRef" @confirm="handleBatchQty" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import settingApi from "@/api/setting";
import productApi from "@/api/product";
import BatchSkuQty from "@/components/BatchSkuQty.vue";
import trans from "@/i18n";

const props = defineProps({
  modelValue: Boolean,
  skuList: {
    type: Array,
    default: () => [],
  },
  printType: {
    type: String,
    default: "print_sku",
  },
});

const emit = defineEmits(["update:modelValue", "success"]);
const batchSkuQtyRef = ref(null);
const dialogVisible = ref(false);
const loading = ref(false);

// 表格列定义
const goodsAllocationColumns = [
  {
    name: "code",
    align: "center",
    label: trans("货架位编号"),
    field: "code",
  },
  {
    name: "qty",
    align: "center",
    label: trans("打印数量") + "*",
    field: "qty",
  },
  {
    name: "actions",
    align: "center",
    label: trans("操作"),
    field: "actions",
  },
];

const inboundColumns = [
  {
    name: "product",
    align: "center",
    label: trans("商品SKU"),
    field: "sku",
  },
  {
    name: "received_quantity",
    align: "center",
    label: trans("收货数量"),
    field: "received_quantity",
  },
  {
    name: "pending_quantity",
    align: "center",
    label: trans("待收货数量"),
    field: (row) => row.quantity - (row.received_quantity || 0),
  },
  {
    name: "qty",
    align: "center",
    label: trans("打印数量") + "*",
    field: "qty",
  },
  {
    name: "actions",
    align: "center",
    label: trans("操作"),
    field: "actions",
  },
];

const skuColumns = [
  // {
  //   name: "sku",
  //   align: "left",
  //   label: trans("商品SKU"),
  //   field: "sku",
  // },
  {
    name: "name",
    align: "center",
    label: trans("商品信息"),
    field: "name",
  },
  {
    name: "qty",
    align: "center",
    label: trans("打印数量") + "*",
    field: "qty",
  },
  {
    name: "actions",
    align: "center",
    label: trans("操作"),
    field: "actions",
  },
];

const form = ref({
  template_id: 1,
  template_type: "warehouse_location",
  paper_type: "roll",
  margin: 1,
  columns: 1,
  horizontal_spacing: 2,
  paper_width: 42,
  paper_height: 32,
  specs: [],
});

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
  }
);

watch(
  () => dialogVisible.value,
  (val) => {
    emit("update:modelValue", val);
    if (val) {
      console.log("props.skuList", props.skuList);

      // 初始化打印规格
      if (props.printType == "goods_allocation") {
        form.value.specs = props.skuList.map((item) => ({
          code: item.code,
          image: item.image,
          qty: 1,
        }));
      } else if (props.printType == "inbound") {
        form.value.specs = props.skuList.map((item) => ({
          sku: item.product_spec_sku,
          received_quantity: item.received_quantity || 0,
          quantity: item.quantity,
          product_spec_image: item.product_spec_image,
          product_name: item.product_name,
          product_spec_sku: item.product_spec_sku,
          qty: 0,
          name: item.product_spec_name,
        }));
      } else if (props.printType == "print_sku") {
        form.value.specs = props.skuList.map((item) => ({
          sku: item.product_spec_sku,
          qty: 1,
          product_name: item.product_name,
          name: item.name,
          product_spec_image: item.product_spec_image,
        }));
      }
    }
  }
);
const templateList = ref([]);
const getPrintLabelTemplateList = () => {
  settingApi
    .getPrintLabelTemplateList({
      type: "warehouse_location",
    })
    .then((res) => {
      if (res.success) {
        templateList.value = res.data;
      }
    });
};
getPrintLabelTemplateList();

// 移除打印项
const removePrintItem = (index) => {
  form.value.specs.splice(index, 1);
  if (form.value.specs.length === 0) {
    dialogVisible.value = false;
  }
};

// 处理打印提交
const handleSubmit = async () => {
  try {
    loading.value = true;
    let response = null;
    // 构建提交数据
    const submitData = {
      template_id: form.value.template_id,
      template_type: form.value.template_type,
      paper_type: form.value.paper_type,
      margin: form.value.margin,
    };

    // 根据纸张类型添加不同的参数
    if (form.value.paper_type === "roll") {
      submitData.columns = form.value.columns;
      submitData.horizontal_spacing = form.value.horizontal_spacing;
    } else {
      submitData.paper_width = form.value.paper_width;
      submitData.paper_height = form.value.paper_height;
    }
    if (props.printType == "goods_allocation") {
      response = await settingApi.productsLabels({
        ...submitData,
        items: form.value.specs,
      });
    } else if (props.printType == "print_sku") {
      submitData.template_type = "sku";
      response = await productApi.printSku({
        ...submitData,
        specs: form.value.specs.map((item) => ({
          sku: item.sku,
          qty: item.qty,
          product_name: item.product_name,
          name: item.name,
        })),
      });
    } else {
      submitData.template_type = "sku";
      response = await productApi.printSku({
        ...submitData,
        specs: form.value.specs.map((item) => ({
          sku: item.product_spec_sku,
          qty: item.qty,
          product_name: item.product_name,
          name: item.name,
        })),
      });
    }
    if (response.success) {
      window.open(response.data.data, "_blank");
      dialogVisible.value = false;
      emit("success");
    }
  } catch (error) {
    console.error("打印标签失败:", error);
  } finally {
    loading.value = false;
  }
};

// 计算每页能显示多少个标签
const getPreviewLabelCount = computed(() => {
  if (form.value.paper_type === "flat") {
    const labelWidth = 40; // 标签宽度(mm)
    const labelHeight = 30; // 标签高度(mm)
    const margin = form.value.margin || 0;

    // 计算可用区域
    const availableWidth = form.value.paper_width - margin * 2;
    const availableHeight = form.value.paper_height - margin * 2;

    // 计算每行/列可以放置的标签数
    const cols = Math.floor(availableWidth / labelWidth);
    const rows = Math.floor(availableHeight / labelHeight);

    return cols * rows;
  }
  return 6; // 默认显示6个
});

// 计算平面纸每行能显示多少个标签
const getPreviewColumns = computed(() => {
  if (form.value.paper_type === "flat") {
    const labelWidth = 40; // 标签宽度(mm)
    const margin = form.value.margin || 0;

    // 计算可用宽度
    const availableWidth = form.value.paper_width - margin * 2;

    // 计算可以放置的标签数
    const count = Math.floor(availableWidth / labelWidth);
    console.log("每行标签数：", count); // 添加日志
    return count;
  }
  return 3;
});

// 计算标签之间的间距(mm)
const getLabelSpacing = computed(() => {
  if (form.value.paper_type === "flat") {
    const labelWidth = 40; // 标签宽度(mm)
    const margin = form.value.margin || 0;
    const availableWidth = form.value.paper_width - margin * 2;
    const labelCount = getPreviewColumns.value;

    if (labelCount <= 1) return 0;

    // 计算剩余空间平均分配给间距
    const totalWidth = labelWidth * labelCount;
    const remainingSpace = availableWidth - totalWidth;

    // 平均分配间距
    const spacing = remainingSpace / (labelCount - 1);
    console.log("标签间距：", spacing); // 添加日志
    return spacing;
  }
  return 0;
});

// 填充所有收货数量
const fillAllReceivedQuantity = () => {
  form.value.specs = form.value.specs.map((spec, index) => ({
    ...spec,
    qty: props.skuList[index].received_quantity || 0,
  }));
};

// 填充所有待收货数量
const fillAllPendingQuantity = () => {
  form.value.specs = form.value.specs.map((spec, index) => ({
    ...spec,
    qty:
      props.skuList[index].quantity -
      (props.skuList[index].received_quantity || 0),
  }));
};

const imgError = (e) => {
  console.log("e", e);
  // e.target.src = "@/assets/images/login/login-bg.png";
};

const batch = () => {
  batchSkuQtyRef.value.open();
};

const handleBatchQty = (qty) => {
  console.log("qty", qty);
  form.value.specs = form.value.specs.map((spec, index) => {
    spec.qty = qty;
    return spec;
  });
};
</script>

<style lang="scss" scoped>
.print-dialog-card {
  width: 95vw;
  max-width: 1200px;
  min-width: 800px;
  overflow: hidden;

  .dialog-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .dialog-content {
    padding: 0 16px;
    height: 65vh;
    overflow-y: hidden;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section {
  background: #fafafa;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
}

.preview-content {
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 160px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .roll-preview {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;

    .margin-container {
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .labels-container {
      background: transparent;
    }

    .label-row {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }

    .horizontal-spacing {
      height: 30px;
      min-width: 4px;
      transition: all 0.3s ease;
    }

    .label-box {
      width: 40px;
      height: 30px;
      border: 1px solid #a8d5ff;
      background: #fff;
      flex-shrink: 0;
    }
  }

  .flat-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;

    .preview-content {
      overflow: hidden;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
      min-width: fit-content;
    }

    .label-box {
      height: 30px;
      border: 1px solid #a8d5ff;
      background: #fff;
      flex-shrink: 0;
    }

    .label-spacing {
      height: 30px;
      flex-shrink: 0;
    }
  }
}

.text-red {
  color: #ff0000;
}

.left-form {
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
  max-height: 65vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 6px;
  }
}

.right-table {
  max-height: 65vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 6px;
  }

  .qty-input {
    width: 80px;
  }

  :deep(.q-table) {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-size: 14px;
      font-weight: 500;
    }

    td {
      color: #606266;
    }
  }
}

.batch-buttons {
  display: flex;
  align-items: center;
}

.primary-text-btn {
  color: #5745c5;
  cursor: pointer;
}
</style> 