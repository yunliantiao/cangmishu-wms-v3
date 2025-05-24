<template>
  <div class="adjust-page">
    <TopBack :title="trans('库存调整')"></TopBack>

    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
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
          :searchModeList="searchModeOptions"
          :searchTypeList="searchTypeList"
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
            @click="getAdjustList"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-none page_table_action">
      <!-- 操作按钮区域 -->
      <div class="row justify-between q-mb-sm">
        <!-- <div class="row items-center">
          <span class="q-mr-sm"
            >{{ trans("选择") }} {{ selectedRows.length }}</span
          >
        </div> -->
        <div>
          <q-btn
            color="primary"
            :label="trans('创建调整单')"
            icon="add"
            flat
            @click="createAdjust"
            unelevated
          />
        </div>
      </div>
      <div>
        <q-table
          flat
          :rows="adjustList"
          :columns="columns"
          v-model:selected="selectedRows"
          row-key="id"
          selection="multiple"
          separator="horizontal"
          :loading="loading"
          :pagination="{
            rowsPerPage: 0,
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
          <!-- 自定义行 -->
          <template v-slot:body="props">
            <!-- 分组标题行 -->
            <q-tr class="group-header-row">
              <q-td colspan="7">
                <div class="row group-header items-center">
                  <div>
                    <q-checkbox v-model="props.selected" size="sm" />
                    <span class="info-item q-mr-md">
                      {{ trans("调整单号") }}:
                      <Copy :text="props.row.system_order_number"></Copy>
                    </span>
                  </div>
                  <div>{{ trans("备注") }}:{{ props.row.remark || "-" }}</div>
                </div>
              </q-td>
            </q-tr>
            <!-- 商品行 -->
            <template v-for="(item, index) in props.row.items" :key="index">
              <q-tr>
                <q-td auto-width class="text-center">
                  <!-- <q-checkbox v-model="props.row.selected" /> -->
                </q-td>
                <q-td key="info" class="product-info-cell">
                  <div class="product-info">
                    <div>
                      <Copy :text="item.product_spec_sku"></Copy>
                    </div>
                    <div>{{ item.product_spec_name }}</div>
                    <div>{{ item.product_name }}</div>
                  </div>
                </q-td>
                <q-td key="type">
                  {{
                    props.row.type === "good"
                      ? trans("良品调整")
                      : trans("不良品调整")
                  }}
                </q-td>
                <q-td key="location">
                  <div
                    v-for="(loc, locIndex) in item.locations"
                    :key="locIndex"
                  >
                    {{ loc.location_code }}
                  </div>
                </q-td>
                <q-td key="quantity" class="text-center">
                  <div
                    v-for="(loc, locIndex) in item.locations"
                    :key="locIndex"
                  >
                    <span
                      class="stock-number"
                      :class="{
                        'text-positive': loc.adjustment_qty > 0,
                        'text-negative': loc.adjustment_qty < 0,
                      }"
                    >
                      {{ loc.adjustment_qty > 0 ? "+" : ""
                      }}{{ loc.adjustment_qty }}
                    </span>
                  </div>
                </q-td>
                <q-td key="operator">
                  {{ props.row.created_by.name || "-" }}
                </q-td>
                <q-td key="created_at">
                  {{ props.row.created_at }}
                </q-td>
              </q-tr>
            </template>
          </template>
        </q-table>
        <div class="q-mt-md">
          <Pagination
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="getAdjustList"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import inventoryApi from "@/api/inventory";
import { useRouter } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import trans from "@/i18n";
import DatePicker from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import { useStore } from "vuex";
const store = useStore();
const router = useRouter();
const selectedRows = ref([]);
const pageParams = ref({
  page: 1,
  per_page: 10,
  total: 0,
  keywords: "",
  status: "",
  date_type: "created_at",
  start_date: "",
  end_date: "",
  search_type: "sku",
  search_mode: "exact",
});
const loading = ref(false);

const adjustList = ref([]);

// 表格列配置
const columns = computed(() => {
  return [
    {
      name: "info",
      label: trans("商品信息/箱信息"),
      align: "left",
      field: (row) => row,
    },
    {
      name: "type",
      label: trans("调整类型"),
      align: "left",
      field: (row) => row.type,
    },
    {
      name: "location",
      label: trans("货架位"),
      align: "left",
      field: (row) => row.items?.[0]?.locations?.[0]?.location_code,
    },
    {
      name: "quantity",
      label: trans("调整数量"),
      align: "center",
      field: (row) => row.items?.[0]?.locations?.[0]?.adjustment_qty,
    },
    {
      name: "operator",
      label: trans("操作人"),
      align: "left",
      field: (row) => row.operator,
    },
    {
      name: "created_at",
      label: trans("时间"),
      align: "left",
      field: (row) => row.created_at,
    },
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

const searchTypeList = computed(() => {
  return [
    { label: trans("商品SKU"), value: "sku" },
    { label: trans("移货编号"), value: "system_order_number" },
    { label: trans("商品名称"), value: "name" },
  ];
});

// 选择相关
const selectAll = ref(false);
watch(selectAll, (val) => {
  adjustList.value.forEach((item) => {
    item.selected = val;
  });
});

// 分页请求
const onRequest = (props) => {
  const { page, rowsPerPage } = props.pagination;
  pageParams.value.page = page;
  pageParams.value.per_page = rowsPerPage;
  getAdjustList();
};

// 获取列表数据
const getAdjustList = () => {
  loading.value = true;
  inventoryApi.getAdjustOrderList(pageParams.value).then((res) => {
    if (res.success) {
      adjustList.value = res.data.items.map((item) => ({
        ...item,
        selected: false,
      }));
      pageParams.value.total = res.data.meta.total;
    }
    loading.value = false;
  });
};

// 重置搜索
const resetSearch = () => {
  pageParams.value = {
    page: 1,
    per_page: 10,
    total: 0,
    keywords: "",
    status: "",
    date_type: "created_at",
    start_date: "",
    end_date: "",
    search_type: "sku",
    search_mode: "exact",
  };
  getAdjustList();
};

const createAdjust = () => {
  router.push({
    name: "create-adjust",
  });
};
// 添加 showGroupHeader 函数
const showGroupHeader = (row, index) => {
  // 第一行显示标题
  if (index === 0) return true;

  // 如果当前行的group_id与前一行不同，显示标题
  const prevRow = adjustList.value[index - 1];
  return prevRow && row.id !== prevRow.id;
};

getAdjustList();
</script>

<style lang="scss" scoped>
.adjust-page {
  :deep(.q-table) {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }

    td {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
    }
  }
  :deep(.q-table__card) {
    box-shadow: none;
    // border: 1px solid rgba(0, 0, 0, 0.12);
  }
  .group-header-row {
    background-color: #f8fafc;

    td {
      padding: 8px 16px;
      // border-top: 1px solid #ebeef5;
      // border-bottom: 1px solid #ebeef5;
    }
  }

  .select-width {
    width: 150px;
  }

  .date-input {
    width: 150px;
  }

  .search-group {
    .search-type-select {
      width: 120px;
    }
    .search-mode-select {
      width: 120px;
    }
  }
}
</style>