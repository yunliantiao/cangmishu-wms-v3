<template>
  <div class="scan-receive-page">
    <ScanTop
      v-if="!orderData"
      :title="trans('扫描收货')"
      :placeholder="trans('请扫描入库单号、ERP单号、运单号或箱唛')"
      ref="scanTopRef"
      v-model:scanValue="scanCode"
      @confirm="handleScan"
    />
    <!-- 标题和扫描区域 -->
    <div class="scan-header" v-if="orderData">
      <!-- 已扫描时显示标题和操作按钮 -->
      <div class="head-box">
        <span class="header-title">
          {{ trans("扫描收货") }}
        </span>
        <span class="head-title-2">{{ trans("ERP单号/入库单号") }}</span>
        <span class="head-number">{{ inboundInfo }}</span>
      </div>
      <div class="btn-box">
        <q-btn
          color="primary"
          @click="resetOrder"
          :label="trans('重置')"
          class="btn"
          outline
        />
        <q-btn
          color="primary"
          :label="trans('新品维护')"
          class="btn"
          :loading="$store.state.btnLoading"
          v-if="arrivalMethod == 'box' && currentProducts.length"
          @click="handleNewSku"
        />

        <q-btn
          color="primary"
          :label="trans('确认收货')"
          unelevated
          class="btn"
          :loading="$store.state.btnLoading"
          @click="handleConfirm"
        />
      </div>
    </div>

    <!-- 订单详情区域 -->
    <div v-if="orderData" class="order-info">
      <div class="info-item">
        <span class="info-label">{{ trans("客户") }}</span>
        <span class="info-value">{{ orderData?.customer?.name }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">{{ trans("运单号") }}</span>
        <span class="info-value">{{ orderData.tracking_number }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">{{ trans("备注") }}</span>
        <span class="info-value">{{ orderData.remark || "--" }}</span>
      </div>

      <!-- 
      <div class="row q-col-gutter-lg">
        <div class="col-6 col-md-3">
          <div class="info-label">{{ trans("客户") }}</div>
          <div class="info-value">{{ orderData?.customer?.name }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="info-label">{{ trans("运单号") }}</div>
          <div class="info-value">{{ orderData.tracking_number }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="info-label">{{ trans("备注") }}</div>
          <div class="info-value">{{ orderData.remark || "--" }}</div>
        </div>
      </div> -->
    </div>

    <!-- 按箱收货 -->
    <div
      v-if="orderData && arrivalMethod == 'express_parcel'"
      class="products-section"
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
    <div v-if="orderData && arrivalMethod == 'box'" class="products-section">
      <ParcelReceipt
        v-model:parcels="parcelData"
        @print="handleParcelPrint"
        @handle-box-click="handleBoxClick"
        ref="parcelReceiptRef"
      />
      <NewProductDialog
        v-model:visible="showNewSkuDialog"
        :products="currentProducts"
        :box-number="boxNumber"
        :id="orderData.id"
        @updateNewProducts="handleScan"
        @update:products="handleUpdateProductsFromDialog"
        @confirm="setSkuProducts"
      />
    </div>
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
import { useRoute, useRouter } from "vue-router";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const arrivalMethod = ref("");
// 状态变量
const scanCode = ref("");
const scanInput = ref(null);
const orderData = ref(null);
const productScanCode = ref("");
const scanType = ref(trans("逐个扫描"));
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

const scanTopRef = ref(null);

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
          isNewSkuBoolean();
          if (characteristic.value) {
            handleConfirm();
          }
        }

        scanTopRef.value.focus();
      }
    });
};

const characteristic = ref(false);
//新品维护后则需要先扫描获取最新规格再确认收货
const setSkuProducts = () => {
  handleScan();
  characteristic.value = true;
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
        message: trans(`未找到商品: {goodsName}`, {
          goodsName: productScanCode.value,
        }),
        position: "top",
      });
    }
  } catch (error) {
    console.error("商品扫描错误:", error);
    $q.notify({
      type: "negative",
      message: trans("扫描失败，请重试"),
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
      message: trans("打印成功"),
    });
  } catch (error) {
    console.error("打印错误:", error);
    $q.notify({
      type: "negative",
      message: trans("打印失败，请重试"),
    });
  } finally {
    printing.value = false;
  }
};

const isNewSkuBoolean = () => {
  currentProducts.value = []; // 清空当前商品列表
  const skuMap = new Map(); // 用于记录已添加的SKU
  // 创建一个Map来存储SKU和对应的箱子编号
  const skuBoxMap = new Map(); // 用于记录SKU对应的箱子编号
  parcelData.value.forEach((parcel) => {
    // 这里是看有没有新品
    //判断包裹中是否有新商品
    parcel.items.forEach((item) => {
      if (isNewSku(item)) {
        // 如果SKU已存在，拼接箱子编号
        if (skuMap.has(item.product_spec_sku)) {
          // 获取已有的商品
          const existingItem = currentProducts.value.find(
            (p) => p.product_spec_sku === item.product_spec_sku
          );
          // 更新箱子编号信息
          if (existingItem) {
            existingItem.box_numbers = existingItem.box_numbers || [
              skuBoxMap.get(item.product_spec_sku),
            ];
            if (!existingItem.box_numbers.includes(parcel.box_number)) {
              existingItem.box_numbers.push(parcel.box_number);
            }
          }
        } else {
          // 新SKU，添加到Map和商品列表
          skuMap.set(item.product_spec_sku, true);
          skuBoxMap.set(item.product_spec_sku, parcel.box_number);
          const newItem = JSON.parse(JSON.stringify(item));
          newItem.box_numbers = [parcel.box_number];
          currentProducts.value.push(newItem);
        }
      }
    });
  });
};

const handleConfirm = async () => {
  let parasm = {};
  // 1. 验证数据
  if (arrivalMethod.value == "box") {
    // 箱子收货模式
    if (!parcelReceiptRef.value) {
      $q.notify({
        type: "negative",
        message: trans("未找到包裹收货组件"),
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
    isNewSkuBoolean();
    // 箱子收货查看是否有新品
    if (currentProducts.value.length) {
      return openNewProductDialog();
    } else {
      parasm = getProductsFromParcels();
      if (boxNumberList.value.length) {
        $q.notify({
          type: "warning",
          message: trans(
            "以下箱子收货数量小于申报数量，同一个箱子不支持多次收货，请确认！"
          ),
          html: true,
          position: "center",
          timeout: 0,
          actions: [
            { label: trans("取消"), color: "white", handler: () => {} },
            {
              label: trans("确定"),
              color: "white",
              handler: () => {
                handleConfirmBox(parasm);
              },
            },
          ],
          caption: boxNumberList.value.join("，"),
        });
        return;
      }
    }
  } else if (arrivalMethod.value === "express_parcel") {
    // 快递收货模式
    parasm = getProductsFrom();
    if (!parasm.length) {
      return;
    }
  } else {
    return $q.notify({
      type: "negative",
      message: trans("未知的收货方式"),
    });
  }
  handleConfirmBox(parasm);
};
const handleConfirmBox = (parasm) => {
  inboundApi
    .confirmReceive(orderData.value.id, { items: parasm })
    .then((res) => {
      if (res.success) {
        if (route.query.number) {
          router.push({
            path: "/inbound/warehouseWarrant",
          });
        } else {
          resetOrder();
        }
      } else {
        $q.notify({
          type: "negative",
          message: res.message || trans("确认失败，请重试"),
        });
      }
    })
    .catch((err) => {
      $q.notify({
        type: "negative",
        message: trans("系统异常，请稍后再试"),
      });
    });
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
  characteristic.value = false;
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
      message: trans("请先选择商品"),
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
      message: trans("请先选择商品"),
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
    message: trans(`已为{count}个商品设置重量`, {
      count: targetProducts.length,
    }),
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
    message: trans("正在准备打印选中商品..."),
  });
};

const handlePrintAll = () => {
  // 实现打印全部商品逻辑
  $q.notify({
    type: "info",
    message: trans("正在准备打印全部商品..."),
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
    message: trans("正在准备打印包裹..."),
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
      message: trans("商品信息已更新"),
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
  const skuMap = new Map(); // 用于记录已添加的SKU
  currentProducts.value = [];

  // 过滤重复的SKU
  row.items.forEach((item) => {
    if (!skuMap.has(item.product_spec_sku)) {
      skuMap.set(item.product_spec_sku, true);
      currentProducts.value.push(item);
    }
  });

  showNewSkuDialog.value = true;
};

const handleNewSku = () => {
  isNewSkuBoolean();
  boxNumber.value = "NewSku";
  showNewSkuDialog.value = true;
};

// 修改openNewProductDialog方法，处理多个商品的情况
const openNewProductDialog = () => {
  boxNumber.value = "";
  showNewSkuDialog.value = true;
};

const boxNumberList = ref([]);

// 添加从包裹数据中提取商品信息的方法
const getProductsFromParcels = () => {
  const extractedProducts = [];
  boxNumberList.value = [];
  parcelData.value.forEach((parcel) => {
    parcel.items.forEach((item) => {
      // 转换为标准产品格式以匹配系统其他部分的数据结构
      if (item.put_away_quantity) {
        if (item.put_away_quantity < item.quantity) {
          boxNumberList.value.push(parcel.box_number);
        }
        extractedProducts.push({
          id: item.id,
          actual_length: item.product_spec_actual_length,
          actual_width: item.product_spec_actual_width,
          actual_height: item.product_spec_actual_height,
          actual_weight: item.product_spec_actual_weight,
          quantity: item.put_away_quantity,
        });
      }
    });
  });

  return extractedProducts;
};

// 从包裹中提取商品信息
const getProductsFrom = () => {
  const extractedProducts = [];
  products.value.forEach((product) => {
    if (
      !product.size_length ||
      !product.size_width ||
      !product.size_height ||
      !product.product_spec_actual_weight
    ) {
      return $q.notify({
        type: "negative",
        message: trans("请填写尺寸和重量"),
      });
    }
    extractedProducts.push({
      id: product.id,
      quantity: product.put_away_quantity || 0,
      actual_length: product.size_length || 0,
      actual_width: product.size_width || 0,
      actual_height: product.size_height || 0,
      actual_weight: product.product_spec_actual_weight || 0,
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

  if (route.query.number) {
    scanCode.value = route.query.number;
    handleScan();
  }
});
</script>

<style lang="scss" scoped>
.scan-header {
  padding: 0 calc((100vw - 1400px) / 2);
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  display: flex;
  height: 80px;
  justify-content: space-between;
  align-items: center;
  .head-box {
    display: flex;
    align-items: center;
    gap: 10px;
    .header-title {
      font-weight: 600;
      font-size: 24px;
      color: #1f1f1f;
    }
    .head-title-2 {
      font-weight: 500;
      font-size: 14px;
      color: #666666;
    }
    .head-number {
      font-weight: bold;
      font-size: 16px;
      color: #5745c5;
    }
  }

  .btn-box {
    display: flex;
    align-items: center;
    gap: 20px;
    .btn {
      border-radius: 9px 9px 9px 9px;
      padding: 0 32px;
      height: 42px;
    }
  }
}

.px-1 {
  margin: 0 5px;
}

// // 通用卡片样式
// .order-info,
// .products-section {
//   // border: 1px solid rgba(0, 0, 0, 0.12);
//   // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

// }

.order-info {
  padding: 20px;
  width: 1400px;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  height: 60px;
  display: flex;
  gap: 20px;
  margin: 20px auto;
  .info-item {
    display: flex;
    align-items: center;
    gap: 20px;
    .info-label {
      font-weight: 500;
      font-size: 14px;
      color: #666666;
    }

    .info-value {
      font-weight: bold;
      font-size: 16px;
      color: #1f1f1f;
      width: 200px;
    }
  }
}

.products-section {
  width: 1400px;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  padding: 20px;
  margin: 0 auto;
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

.scan-receive-page {
  min-height: 100vh;
  background-color: #f4f5f8;
}
</style>


