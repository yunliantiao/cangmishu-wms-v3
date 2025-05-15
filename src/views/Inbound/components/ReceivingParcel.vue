<template>
  <div class="products-section bg-white rounded-borders">
    <div class="table-head">
      <span>
        {{ trans("收货商品") }}
      </span>

      <span class="table-number">
        {{ trans("商品类目/商品总数") }} : {{ totalItems }} /{{ totalItems }}
      </span>
    </div>

    <!-- 商品表格 -->
    <q-table
      :rows="products"
      :columns="columns"
      row-key="id"
      flat
      separator="horizontal"
      selection="multiple"
      v-model:selected="selectedProducts"
      :loading="loading"
      :pagination="{ rowsPerPage: 50 }"
      @update:pagination="handlePaginationUpdate"
      hide-bottom
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-model="props.selected" size="sm" />
          </q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            align="center"
            :props="props"
            :class="{ 'text-primary': col.subLabel }"
          >
            {{ col.label }}
            <span
              v-if="col.subLabel"
              class="table-filter"
              @click="
                col.name === 'dimensions'
                  ? showBatchDimensionsDialog()
                  : col.name === 'weight'
                  ? showBatchWeightDialog()
                  : col.name === 'receivedQuantity'
                  ? fillAllQuantities()
                  : col.name === 'shelfQty'
                  ? fillAllShelfQuantities()
                  : null
              "
            >
              ({{ col.subLabel }})
            </span>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" size="sm" />
          </q-td>
          <q-td key="product" :props="props">
            <div class="product-info">
              <div class="product-name">
                {{ props.row.product_name }}
              </div>
              <div class="product-sku">
                {{ props.row.product_spec_sku }}
              </div>
              <div class="product-spec">
                {{ props.row.product_spec_name }}
              </div>
            </div>
          </q-td>
          <q-td key="dimensions" :props="props">
            <div class="flex">
              <div class="dimensions-row">
                <q-input
                  dense
                  borderless
                  style="height: 34px; margin: 0 !important; width: 60px"
                  size="sm"
                  type="number"
                  v-model="props.row.size_length"
                  class="input-spacing"
                />
                <q-input
                  dense
                  borderless
                  style="height: 34px; margin: 0 !important; width: 60px"
                  size="sm"
                  type="number"
                  v-model="props.row.size_width"
                  class="input-spacing"
                />
                <q-input
                  dense
                  borderless
                  size="sm"
                  type="number"
                  style="height: 34px; margin: 0 !important; width: 60px"
                  v-model="props.row.size_height"
                  class="input-spacing"
                />
                <div class="cm-text">CM</div>
              </div>
            </div>
            <div class="text-description">
              {{ trans("客户申报") }}:
              {{ props.row.product_spec_size_length }} ×
              {{ props.row.product_spec_size_width }} ×
              {{ props.row.product_spec_size_height }} cm
            </div>
            <div
              class="text-description"
              :class="{ 'text-negative': hasVolumeDiff(props.row) }"
            >
              {{ trans("体积") }}: {{ updateVolume(props.row) }}
            </div>
          </q-td>
          <q-td key="weight" :props="props">
            <!-- <div class="weight-row">
              <div class="col mr-1">
                <q-input
                  dense
                  outlined
                  type="number"
                  v-model="props.row.product_spec_actual_weight"
                  @update:model-value="checkWeightDiff(props.row)"
                  class="input-spacing"
                />
              </div>
              <div class="col-auto px-1">g</div>
            </div> -->

            <div class="flex">
              <div class="dimensions-row">
                <q-input
                  dense
                  borderless
                  style="height: 34px; margin: 0 !important; width: 60px"
                  size="sm"
                  type="number"
                  v-model="props.row.product_spec_actual_weight"
                  class="input-spacing"
                  @update:model-value="checkWeightDiff(props.row)"
                />
                <div class="cm-text">G</div>
              </div>
            </div>
            <div class="text-description">
              {{ trans("申报") }}: {{ props.row.product_spec_weight }} g
            </div>
          </q-td>
          <q-td key="quantityExpected" :props="props">
            <div class="flex-center">
              <div>
                <div class="text-center">
                  {{ props.row.quantity }}
                </div>
                <div>
                  <span class="success_num">{{
                    props.row.received_quantity
                  }}</span>
                  /{{ props.row.quantity }}
                </div>
              </div>
            </div>
          </q-td>
          <q-td key="receivedQuantity" align="center" :props="props">
            <!-- <q-input
              dense
              outlined
              type="number"
              v-model="props.row.put_away_quantity"
              min="0"
              :max="props.row.quantity"
              class="input-spacing"
            /> -->
            <div class="flex-center">
              <div class="dimensions-row">
                <q-input
                  dense
                  borderless
                  style="height: 34px; margin: 0 !important; width: 100px"
                  size="sm"
                  min="0"
                  type="number"
                  v-model="props.row.put_away_quantity"
                  class="input-spacing"
                />
              </div>
            </div>
          </q-td>
          <q-td key="shelfLocation" :props="props">
            <div class="shelf-location-cell">
              <div class="huogui-box">
                <div
                  v-for="(shelf, index) in props.row.shelfLocations || []"
                  :key="index"
                  class="shelf-item q-mb-xs"
                >
                  <div class="select-input">
                    <q-select
                      dense
                      v-model="shelf.location"
                      :options="shelfLocationOptions"
                      option-label="code"
                      option-value="id"
                      fill-input
                      use-input
                      hide-selected
                      borderless
                      input-debounce="0"
                      @filter="filterShelfLocations"
                      class="huojia-select"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            {{ trans("未找到匹配的货架位") }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <div class="shelf-qty-item">
                      <q-input
                        borderless
                        dense
                        :placeholder="trans('数量')"
                        type="number"
                        v-model="shelf.quantity"
                        class="huojia-input"
                      />
                    </div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="clear"
                    size="ms"
                    @click="removeShelfLocation(props.row, index)"
                    class="delete-btn"
                    :disabled="props.row.shelfLocations.length <= 1"
                  />
                </div>
              </div>
              <div
                class="text-description add-btn"
                @click="addShelfLocation(props.row)"
              >
                {{ trans("添加货架位") }}
              </div>
            </div>
          </q-td>
          <!-- <q-td key="shelfQty" :props="props">
            <div class="shelf-qty-cell">
              <div
                v-for="(shelf, index) in props.row.shelfLocations || []"
                :key="index"
                class="shelf-qty-item q-mb-xs"
              >
                <q-input
                  dense
                  outlined
                  type="number"
                  v-model="shelf.quantity"
                  class="shelf-qty-input input-spacing"
                />
              </div>
            </div>
          </q-td> -->
        </q-tr>
      </template>
    </q-table>
  </div>
  <!-- 批量设置尺寸对话框 -->
  <q-dialog v-model="showDimensionsDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ trans("批量设置尺寸") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <q-radio
            v-model="batchDimensions.mode"
            val="customer"
            :label="trans('应用客户申报尺寸')"
          />
        </div>
        <div class="q-mb-md">
          <q-radio
            v-model="batchDimensions.mode"
            val="manual"
            :label="trans('统一修改为')"
          />
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-4">
            <q-input
              outlined
              v-model="batchDimensions.length"
              :label="trans('长')"
              type="number"
              dense
              class="input-spacing"
              :disable="batchDimensions.mode !== 'manual'"
            >
              <template v-slot:append>
                <div class="text-grey-8">cm</div>
              </template>
            </q-input>
          </div>
          <div class="col-4">
            <q-input
              outlined
              v-model="batchDimensions.width"
              :label="trans('宽')"
              type="number"
              dense
              class="input-spacing"
              :disable="batchDimensions.mode !== 'manual'"
            >
              <template v-slot:append>
                <div class="text-grey-8">cm</div>
              </template>
            </q-input>
          </div>
          <div class="col-4">
            <q-input
              outlined
              v-model="batchDimensions.height"
              :label="trans('高')"
              type="number"
              dense
              class="input-spacing"
              :disable="batchDimensions.mode !== 'manual'"
            >
              <template v-slot:append>
                <div class="text-grey-8">cm</div>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          :label="trans('确认')"
          color="primary"
          @click="applyBatchDimensions"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 批量设置重量对话框 -->
  <q-dialog v-model="showWeightDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ trans("批量设置重量") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div>
          <q-radio
            v-model="batchWeight.mode"
            val="customer"
            :label="trans('应用客户申报重量')"
          />
        </div>
        <div class="q-mb-md">
          <q-radio
            v-model="batchWeight.mode"
            val="manual"
            :label="trans('统一修改为')"
          />

          <q-input
            :disable="batchWeight.mode !== 'manual'"
            outlined
            v-model="batchWeight.weight"
            :label="trans('重量')"
            type="number"
            dense
            class="q-mt-sm"
          >
            <template v-slot:append>
              <div class="text-grey-8">g</div>
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          :label="trans('确认')"
          color="primary"
          @click="applyBatchWeight"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, watch } from "vue";
import { useQuasar } from "quasar";
import trans from "@/i18n";

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  shelfLocationOptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update-volume",
  "add-shelf-location",
  "remove-shelf-location",
  "batch-dimensions",
  "batch-weight",
  "print-selected",
  "print-all",
  "product-scan",
  "update-products",
]);

const $q = useQuasar();

// 状态变量
const productScanCode = ref("");
const scanType = ref(trans("逐个扫描"));
const scanTypeOptions = [trans("逐个扫描"), trans("批量扫描")];
const selectedProducts = ref([]);
const viewMode = ref("list");
const productScanning = ref(false);
const showDimensionsDialog = ref(false);
const showWeightDialog = ref(false);
const batchDimensions = reactive({
  length: null,
  width: null,
  height: null,
  mode: "customer", // 'manual': 手动输入, 'customer': 应用客户申报尺寸, 'uniform': 统一修改为相同尺寸
  uniformSize: null, // 统一尺寸值
});
const batchWeight = reactive({
  weight: null,
  mode: "customer", // 'manual': 手动输入, 'customer': 应用客户申报重量
});

// 分页配置
const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// 计算属性
const totalItems = computed(() => {
  return props.products.length;
});

// 表格列定义
const columns = [
  {
    name: "product",
    required: true,
    label: trans("商品"),
    align: "left",
    field: "product",
  },
  {
    name: "dimensions",
    align: "center",
    label: trans("实际体积"),
    subLabel: trans("全部"),
    field: "dimensions",
  },
  {
    name: "weight",
    align: "center",
    label: trans("实际重量"),
    subLabel: trans("全部"),
    field: "weight",
  },
  {
    name: "quantityExpected",
    align: "center",
    label: trans("待收货数量"),
    field: "quantity",
  },
  {
    name: "receivedQuantity",
    align: "center",
    label: trans("本次收货数量"),
    subLabel: trans("全部"),
    field: "received_quantity",
  },
  {
    name: "shelfLocation",
    align: "center",
    label: trans("上架货架位*数量"),
  },
  // {
  //   name: "shelfQty",
  //   align: "center",
  //   label: trans("上架数量"),
  //   subLabel: trans("全部"),
  //   field: "shelfQty",
  // },
];

const receivedAuantity = (receivedQuantity) => {
  let result = 0;
  if (receivedQuantity) {
    result = JSON.parse(receivedQuantity);
  }
  return result || 0;
};
// 方法
const handleProductScan = async () => {
  if (!productScanCode.value || productScanning.value) return;

  productScanning.value = true;
  try {
    emit("product-scan", {
      code: productScanCode.value,
      scanType: scanType.value,
    });

    // 成功后清空
    productScanCode.value = "";
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "扫描失败，请重试",
      position: "top",
    });
  } finally {
    productScanning.value = false;
  }
};

/**
 * 更新商品体积计算的函数
 *
 * @param {Object} row - 商品数据行对象
 */
const updateVolume = (row) => {
  const volumeInCubicCm =
    row.product_spec_size_length *
    row.product_spec_size_width *
    row.product_spec_size_height;
  row.calculatedVolume = `${volumeInCubicCm.toFixed(2)} cm³`;
  return row.calculatedVolume;
};

const checkWeightDiff = (row) => {
  // 实现重量差异检查逻辑
  return false;
};

const hasVolumeDiff = (row) => {
  // 实现体积差异检查逻辑
  return false;
};

const isPartiallyReceived = (row) => {
  return row.received_quantity < row.quantity;
};

const removeShelfLocation = (row, index) => {
  // 添加防御性检查
  if (!row) {
    console.error("removeShelfLocation: row is undefined");
    return;
  }

  if (!row.shelfLocations) {
    console.error("removeShelfLocation: row.shelfLocations is undefined");
    row.shelfLocations = [{ location: null, quantity: null }];
    return;
  }

  if (!Array.isArray(row.shelfLocations)) {
    console.error(
      "removeShelfLocation: row.shelfLocations is not an array:",
      typeof row.shelfLocations
    );
    row.shelfLocations = [{ location: null, quantity: null }];
    return;
  }

  // 确保至少保留一个货架位
  if (row.shelfLocations.length <= 1) {
    row.shelfLocations = [{ location: null, quantity: null }];
    return;
  }

  emit("remove-shelf-location", { row, index });
};

const addShelfLocation = (row) => {
  emit("add-shelf-location", row);
};

const filterShelfLocations = (val, update) => {
  if (val === "") {
    update(() => {
      // 不过滤，显示所有选项
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    // 这里不需要实际过滤，因为父组件会处理
  });
};

const handlePaginationUpdate = (val) => {
  pagination.page = val.page;
  pagination.rowsPerPage = val.rowsPerPage;
};

// 批量操作相关方法
const handleBatchDimensions = () => {
  emit("batch-dimensions", selectedProducts.value);
};

const handleBatchWeight = () => {
  emit("batch-weight", selectedProducts.value);
};

const handlePrintSelected = () => {
  emit("print-selected", selectedProducts.value);
};

const handlePrintAll = () => {
  emit("print-all");
};

// 显示批量设置尺寸对话框
const showBatchDimensionsDialog = () => {
  batchDimensions.length = null;
  batchDimensions.width = null;
  batchDimensions.height = null;
  batchDimensions.mode = "customer";
  batchDimensions.uniformSize = null;
  showDimensionsDialog.value = true;
};

// 显示批量设置重量对话框
const showBatchWeightDialog = () => {
  batchWeight.weight = null;
  batchWeight.mode = "customer";
  showWeightDialog.value = true;
};

// 应用批量设置尺寸
const applyBatchDimensions = () => {
  // 应用于所有商品，不再区分选中与否
  const targetProducts = props.products;

  if (targetProducts.length === 0) {
    $q.notify({
      type: "warning",
      message: trans("没有可处理的商品"),
    });
    return;
  }

  // 验证输入
  if (batchDimensions.mode === "manual") {
    if (
      !batchDimensions.length &&
      !batchDimensions.width &&
      !batchDimensions.height
    ) {
      $q.notify({
        type: "warning",
        message: trans("请至少输入一个尺寸值"),
      });
      return;
    }
  } else if (batchDimensions.mode === "uniform") {
    if (!batchDimensions.uniformSize) {
      $q.notify({
        type: "warning",
        message: trans("请输入统一尺寸值"),
      });
      return;
    }
  }

  targetProducts.forEach((product) => {
    if (batchDimensions.mode === "customer") {
      // 应用客户申报的尺寸
      product.size_length = product.product_spec_size_length;
      product.size_width = product.product_spec_size_width;
      product.size_height = product.product_spec_size_height;
      // 同时更新实际尺寸字段
      product.product_spec_actual_length = product.size_length;
      product.product_spec_actual_width = product.size_width;
      product.product_spec_actual_height = product.size_height;
    } else if (batchDimensions.mode === "uniform") {
      // 应用统一尺寸
      product.size_length = batchDimensions.uniformSize;
      product.size_width = batchDimensions.uniformSize;
      product.size_height = batchDimensions.uniformSize;
      // 同时更新实际尺寸字段
      product.product_spec_actual_length = product.size_length;
      product.product_spec_actual_width = product.size_width;
      product.product_spec_actual_height = product.size_height;
    } else {
      // 手动输入模式
      if (batchDimensions.length) {
        product.size_length = batchDimensions.length;
        product.product_spec_actual_length = batchDimensions.length;
      }
      if (batchDimensions.width) {
        product.size_width = batchDimensions.width;
        product.product_spec_actual_width = batchDimensions.width;
      }
      if (batchDimensions.height) {
        product.size_height = batchDimensions.height;
        product.product_spec_actual_height = batchDimensions.height;
      }
    }
    // updateVolume(product);
  });

  // 通知父组件数据已更新
  emit("update-products", JSON.parse(JSON.stringify(props.products)));

  $q.notify({
    type: "positive",
    message: trans(`已为${targetProducts.length}个商品设置尺寸`),
  });

  showDimensionsDialog.value = false;
};

// 应用批量设置重量
const applyBatchWeight = () => {
  // 应用于所有商品，不再区分选中与否
  const targetProducts = props.products;

  if (targetProducts.length === 0) {
    $q.notify({
      type: "warning",
      message: trans("没有可处理的商品"),
    });
    return;
  }

  // 验证输入
  if (batchWeight.mode === "manual" && !batchWeight.weight) {
    $q.notify({
      type: "warning",
      message: trans("请输入重量值"),
    });
    return;
  }

  targetProducts.forEach((product) => {
    if (batchWeight.mode === "customer") {
      // 应用客户申报的重量
      product.product_spec_actual_weight = product.product_spec_weight;
    } else if (batchWeight.mode === "manual" && batchWeight.weight) {
      // 应用手动输入的重量
      product.product_spec_actual_weight = batchWeight.weight;
    }
    checkWeightDiff(product);
  });

  // 通知父组件数据已更新
  emit("update-products", JSON.parse(JSON.stringify(props.products)));

  $q.notify({
    type: "positive",
    message: trans(`已为{count}个商品设置重量`, {
      count: targetProducts.length,
    }),
  });

  showWeightDialog.value = false;
};

// 添加fillAllQuantities方法用于"全部"按钮
const fillAllQuantities = () => {
  // 克隆数据避免直接修改props
  const updatedProducts = JSON.parse(JSON.stringify(props.products));

  updatedProducts.forEach((product) => {
    if (product.quantity > product.received_quantity) {
      product.put_away_quantity = product.quantity - product.received_quantity;
    } else {
      product.put_away_quantity = 0;
    }
  });

  // 通知父组件数据已更新
  emit("update-products", updatedProducts);

  $q.notify({
    type: "positive",
    message: trans("已将所有商品的待收货数量填入本次收货数量"),
    position: "top",
  });
};

// 在fillAllQuantities方法下添加fillAllShelfQuantities方法
const fillAllShelfQuantities = () => {
  // 克隆数据避免直接修改props
  const updatedProducts = JSON.parse(JSON.stringify(props.products));

  updatedProducts.forEach((product) => {
    // 确保每个商品都有货架位
    if (!product.shelfLocations || product.shelfLocations.length === 0) {
      product.shelfLocations = [{ location: null, quantity: null }];
    }
    // 如果只有一个货架位，直接将收货数量填入
    if (product.shelfLocations.length === 1) {
      product.shelfLocations[0].quantity = product.put_away_quantity;
    }
    // 如果有多个货架位，将收货数量均分
    else if (product.shelfLocations.length > 1) {
      const avgQty = Math.floor(
        product.put_away_quantity / product.shelfLocations.length
      );
      let remainder = product.put_away_quantity % product.shelfLocations.length;

      product.shelfLocations.forEach((shelf, index) => {
        shelf.quantity = avgQty;
        // 将余数分配给前几个货架位
        if (remainder > 0) {
          shelf.quantity += 1;
          remainder--;
        }
      });
    }
  });

  // 通知父组件数据已更新
  emit("update-products", updatedProducts);

  $q.notify({
    type: "positive",
    message: trans("已将本次收货数量填入上架数量"),
    position: "top",
  });
};

// 添加一个初始化方法来处理数据加载时的值映射
const initializeProductData = (product) => {
  // 如果实际重量不为0，则认为这是已经维护过的商品
  if (
    product.product_spec_actual_weight &&
    product.product_spec_actual_weight > 0
  ) {
    // 将实际尺寸带入到size字段中，如果size字段为空
    if (!product.size_length && product.product_spec_actual_length) {
      product.size_length = product.product_spec_actual_length;
    }
    if (!product.size_width && product.product_spec_actual_width) {
      product.size_width = product.product_spec_actual_width;
    }
    if (!product.size_height && product.product_spec_actual_height) {
      product.size_height = product.product_spec_actual_height;
    }

    // 更新体积计算
    // updateVolume(product);
  }
  return product;
};

// 监听products变化，处理新加入的商品
watch(
  () => props.products,
  (newProducts) => {
    // 对每个商品进行处理
    newProducts.forEach((product) => {
      initializeProductData(product);
    });
  },
  { immediate: true, deep: true }
);

// 提供对象给父组件
defineExpose({
  selectedProducts,
  pagination,
});
</script>

<style lang="scss" scoped>
.scan-header {
  background-color: #f5f7fa;
  .scan-container {
    .scan-input {
      margin-bottom: 0.5rem;
    }
  }
}
.success_num {
  color: #00b42a;
}
.px-1 {
  margin: 0 5px;
}

.order-info {
  // border: 1px solid rgba(0, 0, 0, 0.12);
  // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .info-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1rem;
    font-weight: 500;
  }
}

.products-section {
  // border: 1px solid rgba(0, 0, 0, 0.12);
  // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .product-scan-input {
    .q-field__control {
      height: 36px;
    }
  }

  .q-table {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      padding: 12px;
      background: #fbfaff;
      white-space: nowrap;
      vertical-align: middle;
    }

    td {
      padding: 8px 12px !important;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      vertical-align: top;
    }

    .q-checkbox {
      .q-checkbox__inner {
        font-size: 40px;
      }
    }

    .q-input,
    .q-select {
      margin: 5px 0;

      .q-field__control {
        height: 32px;

        &:hover {
          border-color: var(--q-primary);
        }

        &:focus-within {
          border-color: var(--q-primary);
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }
    }

    .text-caption {
      margin-top: 4px;
    }
  }
}

.q-dialog {
  .q-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 600px) {
  .scan-header,
  .order-info,
  .products-section {
    padding: 16px !important;
  }

  .q-table {
    th,
    td {
      padding: 8px;
    }
  }
}

.shelf-location-cell {
  width: 100%;
  text-align: center;
  .shelf-item {
    display: flex;
    align-items: center;
    margin-bottom: 0 !important;

    .shelf-select {
      flex: 1;
    }

    .delete-btn {
      margin-left: 4px;
      margin-top: 4px;
    }
  }

  .add-shelf-link {
    cursor: pointer;
    font-size: 12px;
    margin-top: 4px;
    display: inline-block;

    &:hover {
      text-decoration: underline;
    }
  }
}

.shelf-qty-cell {
  width: 100%;

  .shelf-qty-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0 !important;

    .shelf-qty-input {
      width: 80px;
    }

    .check-btn {
      margin-left: 4px;
      margin-top: 4px;
    }
  }
}

.q-tr {
  align-items: flex-start;
}

.weight-row {
  display: flex;
  align-items: center;
  margin: 0 !important;
}

.input-spacing {
  margin: 5px 0 !important;
}

/* 全局强制应用到Quasar输入框 */
.q-field.q-field--outlined {
  margin: 5px 0 !important;
}

.table-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  span {
    &:nth-child(1) {
      font-weight: bold;
      font-size: 16px;
      color: #1f1f1f;
    }
    &:nth-child(2) {
      font-weight: 500;
      font-size: 12px;
      color: #5745c5;
    }
  }
}
.table-filter {
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #5745c5;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  .product-name {
    font-weight: 500;
    font-size: 14px;
    color: #1f1f1f;
  }
  .product-sku {
    font-weight: 500;
    font-size: 12px;
    color: #666666;
  }
  .product-spec {
    font-weight: 500;
    font-size: 12px;
    color: #666666;
  }
}
.dimensions-row {
  display: flex;
  border: 1px solid #f0f0f0;
  border-radius: 9px 9px 9px 9px;
  height: 34px;
  overflow: hidden;
  :deep(.q-input) {
    margin: 0 !important;
  }
  .q-field__control {
    padding: 0 !important;
    height: 34px !important;
  }
  :deep(.q-field__native) {
    padding: 0 10px !important;
    height: 34px !important;
  }
  .q-field__control-container {
    height: 34px !important;
  }
  :deep(.q-input) {
    margin: 0 !important;
  }
  .q-field--dense .q-field__control {
    height: 34px !important;
  }
  .q-select {
    margin: 0 !important;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
    appearance: textfield;
  }

  .cm-text {
    background: #f0f0f0;
    border-radius: 0px 0px 0px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 12px;
    color: #1f1f1f;
    width: 60px;
  }
}
.text-description {
  font-weight: 500;
  font-size: 12px;
  color: #666666;
  line-height: 14px;
  margin-top: 6px;
  text-align: left !important;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.select-input {
  display: flex;
  border-radius: 9px 9px 9px 9px;
  border: 1px solid #f0f0f0;
  gap: 20px;
  padding: 0 10px;
  .huojia-select {
    width: 182px;
    height: 32px;
    :deep(.q-field__native) {
      min-height: 32px !important;
      height: 32px;
    }
  }
  .huojia-input {
    width: 98px;
    height: 34px;
    border-left: 1px solid #f0f0f0;
  }

  .q-field__control {
    padding: 0 !important;
    height: 34px !important;
  }
  :deep(.q-field__native) {
    padding: 0 10px !important;
    height: 34px !important;
  }
  .q-field__control-container {
    height: 34px !important;
  }
  :deep(.q-input) {
    margin: 0 !important;
  }
  .q-field--dense .q-field__control {
    height: 34px !important;
  }
  :deep(.q-select) {
    margin: 0 !important;
  }
}
.add-btn {
  cursor: pointer;
  color: #5745c5;
}

.huogui-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
