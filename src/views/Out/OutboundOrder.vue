<template>
  <div class="simple-print-page">
    <!-- 状态筛选导航 -->
    <!-- <div class="search-bar top-status-nav">
      <div class="row q-gutter-x-md">
        <q-btn
          v-for="status in orderStatusOptions"
          :key="status.value"
          :flat="statusNav != status.value"
          :color="statusNav === status.value ? 'primary' : 'grey-7'"
          :label="status.label"
          class="status-btn"
          @click="handleStatusNav(status.value)"
        />
      </div>
    </div> -->
    <!-- 搜索过滤区域 - 第一行 -->

    <div class="search-bar">
      <div class="tabs-section q-mb-md">
        <q-tabs
          v-model="statusNav"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          @update:model-value="handleStatusNav"
          class="text-grey-8"
        >
          <q-tab
            :name="item.value"
            :label="item.label"
            v-for="item in orderStatusOptions"
            :key="item.value"
          />
        </q-tabs>
      </div>

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
            :label="trans('订单来源')"
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
            :label="trans('平台')"
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
            :label="trans('拦截状态')"
            class="filter-item"
          />
        </div>

        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.logistics_channels_ids"
            :options="logisticsOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            multiple
            clearable
            :label="trans('物流')"
            class="filter-item"
          />
        </div>
        <DatePicker
          v-model:date_type="pageParams.date_type"
          v-model:start_date="pageParams.start_date"
          v-model:end_date="pageParams.end_date"
          :dateList="timeFilterOptions"
        ></DatePicker>

        <KeywordSearch
          v-model:search_type="pageParams.search_type"
          v-model:search_value="pageParams.keywords"
          :searchTypeList="searchFieldOptions"
          :showSearchMode="false"
        ></KeywordSearch>

        <div class="col-auto">
          <q-btn
            outline
            color="primary"
            :label="trans('重置')"
            class="filter-btn"
            @click="resetSearch"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            class="filter-btn"
            :label="trans('查询')"
            :loading="$store.state.btnLoading"
            @click="getOutboundOrder"
          />
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="main-table">
      <div class="btn-group">
        <q-btn flat color="primary" class="table-icon">
          <q-icon name="print"></q-icon>
          <span class="print-text">
            {{ trans("导出") }}
          </span>
          <q-icon name="arrow_drop_down"></q-icon>

          <q-menu>
            <q-list style="min-width: 120px">
              <div class="btn-group-desc">{{ trans("按勾选导出") }}</div>
              <q-item
                clickable
                v-close-popup
                @click="handleExportByType('sku')"
              >
                <q-item-section>{{ trans("商品维度") }}</q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="handleExportByType('package')"
              >
                <q-item-section>{{ trans("包裹维度") }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          color="primary"
          :label="trans('批量发货')"
          flat
          icon="local_shipping"
          class="table-icon"
          v-if="statusNav == 'pending_shipment'"
          @click="handleBatchSendOutboundOrder"
        />

        <!-- <q-btn-dropdown
          color="primary"
          flat
          icon="print"
          :label="trans('导出')"
          class="filter-btn"
        >
          <q-list>
            <q-item clickable v-close-popup @click="handleExport('selected')">
              <q-item-section>{{ trans("导出选中") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleExport('all')">
              <q-item-section>{{ trans("导出全部") }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown> -->
      </div>

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
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width align="center">
              <q-checkbox v-model="props.selected" size="sm" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <!-- 分组标题行 -->
          <template v-if="showGroupHeader(props.row, props.pageIndex)">
            <q-tr class="group-header-row">
              <q-td colspan="8">
                <div class="row group-header items-center">
                  <div class="col-12">
                    <span
                      class="info-item q-mr-md hover-copy"
                      @click="$copy(props.row.system_order_number)"
                      >{{ trans("包裹号") }}:
                      {{ props.row.system_order_number }}</span
                    >

                    <span
                      class="info-item q-mr-md hover-copy"
                      @click="$copy(props.row.order_number)"
                      >{{ trans("订单号") }}: {{ props.row.order_number }}</span
                    >

                    <span class="info-item q-mr-md"
                      >{{ trans("客户") }}: {{ props.row.customer.name }}</span
                    >
                    <span class="info-item q-mr-md">
                      {{ props.row.source }}</span
                    >

                    <span v-if="props.row.remark" class="table-icon">
                      <img
                        src="@/assets/images/remark.png"
                        style="margin-bottom: -5px"
                      />
                      <q-tooltip>
                        {{ trans("备注") }} : {{ props.row.remark }}
                      </q-tooltip>
                    </span>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- 数据行 -->
          <q-tr :props="props">
            <q-td auto-width align="center">
              <q-checkbox v-model="props.selected" size="sm" />
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

            <q-td key="logistics_channels_name" :props="props">
              <div
                class="logistics-item"
                v-for="item in props.row.packages"
                :key="item.id"
              >
                <div>{{ item.logistics_channels_name }}</div>
                <div>
                  <span
                    v-if="item.tracking_number"
                    class="hover-copy"
                    style="color: #5745c5"
                    @click="$copy(item.tracking_number)"
                    >{{ item.tracking_number }}</span
                  >
                  <span v-else>--</span>
                </div>
              </div>
            </q-td>

            <q-td key="time" :props="props">
              <div class="text-grey-8">
                <div>{{ trans("创建") }} : {{ props.row.created_at }}</div>
              </div>
            </q-td>

            <q-td key="is_print_shipping_label" :props="props">
              <span
                class="is-print"
                v-if="isPrint(props.row, 'is_print_shipping_label')"
              >
                {{ trans("已打印") }}
              </span>
              <span v-else>
                {{ trans("未打印") }}
              </span>
            </q-td>
            <q-td key="status" :props="props">
              <div class="icons">
                <span class="table-icon">
                  <img
                    src="@/assets/images/print-success.png"
                    v-if="isPrint(props.row, 'is_print_pick_label')"
                  />
                  <img src="@/assets/images/print.png" v-else />
                  <q-tooltip>
                    {{
                      trans("拣货单{status}", {
                        status: isPrint(props.row, "is_print_pick_label")
                          ? trans("已打印")
                          : trans("未打印"),
                      })
                    }}
                  </q-tooltip>
                </span>

                <span class="table-icon">
                  <img
                    src="@/assets/images/sign-success.png"
                    v-if="isPrint(props.row, 'is_print_shipping_label')"
                  />
                  <img src="@/assets/images/sign-not.png" v-else />
                  <q-tooltip>
                    {{
                      trans("面单{status}", {
                        status: isPrint(props.row, "is_print_shipping_label")
                          ? trans("已打印")
                          : trans("未打印"),
                      })
                    }}
                  </q-tooltip>
                </span>

                <span class="table-icon">
                  <img
                    src="@/assets/images/shipped-success.png"
                    v-if="isPrint(props.row, 'shipped')"
                  />
                  <img src="@/assets/images/shipped-not.png" v-else />
                  <q-tooltip>
                    {{
                      isPrint(props.row, "shipped")
                        ? trans("已发货")
                        : trans("未发货")
                    }}
                  </q-tooltip>
                </span>
              </div>
              <q-chip
                v-if="props.row.ship_print_status == 'pending_print'"
                dense
                color="grey-4"
                text-color="grey-8"
              >
                {{ trans("待打单") }}
              </q-chip>
              <q-chip
                v-else
                dense
                :color="getStatusColor(props.row.status).bg"
                :text-color="getStatusColor(props.row.status).text"
              >
                {{
                  orderStatusOptions.find(
                    (item) => item.value === props.row.status
                  )?.label || trans("草稿")
                }}
              </q-chip>

              <div v-if="getIsExamine(props.row)">
                <span class="table-icon">
                  <img src="@/assets/images/examine.png" />
                  <q-tooltip>
                    {{ getIsExamine(props.row) }}
                  </q-tooltip>
                </span>
              </div>
            </q-td>
            <q-td key="actions" :props="props">
              <div class="row justify-center q-gutter-xs">
                <!-- <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handlePicking(props.row)"
                  icon="edit_calendar"
                  size="sm"
                >
                  <q-tooltip>打印拣货单</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handlePrint(props.row)"
                  icon="print"
                  size="sm"
                >
                  <q-tooltip>打印面单</q-tooltip>
                </q-btn> -->
                <q-btn
                  flat
                  round
                  color="grey-7"
                  v-if="props.row.status != 'shipped'"
                  class="table-icon"
                  @click="handleSendOutboundOrder(props.row)"
                  size="sm"
                >
                  <img src="@/assets/images/send.png" />
                  <q-tooltip>{{ trans("发货") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  @click="handleOrderDetails(props.row)"
                  size="sm"
                  class="table-icon"
                >
                  <img src="@/assets/images/detail.png" />
                  <q-tooltip>{{ trans("详情") }}</q-tooltip>
                </q-btn>

                <q-btn flat round color="grey-7" class="table-icon" size="sm">
                  <img src="@/assets/images/more.png" />
                  <q-menu>
                    <q-list style="min-width: 120px">
                      <q-item
                        clickable
                        v-close-popup
                        @click="handlePrint(props.row)"
                      >
                        <q-item-section>{{ trans("打印面单") }}</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        @click="handlePicking(props.row)"
                      >
                        <q-item-section>{{
                          trans("打印拣货单")
                        }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span> {{ trans("无数据") }} </span>
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
import customerApi from "@/api/customer";
import DatePicker from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import trans from "@/i18n";
import Message from "@/utils/message";
import logisticsApi from "@/api/logistics";

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

const orderSourceOptions = ref([
  {
    label: trans("ERP推送"),
    value: "erp_push",
  },
  {
    label: trans("OMS创建"),
    value: "oms_create",
  },
  {
    label: trans("平台推送"),
    value: "platform_push",
  },
]);

const receivedStatusOptions = ref([
  {
    label: trans("待收货"),
    value: "pending",
  },
  {
    label: trans("部分收货"),
    value: "partially_received",
  },
  {
    label: trans("已收货"),
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
    label: trans("全部"),
    value: "",
  },
  {
    label: trans("待发货"),
    value: "pending_shipment",
  },
  {
    label: trans("已发货"),
    value: "shipped",
  },
  {
    label: trans("异常"),
    value: "exception",
  },
]);

const interceptStatusOptions = ref([
  {
    label: trans("已拦截"),
    value: "intercept_requested",
  },
  {
    label: trans("未拦截"),
    value: "no_intercept",
  },
]);
const timeFilterOptions = ref([
  {
    label: trans("创建时间"),
    value: "created_at",
  },
  { label: trans("发货时间"), value: "shipped_at" },
  { label: trans("取消时间"), value: "cancel_at" },
]);

const searchFieldOptions = computed(() => {
  return [
    {
      label: trans("sku"),
      value: "sku",
    },
    { label: trans("订单号"), value: "order_number" },
    {
      label: trans("包裹号"),
      value: "package_number",
    },
    { label: trans("追踪号"), value: "tracking_number" },
    { label: trans("ERP单号"), value: "erp_package_number" },
  ];
});
// 选中行
const selectedRows = ref([]);
// 状态导航
const statusNav = ref("");

// 物流组
const logisticsOptions = ref([]);

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  // customer_id: "",
  source: "",
  platform: "",
  order_status: "",
  intercept_status: "",
  date_type: "created_at",
  start_date: "",
  end_date: "",
  search_type: "package_number",
  keywords: "",
  logistics_channels_ids: [],
});

// 表格数据
const columns = ref([
  {
    name: "packageInfo",
    label: trans("包裹信息"),
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
    name: "recipient",
    label: trans("收货人&地区"),
    field: "recipient",
    align: "left",
  },

  {
    name: "logistics_channels_name",
    label: trans("物流"),
    field: "logistics_channels_name",
    align: "left",
  },

  {
    name: "time",
    label: trans("时间"),
    field: "time",
    align: "left",
  },
  {
    name: "is_print_shipping_label",
    label: trans("面单打印"),
    field: "is_print_shipping_label",
    align: "center",
  },
  {
    name: "status",
    label: trans("状态"),
    field: "status",
    align: "center",
  },
  {
    name: "actions",
    label: trans("操作"),
    field: "actions",
    align: "center",
  },
]);
// 状态颜色映射
const statusColorMap = {
  pending_shipment: { bg: "blue-1", text: "blue" },
  picking: { bg: "orange-1", text: "orange" },
  picked: { bg: "purple-1", text: "purple" },
  shipped: { bg: "teal-1", text: "teal" },
  exception: { bg: "green-1", text: "green" },
};

const getLogistics = async () => {
  const { data } = await logisticsApi.getAllLogistics();
  logisticsOptions.value = data.map((item) => ({
    label: item.name,
    value: item.id,
  }));
};

// 处理状态导航切换
const handleStatusNav = (status) => {
  statusNav.value = status;
  pageParams.order_status = status;
  getOutboundOrder();
};

const resetSearch = () => {
  pageParams.start_date = "";
  pageParams.end_date = "";
  pageParams.search_type = "package_number";
  pageParams.keywords = "";
  pageParams.source = "";
  pageParams.platform = "";
  pageParams.order_status = "";
  pageParams.intercept_status = "";
  pageParams.date_type = "created_at";
  pageParams.logistics_channels_ids = [];

  getOutboundOrder();
};
// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || { bg: "grey-4", text: "grey-8" };
};

const packages = ref([]);
const getOutboundOrder = () => {
  let params = {
    ...pageParams,
  };

  if (!pageParams.logistics_channels_ids) {
    params.logistics_channels_ids = [];
  }

  outApi.getOutboundOrder(params).then((res) => {
    if (res.success) {
      packages.value = res.data.items;
      pageParams.total = res.data.meta.total;
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

const handleExport = (type) => {
  console.log(`导出${type === "selected" ? "选中" : "全部"}包裹`);
};

const handleSendOutboundOrder = (type) => {
  outApi.shipments(type.packages[0].id).then((res) => {
    if (res.success) {
      getOutboundOrder();
    }
  });
};

const handlePicking = async (type) => {
  const { data } = await outApi.getOutboundOrderPicking(type.id, {
    is_printed: true,
  });
  window.open(data.data, "_blank");
  let bool = type.packages[0].is_print_pick_label;
  if (!bool) {
    $q.dialog({
      title: trans("提示"),
      message: trans("拣货单已成功生成，如果已成功打印，请点击”标记为已打印“"),
      cancel: true,
      persistent: true,
      ok: {
        label: trans("标记为已打印"),
        color: "primary",
      },
      cancel: {
        label: trans("取消"),
        color: "grey-7",
      },
    }).onOk(async () => {
      await outApi.getOutboundOrderPickingResult(type.id, {
        is_printed: true,
      });
      getOutboundOrder();
    });
  }
};

const isPrint = (row, type) => {
  let printBool = false;
  row.packages.forEach((item) => {
    if (item[type]) {
      printBool = true;
    }
  });
  return printBool;
};

const handlePrint = async (type) => {
  let packageId = type.packages[0].id;
  const { data } = await outApi.getOutboundOrderPrint(packageId);
  window.open(data.data, "_blank");
  let bool = type.packages[0].is_print_shipping_label;

  if (!bool) {
    $q.dialog({
      title: trans("提示"),
      message: trans("面单已成功生成，如果已成功打印，请点击”标记为已打印“"),
      cancel: true,
      persistent: true,
      ok: {
        label: trans("标记为已打印"),
        color: "primary",
      },
      cancel: {
        label: trans("取消"),
        color: "grey-7",
      },
    }).onOk(() => {
      outApi
        .signExpressSheet(packageId, {
          is_printed: true,
        })
        .then((res) => {
          if (res.success) {
            getOutboundOrder();
          }
        });
    });
  }
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

const customerList = ref([]);
// 获取客户列表
const getCustomerList = async () => {
  const res = await customerApi.getCustomerAll();
  if (res.success) {
    customerList.value = res.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
};

onMounted(() => {
  // 初始化逻辑，可以加载数据等
  getOutboundOrder();
  getLogistics();
});

const getIsExamine = (row) => {
  let firstPackage = row.packages[0];
  if (firstPackage.intercept_status == "completed") {
    return `${trans("验货时间")}:${firstPackage.intercept_time}`;
  }
};

const handleExportByType = async (type) => {
  console.log("导出", type);
  let res = null;
  let ids = selectedRows.value.map((item) => item.id);

  if (!ids.length) {
    Message.notify(trans("请选择订单"));
    return;
  }

  if (type == "sku") {
    res = await outApi.handleExportBySku({ ids });
  } else {
    res = await outApi.handleExportByPackage({ ids });
  }

  window.open(res.data.data, "_blank");
};

const handleBatchSendOutboundOrder = () => {
  console.log("批量发货");
  if (!selectedRows.value.length) {
    Message.notify(trans("请选择订单"));
    return;
  }
  $q.dialog({
    title: trans("提示"),
    message: trans("确定批量发货吗？"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确定"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
      color: "grey-7",
    },
  }).onOk(async () => {
    let package_ids = [];
    selectedRows.value.forEach((item) => {
      package_ids.push(...item.packages.map((pa) => pa.id));
    });
    await outApi.handleBatchSendOutboundOrder({ package_ids });
    getOutboundOrder();
  });
};
</script>

<style lang="scss">
.print-text {
  margin-left: 10px;
}
.simple-print-page {
  .search-bar {
    .select-width {
      width: 150px;
    }

    .date-input {
      width: 150px;
    }
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
.top-status-nav {
  margin-bottom: 16px;
}

.btn-group {
  display: flex;
}
.icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.tabs-section {
  .q-tabs__content--align-center {
    justify-content: flex-start !important;
  }
}

.q-tabs {
  border-bottom: 1px solid #e6e6e6;
  .q-tab {
    min-height: 38px;
  }
}

.main-table {
  padding-top: 10px;
}

.is-print {
  color: green;
  font-weight: bold;
}

.btn-group-desc {
  color: #86909c;
  font-size: 14px;
  text-indent: 16px;
  padding-top: 10px;
}

.logistics-item {
  max-width: 120px;
}
</style>
