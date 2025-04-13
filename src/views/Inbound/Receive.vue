<template>
  <div class="scan-receive-page">
    <!-- 标题和扫描区域 -->
    <div class="scan-header rounded-borders q-pa-lg q-mb-md">
      <template v-if="!orderData">
        <div class="text-h5 text-weight-medium text-center q-mb-lg">
          扫描收货
        </div>
        <div class="scan-container q-mx-auto" style="max-width: 800px">
          <q-input
            outlined
            v-model="scanCode"
            placeholder="请扫描入库单号、ERP单号、运单号或箱唛"
            class="scan-input"
            ref="scanInput"
            @keyup.enter="handleScan"
            :loading="$store.state.btnLoading"
          >
            <template v-slot:prepend>
              <q-icon
                name="qr_code_scanner"
                class="cursor-pointer"
                @click="handleScan"
              />
            </template>
            <template v-slot:append>
              <q-icon name="help_outline" class="cursor-pointer">
                <q-tooltip
                  >支持扫描入库单号、ERP单号、运单号或箱唛编号</q-tooltip
                >
              </q-icon>
            </template>
          </q-input>
          <div class="text-caption text-grey q-mt-sm">
            <q-icon name="info_outline" size="xs" class="q-mr-xs" />
            请先切换成[EN]输入法
          </div>
        </div>
      </template>

      <!-- 已扫描时显示标题和操作按钮 -->
      <template v-else>
        <div class="row justify-between items-center">
          <div class="text-h6">
            扫描收货
            <span class="text-primary q-ml-sm"
              >ERP单号/入库单号 {{ inboundInfo }}</span
            >
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="grey-6"
              @click="resetOrder"
              icon="restart_alt"
              label="重置"
              flat
              class="bg-grey-2"
            />
            <q-btn
              color="primary"
              icon="print"
              label="打印上架单"
              outline
              :loading="$store.state.btnLoading"
              v-if="arrivalMethod == 'express_parcel'"
              @click="handlePrint"
            />
            <q-btn
              color="primary"
              icon="check_circle"
              label="确认收货"
              unelevated
              :loading="$store.state.btnLoading"
              @click="handleConfirm"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- 订单详情区域 -->
    <div
      v-if="orderData"
      class="order-info bg-white q-pa-lg q-mb-md rounded-borders"
    >
      <div class="row q-col-gutter-lg">
        <div class="col-6 col-md-3">
          <div class="info-label">客户</div>
          <div class="info-value">{{ orderData?.customer?.name }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="info-label">运单号</div>
          <div class="info-value">{{ orderData.tracking_number }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="info-label">备注</div>
          <div class="info-value">{{ orderData.remark || "--" }}</div>
        </div>
      </div>
    </div>

    <!-- 按箱收货 -->
    <div
      v-if="orderData && arrivalMethod == 'express_parcel'"
      class="products-section bg-white rounded-borders"
    >
      <ReceivingParcel
        :products="products"
        :shelf-location-options="shelfLocationOptions"
        :loading="$store.state.btnLoading"
        @update-volume="handleUpdateVolume"
        @add-shelf-location="addShelfLocation"
        @remove-shelf-location="removeShelfLocation"
        @batch-dimensions="showBatchDimensionsDialog"
        @batch-weight="showBatchWeightDialog"
        @print-selected="handlePrintSelected"
        @print-all="handlePrintAll"
        @product-scan="handleProductScanFromComponent"
        @update-products="handleUpdateProducts"
        ref="receivingParcelRef"
      />
    </div>
    <!-- 包裹收货 -->
    <div
      v-if="orderData && arrivalMethod == 'box'"
      class="products-section bg-white rounded-borders"
    >
      <ParcelReceipt
        v-model:parcels="parcelData"
        @print="handleParcelPrint"
        @handle-box-click="handleBoxClick"
        ref="parcelReceiptRef"
      />
    </div>
    <NewProductDialog
      v-model:visible="showNewSkuDialog"
      :products="currentProducts"
      :box-number="boxNumber"
      @update:products="handleUpdateProductsFromDialog"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useQuasar } from "quasar";
import inboundApi from "@/api/inbound";
import settingApi from "@/api/setting";
import ReceivingParcel from "./components/ReceivingParcel.vue";
import ParcelReceipt from "./components/ParcelReceipt.vue";
import NewProductDialog from "./components/NewProductDialog.vue";

const $q = useQuasar();
const arrivalMethod = ref("");
// 状态变量
const scanCode = ref("");
const scanInput = ref(null);
const orderData = ref(null);
const productScanCode = ref("");
const scanType = ref("逐个扫描");
const selectedProducts = ref([]);
const loading = ref(false);
const scanning = ref(false);
const productScanning = ref(false);
const printing = ref(false);
const confirming = ref(false);
const showShelfDialog = ref(false);
const newShelfLocation = ref("");
const shelfLocations = ref([]);
const boxNumber = ref("");

const showNewSkuDialog = ref(false);
const currentProducts = ref([]);

// 商品数据
const products = ref([]);

// 货架位选项
const shelfLocationOptions = ref([]);

// 添加批量设置尺寸和重量对话框状态
const showDimensionsDialog = ref(false);
const showWeightDialog = ref(false);
const batchDimensions = reactive({
  length: null,
  width: null,
  height: null,
  applyToSelected: true,
});
const batchWeight = reactive({
  weight: null,
  applyToSelected: true,
});

// 添加箱子收货数据结构
const parcelData = ref([]);

// 计算属性
const inboundInfo = computed(() => {
  if (!orderData.value) return "";
  return `${orderData.value.system_order_number} / ${orderData.value.custom_order_number}`;
});

// 添加计算属性，获取包裹中的所有商品
const parcelProducts = computed(() => {
  return getProductsFromParcels();
});
// 获取货架位列表
const getShelfLocationList = () => {
  settingApi.getShelfLocationList().then((res) => {
    if (res.success) {
      shelfLocations.value = res.data.items;
      shelfLocationOptions.value = res.data.items;
    }
  });
};
getShelfLocationList();

// 方法
const handleScan = () => {
  if (!scanCode.value) return;
  scanning.value = true;
  inboundApi
    .getReceive({
      number: scanCode.value,
    })
    .then((res) => {
      if (res.success) {
        arrivalMethod.value = res.data.arrival_method;
        scanning.value = false;
        orderData.value = res.data;
        if (res.data.arrival_method == "express_parcel") {
          let items = res.data.boxes[0].items;
          items.forEach((item) => {
            item.receivedQty = 0;
            item.shelfLocations = [{ location: null, quantity: null }];
          });
          products.value = items;
        } else {
          parcelData.value = res.data.boxes;
        }
      }
    });
};

const handleProductScan = async () => {
  if (!productScanCode.value || productScanning.value) return;

  productScanning.value = true;
  try {
    // 查找商品
    const index = products.value.findIndex(
      (p) => p.sku === productScanCode.value
    );
    if (index >= 0) {
      products.value[index].receivedQty += 1;
      products.value[
        index
      ].receivedRatio = `${products.value[index].receivedQty}/${products.value[index].expectedQty}`;

      // 确保商品有默认货架位
      if (
        !products.value[index].shelfLocations ||
        products.value[index].shelfLocations.length === 0
      ) {
        products.value[index].shelfLocations = [
          { location: null, quantity: null },
        ];
      }
    } else {
      $q.notify({
        type: "warning",
        message: `未找到商品: ${productScanCode.value}`,
        position: "top",
      });
    }
  } catch (error) {
    console.error("商品扫描错误:", error);
    $q.notify({
      type: "negative",
      message: "扫描失败，请重试",
      position: "top",
    });
  } finally {
    productScanning.value = false;
    productScanCode.value = "";
  }
};

const handlePrint = async () => {
  if (printing.value) return;

  printing.value = true;
  try {
    // 打印逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000));
    $q.notify({
      type: "positive",
      message: "打印成功",
    });
  } catch (error) {
    console.error("打印错误:", error);
    $q.notify({
      type: "negative",
      message: "打印失败，请重试",
    });
  } finally {
    printing.value = false;
  }
};

const handleConfirm = async () => {
  console.log("......", arrivalMethod.value);

  let parasm = {};
  // 1. 验证数据
  if (arrivalMethod.value == "box") {
    // 箱子收货模式
    if (!parcelReceiptRef.value) {
      $q.notify({
        type: "negative",
        message: "未找到包裹收货组件",
      });
      return;
    }
    // 使用子组件提供的验证方法
    const { valid, errorMessage } = parcelReceiptRef.value.validateData();
    if (!valid) {
      $q.notify({
        type: "negative",
        message: errorMessage,
      });
      return;
    }
    // 获取标准格式的产品数据
    parasm = getProductsFromParcels();
  } else if (arrivalMethod.value === "express_parcel") {
    // 快递收货模式
    parasm = getProductsFrom();
  } else {
    return $q.notify({
      type: "negative",
      message: "未知的收货方式",
    });
  }
  // 执行提交逻辑
  if (parasm.length) {
    await inboundApi
      .confirmReceive(orderData.value.id, { items: parasm })
      .then((res) => {
        if (res.success) {
          resetOrder();
        } else {
          $q.notify({
            type: "negative",
            message: res.message || "确认失败，请重试",
          });
        }
      })
      .catch((err) => {
        console.error("提交错误:", err);
        $q.notify({
          type: "negative",
          message: "系统异常，请稍后再试",
        });
      });
  }
};

// 实用方法
const updateVolume = (row) => {
  if (row.length && row.width && row.height) {
    row.calculatedVolume = `${(
      (row.length * row.width * row.height) /
      1000000
    ).toFixed(3)} m³`;
  }
};

const resetOrder = () => {
  orderData.value = null;
  selectedProducts.value = [];
  productScanCode.value = "";
  scanCode.value = "";
  products.value = [];
};

const addShelfLocation = (row) => {
  if (!row.shelfLocations) {
    row.shelfLocations = [];
  }
  row.shelfLocations.push({ location: null, quantity: null });
};

const removeShelfLocation = (payload) => {
  // 修复从组件接收的参数格式，解构参数
  const { row, index } = payload;
  if (row && row.shelfLocations && Array.isArray(row.shelfLocations)) {
    row.shelfLocations.splice(index, 1);
  }
};

// 批量操作相关
const showBatchDimensionsDialog = () => {
  batchDimensions.length = null;
  batchDimensions.width = null;
  batchDimensions.height = null;
  batchDimensions.applyToSelected = true;
  showDimensionsDialog.value = true;
};

const showBatchWeightDialog = () => {
  batchWeight.weight = null;
  batchWeight.applyToSelected = true;
  showWeightDialog.value = true;
};

const applyBatchDimensions = () => {
  const targetProducts = batchDimensions.applyToSelected
    ? selectedProducts.value
    : products.value;

  if (targetProducts.length === 0) {
    $q.notify({
      type: "warning",
      message: "请先选择商品",
    });
    return;
  }

  targetProducts.forEach((product) => {
    if (batchDimensions.length) product.length = batchDimensions.length;
    if (batchDimensions.width) product.width = batchDimensions.width;
    if (batchDimensions.height) product.height = batchDimensions.height;
    updateVolume(product);
  });

  showDimensionsDialog.value = false;
};

const applyBatchWeight = () => {
  const targetProducts = batchWeight.applyToSelected
    ? selectedProducts.value
    : products.value;

  if (targetProducts.length === 0) {
    $q.notify({
      type: "warning",
      message: "请先选择商品",
    });
    return;
  }

  targetProducts.forEach((product) => {
    if (batchWeight.weight) {
      product.weight = batchWeight.weight;
    }
  });

  $q.notify({
    type: "positive",
    message: `已为${targetProducts.length}个商品设置重量`,
  });

  showWeightDialog.value = false;
};

// 组件事件处理
const receivingParcelRef = ref(null);
const parcelReceiptRef = ref(null);

const handleUpdateVolume = (row) => {
  updateVolume(row);
};

const handlePrintSelected = () => {
  // 实现打印选中商品逻辑
  $q.notify({
    type: "info",
    message: "正在准备打印选中商品...",
  });
};

const handlePrintAll = () => {
  // 实现打印全部商品逻辑
  $q.notify({
    type: "info",
    message: "正在准备打印全部商品...",
  });
};

const handleProductScanFromComponent = ({ code, scanType: type }) => {
  productScanCode.value = code;
  scanType.value = type;
  handleProductScan();
};

const handleParcelPrint = (parcels) => {
  // 实现包裹打印逻辑
  // 可以调用打印服务或API
  $q.notify({
    type: "info",
    message: "正在准备打印包裹...",
  });
};

const handleUpdateProductsFromDialog = (updatedProducts) => {
  // 更新全局产品列表中对应的商品信息
  if (updatedProducts && updatedProducts.length > 0) {
    // 深拷贝以防止引用问题
    const productsCopy = JSON.parse(JSON.stringify(updatedProducts));

    // 更新parcelData中的商品信息
    if (arrivalMethod.value === "box") {
      updateParcelProducts(productsCopy);
    } else {
      // 更新products列表中的商品信息
      updateExpressProducts(productsCopy);
    }

    $q.notify({
      type: "positive",
      message: "商品信息已更新",
    });
  }
};

// 添加更新箱子收货商品的方法
const updateParcelProducts = (updatedProducts) => {
  parcelData.value.forEach((parcel) => {
    parcel.items.forEach((item) => {
      // 在更新的商品中查找匹配项
      const updatedItem = updatedProducts.find((p) => p.id === item.id);
      if (updatedItem) {
        // 更新尺寸和重量信息
        item.product_spec_actual_length =
          updatedItem.product_spec_actual_length;
        item.product_spec_actual_width = updatedItem.product_spec_actual_width;
        item.product_spec_actual_height =
          updatedItem.product_spec_actual_height;
        item.product_spec_actual_weight =
          updatedItem.product_spec_actual_weight;
      }
    });
  });
};

// 添加更新快递收货商品的方法
const updateExpressProducts = (updatedProducts) => {
  products.value.forEach((product) => {
    // 在更新的商品中查找匹配项
    const updatedProduct = updatedProducts.find((p) => p.id === product.id);
    if (updatedProduct) {
      // 更新尺寸和重量信息
      product.product_spec_actual_length =
        updatedProduct.product_spec_actual_length;
      product.product_spec_actual_width =
        updatedProduct.product_spec_actual_width;
      product.product_spec_actual_height =
        updatedProduct.product_spec_actual_height;
      product.product_spec_actual_weight =
        updatedProduct.product_spec_actual_weight;

      // 如果有计算体积，也更新
      if (updatedProduct.calculatedVolume) {
        product.calculatedVolume = updatedProduct.calculatedVolume;
      }
    }
  });
};

const handleBoxClick = (row) => {
  boxNumber.value = row.box_number;
  currentProducts.value = row.items;
  showNewSkuDialog.value = true;
};

// 修改openNewProductDialog方法，处理多个商品的情况
const openNewProductDialog = () => {
  boxNumber.value = "";
  showNewSkuDialog.value = true;
};

// 添加从包裹数据中提取商品信息的方法
const getProductsFromParcels = () => {
  const extractedProducts = [];
  currentProducts.value = [];
  parcelData.value.forEach((parcel) => {
    parcel.items.forEach((item) => {
      currentProducts.value.push(item);
      if (isNewSku(item)) {
        openNewProductDialog();
        return;
      }
      // 转换为标准产品格式以匹配系统其他部分的数据结构
      extractedProducts.push({
        id: item.id,
        actual_length: item.product_spec_actual_length,
        actual_width: item.product_spec_actual_width,
        actual_height: item.product_spec_actual_height,
        actual_weight: item.product_spec_actual_weight,
        quantity: item.put_away_quantity || 0,
        // 添加其他需要的字段
      });
    });
  });

  return extractedProducts;
};

// 从包裹中提取商品信息
const getProductsFrom = () => {
  const extractedProducts = [];
  products.value.forEach((product) => {
    extractedProducts.push({
      id: product.id,
      quantity: product.put_away_quantity,
      actual_length: product.size_length,
      actual_width: product.size_width,
      actual_height: product.size_height,
      actual_weight: product.product_spec_actual_weight,
      shelf_locations: screenShelfLocations(product),
    });
  });
  return extractedProducts;
};

const screenShelfLocations = (item) => {
  const shelfLocations = [];
  item.shelfLocations.forEach((shelfLocation) => {
    if (shelfLocation.location != null) {
      shelfLocations.push({
        warehouse_location_code: shelfLocation.location.code,
        quantity: shelfLocation.quantity,
      });
    }
  });
  return shelfLocations;
};

const handleUpdateProducts = (updatedProducts) => {
  products.value = updatedProducts;
};

const isNewSku = (item) => {
  return !item.product_spec_actual_weight;
};

onMounted(() => {
  // 页面加载后自动聚焦到扫描输入框
  nextTick(() => {
    scanInput.value.focus();
  });
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

.px-1 {
  margin: 0 5px;
}

// 通用卡片样式
.order-info,
.products-section {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-info {
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
  .section-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}

// 表格和表单样式
.q-table {
  th {
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    padding: 12px;
    background-color: #f5f7fa;
    white-space: nowrap;
    vertical-align: middle;
  }

  td {
    padding: 8px 12px !important;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.75);
    vertical-align: top;

    .q-input,
    .q-select,
    :deep(.q-input),
    :deep(.q-select) {
      margin: 5px 0 !important;
    }
  }
}

// 输入框统一样式
.q-input,
.q-select,
.input-spacing {
  margin: 5px 0 !important;

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

// 对话框样式
.q-dialog {
  .q-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// 货架位样式
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

// 行样式
.q-tr {
  align-items: flex-start;
}

.dimensions-row,
.weight-row {
  display: flex;
  align-items: center;
  margin: 0 !important;
}

// 响应式布局
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
</style>


