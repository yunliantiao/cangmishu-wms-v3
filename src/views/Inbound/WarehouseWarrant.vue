<template>
  <div class="warehouse-warrant">
    <!-- 状态筛选导航 -->
    <!-- <div class="search-bar">
      <div class="row q-gutter-x-md">
        <q-btn
          v-for="status in statusOptions"
          :key="status.value"
          :flat="statusNav != status.value"
          :color="statusNav === status.value ? 'primary' : 'grey-7'"
          :label="status.label"
          class="status-btn"
          @click="handleStatusNav(status.value)"
        />
      </div>
    </div> -->

    <!-- 搜索过滤区域 -->
    <div class="search-bar global-mt">
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
            v-for="item in statusOptions"
            :key="item.value"
          />
        </q-tabs>
      </div>
      <div class="row q-col-gutter-sm">
        <div
          v-for="filter in filterOptions"
          :key="filter.field"
          class="col-auto"
        >
          <q-select
            outlined
            dense
            v-model="filterValues[filter.field]"
            :options="filter.options"
            :label="filter.label"
            class="filter-item"
            clearable
            emit-value
            map-options
          />
        </div>

        <DatePicker
          v-model:date_type="filterValues.date_type"
          v-model:start_date="filterValues.start_date"
          v-model:end_date="filterValues.end_date"
          :dateList="pageData.dateOptions"
        />

        <KeywordSearch
          v-model:search_type="filterValues.search_type"
          v-model:search_value="filterValues.keywords"
          v-model:search_mode="filterValues.search_mode"
          :searchTypeList="searchFieldOptions"
          :searchModeList="searchTypeOptions"
        />

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
            :label="trans('查询')"
            class="filter-btn"
            :loading="$store.state.btnLoading"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="main-table">
      <!-- 数据表格 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="warehouseOrders"
          :columns="visibleColumns"
          :loading="$store.state.btnLoading"
          row-key="id"
          flat
          separator="horizontal"
          selection="multiple"
          v-model:selected="selectedRows"
          hide-pagination
          :pagination="{
            rowsPerPage: pageParams.per_page,
            page: pageParams.page,
            total: pageParams.total,
          }"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width>
                <q-checkbox v-model="props.selected" size="sm" />
              </q-th>
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" size="sm" />
              </q-td>
              <q-td key="orderInfo" :props="props">
                <div class="column">
                  <div>
                    入库单号:
                    <span
                      class="hover-copy"
                      @click="$copy(props.row.system_order_number)"
                      >{{ props.row.system_order_number }}</span
                    >
                  </div>
                  <div>
                    自定义单号:
                    <span
                      class="hover-copy"
                      @click="$copy(props.row.custom_order_number)"
                    >
                      {{ props.row.custom_order_number }}
                    </span>
                  </div>
                </div>
              </q-td>
              <q-td key="customer" :props="props">
                {{ props.row.customer.name }}
              </q-td>
              <q-td key="trackingNumber" :props="props">
                <div class="text-primary">
                  <span
                    class="hover-copy"
                    @click="$copy(props.row.tracking_number)"
                    >{{ props.row.tracking_number || "--" }}</span
                  >
                </div>
              </q-td>
              <q-td key="arrivalMethod" :props="props">
                {{ props.row.arrival_method == "box" ? "箱子" : "快递包裹" }}
              </q-td>
              <q-td key="boxCount" :props="props">
                <div class="text-primary text-weight-medium">
                  <div v-if="props.row.total_box_qty">
                    <div class="text-blue cursor-pointer position-relative">
                      <q-btn
                        flat
                        dense
                        no-caps
                        color="primary"
                        :label="`${props.row.total_box_qty}`"
                        @mouseenter="showTooltip($event, props.row.id, 'box')"
                        @mouseleave="hideTooltip('box')"
                      >
                        <q-menu
                          :model-value="getTooltipState(props.row.id, 'box')"
                          @update:model-value="
                            (val) => setTooltipState(props.row.id, 'box', val)
                          "
                          anchor="bottom middle"
                          self="top middle"
                          @mouseenter="keepTooltip(props.row.id, 'box')"
                          @mouseleave="hideTooltip('box')"
                          transition-show="fade"
                          transition-hide="fade"
                        >
                          <div class="tooltip-content">
                            <table class="tooltip-table">
                              <thead>
                                <tr>
                                  <th>箱号</th>
                                  <th>SKU</th>
                                  <th>数量</th>
                                </tr>
                              </thead>
                              <tbody v-if="!$store.state.btnLoading">
                                <tr
                                  v-for="(box, index) in props.row.boxes"
                                  :key="index"
                                >
                                  <td>{{ box.box_number || "-" }}</td>
                                  <td>
                                    <div
                                      v-for="item in box.items"
                                      :key="item.id"
                                      class="sku-item"
                                    >
                                      <div class="sku-code">
                                        {{ item.product_spec_sku }}
                                      </div>
                                    </div>
                                  </td>
                                  <td class="text-center">
                                    <div
                                      v-for="item in box.items"
                                      :key="item.id"
                                      class="qty-item"
                                    >
                                      {{ item.quantity }}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                              <tbody v-else>
                                <tr>
                                  <td colspan="3">
                                    <q-skeleton type="text" />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                  <div v-else>--</div>
                </div>
              </q-td>
              <q-td key="skuInfo" :props="props">
                <div class="text-primary">
                  <span v-if="props.row.total_sku_type_qty == 1">
                    {{ props.row.first_items_sku_with_qty }}
                  </span>
                  <div
                    v-else
                    class="text-blue cursor-pointer position-relative"
                  >
                    <q-btn
                      flat
                      dense
                      no-caps
                      color="primary"
                      :label="`${trans('多个({count})', {
                        count: props.row.total_sku_type_qty,
                      })}`"
                      @mouseenter="showTooltip($event, props.row.id, 'sku')"
                      @mouseleave="hideTooltip('sku')"
                    >
                      <q-menu
                        :model-value="getTooltipState(props.row.id, 'sku')"
                        @update:model-value="
                          (val) => setTooltipState(props.row.id, 'sku', val)
                        "
                        anchor="bottom middle"
                        self="top middle"
                        @mouseenter="keepTooltip(props.row.id, 'sku')"
                        @mouseleave="hideTooltip('sku')"
                        transition-show="fade"
                        transition-hide="fade"
                      >
                        <div class="tooltip-content">
                          <table class="tooltip-table">
                            <thead>
                              <tr>
                                <th>{{ trans("SKU") }}</th>
                                <th>{{ trans("申报数量") }}</th>
                                <th>{{ trans("收货数量") }}</th>
                                <th>{{ trans("上架数量") }}</th>
                              </tr>
                            </thead>
                            <tbody v-if="!$store.state.btnLoading">
                              <tr
                                v-for="(item, index) in getSkuItems(props.row)"
                                :key="index"
                              >
                                <td>{{ item.product_spec_sku || "-" }}</td>
                                <td class="text-center">
                                  {{ item.quantity }}
                                </td>
                                <td class="text-center">
                                  {{ item.received_quantity }}
                                </td>
                                <td class="text-center">
                                  {{ item.shelf_quantity }}
                                </td>
                              </tr>
                            </tbody>
                            <tbody v-else>
                              <tr>
                                <td colspan="4">
                                  <q-skeleton type="text" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
              </q-td>
              <q-td key="status" :props="props">
                <q-chip
                  dense
                  :color="getStatusColor(props.row.status).bg"
                  :text-color="getStatusColor(props.row.status).text"
                >
                  {{
                    statusOptions.find(
                      (item) => item.value === props.row.status
                    )?.label || props.row.status
                  }}
                </q-chip>
                <div
                  v-if="
                    props.row.status != 'reported' &&
                    props.row.status != 'in_transit'
                  "
                >
                  {{
                    filterOptions[1].options.find(
                      (item) => item.value === props.row.receive_status
                    )?.label || props.row.receive_status
                  }}
                </div>
                <div
                  v-if="
                    props.row.status != 'reported' &&
                    props.row.status != 'in_transit'
                  "
                >
                  {{
                    filterOptions[2].options.find(
                      (item) => item.value === props.row.shelf_status
                    )?.label || props.row.shelf_status
                  }}
                </div>
              </q-td>
              <q-td key="receivedStatus" :props="props">
                {{
                  filterOptions[1].options.find(
                    (item) => item.value === props.row.receive_status
                  )?.label || props.row.receive_status
                }}
              </q-td>
              <q-td key="shelfStatus" :props="props">
                {{
                  filterOptions[2].options.find(
                    (item) => item.value === props.row.shelf_status
                  )?.label || props.row.shelf_status
                }}
              </q-td>
              <q-td key="time" :props="props">
                <div class="text-grey-8 column">
                  <template
                    v-for="(time, type) in getOrderTimes(props.row)"
                    :key="type"
                  >
                    <div v-if="time">{{ type }}: {{ time }}</div>
                  </template>
                </div>
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row justify-center">
                  <q-btn
                    flat
                    round
                    size="sm"
                    class="table-icon"
                    @click="viewDetails(props.row)"
                  >
                    <img src="@/assets/images/detail.png" />
                    <q-tooltip>{{ trans("详情") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    size="sm"
                    class="table-icon"
                    @click="signFor(props.row)"
                    v-if="props.row.status === 'in_transit'"
                  >
                    <img src="@/assets/images/sign.png" />
                    <q-tooltip>{{ trans("签收") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    size="sm"
                    class="table-icon"
                    @click="putWay(props.row)"
                    v-if="
                      props.row.status != 'reported' &&
                      props.row.status != 'in_transit' &&
                      props.row.receive_status != 'fully_received'
                    "
                  >
                    <img src="@/assets/images/take.png" />
                    <q-tooltip>{{ trans("收货") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    size="sm"
                    class="table-icon"
                    @click="putaway(props.row)"
                    v-if="
                      props.row.status != 'reported' &&
                      props.row.status != 'pending_inbound' &&
                      props.row.status != 'in_transit' &&
                      props.row.shelf_status != 'fully_shelved'
                    "
                  >
                    <img src="@/assets/images/grounding.png" />
                    <q-tooltip>{{ trans("上架") }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="grey-7" class="table-icon" size="sm">
                    <img src="@/assets/images/more.png" />
                    <q-menu>
                      <q-list style="min-width: 120px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="printLabel(props.row)"
                        >
                          <q-item-section>{{
                            trans("打印标签")
                          }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="printWarehouseReceipt(props.row)"
                        >
                          <q-item-section>{{
                            trans("打印入库单")
                          }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.arrival_method == 'box'"
                          @click="printBoxLabel(props.row)"
                        >
                          <q-item-section>{{
                            trans("打印箱唛")
                          }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ trans("暂无数据") }}</span>
            </div>
          </template>
        </q-table>

        <!-- 分页 -->
        <div class="q-pa-md">
          <Pagination
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 添加详情弹窗 -->
    <DetailDialog
      v-model:visible="detailDialogVisible"
      :order-id="selectedOrderId"
      @close="closeDetailDialog"
    />

    <!-- 打印箱唛弹窗 -->
    <q-dialog v-model="printDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ trans("打印箱唛") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-y-md">
            <div class="row items-center">
              <span class="required col-3">{{ trans("打印范围") }}</span>
              <div class="col row items-center no-wrap">
                <span>{{ trans("第") }}</span>
                <q-input
                  v-model="printForm.start_box"
                  type="number"
                  class="q-mx-sm"
                  style="width: 60px"
                  dense
                  outlined
                />
                <span>{{ trans("~") }}</span>
                <q-input
                  v-model="printForm.end_box"
                  type="number"
                  class="q-mx-sm"
                  style="width: 60px"
                  dense
                  outlined
                />
                <span>{{ trans("箱") }}</span>
              </div>
            </div>

            <div class="row">
              <span class="required col-3">{{ trans("纸张大小") }}</span>
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-radio
                    v-model="printForm.box_size"
                    val="small"
                    label="100*60"
                  />
                </div>
                <div class="row items-center q-mb-sm">
                  <q-radio v-model="printForm.box_size" val="medium">
                    <template v-slot:default>
                      100*100
                      <span class="text-grey-6">{{
                        trans("显示SKU信息")
                      }}</span>
                    </template>
                  </q-radio>
                </div>
                <div class="row items-center">
                  <q-radio v-model="printForm.box_size" val="large">
                    <template v-slot:default>
                      100*150
                      <span class="text-grey-6">{{
                        trans("显示SKU信息")
                      }}</span>
                    </template>
                  </q-radio>
                </div>
              </div>
            </div>

            <div class="row">
              <span class="col-3">{{ trans("附加信息") }}</span>
              <div class="col q-gutter-x-md">
                <q-checkbox
                  v-model="printForm.additional_info"
                  val="customer_fullname"
                  :label="trans('客户姓名')"
                />
                <q-checkbox
                  v-model="printForm.additional_info"
                  val="made_in_china"
                  :label="trans('中国制造')"
                />
                <q-checkbox
                  v-model="printForm.additional_info"
                  val="product_name"
                  :label="trans('产品名称')"
                />
                <q-checkbox
                  v-model="printForm.additional_info"
                  val="other"
                  :label="trans('其他')"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="trans('取消')" color="grey-7" flat v-close-popup />
          <q-btn
            :label="trans('确定')"
            color="primary"
            flat
            @click="handlePrintConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="printOrderDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ trans("打印入库单") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-sm">
            <q-radio v-model="printType" val="sku" :label="trans('按SKU')" />
            <q-radio v-model="printType" val="box" :label="trans('按箱')" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-primary q-pa-md">
          <q-btn flat :label="trans('取消')" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="trans('打印')"
            @click="handlePrint"
            :loading="$store.state.btnLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <print-label-dialog
      v-model="labelVisible"
      :sku-list="selectedLocations"
      print-type="inbound"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import DetailDialog from "./components/DetailDialog.vue";
import inboundApi from "@/api/inbound";
import customerApi from "@/api/customer";
import PrintLabelDialog from "@/components/PrintLabelDialog.vue";
import DatePicker from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import trans from "@/i18n";

const $q = useQuasar();
const router = useRouter();

// 状态选项配置
const statusOptions = [
  { label: trans("全部"), value: "all" },
  { label: trans("已预报"), value: "reported" },
  { label: trans("运输中"), value: "in_transit" },
  { label: trans("待入库"), value: "pending_inbound" },
  { label: trans("入库中"), value: "inbound_processing" },
  { label: trans("已完成"), value: "shelved" },
];

const pageData = reactive({
  dateOptions: [
    {
      label: trans("创建时间"),
      value: "created_at",
    },
    {
      label: trans("签收时间"),
      value: "sign_at",
    },
    {
      label: trans("首次上架时间"),
      value: "first_shelf_at",
    },
    {
      label: trans("完成时间"),
      value: "completed_at",
    },
  ],
});

// 筛选器配置
const filterOptions = [
  {
    field: "customer_id",
    label: trans("用户"),
    options: [],
  },
  {
    field: "received_status",
    label: trans("收货状态"),
    options: [
      {
        label: trans("待收货"),
        value: "pending",
      },
      {
        label: trans("部分收货"),
        value: "partially_received",
      },
      {
        label: trans("已收"),
        value: "fully_received",
      },
    ],
  },
  {
    field: "shelf_status",
    label: trans("上架状态"),
    options: [
      {
        label: trans("待上架"),
        value: "pending_shelved",
      },
      {
        label: trans("部分上架"),
        value: "partially_shelved",
      },
      {
        label: trans("全部上架"),
        value: "fully_shelved",
      },
    ],
  },
  // {
  //   field: "date_type",
  //   label: trans("创建时间"),
  //   options: [
  //     {
  //       label: trans("创建时间"),
  //       value: "created_at",
  //     },
  //     {
  //       label: trans("签收时间"),
  //       value: "sign_at",
  //     },
  //     {
  //       label: trans("首次上架时间"),
  //       value: "first_shelf_at",
  //     },
  //     {
  //       label: trans("完成时间"),
  //       value: "completed_at",
  //     },
  //   ],
  // },
];

// 搜索字段选项
const searchFieldOptions = [
  {
    label: trans("入库单号"),
    value: "system_order_number",
  },
  {
    label: trans("运单号"),
    value: "tracking_number",
  },
  {
    label: trans("ERP单号"),
    value: "custom_order_number",
  },
  {
    label: trans("商品SKU"),
    value: "sku",
  },
  {
    label: trans("商品名称"),
    value: "product_name",
  },
];

// 搜索模式选项
const searchTypeOptions = [
  {
    label: trans("模糊搜索"),
    value: "fuzzy",
  },
  {
    label: trans("精确搜索"),
    value: "exact",
  },
];

const printOrderDialogVisible = ref(false);
const printType = ref("sku");
const loading = ref(false);
const printOrderId = ref(null);
const printWarehouseReceipt = (row) => {
  printOrderId.value = row.id;
  if (row.arrival_method == "box") {
    printOrderDialogVisible.value = true;
  } else {
    printType.value = "sku";
    handlePrint();
  }
};
const handlePrint = async () => {
  let params = {};
  if (printType.value == "sku") {
    params = await inboundApi.inboundPrintSku(printOrderId.value);
  } else {
    params = await inboundApi.inboundPrintBox(printOrderId.value);
  }
  if (params.success) {
    window.open(params.data.data, "_blank");
    printOrderDialogVisible.value = false;
  }
};

// 状态导航
const statusNav = ref("all");

// 监听状态导航变化，触发表格列更新
watch(statusNav, (newValue) => {
  // 状态变化时更新列，确保重新计算可见列
  visibleColumns.value = columns.filter((col) => !col.hidden || !col.hidden());
});

// 筛选值
const filterValues = reactive({
  date_type: "created_at",
  start_date: "",
  end_date: "",
  search_type: "system_order_number",
  keywords: "",
  search_mode: "exact",
});
// 初始化筛选值为空
// filterOptions.forEach((filter) => {
//   filterValues[filter.field] = null;
// });

// 客户列表
const customerList = ref([]);
// 获取客户列表
const getCustomerList = async () => {
  const res = await customerApi.getCustomerAll();
  if (res.success) {
    // customerList.value = res.data;
    customerList.value = res.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    filterOptions[0].options = customerList.value;
  }
};
getCustomerList();

// 日期范围
const dateRange = reactive({
  start: "",
  end: "",
  startLabel: trans("开始时间"),
  endLabel: trans("结束时间"),
});

// 搜索配置
const searchConfig = reactive({
  field: "system_order_number", // 默认不选中
  keywords: "",
  type: "exact", // 默认不选中
});

// 选中行
const selectedRows = ref([]);
// 表格数据
const warehouseOrders = ref([]);

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});

// 搜索参数
const searchParams = reactive({
  customer_id: "", // 客户id
  inbound_status: "", // 单据状态
  received_status: "", // 收货状态
  shelf_status: "", // 上架状态
  date_type: "created_at", // 时间类型
  start_date: "", // 开始时间
  end_date: "", // 结束时间
  search_type: "system_order_number", // 搜索类型
  search_mode: "exact", // 搜索模式
  keywords: "", // 关键词
});

// 状态颜色映射
const statusColorMap = {
  reported: { bg: "blue-1", text: "blue" },
  in_transit: { bg: "orange-1", text: "orange" },
  pending_inbound: { bg: "purple-1", text: "purple" },
  inbound_processing: { bg: "teal-1", text: "teal" },
  shelved: { bg: "green-1", text: "green" },
};

// 打印相关的状态
const printDialogVisible = ref(false);
const currentInboundId = ref(null);
const printForm = ref({
  start_box: null,
  end_box: null,
  box_size: "small",
  additional_info: [],
});

const printBoxLabel = (row) => {
  printForm.value = {
    start_box: 1,
    end_box: row.total_box_qty,
    box_size: "small",
    additional_info: [],
  };
  currentInboundId.value = row.id;
  printDialogVisible.value = true;
};

const handlePrintConfirm = async () => {
  try {
    const params = {
      start_box: parseInt(printForm.value.start_box),
      end_box: parseInt(printForm.value.end_box),
      box_size: printForm.value.box_size,
      additional_info: printForm.value.additional_info,
    };

    // 设置responseType为blob
    const response = await inboundApi.inboundBoxLabel(
      currentInboundId.value,
      params,
      {
        responseType: "blob",
      }
    );

    // 检查响应类型
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
      printDialogVisible.value = false;
      $q.notify({
        message: "打印箱唛生成成功",
        color: "positive",
      });
    } else {
      throw new Error("Invalid response type");
    }
  } catch (error) {
    $q.notify({
      message: "打印箱唛生成失败",
      color: "negative",
    });
  }
};
// 签收
const signFor = (row) => {
  router.push({
    path: "/inbound/sign",
    query: {
      number: row.system_order_number,
    },
  });
};

// 收货
const putWay = (row) => {
  router.push({
    path: "/inbound/receive",
    query: {
      number: row.system_order_number,
    },
  });
};

// 上架
const putaway = (row) => {
  router.push({
    path: "/inbound/shelve",
    query: { number: row.system_order_number },
  });
};

// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || { bg: "grey-4", text: "grey-8" };
};

// 获取订单时间信息
const getOrderTimes = (order) => {
  return {
    创建: order.created_at,
    预计到达时间: order.estimated_arrival_date,
    签收: order.sign_at,
    首次上架时间: order.first_shelf_at,
    完成时间: order.completed_at,
  };
};

// 处理状态导航切换
const handleStatusNav = (status) => {
  statusNav.value = status;
  searchParams.inbound_status = status === "all" ? "" : status;
  resetPage();
  getList();
};

// 处理搜索
const handleSearch = () => {
  resetPage();
  getList();
};

const tooltipStates = ref({});
const tooltipTimer = ref(null);

const showTooltip = (event, rowId, type) => {
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value);
    tooltipTimer.value = null;
  }

  if (!tooltipStates.value[rowId]) {
    tooltipStates.value[rowId] = { box: false, sku: false };
  }

  getProductInfo(rowId, type);
  nextTick(() => {
    tooltipStates.value[rowId][type] = true;
  });
};

const keepTooltip = (rowId, type) => {
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value);
    tooltipTimer.value = null;
  }
};

const hideTooltip = (type) => {
  tooltipTimer.value = setTimeout(() => {
    Object.keys(tooltipStates.value).forEach((rowId) => {
      if (tooltipStates.value[rowId]) {
        tooltipStates.value[rowId][type] = false;
      }
    });
  }, 150);
};

const getTooltipState = (rowId, type) => {
  if (!tooltipStates.value[rowId]) {
    tooltipStates.value[rowId] = { box: false, sku: false };
  }
  return tooltipStates.value[rowId][type];
};

const setTooltipState = (rowId, type, value) => {
  if (!tooltipStates.value[rowId]) {
    tooltipStates.value[rowId] = { box: false, sku: false };
  }
  tooltipStates.value[rowId][type] = value;
};

const getProductInfo = (rowId, type) => {
  warehouseOrders.value.forEach((item) => {
    if (item.id === rowId) {
      if (type == "box") {
        if (!item.boxes) {
          inboundApi.getBoxes(rowId).then((res) => {
            if (res.success) {
              item.boxes = res.data;
            }
          });
        }
      }
      if (type == "sku") {
        if (!item.sku) {
          inboundApi.getSku(rowId).then((res) => {
            if (res.success) {
              item.sku = res.data;
            }
          });
        }
      }
    }
  });
};

// 重置页码
const resetPage = () => {
  pageParams.page = 1;
};

// 处理分页变化
const handlePageChange = ({ page, rowsPerPage }) => {
  pageParams.page = page;
  pageParams.per_page = rowsPerPage;
  getList();
};

// 获取列表数据
const getList = async () => {
  const params = {
    ...pageParams,
    ...filterValues,
    inbound_status: searchParams.inbound_status,
  };
  const res = await inboundApi.getWarehouseWarrant(params);
  if (res.success) {
    warehouseOrders.value = res.data.items;
    pageParams.total = res.data.meta.total;
    selectedRows.value = [];
  }
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = "";
  });
  Object.keys(filterValues).forEach((key) => {
    filterValues[key] = null;
  });
  searchConfig.keywords = "";
  searchConfig.field = null; // 重置为不选中
  searchConfig.type = null; // 重置为不选中
  dateRange.start = "";
  dateRange.end = "";

  filterValues.date_type = "created_at";
  filterValues.search_type = "system_order_number";
  filterValues.search_mode = "exact";

  resetPage();
  getList();
};

// 批量打印
const handleBatchPrint = () => {
  if (selectedRows.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "请先选择要打印的入库单",
    });
    return;
  }
  // TODO: 实现批量打印逻辑
};

// 查看SKU详情
const viewSkuDetails = (row) => {
  // TODO: 实现查看SKU详情逻辑
};

// 详情弹窗控制
const detailDialogVisible = ref(false);
const selectedOrderId = ref(null);

// 查看详情
const viewDetails = (row) => {
  selectedOrderId.value = row.id;
  detailDialogVisible.value = true;
};

// 关闭详情弹窗
const closeDetailDialog = () => {
  detailDialogVisible.value = false;
  selectedOrderId.value = null;
};

const selectedLocations = ref([]);
const labelVisible = ref(false);
// 打印标签
const printLabel = (row) => {
  inboundApi.getWarehouseWarrantDetail(row.id).then((res) => {
    if (res.success) {
      let allItems = [];
      res.data.details.forEach((box) => {
        if (box.items && box.items.length > 0) {
          allItems.push(...box.items);
        }
      });
      selectedLocations.value = mergeSameSkuItems(allItems); //去重
      labelVisible.value = true;
      console.log(allItems);
    }
  });
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

// 复制入库单
const handleCopy = (row) => {
  // TODO: 实现复制入库单逻辑
};

// 核验入库单
const handleVerify = (row) => {
  // TODO: 实现核验入库单逻辑
};

// 表格列配置
const columns = [
  {
    name: "orderInfo",
    label: trans("单号"),
    field: "orderInfo",
    align: "left",
  },
  {
    name: "customer",
    label: trans("客户"),
    field: "customer",
    align: "left",
  },
  {
    name: "trackingNumber",
    label: trans("运单号"),
    field: "trackingNumber",
    align: "left",
  },
  {
    name: "arrivalMethod",
    label: trans("到仓方式"),
    field: "arrivalMethod",
    align: "center",
  },
  {
    name: "boxCount",
    label: trans("总箱数"),
    field: "boxCount",
    align: "center",
  },
  {
    name: "skuInfo",
    label: trans("SKU*Qty"),
    field: "skuInfo",
    align: "center",
  },
  {
    name: "status",
    label: trans("状态"),
    field: "status",
    align: "center",
    hidden: () => statusNav.value === "inbound_processing",
  },
  {
    name: "receivedStatus",
    label: trans("收货状态"),
    field: "receivedStatus",
    align: "center",
    format: (val) => `${val}`,
    // 根据状态控制显示
    hidden: () => statusNav.value !== "inbound_processing",
  },
  {
    name: "shelfStatus",
    label: trans("上架状态"),
    field: "shelfStatus",
    align: "center",
    format: (val) => `${val}`,
    // 根据状态控制显示
    hidden: () => statusNav.value !== "inbound_processing",
  },
  {
    name: "time",
    label: trans("时间"),
    field: "time",
    align: "left",
  },
  {
    name: "actions",
    label: trans("操作"),
    field: "actions",
    align: "center",
  },
];

// 计算实际显示的列，注意需要使用ref而不是computed
const visibleColumns = ref([]);

// 初始化可见列
onMounted(() => {
  // 初始化列显示
  visibleColumns.value = columns.filter((col) => !col.hidden || !col.hidden());

  // 获取列表数据
  getList();
});

// 在script部分添加新函数
const getSkuItems = (row) => {
  if (row && row.sku) {
    return row.sku;
  }

  // 如果没有预加载数据则立即获取
  if (!row.sku) {
    inboundApi.getSku(row.id).then((res) => {
      if (res.success) {
        row.sku = res.data;
      }
    });
  }

  return [];
};
</script>

<style lang="scss" scoped>
.warehouse-warrant {
  .position-relative {
    position: relative;
  }

  .hover-container {
    position: relative;
    display: inline-block;
  }

  @keyframes tooltip-appear {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .status-nav {
    .status-btn {
      min-width: 80px;
      font-size: 14px;

      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }
    }
  }

  .search-bar {
    .select-width {
      width: 150px;
    }

    .date-input {
      width: 150px;
    }

    .search-select {
      width: 180px;

      :deep(.q-field__native) {
        padding-top: 0;
      }

      :deep(.q-field__label) {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
    }

    .search-input {
      :deep(.q-field__native) {
        padding-top: 0;
      }

      :deep(.q-field__label) {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
    }
  }

  .q-table {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      //background-color: #f5f7fa;
      padding: 12px 16px;
    }

    td {
      font-size: 14px;
      padding: 12px 16px;
      color: rgba(0, 0, 0, 0.75);
      white-space: normal;
    }

    tbody {
      tr {
        &:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }

        .q-btn {
          opacity: 0.7;
          transition: opacity 0.3s ease;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
}

.tooltip-content {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  min-width: 400px;
  max-width: 90vw;
}

.tooltip-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #f5f7fa;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .text-center {
    text-align: center;
  }

  .sku-item {
    padding: 4px 0;

    &:not(:last-child) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
      margin-bottom: 4px;
    }

    .sku-code {
      font-weight: 500;
    }

    .sku-name {
      font-size: 12px;
      word-break: break-word;
      max-width: 200px;
    }
  }

  .qty-item {
    padding: 4px 0;
    text-align: center;

    &:not(:last-child) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
      margin-bottom: 4px;
    }
  }
}
:deep(.q-tabs__content--align-center) {
  justify-content: flex-start;
}

.q-tabs {
  border-bottom: 1px solid #e6e6e6;
  .q-tab {
    min-height: 38px;
  }
}
</style>