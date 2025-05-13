<template>
  <div class="signing-record-page">
    <!-- 筛选栏 -->
    <div class="filter-bar row items-center q-gutter-md">
      <q-input
        outlined
        dense
        v-model="pageData.date"
        label="日期区间"
        style="width: 260px"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer" />
        </template>
      </q-input>
      <!-- 日期选择器建议用 q-date-range 或自定义弹窗，这里简化为输入框 -->
      <q-select
        outlined
        dense
        v-model="pageData.searchType"
        :options="pageData.searchTypeOptions"
        label="运单号"
        style="width: 120px"
      />
      <q-input
        outlined
        dense
        v-model="pageData.searchValue"
        label="请输入"
        style="width: 160px"
      />
      <q-btn color="primary" icon="search" @click="getList" />
    </div>

    <!-- 表格 -->
    <div class="main-table q-mt-md">
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        bordered
        hide-bottom
        class="signing-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td>{{ props.row.sign_no }}</q-td>
            <q-td>{{ props.row.warehouse }}</q-td>
            <q-td>{{ props.row.group_name }}</q-td>
            <q-td>{{ props.row.package_count }}</q-td>
            <q-td>{{ props.row.created_at }}</q-td>
            <q-td>
              <q-btn
                flat
                round
                icon="print"
                @click="handlePrint(props.row)"
                size="sm"
              />
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <span class="text-grey">暂无数据</span>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const pageData = reactive({
  warehouse: "",
  warehouseOptions: ["USC"],
  group: "",
  groupOptions: ["全部物流组", "物流组 A", "物流组 B"],
  date: "",
  searchType: "运单号",
  searchTypeOptions: ["运单号"],
  searchValue: "",
  rows: [
    {
      id: 1,
      sign_no: "MF3HB2505120016",
      warehouse: "USC",
      group_name: "物流组 B",
      package_count: 1,
      created_at: "2025-05-12 00:12",
    },
    {
      id: 2,
      sign_no: "MF3HB2505110015",
      warehouse: "USC",
      group_name: "物流组 B",
      package_count: 1,
      created_at: "2025-05-11 23:47",
    },
    {
      id: 3,
      sign_no: "MF3HB2505110014",
      warehouse: "USC",
      group_name: "物流组 B",
      package_count: 1,
      created_at: "2025-05-11 23:46",
    },
    {
      id: 4,
      sign_no: "MF3HB2505110013",
      warehouse: "USC",
      group_name: "物流组 B",
      package_count: 1,
      created_at: "2025-05-11 19:33",
    },
    {
      id: 5,
      sign_no: "MF3HB2505110012",
      warehouse: "USC",
      group_name: "物流组 B",
      package_count: 1,
      created_at: "2025-05-11 19:30",
    },
  ],
  columns: [
    { name: "sign_no", label: "签单号", field: "sign_no", align: "left" },
    { name: "warehouse", label: "仓库", field: "warehouse", align: "left" },
    {
      name: "group_name",
      label: "物流组名称",
      field: "group_name",
      align: "left",
    },
    {
      name: "package_count",
      label: "包裹数量",
      field: "package_count",
      align: "center",
    },
    {
      name: "created_at",
      label: "生成时间",
      field: "created_at",
      align: "center",
    },
    { name: "actions", label: "操作", field: "actions", align: "center" },
  ],
});

const getList = () => {
  // 查询逻辑
};

const handlePrint = (row) => {
  // 打印逻辑
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
    background: #fff;
    border-radius: 8px;
    margin: 24px 16px 0 16px;
    padding-bottom: 24px;
    .signing-table {
      margin-top: 0;
      :deep(.q-table th) {
        background: #f5f6fa;
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