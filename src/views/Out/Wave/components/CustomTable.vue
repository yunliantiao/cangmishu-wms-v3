<template>
  <div class="custom-table">
    <div class="row items-center q-mb-sm">
      <div class="col-auto">
        <span>选择 {{ componentData.selectCount }}</span>
      </div>
      <div class="col-auto q-ml-md" v-if="props.showError">
        <q-btn flat color="primary" @click="handleError" label="标记异常" />
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="selection-cell" v-if="props.showError">
            <q-checkbox
              v-model="selectAll"
              @update:model-value="toggleSelectAll"
            />
          </th>
          <th>包裹信息</th>
          <th>物流方式/运单号</th>
          <th>收货人&地区</th>
          <th>状态&时间</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(row, index) in rows" :key="row[rowKey]">
          <!-- 包裹行 -->
          <tr class="package-row">
            <td class="selection-cell" v-if="props.showError">
              <!-- <input type="checkbox" v-model="selectedRows" :value="row" /> -->
              <q-checkbox
                v-model="row.checked"
                @update:model-value="selectRow(row)"
              />
            </td>
            <td>
              <div>
                包裹号: {{ row.package_number }} ({{
                  getWaveTypeText(row.package_type)
                }})
              </div>
            </td>
            <td>
              <div>
                客户: {{ row.customer?.name }} [{{ row.customer?.code }}]
              </div>
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <!-- 商品明细行 -->
          <tr class="product-row" v-if="row.items && row.items.length">
            <td v-if="props.showError"></td>

            <td>
              <div class="product-details">
                <div
                  class="product-item"
                  v-for="(product, pIndex) in row.items"
                  :key="pIndex"
                >
                  <div class="product-image">
                    <img
                      :src="
                        product.sku_image || 'https://via.placeholder.com/60'
                      "
                      width="60"
                      height="60"
                    />
                  </div>
                  <div class="product-info">
                    <div class="product-code">
                      {{ product.sku || "--" }}
                      <span style="font-size: 18px; margin-left: 10px"
                        >x{{ product.quantity }}</span
                      >
                    </div>
                    <div class="product-name">
                      {{ product.product_name || "--" }}
                    </div>
                    <div class="product-sku">
                      {{ product.sku_name || "--" }}
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div>物流方式:{{ row.logistics_channels_name || "--" }}</div>
              <div>单号:{{ row.tracking_number || "--" }}</div>
            </td>
            <td>
              <div>
                {{ row.receive_city || "--" }}
              </div>
              <div>
                {{ row.receive_name || "--" }}
              </div>
            </td>
            <td>
              <div>
                {{ getStatusDesc(row.status) }}
              </div>
              <div>创建:{{ row.created_at }}</div>
              <div>波次:{{ row.wave_at }}</div>
            </td>
            <td>
              <q-btn
                @click="handleErrorRow(row)"
                flat
                round
                v-if="
                  [
                    'pending_transfer',
                    'pending_print',
                    'pending_pick',
                    'pending_pack',
                  ].includes(row.status)
                "
                color="grey-7"
                icon="report_gmailerrorred"
              >
                <q-tooltip>标记异常</q-tooltip>
              </q-btn>

              <q-btn
                @click="showOrderDialog(row)"
                flat
                round
                color="grey-7"
                icon="library_books"
              >
                <q-tooltip>详情</q-tooltip>
              </q-btn>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <OrderDetailsDialog
      v-model:visible="componentData.showOrderDialog"
      :order="componentData.currentOrder"
    />

    <HandleError ref="handleErrorRef" @handleConfirm="refresh"></HandleError>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import OrderDetailsDialog from "../../components/OrderDetailsDialog.vue";
import outApi from "@/api/out";
import HandleError from "./HandleError.vue";

const componentData = reactive({
  showOrderDialog: false,
  currentOrder: null,
});
const handleErrorRef = ref(null);

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: "id",
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  showError: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const emit = defineEmits(["refresh"]);
const selectAll = ref(false);

const showOrderDialog = async (row) => {
  const { data } = await outApi.getOrderInfo(row.order_id);
  componentData.currentOrder = data;
  componentData.showOrderDialog = true;
};

// 全选/取消全选
const toggleSelectAll = () => {
  props.rows.forEach((row) => {
    row.checked = selectAll.value;
  });

  getSelectCount();
};

const getSelectCount = () => {
  let num = 0;
  props.rows.forEach((row) => {
    if (row.checked) {
      num += 1;
    }
  });
  componentData.selectCount = num;
};

const selectRow = () => {
  let bool = true;
  props.rows.forEach((row) => {
    if (!row.checked) {
      bool = false;
    }
  });
  selectAll.value = bool;
  getSelectCount();
};

// 获取波次类型文本
const getWaveTypeText = (type) => {
  const typeMap = {
    single_item: "单品单数",
    multi_items: "单品多数",
    mixed_items: "多品混包",
    hot_wave: "爆款包裹",
  };
  return typeMap[type];
};

const getStatusDesc = (status) => {
  //   pending_transfer	订单进入WMS后，包裹内有商品在拣货区的库存不足
  // pending_print	没有加入波次的包裹
  // pending_pick	已加入波次但未打印拣货单
  // pending_pack	所在波次成功打印拣货单后包裹状态置为待包装
  // packing	所在波次开始进行扫描包装作业时，包裹状态为包装中
  // pending_shipment	完成包装但没有手动点击发货或者是扫描发货
  // shipped	完成手动点击发货或者是扫描发货
  // exception	手动标记异常的包裹
  // cancelled	发货前被取消的包裹

  const statusMap = {
    pending_transfer: "待调拨",
    pending_print: "待加入波次",
    pending_pick: "待拣货",
    pending_pack: "待包装",
    packing: "包装中",
    pending_shipment: "待发货",
    shipped: "已发货",
    exception: "异常",
    cancelled: "已取消",
  };

  return statusMap[status] || status || "未知状态";
};

const getCheckedList = () => {
  let ids = props.rows.filter((row) => row.checked).map((row) => row.id);
  return ids;
};

const handleError = () => {
  let ids = getCheckedList();
  if (ids.length) {
    handleErrorRef.value.open(route.query.id, ids);
  } else {
    NotifyUtils.notify("请选择包裹");
  }
};

const handleErrorRow = (row) => {
  let ids = [row.id];
  handleErrorRef.value.open(route.query.id, ids);
};

const refresh = () => {
  emit("refresh");
};
</script>

<style scoped>
.custom-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

td {
  color: #606266;
  font-size: 14px;
}

.package-row:hover {
  background-color: #f5f7fa;
}

.product-row {
  background-color: #f9f9f9;
}

.selection-cell {
  width: 50px;
  text-align: center;
}

.selected {
  background-color: #f0f7ff;
}

.product-details {
  /* padding: 10px; */
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.product-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.product-image {
  margin-right: 15px;
}

.product-image img {
  object-fit: contain;
  border: 1px solid #ebeef5;
}

.product-info {
  /* flex: 1; */
}

.product-code {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-name {
  width: 200px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.product-quantity {
  font-size: 16px;
  font-weight: 500;
  margin-left: 15px;
}

.logistics-tag {
  display: inline-block;
  background-color: #1976d2;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
}

.status-times {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.action-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
}
</style> 