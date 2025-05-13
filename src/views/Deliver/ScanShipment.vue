<template>
  <div class="scan-shipment-page">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar row items-center">
      <q-input
        outlined
        dense
        v-model="pageData.orderNo"
        label="请扫描输入运单号或平台订单号"
        class="filter-input"
        style="width: 320px"
      />

      <q-btn color="primary" label="确定" @click="handleSearch" />
    </div>
    <div class="tip-bar row items-center q-mt-xs q-ml-sm">
      <q-icon name="info" color="grey-5" size="18px" class="q-mr-xs" />
      <span class="text-grey-6" style="font-size: 13px"
        >请先切换成EN输入法</span
      >
    </div>
    <div class="text-grey-7 q-ml-sm q-mt-xs" style="font-size: 13px">
      称重须知：请注意电子平台单位和页面选中的称重单位保持一致
    </div>

    <!-- 表格 -->
    <div class="main-table q-mt-md">
      <div class="table-header row items-center">
        <span class="text-h6">扫描记录</span>
        <q-space />
        <q-btn
          color="primary"
          flat
          @click="handlePrint"
          :disable="pageData.rows.length === 0"
          >打印签单</q-btn
        >
      </div>
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        class="scan-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <span class="text-grey">No Data</span>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="tracking_number" :props="{ row }">
              {{ row.tracking_number }}
            </q-td>
            <q-td key="logistics" :props="{ row }">
              {{ row.logistics || "--" }}
            </q-td>
            <q-td key="product" :props="{ row }">
              <div class="box" v-for="(item, index) in row.items" :key="index">
                {{ item.sku }}
              </div>
            </q-td>
            <q-td key="qty" :props="{ row }">
              <div class="box" v-for="(item, index) in row.items" :key="index">
                {{ item.quantity }}
              </div>
            </q-td>

            <q-td key="estimated_weight" :props="{ row }">
              {{ row.estimated_weight || "--" }}
            </q-td>

            <q-td key="actual_weight" :props="{ row }">
              {{ row.actual_weight || "--" }}
            </q-td>
            <q-td key="diff_weight" :props="{ row }">
              {{ row.actual_weight - row.estimated_weight || "--" }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import outApi from "@/api/out";
const pageData = reactive({
  orderNo: "",
  weight: "",
  weightUnit: "g",
  weightUnitOptions: [
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
  ],
  voice: true,
  rows: [],
  columns: [
    {
      name: "tracking_number",
      label: "运单号",
      field: "tracking_number",
      align: "left",
    },
    { name: "logistics", label: "物流方式", field: "logistics", align: "left" },
    { name: "product", label: "商品信息", field: "product", align: "left" },
    { name: "qty", label: "数量", field: "qty", align: "center" },
    {
      name: "estimated_weight",
      label: "预设重量(g)",
      field: "estimated_weight",
      align: "center",
    },
    {
      name: "actual_weight",
      label: "实际重量(g)",
      field: "real_weight",
      align: "actual_weight",
    },
    {
      name: "diff_weight",
      label: "称重差异(g)",
      field: "diff_weight",
      align: "center",
    },
  ],
});

const handleSearch = async () => {
  // 扫描/称重逻辑
  const { data } = await outApi.scanShipment({
    number: pageData.orderNo,
  });
  pageData.rows = [data.data];
};

const handlePrint = () => {
  // 打印签单逻辑
};
</script>

<style scoped lang="scss">
.scan-shipment-page {
  .filter-bar {
    background: #ffffff;
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;
    padding: 32px;
    gap: 20px;
  }
  .filter-select,
  .filter-input {
    min-width: 120px;
  }
  .tip-bar {
    min-height: 32px;
  }
  .main-table {
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;
    background: #ffffff;
    padding: 32px;

    .table-header {
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #1976d2;
      .text-h6 {
        font-size: 16px;
        font-weight: 500;
      }
    }
    .scan-table {
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
.keywords-input {
  flex: 1;
  :deep(.q-field__control) {
    border-radius: 0;
    border-right: none !important;
  }
}

.search-mode-select {
  width: 120px;
  :deep(.q-field__control) {
    border-radius: 0 4px 4px 0 !important;
  }
  :deep(.q-field__control:before) {
    border-left: 0;
  }
}

.box {
  padding: 5px 0;
}
</style>