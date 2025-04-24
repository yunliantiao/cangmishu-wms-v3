<template>
  <q-dialog
    v-model="isOpen"
    position="right"
    :maximized="$q.screen.lt.md"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    class="detail-dialog"
  >
    <q-card class="detail-card" style="width: 80vw; max-width: 1400px">
      <q-card-section class="dialog-header row items-center bg-grey-2">
        <div class="text-subtitle1 text-weight-medium">入库单详情</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-card-section class="dialog-body q-pa-md scroll" v-if="orderDetails">
        <!-- 基本信息 -->
        <div class="detail-section bg-white q-pa-md q-mb-md rounded-borders">
          <div class="text-subtitle1 text-weight-medium q-mb-md">基本信息</div>
          <div class="row q-col-gutter-md">
            <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">客户</div>
                <div class="detail-value">
                  {{ orderDetails.customer?.name || "--" }}
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">入库单号</div>
                <div class="detail-value">
                  {{ orderDetails.system_order_number }}
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">运单号</div>
                <div class="detail-value">
                  {{ orderDetails.tracking_number || "--" }}
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">到仓方式</div>
                <div class="detail-value">
                  {{
                    orderDetails.arrival_method === "box" ? "箱子" : "快递包裹"
                  }}
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">签收时间</div>
                <div class="detail-value">
                  {{ orderDetails.sign_at || "--" }}
                </div>
              </div>
            </div>
            <!-- <div class="col-3">
              <div class="detail-item">
                <div class="detail-label">客户备注</div>
                <div class="detail-value">
                  {{ orderDetails.customer_remark || "--" }}
                </div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- 物品信息标签页 -->
        <div class="bg-white rounded-borders">
          <q-tabs
            v-model="activeTab"
            class="text-primary"
            active-color="primary"
            indicator-color="primary"
            dense
            narrow-indicator
          >
            <q-tab name="products" label="商品信息" />
            <q-tab name="packages" v-if="orderDetails.arrival_method === 'box'" label="装箱信息" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="products" class="q-pa-md">
              <q-markup-table flat bordered class="q-mb-none">
                <thead>
                  <tr>
                    <th class="text-left product-col">SKU信息</th>
                    <th class="text-center">申报体积&重量</th>
                    <th class="text-center">实际体积&重量</th>
                    <th class="text-center">申报入库数量</th>
                    <th class="text-center">已收</th>
                    <th class="text-center">上架良品</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in skuList" :key="item.product_spec_sku">
                    <td class="text-left product-info-cell">
                      <div class="row no-wrap items-center">
                        <div class="product-img-container q-mr-sm">
                          <img
                            :src="
                              item.product_spec_image ||
                             'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                            "
                            class="product-img"
                          />
                        </div>
                        <div class="product-details">
                          <div class="product-sku">
                            {{ item.product_spec_sku || "--" }}
                          </div>
                          <div class="product-code text-grey-8">
                            {{ item.product_code }}
                          </div>
                          <div class="product-name text-grey-7">
                            {{ item.product_name }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center measurement-col">
                      <div>
                        {{ item.product_spec_size_height }}x{{
                          item.product_spec_size_width
                        }}
                        x {{ item.product_spec_size_length }}cm
                      </div>
                      <div>{{ item.product_spec_weight }}g</div>
                    </td>
                    <td class="text-center measurement-col">
                      <div>
                        {{ item.product_spec_actual_height }}x{{
                          item.product_spec_actual_width
                        }}
                        x {{ item.product_spec_actual_length }}cm
                      </div>
                      <div>{{ item.product_spec_actual_weight }}g</div>
                    </td>
                    <td class="text-center">{{ item.quantity || "0" }}</td>
                    <td class="text-center">
                      {{ item.received_quantity || "0" }}
                    </td>
                    <td class="text-center">
                      {{ item.shelf_quantity || "0" }}
                    </td>
                  </tr>
                  <tr v-if="skuList.length === 0">
                    <td colspan="6" class="text-center">暂无数据</td>
                  </tr>
                  <tr class="bg-grey-2">
                    <td class="text-left">合计{{ skuList.length }}条</td>
                    <td class="text-center">--</td>
                    <td class="text-center">--</td>
                    <td class="text-center">{{ getTotalQty(skuList) }}</td>
                    <td class="text-center">
                      {{ getTotalReceivedQty(skuList) }}
                    </td>
                    <td class="text-center">
                      {{ getTotalShelvedQty(skuList) }}
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel name="packages" class="q-pa-md">
              <q-markup-table flat bordered class="q-mb-none">
                <thead>
                  <tr>
                    <th class="text-center" style="width: 60px">#</th>
                    <th class="text-left">箱唛号</th>
                    <th class="text-center">箱子尺寸</th>
                    <th class="text-center">箱子重量</th>
                    <th class="text-center">商品SKU</th>
                    <th class="text-center">申报入库数量</th>
                    <th class="text-center">已收</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(box, index) in boxList" :key="box.id">
                    <tr
                      v-for="(item, itemIndex) in box.items"
                      :key="`${box.id}-${item.id}`"
                    >
                      <template v-if="itemIndex === 0">
                        <td class="text-center" :rowspan="box.items.length">
                          {{ index + 1 }}
                        </td>
                        <td class="text-left" :rowspan="box.items.length">
                          {{ orderDetails.system_order_number }}-{{ box.box_number }}
                        </td>
                        <td class="text-center" :rowspan="box.items.length">
                          {{ box.size_length }}x{{ box.size_width }}x{{
                            box.size_height
                          }}
                          cm
                        </td>
                        <td class="text-center" :rowspan="box.items.length">
                          {{ box.weight }} g
                        </td>
                      </template>
                      <td class="text-center">{{ item.product_spec_sku }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-center">{{ item.received_quantity }}</td>
                    </tr>
                  </template>
                  <tr v-if="boxList.length === 0">
                    <td colspan="7" class="text-center">暂无箱子数据</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel name="fees" class="q-pa-md">
              <div class="text-grey-8 text-center">费用信息暂未开放</div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>

      <q-card-section class="dialog-body q-pa-md" v-else>
        <div class="row flex-center">
          <q-spinner size="40px" color="primary" v-if="loading" />
          <div class="text-grey-8 q-pa-lg text-center" v-else>暂无数据</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import inboundApi from "@/api/inbound";

const $q = useQuasar();

// Props
const props = defineProps({
  visible: Boolean,
  orderId: [String, Number],
});

// Emits
const emits = defineEmits(["update:visible", "close"]);

// Reactive data
const isOpen = ref(false);
const orderDetails = ref(null);
const loading = ref(false);
const boxList = ref([]);
const skuList = ref([]);
const activeTab = ref("products");

// Watch for visibility changes
watch(
  () => props.visible,
  (val) => {
    isOpen.value = val;
    if (val && props.orderId) {
      activeTab.value = "products";
      fetchOrderDetails();
    }
  }
);

// Watch for dialog close event
watch(isOpen, (val) => {
  if (!val) {
    emits("update:visible", false);
    emits("close");
  }
});

// Computed properties
const statusColor = computed(() => {
  if (!orderDetails.value) return { bg: "grey-4", text: "grey-8" };

  const statusMap = {
    reported: { bg: "blue-1", text: "blue" },
    in_transit: { bg: "orange-1", text: "orange" },
    pending_inbound: { bg: "purple-1", text: "purple" },
    inbound_processing: { bg: "teal-1", text: "teal" },
    shelved: { bg: "green-1", text: "green" },
  };

  return (
    statusMap[orderDetails.value.status] || { bg: "grey-4", text: "grey-8" }
  );
});

const statusLabel = computed(() => {
  if (!orderDetails.value) return "";

  const statusLabels = {
    reported: "已预报",
    in_transit: "运输中",
    pending_inbound: "待入库",
    inbound_processing: "入库中",
    shelved: "已完成",
  };

  return statusLabels[orderDetails.value.status] || orderDetails.value.status;
});

// Methods
const fetchOrderDetails = async () => {
  if (!props.orderId) return;
  orderDetails.value = null;
  boxList.value = [];
  skuList.value = [];
  loading.value = true;
  try {
    const res = await inboundApi.getWarehouseWarrantDetail(props.orderId);
    if (res.success) {
      orderDetails.value = res.data;

      // 处理箱子数据，确保数据结构正确
      boxList.value = res.data.details || [];

      // 提取所有SKU数据并合并相同SKU
      let allItems = [];
      if (boxList.value && boxList.value.length > 0) {
        boxList.value.forEach((box) => {
          if (box.items && box.items.length > 0) {
            allItems.push(...box.items);
          }
        });
      }

      // 合并相同SKU的项目，汇总数量
      const mergedItems = mergeSameSkuItems(allItems);
      skuList.value = mergedItems;
    }
  } catch (error) {
    console.error("获取入库单详情失败:", error);
  } finally {
    loading.value = false;
  }
};

// 合并相同SKU的商品，汇总数量
const mergeSameSkuItems = (items) => {
  const skuMap = new Map();

  // 遍历所有商品，按SKU分组
  items.forEach((item) => {
    const sku = item.product_spec_sku;
    if (!sku) return;

    if (!skuMap.has(sku)) {
      // 首次遇到该SKU，直接添加到Map
      skuMap.set(sku, { ...item });
    } else {
      // 已存在该SKU，累加数量
      const existingItem = skuMap.get(sku);
      existingItem.quantity =
        (parseInt(existingItem.quantity) || 0) + (parseInt(item.quantity) || 0);
      existingItem.received_quantity =
        (parseInt(existingItem.received_quantity) || 0) +
        (parseInt(item.received_quantity) || 0);
      existingItem.shelf_quantity =
        (parseInt(existingItem.shelf_quantity) || 0) +
        (parseInt(item.shelf_quantity) || 0);
    }
  });

  // 将Map转换回数组
  return Array.from(skuMap.values());
};

const getTotalQty = (items) => {
  return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
};

const getTotalReceivedQty = (items) => {
  return items.reduce(
    (sum, item) => sum + (parseInt(item.received_quantity) || 0),
    0
  );
};

const getTotalShelvedQty = (items) => {
  return items.reduce(
    (sum, item) => sum + (parseInt(item.shelf_quantity) || 0),
    0
  );
};

const getBoxStatus = (box) => {
  if (!box) return "未知";

  // 根据业务逻辑判断箱子状态
  if (box.received && box.shelved) {
    return "已上架";
  } else if (box.received) {
    return "已收货";
  } else {
    return "待处理";
  }
};

const getTotalBoxCount = (boxes) => {
  return boxes.length;
};

const getTotalItemsCount = (boxes) => {
  return boxes.reduce((sum, box) => sum + (parseInt(box.item_count) || 0), 0);
};

const getBoxItems = (box) => {
  if (!box.items || box.items.length === 0) {
    return [{ product_spec_sku: "", quantity: 0, received_quantity: 0 }];
  }

  // 实现箱内相同SKU合并逻辑
  const skuMap = new Map();
  box.items.forEach((item) => {
    const sku = item.product_spec_sku;
    if (!sku) return;

    if (!skuMap.has(sku)) {
      skuMap.set(sku, { ...item });
    } else {
      const existingItem = skuMap.get(sku);
      existingItem.quantity =
        (parseInt(existingItem.quantity) || 0) + (parseInt(item.quantity) || 0);
      existingItem.received_quantity =
        (parseInt(existingItem.received_quantity) || 0) +
        (parseInt(item.received_quantity) || 0);
    }
  });

  return Array.from(skuMap.values());
};

const close = () => {
  isOpen.value = false;
};
</script>

<style lang="scss" scoped>
.detail-dialog {
  .q-dialog__inner > div {
    border-radius: 4px;
  }

  .detail-card {
    display: flex;
    flex-direction: column;
  }

  .dialog-header {
    padding: 16px 24px;
  }

  .dialog-body {
    overflow-y: auto;
    background-color: #f5f7fa;
  }

  .detail-item {
    margin-bottom: 12px;

    .detail-label {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  :deep(.q-table th) {
    font-weight: 500;
    font-size: 14px;
    background-color: #f5f7fa;
  }

  :deep(.q-table td) {
    font-size: 14px;
  }

  :deep(.q-tab) {
    min-height: 40px;
  }

  .product-col {
    min-width: 200px;
  }

  .measurement-col {
    min-width: 120px;
  }

  .product-info-cell {
    padding: 8px 12px;
  }

  .product-img-container {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
  }

  .product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .product-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .product-sku {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  .product-code {
    font-size: 12px;
  }

  .product-name {
    font-size: 12px;
  }

  // 修复表格列宽问题 - 移除旧的宽度定义
  :deep(.q-table th:nth-child(1)),
  :deep(.q-table td:nth-child(1)) {
    width: auto;
  }
  :deep(.q-table th:nth-child(2)),
  :deep(.q-table td:nth-child(2)) {
    width: auto;
  }
  :deep(.q-table th:nth-child(3)),
  :deep(.q-table td:nth-child(3)) {
    width: auto;
  }
  :deep(.q-table th:nth-child(4)),
  :deep(.q-table td:nth-child(4)) {
    width: auto;
  }

  // 确保合计行样式一致
  :deep(.q-table tbody tr.bg-grey-2 td),
  :deep(.q-markup-table tbody tr.bg-grey-2 td) {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    font-weight: 500;
  }

  :deep(tr.bg-grey-2 td) {
    height: 48px;
    line-height: 24px;
    padding: 12px 16px;
  }
}
</style> 