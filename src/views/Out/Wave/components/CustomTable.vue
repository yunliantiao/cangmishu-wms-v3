<template>
  <div class="custom-table">
    <div class="row items-center q-mb-sm">
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="componentData.customerFilter"
          multiple
          clearable
          :options="componentData.customerList"
          @update:model-value="updateFilter"
          :label="trans('全部客户')"
          class="filter-item"
          emit-value
          map-options
        />
      </div>
      <div class="col-auto select-text" v-if="showError">
        <span>{{ trans("选择") }} {{ componentData.selectedRows.length }}</span>
      </div>
      <div class="col-auto q-ml-md" v-if="props.showError">
        <q-btn
          flat
          color="primary"
          @click="handleError"
          :label="trans('标记异常')"
        />
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 0 }"
      flat
      hide-pagination
      hide-bottom
      v-model:selected="componentData.selectedRows"
      selection="multiple"
      separator="horizontal"
      :selected-rows-label="getSelectedString"
    >
      <!-- 包裹行和商品行的组合展示 -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <!-- 选择框列 -->
          <q-td auto-width align="center" v-if="showError">
            <q-checkbox size="sm" v-model="props.selected" />
          </q-td>

          <!-- 包裹信息列 -->
          <q-td key="package_info" :props="props">
            <span class="package_info">
              {{ trans("订单号") }}:
              <span
                class="hover-copy"
                @click="$copy(props.row.system_order_number)"
              >
                {{ props.row.system_order_number }}
              </span>
              ({{ getWaveTypeText(props.row.package_type) }})
            </span>

            <span class="package_info" style="margin-left: 10px">
              {{ trans("包裹号") }}:
              <span class="hover-copy" @click="$copy(props.row.package_number)">
                {{ props.row.package_number }}
              </span>
            </span>
          </q-td>

          <!-- 物流方式列 -->
          <q-td key="logistics" :props="props">
            <div class="package_info">
              {{ trans("客户") }}: {{ props.row.customer?.name }} [{{
                props.row.customer?.code
              }}]
            </div>
          </q-td>

          <!-- 收货人列 -->
          <q-td key="receiver" :props="props">
            <!-- 包裹行未填充收货人 -->
          </q-td>

          <!-- 状态列 -->
          <q-td key="status" :props="props">
            <!-- 包裹行未填充状态 -->
          </q-td>

          <!-- 操作列 -->
          <q-td key="actions" :props="props">
            <!-- 包裹行未填充操作 -->
          </q-td>
        </q-tr>

        <!-- 商品明细行 -->
        <q-tr
          v-if="props.row.items && props.row.items.length"
          class="product-row"
        >
          <!-- 选择框列留空 -->
          <q-td auto-width v-if="showError"></q-td>

          <!-- 商品详情列 -->
          <q-td key="package_info" :props="props">
            <div class="product-details">
              <div
                class="product-item"
                v-for="(product, pIndex) in props.row.items"
                :key="pIndex"
              >
                <div class="product-image">
                  <img :src="product.sku_image" width="70" height="70" />
                </div>
                <div class="product-info">
                  <div class="product-code">
                    {{ product.sku || "--" }}
                  </div>
                  <div class="product-name">
                    {{ product.product_name || "--" }}
                  </div>
                  <div class="product-sku">
                    {{ product.sku_name || "--" }}
                    <span>x{{ product.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
          </q-td>

          <!-- 物流方式列 -->
          <q-td key="logistics" :props="props">
            <div class="status-text">
              {{ trans("物流方式") }}:{{
                props.row.logistics_channels_name || "--"
              }}
            </div>
            <div class="status-text">
              {{ trans("单号") }}:{{ props.row.tracking_number || "--" }}
            </div>
          </q-td>

          <!-- 收货人列 -->
          <q-td key="receiver" :props="props">
            <div class="status-text">
              {{ props.row.receive_city || "--" }}
            </div>
            <div class="status-text">
              {{ props.row.receive_name || "--" }}
            </div>
          </q-td>

          <!-- 状态列 -->
          <q-td key="status" :props="props">
            <div class="status-text">
              {{ getStatusDesc(props.row.status) }}
            </div>
            <div class="status-text">
              {{ trans("创建") }}:{{ props.row.created_at }}
            </div>
            <div class="status-text">
              {{ trans("波次") }}:{{ props.row.wave_at }}
            </div>
          </q-td>

          <!-- 操作列 -->
          <q-td key="actions" :props="props">
            <q-btn
              @click="handleErrorRow(props.row)"
              flat
              round
              v-if="
                [
                  'pending_transfer',
                  'pending_print',
                  'pending_pick',
                  'pending_pack',
                ].includes(props.row.status)
              "
              size="sm"
              class="table-icon"
            >
              <img src="@/assets/images/error.png" />
              <q-tooltip>{{ trans("标记异常") }}</q-tooltip>
            </q-btn>

            <q-btn
              @click="showOrderDialog(props.row)"
              flat
              round
              class="table-icon"
            >
              <img src="@/assets/images/detail.png" />
              <q-tooltip>{{ trans("详情") }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>

      <!-- 表头插槽 -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <!-- 全选框 -->
          <q-th auto-width v-if="showError" align="center">
            <q-checkbox size="sm" v-model="props.selected" />
          </q-th>

          <!-- 其他表头 -->
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- 无数据显示 -->
      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-md">
          <q-icon name="sentiment_dissatisfied" size="2em" color="grey-7" />
          <span class="text-grey-7">{{ trans("暂无数据") }}</span>
        </div>
      </template>
    </q-table>

    <OrderDetailsDialog
      v-model:visible="componentData.showOrderDialog"
      :order="componentData.currentOrder"
    />

    <HandleError ref="handleErrorRef" @handleConfirm="refresh"></HandleError>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import OrderDetailsDialog from "../../components/OrderDetailsDialog.vue";
import outApi from "@/api/out";
import HandleError from "./HandleError.vue";
import trans from "@/i18n";
import { Notify } from "quasar";
import CustomerApi from "@/api/customer.js";

const NotifyUtils = {
  notify: (message) => {
    Notify.create({
      message,
      color: "negative",
    });
  },
};

onMounted(() => {
  getCustomerList();
});

const getCustomerList = async () => {
  const { data } = await CustomerApi.getAllUser();
  componentData.customerList = data.map((row) => {
    return {
      label: row.name,
      value: row.id,
    };
  });
};

const componentData = reactive({
  showOrderDialog: false,
  currentOrder: null,
  // 筛选选项
  customerFilter: [],
  customerList: [],
  selectedRows: [],
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

// 列定义
const columns = computed(() => {
  return [
    {
      name: "package_info",
      required: true,
      label: trans("包裹信息"),
      align: "left",
      field: (row) => row.package_number,
    },
    {
      name: "logistics",
      required: true,
      label: trans("物流方式/运单号"),
      align: "left",
      field: (row) => row.logistics_channels_name,
    },
    {
      name: "receiver",
      required: true,
      label: trans("收货人&地区"),
      align: "left",
      field: (row) => row.receive_name,
    },
    {
      name: "status",
      required: true,
      label: trans("状态&时间"),
      align: "left",
      field: (row) => row.status,
    },
    {
      name: "actions",
      required: true,
      label: trans("操作"),
      align: "center",
      field: "actions",
    },
  ];
});

const route = useRoute();
const emit = defineEmits(["refresh", "updateFilter"]);

const showOrderDialog = async (row) => {
  const { data } = await outApi.getOrderInfo(row.order_id);
  componentData.currentOrder = data;
  componentData.showOrderDialog = true;
};

const updateFilter = () => {
  console.log(componentData.customerFilter);
  emit("updateFilter", componentData.customerFilter);
};

// 获取波次类型文本
const getWaveTypeText = (type) => {
  const typeMap = {
    single_item: trans("单品单数"),
    multi_items: trans("单品多数"),
    mixed_items: trans("多品混包"),
    hot_wave: trans("爆款包裹"),
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
    pending_transfer: trans("待调拨"),
    pending_print: trans("待加入波次"),
    pending_pick: trans("待拣货"),
    pending_pack: trans("待包装"),
    packing: trans("包装中"),
    pending_shipment: trans("待发货"),
    shipped: trans("已发货"),
    exception: trans("异常"),
    cancelled: trans("已取消"),
  };

  return statusMap[status] || status || trans("未知状态");
};

const getSelectedString = () => {
  return `${componentData.selectedRows.length} ${trans("已选择")}`;
};

const getCheckedList = () => {
  let ids = componentData.selectedRows.map((row) => row.id);
  return ids;
};

const handleError = () => {
  let ids = getCheckedList();
  if (ids.length) {
    handleErrorRef.value.open(route.query.id, ids);
  } else {
    NotifyUtils.notify(trans("请选择包裹"));
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

<style scoped lang="scss">
.custom-table {
  width: 100%;
  overflow-x: auto;
}

.product-row {
  // background-color: #f9f9f9;
  // background: #fbfaff;
}

.product-details {
  padding: 6px 0;
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.product-image {
  img {
    object-fit: contain;
    border: 1px solid #ebeef5;
  }
}

.product-info {
  flex: 1;
  margin-left: 10px;
}

.product-code {
  font-weight: 500;
  font-size: 14px;
  color: #5745c5;
  line-height: 16px;
  margin-bottom: 10px;
}

.product-name {
  width: 200px;
  margin-bottom: 10px;
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

/* 表格图标按钮样式 */
.table-icon {
  img {
    width: 20px;
    height: 20px;
  }
}
.package_info {
  font-weight: 500;
  font-size: 12px;
  color: #1f1f1f;
  line-height: 16px;
}

.select-text {
  margin-left: 20px;
}

.q-table thead {
  // background: #fbfaff !important;
}
// .q-table thead,
// .q-table tr,
// .q-table th,
// .q-table td {
//   background: #fbfaff !important;
// }

.status-text {
  font-weight: 600;
  font-size: 14px;
  color: #1f1f1f;
  line-height: 16px;
  margin-bottom: 10px;
}
</style>