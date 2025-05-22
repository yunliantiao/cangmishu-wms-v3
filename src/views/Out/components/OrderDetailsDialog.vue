<template>
  <q-dialog
    v-model="dialogVisible"
    position="right"
    :maximized="$q.screen.lt.md"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    @hide="onDialogHide"
  >
    <q-card class="order-details-dialog" style="width: 80vw; max-width: 1400px">
      <!-- 对话框头部 -->
      <q-card-section class="dialog-header row items-center bg-white">
        <div class="text-subtitle1">
          {{ trans("包裹详情") }}
          <span class="wave-number" v-if="getWaveNumber(order)">
            {{ getWaveNumber(order) }}
          </span>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="dialogVisible = false" />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <div class="order-details-content">
          <!-- 订单状态卡片 -->
          <div class="status-card q-pa-lg bg-white">
            <div class="row justify-between items-center">
              <div class="column">
                <div class="row items-baseline">
                  <div class="text-h6 q-mr-md">
                    {{ order?.system_order_number || "" }}
                  </div>
                  <div class="status-text q-mt-sm text-green">
                    {{ getStatus(order?.status) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单状态进度条 -->
            <!-- <div class="status-progress q-mt-xl">
              <div class="progress-line"></div>
              <div class="status-steps row justify-between">
                <div
                  class="status-step"
                  :class="{ active: isStatusActive('pending') }"
                >
                  <div class="step-icon-wrapper">
                    <q-icon name="inventory" size="24px" class="step-icon" />
                  </div>
                  <div class="step-text q-mt-sm">待拣货</div>
                </div>
                <div
                  class="status-step"
                  :class="{ active: isStatusActive('picking') }"
                >
                  <div class="step-icon-wrapper">
                    <q-icon name="archive" size="24px" class="step-icon" />
                  </div>
                  <div class="step-text q-mt-sm">待包装</div>
                </div>
                <div
                  class="status-step"
                  :class="{ active: isStatusActive('packaging') }"
                >
                  <div class="step-icon-wrapper">
                    <q-icon
                      name="inventory_2"
                      size="24px"
                      class="step-icon"
                    />
                  </div>
                  <div class="step-text q-mt-sm">包装中</div>
                </div>
                <div
                  class="status-step"
                  :class="{ active: isStatusActive('waiting_ship') }"
                >
                  <div class="step-icon-wrapper">
                    <q-icon
                      name="local_shipping"
                      size="24px"
                      class="step-icon"
                    />
                  </div>
                  <div class="step-text q-mt-sm">待发货</div>
                </div>
                <div
                  class="status-step"
                  :class="{ active: isStatusActive('shipped') }"
                >
                  <div class="step-icon-wrapper">
                    <q-icon
                      name="check_circle"
                      size="24px"
                      class="step-icon"
                    />
                  </div>
                  <div class="step-text q-mt-sm">已发货</div>
                </div>
              </div>
            </div> -->
          </div>

          <!-- 商品信息卡片 -->
          <div class="info-card bg-white q-mb-md">
            <div class="info-header q-px-md q-py-sm">
              {{ trans("商品信息") }}
            </div>

            <div class="product-list q-pa-md">
              <q-table
                :rows="orderItems"
                :columns="productDetailColumns"
                row-key="id"
                flat
                bordered
                hide-bottom
                :pagination="{ rowsPerPage: 0 }"
              >
                <template v-slot:body-cell-product="props">
                  <q-td :props="props">
                    <div class="row no-wrap items-center">
                      <img
                        :src="
                          props.row.sku_image ||
                          'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                        "
                        class="product-image q-mr-md"
                      />
                      <div>
                        <div class="text-weight-medium">
                          {{ props.row.sku }}
                        </div>
                        <div class="text-caption text-grey-8 q-mt-xs">
                          {{ props.row.product_name }}
                        </div>
                        <div class="text-caption q-mt-xs">
                          {{ props.row.product_spec_name }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <!-- 客户信息 -->
            <div class="col-12 col-md-6">
              <div class="info-card bg-white">
                <div class="info-header q-px-md q-py-sm">
                  {{ trans("客户信息") }}
                </div>
                <div class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("客户代码") }}</div>
                      <div class="info-value">
                        {{ order?.customer?.code || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("客户姓名") }}</div>
                      <div class="info-value">
                        {{ order?.customer?.name || "" }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-header q-px-md q-py-sm">
                  {{ trans("物流信息") }}
                </div>
                <div class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 info-row">
                      <div class="info-label">{{ trans("物流方式") }}</div>
                      <div class="info-value">
                        {{ order?.shipping_method || "--" }}
                      </div>
                    </div>
                    <div class="col-12 info-row">
                      <div class="info-label">{{ trans("运单号") }}</div>
                      <div class="info-value">
                        {{ order?.tracking_number || "--" }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-header q-px-md q-py-sm">
                  {{ trans("包裹规格") }}
                </div>
                <div class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("包裹体积") }}</div>
                      <div class="info-value">
                        {{
                          order?.packages[0].size_length +
                            "×" +
                            order?.packages[0].size_width +
                            "×" +
                            order?.packages[0].size_height || "--"
                        }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("包裹重量") }}</div>
                      <div class="info-value">
                        {{ order?.packages[0].actual_weight || "--" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 收件人信息 -->
            <div class="col-12 col-md-6">
              <div class="info-card bg-white">
                <div class="info-header q-px-md q-py-sm">
                  {{ trans("收件人信息") }}
                </div>
                <div class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("收件人") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.first_name || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("电话") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.phone || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("国家") }}</div>
                      <div class="info-value">
                        {{
                          order?.recipient?.country_code ||
                          order?.recipient?.country ||
                          ""
                        }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("省/州") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.province || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("市/府") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.city || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("区/县") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.district || "" }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6 info-row">
                      <div class="info-label">{{ trans("邮编") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.postcode || "" }}
                      </div>
                    </div>
                    <div class="col-12 info-row">
                      <div class="info-label">{{ trans("地址1") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.address1 || "" }}
                      </div>
                    </div>
                    <div class="col-12 info-row">
                      <div class="info-label">{{ trans("地址2") }}</div>
                      <div class="info-value">
                        {{ order?.recipient?.address2 || "" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import trans from "@/i18n";

const $q = useQuasar();

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: () => ({}),
  },
});

// Emits
const emit = defineEmits(["update:visible"]);

// 控制对话框显示
const dialogVisible = ref(props.visible);

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听dialogVisible变化，通知父组件
watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
});

const getStatus = (status) => {
  const statusMap = {
    pending_shipment: trans("待发货"),
    shipped: trans("已发货"),
    exception: trans("异常"),
  };
  return statusMap[status] || "";
};

// 订单状态
const isStatusActive = (status) => {
  const statusMap = {
    pending: 0,
    picking: 1,
    packaging: 2,
    waiting_ship: 3,
    shipped: 4,
  };

  const orderStatus = props.order?.status || "pending";
  const currentStatusValue = statusMap[orderStatus] || 0;
  const checkStatusValue = statusMap[status] || 0;

  return checkStatusValue <= currentStatusValue;
};

// 计算商品列表
const orderItems = computed(() => {
  if (!props.order || !props.order.packages) return [];

  // 从packages中提取所有items并合并
  const items = [];
  props.order.packages.forEach((pkg) => {
    if (pkg.items && Array.isArray(pkg.items)) {
      items.push(...pkg.items);
    }
  });
  return items;
});

// 产品详情表格列
const productDetailColumns = [
  {
    name: "product",
    required: true,
    label: trans("商品信息"),
    align: "left",
    field: (row) => row,
    style: "width: 40%",
  },
  {
    name: "dimensions",
    label: trans("商品实际规格"),
    align: "center",
    field: (row) =>
      `${row.sku_size_length} × ${row.sku_size_width} × ${row.sku_size_height} cm`,
  },
  {
    name: "weight",
    label: trans("实际重量"),
    align: "center",
    field: (row) => `${row.sku_weight || "--"} g`,
  },
  {
    name: "location",
    label: trans("货架位"),
    align: "center",
    field: (row) =>
      row?.stock_locations
        ?.map((location) => location.warehouse_location_code)
        .join(", ") || "--",
  },
  {
    name: "quantity",
    label: trans("数量"),
    align: "center",
    field: "quantity",
  },
];

// 关闭对话框时触发
const onDialogHide = () => {
  emit("update:visible", false);
};

const getWaveNumber = (order) => {
  console.log("order", order);
  let waveNumber = "";
  order.packages.forEach((row) => {
    waveNumber = row.wave_number;
  });

  return waveNumber;
};
</script>

<style lang="scss">
// 弹窗样式需要在全局范围内生效
.order-details-dialog {
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-radius: 0;

  .dialog-header {
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    padding: 12px 16px;
  }

  .q-card__section.q-card__section--vert.q-pa-none {
    flex: 1;
    overflow-y: auto;
  }

  .order-details-content {
    padding: 16px;
    height: 100%;
  }

  .status-card,
  .info-card {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    margin-bottom: 16px;
    background-color: white;
  }

  .status-text {
    font-size: 16px;
    font-weight: 500;
    color: #00b42a;
  }

  .status-progress {
    position: relative;
    margin-top: 32px;
    padding: 0 12px;

    .progress-line {
      position: absolute;
      top: 12px;
      left: 10%;
      right: 10%;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }

    .status-steps {
      position: relative;
      z-index: 2;
    }
  }

  .status-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .step-icon-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-radius: 50%;
      border: 2px solid #eeeeee;
    }

    .step-icon {
      color: #bdbdbd;
      font-size: 18px;
    }

    .step-text {
      font-size: 12px;
      color: #757575;
      margin-top: 6px;
      white-space: nowrap;
    }

    &.active {
      .step-icon-wrapper {
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
      }

      .step-icon {
        color: #1976d2;
      }

      .step-text {
        color: #1976d2;
        font-weight: 500;
      }
    }
  }

  .info-header {
    font-weight: 500;
    color: #424242;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f9f9f9;
  }

  .product-image {
    width: 60px;
    height: 60px;
    object-fit: contain;
    background-color: #f9f9f9;
    border: 1px solid #eeeeee;
    border-radius: 6px;
  }

  .info-row {
    .info-label {
      font-size: 13px;
      color: #757575;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 14px;
      color: #212121;
      font-weight: 500;
    }
  }

  .q-table {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      background-color: #f5f7fa;
    }

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      vertical-align: middle;
    }
  }
}

.wave-number {
  font-size: 14px;
  color: #5745c5;
  margin-left: 2px;
}
</style> 