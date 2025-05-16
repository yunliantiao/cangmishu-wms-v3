<template>
  <div class="count-page">
    <!-- 状态筛选导航 -->
    <!-- <div class="status-nav bg-white rounded-borders q-pa-sm q-mb-md">
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
    </div> -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="tabs-section q-mb-md">
        <q-tabs
          v-model="pageParams.status"
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
        <div class="col-auto">
          <q-select
            outlined
            dense
            class="filter-item"
            v-model="pageParams.order_type"
            :options="[
              { label: trans('商品+货架位'), value: 'product_location' },
              { label: trans('货架位'), value: 'location_only' },
            ]"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            :label="trans('盘点类型')"
            clearable
          />
        </div>
        <DatePicker
          v-model:start_date="pageParams.start_date"
          v-model:end_date="pageParams.end_date"
          v-model:date_type="pageParams.date_type"
          :dateList="dateTypeOptions"
        ></DatePicker>

        <KeywordSearch
          v-model:search_type="pageParams.search_type"
          v-model:search_value="pageParams.keywords"
          v-model:search_mode="pageParams.search_mode"
          :searchTypeList="[
            {
              label: trans('商品SKU'),
              value: 'sku',
            },
            {
              label: trans('盘点单号'),
              value: 'number',
            },
          ]"
          :searchModeList="searchModeOptions"
        ></KeywordSearch>
        <div class="col-auto">
          <q-btn
            outline
            color="grey"
            :label="trans('重置')"
            class="filter-btn"
            @click="resetSearch"
          />
        </div>

        <div class="col-auto">
          <q-btn
            color="primary"
            class="filter-btn"
            :label="trans('搜索')"
            :loading="$store.state.btnLoading"
            @click="getCountList"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-none page_table_action">
      <div class="row justify-between q-mb-sm">
        <div>
          <q-btn
            color="primary"
            :label="trans('创建盘点单')"
            icon="add"
            flat
            class="filter-btn"
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
              label: trans('盘点单号'),
              align: 'left',
              field: 'system_order_number',
            },
            {
              name: 'type',
              label: trans('盘点类型'),
              align: 'left',
              field: (row) =>
                row.type === 'product_location' ? '商品+货架位' : '货架位',
            },
            {
              name: 'remark',
              label: trans('备注'),
              align: 'left',
              field: 'remark',
            },
            {
              name: 'created_by',
              label: trans('创建人'),
              align: 'left',
              field: (row) => row.created_by?.name,
            },
            {
              name: 'created_at',
              label: trans('创建时间'),
              align: 'left',
              field: 'created_at',
            },
            {
              name: 'actions',
              label: trans('操作'),
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
                    <q-tooltip>{{ trans("编辑") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status === 'pending'"
                    flat
                    dense
                    color="primary"
                    icon="play_arrow"
                    @click="handleStartCount(props.row)"
                  >
                    <q-tooltip>{{ trans("开始盘点") }}</q-tooltip>
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
                    <q-tooltip>{{ trans("盘点") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status === 'processing'"
                    flat
                    dense
                    icon="check_circle"
                    class="q-ml-sm"
                    @click="submitCount(props.row)"
                  >
                    <q-tooltip>{{ trans("提交盘点结果") }}</q-tooltip>
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
                    <q-tooltip>{{ trans("导出盘点数据") }}</q-tooltip>
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
                    <q-tooltip>{{ trans("打印盘点单") }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    dense
                    v-if="props.row.status != 'completed'"
                    color="negative"
                    icon="delete"
                    @click="handleDelete(props.row)"
                  >
                    <q-tooltip>{{ trans("删除") }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    v-if="props.row.status === 'completed'"
                    color="primary"
                    icon="list_alt"
                    @click="viewDetails(props.row)"
                  >
                    <q-tooltip>{{ trans("详情") }}</q-tooltip>
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
                        label: trans('商品SKU'),
                        align: 'left',
                        field: 'product_spec_sku',
                      },
                      {
                        name: 'product_spec_name',
                        label: trans('商品名称'),
                        align: 'left',
                        field: 'product_spec_name',
                      },
                      {
                        name: 'warehouse_location_code',
                        label: trans('货架位'),
                        align: 'left',
                        field: 'warehouse_location_code',
                      },
                      {
                        name: 'warehouse_area_type',
                        label: trans('货区类型'),
                        align: 'left',
                        field: 'warehouse_area_type',
                      },
                      {
                        name: 'total_qty',
                        label: trans('系统库存'),
                        align: 'right',
                        field: 'total_qty',
                      },
                      {
                        name: 'counting_qty',
                        label: trans('盘点数量'),
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
              {{ trans("暂无数据") }}
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
          <div class="text-subtitle1 text-weight-medium">
            {{ trans("盘点单详情") }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="close" />
        </q-card-section>
        <q-card-section class="dialog-body q-pa-md scroll" v-if="countOrder">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-3">
              <div class="text-grey">{{ trans("盘点类型") }}</div>
              <div>
                {{
                  countOrder.type === "location_only"
                    ? trans("货架位")
                    : trans("商品+货架位")
                }}
              </div>
            </div>
            <div class="col-3">
              <div class="text-grey">{{ trans("备注") }}</div>
              <div>{{ countOrder.remark || "--" }}</div>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-sm">{{ trans("盘点信息") }}</div>
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
                  areaTypeOptions.find(
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
          <div class="text-h6">{{ trans("盘点") }}</div>
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">
            {{ trans("失败原因") }}:{{ message }}
          </div>
          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">{{ trans("商品SKU") }}</th>
                <th class="text-left">{{ trans("货架位") }}</th>
                <th v-if="submitType == 'submitCountOrder'" class="text-left">
                  {{ trans("原因") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in errorList" :key="item.id">
                <td>{{ item.product_spec_sku }}</td>
                <td>{{ item.warehouse_location_code }}</td>
                <td v-if="submitType == 'submitCountOrder'">
                  {{ trans("实盘库存未填写") }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="{{ trans('关闭') }}"
            color="primary"
            v-close-popup
          />
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
import trans from "@/i18n";
import DatePicker from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import { useStore } from "vuex";
const store = useStore();

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const statusOptions = computed(() => {
  return [
    { label: trans("待盘点"), value: "pending" },
    { label: trans("盘点中"), value: "processing" },
    { label: trans("已完成"), value: "completed" },
  ];
});

const searchModeOptions = computed(() => {
  return store.state.searchModeOptions.map((item) => {
    return {
      label: trans(item.label),
      value: item.value,
    };
  });
});

const dateTypeOptions = computed(() => {
  return store.state.dateTypeOptions.map((item) => {
    return {
      label: trans(item.label),
      value: item.value,
    };
  });
});

const areaTypeOptions = computed(() => {
  return store.state.areaTypeOptions.map((item) => {
    return {
      label: trans(item.label),
      value: item.value,
    };
  });
});

const pageParams = ref({
  page: 1,
  per_page: 10,
  total: 0,
  order_type: "",
  status: "pending",
  date_type: "created_at",
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
  pageParams.value.date_type = "created_at";
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
    title: trans("确认"),
    message: trans("确定要开始盘点吗？"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
    title: trans("确认"),
    message: trans("确定要删除该盘点单吗？"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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

const detailColumns = computed(() => {
  return [
    { name: "index", label: "#", field: "index", align: "center" },
    {
      name: "sku",
      label: trans("商品SKU"),
      field: "product_spec_sku",
      align: "left",
    },
    {
      name: "name",
      label: trans("商品名称"),
      field: "product_spec_name",
      align: "left",
    },
    {
      name: "customer",
      label: trans("客户"),
      field: "customer_name",
      align: "left",
    },
    {
      name: "location",
      label: trans("货架位"),
      field: "location_code",
      align: "left",
    },
    {
      name: "area_type",
      label: trans("货区类型"),
      field: "area_type_name",
      align: "left",
    },
    {
      name: "system_qty",
      label: trans("账面库存"),
      field: "system_qty",
      align: "center",
    },
    {
      name: "actual_qty",
      label: trans("实盘库存"),
      field: "actual_qty",
      align: "center",
    },
    { name: "diff", label: trans("差异"), field: "diff_qty", align: "center" },
  ];
});

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
    // background: #f5f7fa;

    th {
      padding: 8px 12px;
      font-weight: 500;
      // border-bottom: 1px solid #ebeef5;
      // border-right: 1px solid #ebeef5;
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
