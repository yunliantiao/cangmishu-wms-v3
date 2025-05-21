<template>
  <div class="sort-sku-tooltip">
    <div class="tooltip-title">{{ trans("分拣框") }} #{{ boxIndex + 1 }}</div>
    <q-table
      :rows="boxData.boxes"
      :columns="skuColumns"
      row-key="product_spec_sku"
      dense
      flat
      hide-bottom
      class="sku-table"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="sku" :props="props">
            <span
              class="hover-copy"
              @click="$copy(props.row.product_spec_sku)"
              >{{ props.row.product_spec_sku }}</span
            >
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.product_name || "-" }}
          </q-td>
          <q-td key="inFrame" :props="props">
            {{ props.row.inFrame }}
          </q-td>
          <q-td key="quantity" :props="props">
            {{ props.row.quantity }}
          </q-td>
          <q-td key="remain" :props="props">
            {{ props.row.quantity - props.row.inFrame }}
          </q-td>
          <!-- <q-td key="status" :props="props">
            <q-badge :color="getSkuStatusColor(props.row)">
              {{ getSkuStatusText(props.row) }}
            </q-badge>
          </q-td> -->
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from "vue";
import trans from "@/i18n";

const props = defineProps({
  boxData: {
    type: Object,
    required: true,
  },
  boxIndex: {
    type: Number,
    required: true,
  },
});

// SKU 表格列定义
const skuColumns = [
  {
    name: "sku",
    align: "left",
    label: trans("SKU"),
    field: "product_spec_sku",
  },
  {
    name: "name",
    align: "left",
    label: trans("商品名称"),
    field: "product_name",
  },
  {
    name: "inFrame",
    align: "center",
    label: trans("已入框"),
    field: "inFrame",
  },
  {
    name: "quantity",
    align: "center",
    label: trans("总数量"),
    field: "quantity",
  },
  {
    name: "remain",
    align: "center",
    label: trans("剩余"),
    field: (row) => row.quantity - row.inFrame,
  },
  // {
  //   name: "status",
  //   align: "center",
  //   label: trans("状态"),
  //   field: (row) => getSkuStatusText(row),
  // },
];

// 获取 SKU 状态文本
const getSkuStatusText = (row) => {
  if (row.inFrame === 0) return trans("未开始");
  if (row.inFrame < row.quantity) return trans("进行中");
  return trans("已完成");
};

// 获取 SKU 状态颜色
const getSkuStatusColor = (row) => {
  if (row.inFrame === 0) return "grey";
  if (row.inFrame < row.quantity) return "orange";
  return "green";
};
</script>

<style scoped lang="scss">
.sort-sku-tooltip {
  padding: 0;
  min-width: 500px;

  .tooltip-title {
    font-size: 14px;
    font-weight: 500;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }

  .sku-table {
    :deep(th) {
      background-color: #f9f9f9;
      color: #606266;
      font-weight: 500;
      font-size: 13px;
      padding: 8px 12px;
    }

    :deep(td) {
      padding: 6px 12px;
      font-size: 13px;
    }

    :deep(.q-table__card) {
      box-shadow: none;
    }
  }
}
</style>
