<template>
  <div class="count-page">
    <!-- 状态筛选导航 -->
    <div class="status-nav bg-white rounded-borders q-pa-sm q-mb-md">
      <div class="row q-gutter-x-md">
        <q-btn
          v-for="status in statusOptions"
          :key="status.value"
          flat
          :color="pageParams.status === status.value ? 'primary' : 'grey-7'"
          :label="status.label"
          class="status-btn"
          @click="handleStatusNav(status.value)"
        />
      </div>
    </div>
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.order_type"
            :options="[
              { label: '商品+货架位', value: 'product_location' },
              { label: '货架位', value: 'location_only' },
            ]"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            class="search-type-select"
            label="盘点类型"
            clearable
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.date_type"
            :options="$store.state.dateTypeOptions"
            label="创建时间"
            class="search-type-select"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            clearable
          />
        </div>
        <div class="col-auto">
          <div class="row q-col-gutter-sm">
            <div class="col-auto">
              <q-input
                outlined
                dense
                v-model="pageParams.start_date"
                label="开始时间"
                readonly
                class="date-input"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="pageParams.start_date"
                        mask="YYYY-MM-DD"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-auto self-center">To</div>
            <div class="col-auto">
              <q-input
                outlined
                dense
                readonly
                v-model="pageParams.end_date"
                label="结束时间"
                class="date-input"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="pageParams.end_date" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <div class="col-auto">
          <div class="row items-center no-wrap search-group q-ml-md">
            <q-select
              outlined
              dense
              v-model="pageParams.search_type"
              :options="[
                {
                  label: '商品SKU',
                  value: 'sku',
                },
                {
                  label: '盘点单号',
                  value: 'number',
                },
              ]"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              class="search-type-select"
            />
            <q-input
              outlined
              dense
              v-model="pageParams.keywords"
              placeholder="关键字"
              class="keywords-input"
              style="min-width: 200px"
            />
            <q-select
              outlined
              dense
              v-model="pageParams.search_mode"
              :options="$store.state.searchModeOptions"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              class="search-mode-select"
            />
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            outline
            color="grey"
            label="重置"
            class="q-mr-sm"
            @click="resetSearch"
          />
          <q-btn
            color="primary"
            icon="search"
            label="搜索"
            :loading="$store.state.btnLoading"
            @click="getCountList"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-none page_table_action">
      <div class="row justify-between q-mb-sm">
        <div class="row items-center">
          <span class="q-mr-sm">选择 {{ selectedRows.length }}</span>
        </div>
        <div>
          <q-btn
            color="primary"
            label="创建盘点单"
            icon="add"
            v-if="pageParams.status === 'pending'"
            @click="createCount"
            unelevated
          />
        </div>
      </div>
      <div>
        <q-table
          flat
          :rows="tableData"
          :columns="[
            {
              name: 'system_order_number',
              label: '盘点单号',
              align: 'left',
              field: 'system_order_number',
            },
            {
              name: 'type',
              label: '盘点类型',
              align: 'left',
              field: (row) =>
                row.type === 'product_location' ? '商品+货架位' : '货架位',
            },
            {
              name: 'remark',
              label: '备注',
              align: 'left',
              field: 'remark',
            },
            {
              name: 'created_by',
              label: '创建人',
              align: 'left',
              field: (row) => row.created_by?.name,
            },
            {
              name: 'created_at',
              label: '创建时间',
              align: 'left',
              field: 'created_at',
            },
            {
              name: 'actions',
              label: '操作',
              align: 'left',
            },
          ]"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          :loading="$store.state.btnLoading"
          separator="horizontal"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="system_order_number" :props="props">
                {{ props.row.system_order_number }}
              </q-td>
              <q-td key="type" :props="props">
                {{
                  props.row.type === "product_location"
                    ? "商品+货架位"
                    : "货架位"
                }}
              </q-td>
              <q-td key="remark" :props="props">
                {{ props.row.remark ? props.row.remark : "-" }}
              </q-td>
              <q-td key="created_by" :props="props">
                {{ props.row.created_by?.name }}
              </q-td>
              <q-td key="created_at" :props="props">
                {{ props.row.created_at }}
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row items-center">
                  <q-btn
                    v-if="props.row.status === 'pending'"
                    flat
                    dense
                    color="primary"
                    icon="edit"
                    @click="handleEdit(props.row)"
                  >
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status === 'pending'"
                    flat
                    dense
                    color="primary"
                    icon="play_arrow"
                    @click="handleStartCount(props.row)"
                  >
                    <q-tooltip>开始盘点</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status === 'processing'"
                    flat
                    dense
                    color="primary"
                    icon="play_arrow"
                    class="q-ml-sm"
                    @click="takeStock(props.row)"
                  >
                    <q-tooltip>盘点</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status === 'processing'"
                    flat
                    dense
                    icon="check_circle"
                    class="q-ml-sm"
                    @click="submitCount(props.row)"
                  >
                    <q-tooltip>提交盘点结果</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="props.row.status === 'processing'"
                    flat
                    dense
                    color="primary"
                    icon="system_update_alt"
                    class="q-ml-sm"
                    @click="handleExport(props.row)"
                  >
                    <q-tooltip>导出盘点数据</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="props.row.status === 'processing'"
                    flat
                    dense
                    color="primary"
                    icon="print"
                    class="q-ml-sm"
                    @click="handlePrint(props.row)"
                  >
                    <q-tooltip>打印盘点单</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    dense
                    v-if="props.row.status != 'completed'"
                    color="negative"
                    icon="delete"
                    @click="handleDelete(props.row)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    v-if="props.row.status === 'completed'"
                    color="primary"
                    icon="list_alt"
                    @click="viewDetails(props.row)"
                  >
                    <q-tooltip>详情</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
            <!-- 展开的商品详情 -->
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div class="q-pa-md">
                  <q-table
                    flat
                    :rows="props.row.items"
                    :columns="[
                      {
                        name: 'product_spec_sku',
                        label: '商品SKU',
                        align: 'left',
                        field: 'product_spec_sku',
                      },
                      {
                        name: 'product_spec_name',
                        label: '商品名称',
                        align: 'left',
                        field: 'product_spec_name',
                      },
                      {
                        name: 'warehouse_location_code',
                        label: '货架位',
                        align: 'left',
                        field: 'warehouse_location_code',
                      },
                      {
                        name: 'warehouse_area_type',
                        label: '货区类型',
                        align: 'left',
                        field: 'warehouse_area_type',
                      },
                      {
                        name: 'total_qty',
                        label: '系统库存',
                        align: 'right',
                        field: 'total_qty',
                      },
                      {
                        name: 'counting_qty',
                        label: '盘点数量',
                        align: 'right',
                        field: 'counting_qty',
                      },
                    ]"
                    row-key="id"
                    :pagination="{ rowsPerPage: 0 }"
                    hide-pagination
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey">
              暂无数据
            </div>
          </template>
        </q-table>
        <div class="q-mt-md">
          <Pagination
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="getCountList"
          />
        </div>
      </div>
    </div>

    <q-dialog
      position="right"
      :maximized="$q.screen.lt.md"
      transition-show="slide-left"
      transition-hide="slide-right"
      full-height
      class="detail-dialog"
      v-model="detailDialogVisible"
    >
      <q-card class="detail-card" style="width: 80vw; max-width: 1400px">
        <q-card-section class="dialog-header row items-center bg-grey-2">
          <div class="text-subtitle1 text-weight-medium">盘点单详情</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="close" />
        </q-card-section>
        <q-card-section class="dialog-body q-pa-md scroll" v-if="countOrder">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-3">
              <div class="text-grey">盘点类型</div>
              <div>
                {{
                  countOrder.type === "location_only" ? "货架位" : "商品+货架位"
                }}
              </div>
            </div>
            <div class="col-3">
              <div class="text-grey">备注</div>
              <div>{{ countOrder.remark || "--" }}</div>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">盘点信息</div>
          <q-table
            :rows="countOrder.items"
            :columns="detailColumns"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            :loading="$store.state.btnLoading"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="index" :props="props">{{ props.rowIndex + 1 }}</q-td>
                <q-td key="sku" :props="props">{{
                  props.row.product_spec_sku
                }}</q-td>
                <q-td key="name" :props="props">{{
                  props.row.product_spec_name
                }}</q-td>
                <q-td key="customer" :props="props">
                  {{ props.row.customer?.name }} [{{
                    props.row.customer?.code
                  }}]
                </q-td>
                <q-td key="location" :props="props">{{
                  props.row.warehouse_location_code
                }}</q-td>
                <q-td key="area_type" :props="props">{{
                  $store.state.areaTypeOptions.find(
                    (item) => item.value === props.row.warehouse_area_type
                  )?.label || props.row.warehouse_area_type
                }}</q-td>
                <q-td key="system_qty" :props="props">{{
                  props.row.total_qty
                }}</q-td>
                <q-td key="actual_qty" :props="props">{{
                  props.row.counting_qty
                }}</q-td>
                <q-td
                  key="diff"
                  :props="props"
                  class="text-center"
                  :style="getDifferenceStyle(props.row)"
                >
                  {{ props.row.counting_qty - props.row.total_qty }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="errorDialogVisible">
      <q-card style="width: 90vw; max-width: 800px">
        <q-card-section>
          <div class="text-h6">盘点</div>
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">失败原因：{{ message }}</div>
          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">商品SKU</th>
                <th class="text-left">货架位</th>
                <th v-if="submitType == 'submitCountOrder'" class="text-left">
                  原因
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in errorList" :key="item.id">
                <td>{{ item.product_spec_sku }}</td>
                <td>{{ item.warehouse_location_code }}</td>
                <td v-if="submitType == 'submitCountOrder'">实盘库存未填写</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import inventoryApi from "@/api/inventory";
import Pagination from "@/components/Pagination.vue";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const statusOptions = ref([
  { label: "待盘点", value: "pending" },
  { label: "盘点中", value: "processing" },
  { label: "已完成", value: "completed" },
]);

const pageParams = ref({
  page: 1,
  per_page: 10,
  total: 0,
  order_type: "",
  status: "pending",
  date_type: "",
  search_type: "sku",
  search_mode: "exact",
  keywords: "",
  start_date: "",
  end_date: "",
});
const selectedRows = ref([]);
const createCount = () => {
  router.push({
    name: "create-count",
  });
};
const tableData = ref([]);

const handleStatusNav = (status) => {
  pageParams.value.status = status;
  getCountList();
};

const getCountList = () => {
  inventoryApi.getCountOrderList(pageParams.value).then((res) => {
    if (res.success) {
      tableData.value = res.data.items;
      pageParams.value.total = res.data.meta.total;
    }
  });
};

const resetSearch = () => {
  pageParams.value.page = 1;
  pageParams.value.date_type = "";
  pageParams.value.search_type = "sku";
  pageParams.value.search_mode = "exact";
  pageParams.value.keywords = "";
  pageParams.value.start_date = "";
  pageParams.value.end_date = "";
  getCountList();
};

// 编辑盘点单
const handleEdit = (row) => {
  // 跳转到编辑页面
  router.push({
    path: `/inventory/create-count`,
    query: {
      id: row.id,
      type: "edit",
    },
  });
};

// 盘点
const takeStock = (row) => {
  router.push({
    path: `/inventory/stocktaking`,
    query: { id: row.id },
  });
};
// 获取差异列的样式
const getDifferenceStyle = (row) => {
  const diff = row.counting_qty - row.total_qty;
  return diff < 0 ? "color: #f56c6c" : "";
};
const errorList = ref([]);
const errorDialogVisible = ref(false);

const submitCount = (row) => {
  countOrder.value = row;
  errorList.value = row.items.filter((item) => !item.counting_qty);
  if (errorList.value.length) {
    submitType.value = "submitCountOrder";
    errorDialogVisible.value = true;
    return;
  }

  inventoryApi.submitCountOrder(row.id).then((res) => {
    if (res.success) {
      getCountList();
    }
  });
};
const submitType = ref("startCount");
// 开始盘点
const handleStartCount = (row) => {
  $q.dialog({
    title: "确认",
    message: "确定要开始盘点吗？",
    cancel: true,
    persistent: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(() => {
    inventoryApi
      .startCount(row.id)
      .then((res) => {
        if (res.success) {
          getCountList(); // 刷新列表
        }
      })
      .catch((err) => {
        submitType.value = "submitType";
        errorList.value = err.data;
        message.value = err.message;
        errorDialogVisible.value = true;
      });
  });
};
const detailDialogVisible = ref(false);
const countOrder = ref(null);
const viewDetails = (row) => {
  countOrder.value = row;
  detailDialogVisible.value = true;
};

const message = ref("");
// 删除盘点单
const handleDelete = (row) => {
  $q.dialog({
    title: "确认",
    message: "确定要删除该盘点单吗？",
    cancel: true,
    persistent: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(() => {
    inventoryApi.deleteCount(row.id).then((res) => {
      if (res.success) {
        getCountList(); // 刷新列表
      }
    });
  });
};

const handlePrint = (row) => {
  inventoryApi.printCountOrder(row.id).then((res) => {
    if (res.success) {
      window.open(res.data.data);
    }
  });
};
const handleExport = (row) => {
  inventoryApi.exportCountOrder(row.id).then((res) => {
    if (res.success) {
      window.open(res.data.data);
    }
  });
};

const detailColumns = [
  { name: "index", label: "#", field: "index", align: "center" },
  { name: "sku", label: "商品SKU", field: "product_spec_sku", align: "left" },
  {
    name: "name",
    label: "商品名称",
    field: "product_spec_name",
    align: "left",
  },
  { name: "customer", label: "客户", field: "customer_name", align: "left" },
  { name: "location", label: "货架位", field: "location_code", align: "left" },
  {
    name: "area_type",
    label: "货区类型",
    field: "area_type_name",
    align: "left",
  },
  {
    name: "system_qty",
    label: "账面库存",
    field: "system_qty",
    align: "center",
  },
  {
    name: "actual_qty",
    label: "实盘库存",
    field: "actual_qty",
    align: "center",
  },
  { name: "diff", label: "差异", field: "diff_qty", align: "center" },
];

const searchType = ref("sku");
const searchKeyword = ref("");

onMounted(() => {
  if (route.query.type) {
    pageParams.value.status = route.query.type;
  }
  getCountList();
});
</script>

<style lang="scss" scoped>
.count-page {
  .search-type-select {
    width: 150px;
  }
}

:deep(.q-table) {
  thead tr {
    height: 40px;
    background: #f5f7fa;

    th {
      padding: 8px 12px;
      font-weight: 500;
      border-bottom: 1px solid #ebeef5;
      border-right: 1px solid #ebeef5;
      white-space: nowrap;

      &:first-child {
        padding: 8px;
      }
    }
  }

  tbody td {
    padding: 8px 12px;
    border-bottom: 1px solid #ebeef5;
    border-right: 1px solid #ebeef5;

    &:first-child {
      padding: 8px;
    }
  }

  tr:hover {
    td {
      background: #f5f7fa;
    }
  }
}

.q-badge {
  padding: 4px 8px;
}
</style>
