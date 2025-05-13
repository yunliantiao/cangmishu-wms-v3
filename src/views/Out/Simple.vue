<template>
  <div class="simple-print-page">
    <!-- 搜索过滤区域 - 第一行 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.source"
            :options="orderSourceOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="订单来源"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.platform"
            :options="platformOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="平台"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            v-model="pageParams.order_status"
            :options="orderStatusOptions"
            label="订单状态"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.intercept_status"
            :options="interceptStatusOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="拦截状态"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <DatePickerNew
            :selectInfo="componentData.selectInfo"
            :dateList="timeFilterOptions"
          ></DatePickerNew>
        </div>
      </div>

      <!-- 搜索过滤区域 - 第三行 -->
      <div class="row q-col-gutter-sm q-mt-sm">
        <KeywordSearch
          :selectInfo="componentData.keywordInfo"
          :showSearchMode="false"
          :searchTypeList="searchFieldOptions"
        ></KeywordSearch>

        <div class="col-auto">
          <q-btn
            outline
            color="grey"
            label="重置"
            class="q-mr-sm filter-btn"
            @click="resetSearch"
          />
          <q-btn
            color="primary"
            icon="search"
            class="filter-btn"
            label="搜索"
            :loading="$store.state.btnLoading"
            @click="getOutboundOrder"
          />
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="main-table">
      <q-table
        :rows="packages"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        selection="multiple"
        v-model:selected="selectedRows"
        hide-pagination
        :pagination="{
          page: pageParams.page,
          rowsPerPage: pageParams.per_page,
          total: pageParams.total,
        }"
        :loading="$store.state.btnLoading"
      >
        <template v-slot:body="props">
          <!-- 分组标题行 -->
          <template v-if="showGroupHeader(props.row, props.pageIndex)">
            <q-tr class="group-header-row">
              <q-td colspan="8">
                <div class="row group-header items-center">
                  <div class="col-12">
                    <span class="info-item q-mr-md"
                      >包裹号: {{ props.row.system_order_number }}</span
                    >
                    <span class="info-item q-mr-md"
                      >客户: {{ props.row.customer.name }}</span
                    >
                    <span class="info-item q-mr-md">
                      {{ props.row.source }}</span
                    >
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- 数据行 -->
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" />
            </q-td>
            <q-td key="packageInfo" :props="props">
              <div>
                <div class="text-weight-medium">
                  {{
                    props.row.packageNote ? `(${props.row.packageNote})` : ""
                  }}
                </div>
                <div>
                  <div
                    v-for="(item, index) in props.row.packages"
                    :key="index"
                    class="q-mt-xs"
                  >
                    <div v-for="ele in item.items" :key="ele.id">
                      {{ ele.sku }} x{{ ele.quantity }}
                    </div>
                  </div>
                </div>
                <div v-if="props.row.note" class="text-grey">
                  {{ props.row.note }}
                </div>
              </div>
            </q-td>
            <!-- <q-td key="shippingInfo" :props="props">
              <div>
                <div>{{ props.row.shippingMethod }}</div>
                <div>客户: {{ props.row.customer }}</div>
              </div>
            </q-td> -->
            <q-td key="printStatus" :props="props">
              {{ props.row.printStatus }}
            </q-td>
            <q-td key="recipient" :props="props">
              <div>
                <div>{{ props.row.recipient.first_name }}</div>
                <div>
                  {{ props.row.recipient.province }}
                  {{ props.row.recipient.city }}
                  {{ props.row.recipient.district }}
                </div>
                <div>{{ props.row.recipient.address1 }}</div>
              </div>
            </q-td>
            <q-td key="time" :props="props">
              <div class="text-grey-8">
                <div>创建: {{ props.row.created_at }}</div>
              </div>
            </q-td>
            <q-td key="status" :props="props">
              <div class="q-pa-sm">
                <q-icon
                  name="print"
                  size="20px"
                  :color="
                    isPrint(props.row, 'is_print_pick_label')
                      ? 'green'
                      : 'grey-7'
                  "
                />
              </div>
              <div>
                {{
                  isPrint(props.row, "is_print_pick_label")
                    ? "已打印"
                    : "待打单"
                }}
              </div>
            </q-td>
            <q-td key="actions" :props="props">
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handlePicking(props.row)"
                  icon="print"
                >
                  <q-tooltip>打印拣货单</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handlePrint(props.row)"
                  icon="edit_calendar"
                >
                  <q-tooltip>打印面单</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handleOrderDetails(props.row)"
                  icon="library_books"
                >
                  <q-tooltip>详情</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span> 无数据 </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
      </q-table>

      <!-- 分页 -->
      <div class="q-pa-md">
        <Pagination
          :total-count="pageParams.total"
          v-model:page="pageParams.page"
          v-model:rows-per-page="pageParams.per_page"
          @page-change="getOutboundOrder"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <OrderDetailsDialog
      v-model:visible="showOrderDialog"
      :order="currentOrder"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import OrderDetailsDialog from "./components/OrderDetailsDialog.vue";
import outApi from "@/api/out";
import DatePickerNew from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";

const $q = useQuasar();
const router = useRouter();

// 抽屉相关状态
const showOrderDialog = ref(false);
const currentOrder = ref(null);

// 检查订单状态
const isStatusActive = (status) => {
  const statusMap = {
    pending: 0,
    picking: 1,
    packaging: 2,
    waiting_ship: 3,
    shipped: 4,
  };

  const orderStatus = currentOrder.value?.status || "pending";
  const currentStatusValue = statusMap[orderStatus] || 0;
  const checkStatusValue = statusMap[status] || 0;

  return checkStatusValue <= currentStatusValue;
};

// 筛选选项

// 筛选选项

const orderSourceOptions = ref([
  {
    label: "ERP推送",
    value: "erp_push",
  },
  {
    label: "OMS创建",
    value: "oms_create",
  },
  {
    label: "平台推送",
    value: "platform_push",
  },
]);

const receivedStatusOptions = ref([
  {
    label: "待收货",
    value: "pending",
  },
  {
    label: "部分收货",
    value: "partially_received",
  },
  {
    label: "已收货",
    value: "fully_received",
  },
]);

const platformOptions = [
  {
    label: "customer",
    value: "customer",
  },
  {
    label: "dsfulfill",
    value: "dsfulfill",
  },
  {
    label: "amazon",
    value: "amazon",
  },
  {
    label: "other",
    value: "other",
  },
];

const orderStatusOptions = ref([
  {
    label: "待发货",
    value: "pending_shipment",
  },
  {
    label: "拣货中",
    value: "picking",
  },
  {
    label: "已拣货",
    value: "picked",
  },
  {
    label: "已发货",
    value: "shipped",
  },
  {
    label: "异常",
    value: "exception",
  },
]);

const interceptStatusOptions = ref([
  {
    label: "已拦截",
    value: "intercept_requested",
  },
  {
    label: "未拦截",
    value: "no_intercept",
  },
]);
const timeFilterOptions = [
  {
    label: "创建时间",
    value: "created_at",
  },
  { label: "发货时间", value: "shipped_at" },
  { label: "取消时间", value: "cancel_at" },
];

const searchFieldOptions = [
  {
    label: "sku",
    value: "sku",
  },
  { label: "订单号", value: "order_number" },
  {
    label: "包裹号",
    value: "package_number",
  },
  { label: "追踪号", value: "tracking_number" },
  { label: "ERP单号", value: "erp_package_number" },
];

const isPrint = (row, type) => {
  let printBool = false;
  row.packages.forEach((item) => {
    if (item[type]) {
      printBool = true;
    }
  });
  return printBool;
};

const componentData = reactive({
  selectInfo: {
    date_type: "created_at",
    date_range: [],
  },
  keywordInfo: {
    search_type: "sku",
    search_value: "",
  },
});

// 选中行
const selectedRows = ref([]);

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  source: "",
  platform: "",
  order_status: "",
  intercept_status: "",
  date_type: "",
  start_date: "",
  end_date: "",
  search_type: "",
  keywords: "",
});

// 表格数据
const columns = [
  {
    name: "packageInfo",
    label: "包裹信息",
    field: "packageInfo",
    align: "left",
  },
  //   {
  //     name: "shippingInfo",
  //     label: "物流方式/运单号",
  //     field: "shippingInfo",
  //     align: "left",
  //   },
  {
    name: "printStatus",
    label: "面单打印",
    field: "printStatus",
    align: "center",
  },
  {
    name: "recipient",
    label: "收货人&地区",
    field: "recipient",
    align: "left",
  },
  {
    name: "time",
    label: "时间",
    field: "time",
    align: "left",
  },
  {
    name: "status",
    label: "状态",
    field: "status",
    align: "center",
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
  },
];

// 产品详情表格列
const productDetailColumns = [
  {
    name: "product",
    required: true,
    label: "商品信息",
    align: "left",
    field: (row) => row,
    style: "width: 40%",
  },
  {
    name: "dimensions",
    label: "商品实际规格",
    align: "center",
    field: (row) =>
      `${
        row.product_spec_actual_length || row.product_spec_size_length || "--"
      } × ${
        row.product_spec_actual_width || row.product_spec_size_width || "--"
      } × ${
        row.product_spec_actual_height || row.product_spec_size_height || "--"
      } cm`,
  },
  {
    name: "weight",
    label: "实际重量",
    align: "center",
    field: (row) =>
      `${row.product_spec_actual_weight || row.product_spec_weight || "--"} g`,
  },
  {
    name: "location",
    label: "货架位",
    align: "center",
    field: (row) => row.location || row.storage_location || "--",
  },
  {
    name: "quantity",
    label: "数量",
    align: "center",
    field: "quantity",
  },
];
// 状态颜色映射
const statusColorMap = {
  pending_shipment: { bg: "blue-1", text: "blue" },
  picking: { bg: "orange-1", text: "orange" },
  picked: { bg: "purple-1", text: "purple" },
  shipped: { bg: "teal-1", text: "teal" },
  exception: { bg: "green-1", text: "green" },
};
// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || { bg: "grey-4", text: "grey-8" };
};
const resetSearch = () => {
  pageParams.start_date = "";
  pageParams.end_date = "";
  pageParams.search_type = "";
  pageParams.keywords = "";
  pageParams.source = "";
  pageParams.platform = "";
  pageParams.order_status = "";
  pageParams.intercept_status = "";
  pageParams.date_type = "";

  componentData.keywordInfo = { search_type: "sku", search_value: "" };
  componentData.selectInfo = { date_type: "created_at", date_range: [] };
  getOutboundOrder();
};

// 模拟数据
const packages = ref([]);

const getOutboundOrder = () => {
  let params = {
    ...pageParams,
    date_type: componentData.selectInfo.date_type,
    start_date: componentData.selectInfo?.date_range[0] || "",
    end_date: componentData.selectInfo?.date_range[1] || "",
    search_type: componentData.keywordInfo.search_type,
    keywords: componentData.keywordInfo.search_value,
  };
  outApi.getShipments(params).then((res) => {
    if (res.success) {
      packages.value = res.data.items;
      pageParams.total = res.data.meta.total;
    }
  });
};
//批量设置待发货
const handleSetPendingShipment = () => {
  if (!selectedRows.value.length) {
    $q.notify({
      title: "提示",
      message: "请选择包裹",
      type: "negative",
      position: "top",
    });
    return;
  }
  let packageIds = selectedRows.value
    .map((item) => item.packages.map((ele) => ele.id))
    .flat();
  outApi
    .setPendingShipment({
      package_ids: packageIds,
      is_print_shipping_label: true,
    })
    .then((res) => {
      if (res.success) {
        getOutboundOrder();
      }
    });
};

// 添加 showGroupHeader 函数
const showGroupHeader = (row, index) => {
  // 第一行显示标题
  if (index === 0) return true;

  // 如果当前行的group_id与前一行不同，显示标题
  const prevRow = packages.value[index - 1];
  return prevRow && row.id !== prevRow.id;
};

//订单详情
const handleOrderDetails = (row) => {
  currentOrder.value = row;
  showOrderDialog.value = true;
};

// 功能处理方法
const handleSearch = () => {
  console.log("搜索条件:", searchText.value);
};

const handleExport = (type) => {
  console.log(`导出${type === "selected" ? "选中" : "全部"}包裹`);
};

const handlePicking = (item) => {
  outApi.getOutboundOrderPicking(item.id).then((res) => {
    if (res.success) {
      window.open(res.data.data, "_blank");
      $q.dialog({
        title: "提示",
        message: "拣货单打印结果确认是否打印成功？",
        ok: {
          label: "是",
          color: "primary",
        },
        cancel: {
          label: "否",
          color: "grey",
        },
        persistent: true,
      }).onOk(() => {
        if (res.success) {
          outApi
            .getOutboundOrderPickingResult(item.id, {
              is_printed: true,
            })
            .then((res) => {
              if (res.success) {
                getOutboundOrder();
              }
            });
        }
      });
    }
  });
};

const handlePrint = (type) => {
  outApi
    .getOutboundOrderPrint(type.packages[0].id, {
      is_printed: true,
    })
    .then((res) => {
      if (res.success) {
        window.open(res.data.data, "_blank");
        $q.dialog({
          title: "提示",
          message: "面单打印结果确认是否打印成功？",
          ok: {
            label: "是",
            color: "primary",
          },
          cancel: {
            label: "否",
            color: "grey",
          },
          persistent: true,
        }).onOk(() => {
          if (res.success) {
            outApi
              .signExpressSheet(type.packages[0].id, {
                is_printed: true,
              })
              .then((res) => {
                if (res.success) {
                  getOutboundOrder();
                }
              });
          }
        });
      }
    });
};

const toggleSortByTime = () => {
  console.log("切换时间排序");
};

const handleCopyPackage = (row) => {
  console.log("复制包裹:", row);
};

const handleDeletePackage = (row) => {
  console.log("删除包裹:", row);
};

onMounted(() => {
  // 初始化逻辑，可以加载数据等
  getOutboundOrder();
});
</script>

<style lang="scss">
.simple-print-page {
  .main-table {
    background: #ffffff;
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;
    padding: 32px;
    margin-top: 20px;
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
  .q-table th {
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
  }

  .q-table td {
    font-size: 14px;
    padding: 12px 16px;
    color: rgba(0, 0, 0, 0.75);
    white-space: normal;
  }

  .q-table tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  .q-table tbody tr .q-btn {
    opacity: 0.7;
  }

  .q-table tbody tr:hover .q-btn {
    opacity: 1;
  }

  .group-header-row {
    background-color: #f8fafc;
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    td {
      //   padding: 10px 16px;
      width: 100%;
    }
  }

  .group-header {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 13px;

    .info-item {
      color: rgba(0, 0, 0, 0.75);
      padding-right: 8px;
    }
  }
}
</style>

