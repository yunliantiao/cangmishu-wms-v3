<template>
  <div class="signing-record-page">
    <!-- 筛选栏 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <DatePicker
            v-model:start_date="pageData.filter.start_date"
            v-model:end_date="pageData.filter.end_date"
            :showSelect="false"
          />
        </div>
        <div class="col-auto">
          <KeywordSearch
            v-model:search_type="pageData.filter.search_type"
            v-model:search_value="pageData.filter.keywords"
            v-model:search_mode="pageData.filter.search_mode"
            :searchTypeList="pageData.searchTypeList"
            :searchModeList="pageData.searchModeList"
          />
        </div>
        <div class="col-auto">
          <q-btn color="primary" @click="getList" class="filter-btn">
            查询
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="main-table">
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        hide-bottom
        class="signing-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
        :loading="pageData.loading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td>{{ props.row.deliver_sign_number }}</q-td>
            <q-td>{{ props.row.logistics_group_name || "--" }}</q-td>
            <q-td>{{ props.row.package_quantity }}</q-td>
            <q-td>{{ props.row.created_at }}</q-td>
            <q-td>
              <q-btn
                flat
                round
                @click="handlePrint(props.row)"
                size="sm"
                class="table-icon"
              >
                <img src="@/assets/images/print.png" />
                <q-tooltip>打印</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <span class="text-grey">暂无数据</span>
          </div>
        </template>
      </q-table>

      <div class="q-pa-md">
        <Pagination
          :total-count="pageData.filter.total"
          v-model:page="pageData.filter.page"
          v-model:rows-per-page="pageData.filter.per_page"
          @page-change="getList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import outApi from "@/api/out";
import DatePicker from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import Pagination from "@/components/Pagination.vue";

const pageData = reactive({
  warehouse: "",
  warehouseOptions: ["USC"],
  group: "",
  groupOptions: ["全部物流组", "物流组 A", "物流组 B"],
  rows: [],
  columns: [
    {
      name: "deliver_sign_number",
      label: "签单号",
      field: "deliver_sign_number",
      align: "left",
    },
    {
      name: "logistics_group_name",
      label: "物流组名称",
      field: "logistics_group_name",
      align: "left",
    },
    {
      name: "package_quantity",
      label: "包裹数量",
      field: "package_quantity",
      align: "left",
    },
    {
      name: "created_at",
      label: "生成时间",
      field: "created_at",
      align: "left",
    },
    { name: "actions", label: "操作", field: "actions", align: "left" },
  ],
  filter: {
    start_date: "",
    end_date: "",
    keywords: "",
    search_mode: "exact",
    search_type: "tracking_number",
    total: 0,
    page: 1,
    per_page: 10,
  },
  loading: false,
  searchTypeList: [
    { label: "运单号", value: "tracking_number" },
    { label: "签单号", value: "deliver_sign_number" },
  ],
  searchModeList: [
    { label: "精确搜索", value: "exact" },
    { label: "模糊搜索", value: "fuzzy" },
    { label: "前缀搜索", value: "prefix" },
  ],
});

onMounted(() => {
  getList();
});

const getList = async () => {
  pageData.loading = true;
  try {
    // 查询逻辑
    const { data } = await outApi.getShipmentRecord(pageData.filter);
    pageData.rows = data.items;
    pageData.filter.total = data.meta.total;
    pageData.loading = false;
  } catch (error) {
    pageData.loading = false;
  }
};

const handlePrint = async (row) => {
  // 打印逻辑

  const { data } = await outApi.getShipmentPdf(row.id);
  console.log("data", data);
  window.open(data.data, "_blank");
};
</script>

<style scoped lang="scss">
.signing-record-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 0 0 24px 0;

  .filter-bar {
    background: #fff;
    padding: 24px 24px 0 24px;
    border-radius: 0 0 8px 8px;
  }
  .main-table {
    .signing-table {
      margin-top: 0;
      :deep(.q-table th) {
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }
      :deep(.q-table td) {
        font-size: 14px;
        color: #333;
        padding: 8px 12px;
        background: #fff;
      }
    }
  }
}
</style>