<template>
  <div class="custom-table">
    <table>
      <thead>
        <tr>
          <th class="selection-cell">
            <input
              type="checkbox"
              v-model="selectAll"
              @change="toggleSelectAll"
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
          <tr class="package-row" :class="{ selected: isSelected(row) }">
            <td class="selection-cell">
              <input type="checkbox" v-model="selectedRows" :value="row" />
            </td>
            <td>
              <div>
                包裹号: {{ row.package_number }} ({{
                  getWaveTypeText(row.wave_type)
                }})
              </div>
            </td>
            <td>
              <div>
                客户: {{ row.customer_name || "test" }} [{{
                  row.customer_code || "CN03HB00002"
                }}]
              </div>
            </td>
          </tr>

          <!-- 商品明细行 -->
          <tr class="product-row" v-if="row.items && row.items.length">
            <td></td>

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
                      {{ product.code || product.sku_code || "3HB00001" }}
                    </div>
                    <div class="product-name">
                      {{ product.name || product.sku_name || "TEST01" }}
                    </div>
                    <div class="product-sku">{{ product.sku || "TEST" }}</div>
                  </div>
                  <div class="product-quantity">
                    x{{ product.quantity || 2 }}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div>物流方式i暂时没有</div>
              <div>{{ row.tracking_number }}</div>
            </td>
            <td>
              <div>暂时没有</div>
            </td>
            <td>
              <div>
                {{ row.status }}
              </div>
              <div>创建:{{ row.created_at }}</div>
              <div>波次:{{ row.wave_at }}</div>
            </td>
            <td>
              <q-btn
                @click="handleError(row)"
                flat
                round
                color="grey-7"
                icon="report_gmailerrorred"
              >
                <q-tooltip>标记异常-暂无</q-tooltip>
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
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import OrderDetailsDialog from "../../components/OrderDetailsDialog.vue";
import outApi from "@/api/out";

const componentData = reactive({
  showOrderDialog: false,
  currentOrder: null,
});

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
});

const emit = defineEmits(["refresh"]);

const selectedRows = ref([]);
const selectAll = ref(false);

const showOrderDialog = async (row) => {
  console.log("row", row);
  const { data } = await outApi.getOrderInfo(row.order_id);
  console.log("data", data);

  componentData.currentOrder = data;
  componentData.showOrderDialog = true;
};

const handleError = () => {};

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = [...props.rows];
  } else {
    selectedRows.value = [];
  }
};

// 判断行是否被选中
const isSelected = (row) => {
  return selectedRows.value.some(
    (item) => item[props.rowKey] === row[props.rowKey]
  );
};

// 获取波次类型文本
const getWaveTypeText = (type) => {
  const typeMap = {
    single_item: "单品单数",
    multi_items: "单品多数",
    mixed_items: "多品混包",
    hot_wave: "爆款包裹",
  };
  return typeMap[type] || type || "单品多数";
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
  margin-bottom: 4px;
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