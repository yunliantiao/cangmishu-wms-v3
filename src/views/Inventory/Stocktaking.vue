<template>
  <div class="stocktaking-page">
    <div class="row items-center justify-between q-pa-md bg-white q-mb-md">
      <div class="row items-center">
        <q-btn flat dense icon="arrow_back" @click="$router.back()" />
        <div class="text-h6 q-ml-sm">{{ trans("盘点") }}</div>
      </div>
      <div>
        <q-btn
          outline
          :label="trans('取消')"
          color="grey"
          class="q-mr-sm"
          @click="$router.back()"
        />
        <q-btn
          outline
          class="q-mr-sm"
          :label="trans('打印盘点单')"
          color="primary"
          :loading="$store.state.btnLoading"
          @click="printCountOrder()"
        />
        <q-btn
          outline
          class="q-mr-sm"
          :label="trans('保存')"
          color="primary"
          :loading="$store.state.btnLoading"
          @click="handleSubmit('save')"
        />
        <q-btn
          unelevated
          :label="trans('提交')"
          color="primary"
          :loading="$store.state.btnLoading"
          @click="handleSubmit('start')"
        />
      </div>
    </div>
    <div class="q-mb-md">
      <!-- 基本信息 -->
      <div class="bg-white rounded-borders q-pa-lg q-mb-md">
        <div class="text-subtitle1 q-mb-md">{{ trans("基本信息") }}</div>
        <q-form ref="formRef" class="q-gutter-md" @submit="handleSubmit">
          <div class="row q-mb-md">
            <div class="col-4">
              <q-select
                outlined
                v-model="formData.type"
                :options="inventoryTypes"
                :label="trans('盘点类型')"
                disable
                :rules="rules.type"
                emit-value
                map-options
              >
                <template v-slot:append>
                  <span class="text-red">*</span>
                </template>
              </q-select>
            </div>
            <div class="col-4 q-ml-xl">
              <div>{{ trans("0库存是否参加盘点") }}</div>
              <q-radio
                v-model="formData.is_zero_counting"
                :val="true"
                :label="trans('是')"
                disable
              />
              <span class="q-ml-md"></span>
              <q-radio
                v-model="formData.is_zero_counting"
                :val="false"
                :label="trans('否')"
                disable
              />
            </div>
          </div>
          <div class="row">
            <div class="col-8">
              <q-input
                outlined
                v-model="formData.remark"
                :label="trans('备注')"
                type="textarea"
                rows="4"
                disable
              />
            </div>
          </div>
        </q-form>
      </div>
      <div class="bg-white rounded-borders q-pa-lg">
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-subtitle1">{{ trans("盘点信息") }}</div>
          <div>
            <q-btn
              outline
              color="primary"
              :label="trans('导出')"
              icon-right="arrow_drop_down"
            >
              <q-menu>
                <q-list style="min-width: 100px">
                  <!-- <q-item clickable v-close-popup @click="handleImport">
                    <q-item-section>导入</q-item-section>
                  </q-item> -->
                  <q-item clickable v-close-popup @click="handleExport">
                    <q-item-section>{{ trans("导出盘点数据") }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
        <div class="q-mb-md">
          <div class="row q-gutter-md">
            <q-radio
              v-model="countMode"
              val="fill_stock"
              :label="trans('实盘库存为0，自动填充账面库存')"
            />
            <q-radio
              v-model="countMode"
              val="fill_zero"
              :label="trans('实盘库存为0，自动填0')"
            />
          </div>
        </div>
        <div>
          <q-table
            flat
            :rows="tableData"
            :columns="[
              {
                name: 'index',
                label: '#',
                align: 'center',
                field: (row, index) => index + 1,
                style: 'width: 80px',
              },
              {
                name: 'sku',
                label: trans('商品SKU'),
                align: 'center',
                field: (row) => row.product_spec_sku,
              },
              {
                name: 'name',
                label: trans('商品名称'),
                align: 'center',
                field: (row) => row.product_spec_name,
              },
              {
                name: 'customer',
                label: trans('客户'),
                align: 'center',
                field: 'customer',
              },
              {
                name: 'location',
                label: trans('货架位'),
                align: 'center',
                field: (row) =>
                  `${row.warehouse_location_code} [${
                    row.warehouse_area_type === 'staging'
                      ? trans('暂存区')
                      : trans('拣货区')
                  }]`,
              },
              {
                name: 'system_qty',
                label: trans('账面库存'),
                align: 'center',
                field: 'total_qty',
              },
              {
                name: 'counting_qty',
                label: trans('实盘库存'),
                align: 'center',
                field: 'counting_qty',
              },
              {
                name: 'difference',
                label: trans('差异'),
                align: 'center',
                field: (row) => row.counting_qty - row.total_qty,
                style: (row) => {
                  const diff = row.counting_qty - row.total_qty;
                  return diff < 0 ? 'color: #f56c6c' : '';
                },
              },
            ]"
            row-key="id"
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            :separator="'none'"
            :loading="$store.state.btnLoading"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="index" :props="props" class="text-center">
                  {{ props.rowIndex + 1 }}
                </q-td>
                <q-td key="sku" :props="props" class="text-center">
                  {{ props.row.product_spec_sku }}
                </q-td>
                <q-td key="name" :props="props" class="text-center">
                  {{ props.row.product_spec_name }}
                </q-td>
                <q-td key="customer" :props="props" class="text-center">
                  <div v-if="props.row.customer">
                    {{ props.row.customer?.name }}
                    <div class="text-grey-7">
                      [{{ props.row.customer?.code }}]
                    </div>
                  </div>
                </q-td>
                <q-td key="location" :props="props" class="text-center">
                  {{ props.row.warehouse_location_code }}
                  <div>
                    [{{
                      areaTypeOptions.find(
                        (item) => item.value === props.row.warehouse_area_type
                      )?.label || "-"
                    }}]
                  </div>
                </q-td>
                <q-td key="system_qty" :props="props" class="text-center">
                  {{ props.row.total_qty }}
                </q-td>
                <q-td key="counting_qty" :props="props" class="text-center">
                  <q-input
                    :model-value="props.row.counting_qty || ''"
                    @update:model-value="
                      (val) => {
                        props.row.counting_qty = val ? Number(val) : null;
                        handleQtyChange(props.row);
                      }
                    "
                    dense
                    outlined
                    type="number"
                    style="width: 100px; margin: 0 auto"
                    class="text-center"
                    :placeholder="trans('请输入')"
                  />
                </q-td>
                <q-td
                  key="difference"
                  :props="props"
                  class="text-center"
                  :style="getDifferenceStyle(props.row)"
                >
                  {{
                    props.row.counting_qty
                      ? props.row.counting_qty - props.row.total_qty
                      : ""
                  }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import inventoryApi from "@/api/inventory";
import settingApi from "@/api/setting";
import { useRoute, useRouter } from "vue-router";
import trans from "@/i18n";
import { useStore } from "vuex";

const store = useStore();
const route = useRoute();
const router = useRouter();
const id = route.query.id;
const $q = useQuasar();
const formRef = ref(null);
const rules = {
  type: [(val) => !!val || trans("请选择盘点类型")],
};

const inventoryTypes = ref([
  { label: trans("商品+货架位"), value: "product_location" },
  { label: trans("货架位"), value: "location_only" },
]);

const areaTypeOptions = computed(() => {
  return store.state.areaTypeOptions.map((item) => {
    return {
      label: trans(item.label),
      value: item.value,
    };
  });
});

const formData = ref({
  type: "",
  remark: "",
  is_zero_counting: true,
  items: [],
});

const countMode = ref("fill_stock");

const columns = [
  {
    name: "sku",
    label: trans("商品SKU"),
    align: "left",
    field: "sku",
  },
  {
    name: "name",
    label: trans("商品名称"),
    align: "left",
    field: (row) => row.product?.name || "-",
  },
  {
    name: "customer",
    label: trans("客户"),
    align: "left",
    field: (row) => {
      const code = row.customer?.code || "-";
      return `${row.customer?.name || "-"} [${code}]`;
    },
  },
  {
    name: "location",
    label: trans("货架位"),
    align: "left",
    field: (row) => row.location || "B-001",
  },
  {
    name: "type",
    label: trans("货区类型"),
    align: "left",
    field: (row) => row.type || trans("拣货区"),
  },
  {
    name: "actions",
    label: trans("操作"),
    align: "center",
  },
];

const tableData = ref([]);

const handleSubmit = (type) => {
  // 验证是否所有商品都已填写实盘库存
  const emptyItems = tableData.value.filter(
    (item) => item.counting_qty === null || item.counting_qty === undefined
  );

  if (emptyItems.length > 0) {
    $q.notify({
      type: "warning",
      message: trans("请填写所有商品的实盘库存"),
      position: "top",
    });
    return;
  }

  // 构建保存数据
  const saveData = {
    result_type: countMode.value,
    items: tableData.value.map((item) => ({
      id: item.id,
      qty: item.counting_qty,
    })),
  };
  inventoryApi.saveCountOrder(id, saveData).then((res) => {
    if (res.success) {
      if (type === "save") {
        router.push("/inventory/count?type=processing");
      } else {
        submitCountOrder(id);
      }
    }
  });
};

const submitCountOrder = (orderId) => {
  inventoryApi.submitCountOrder(orderId).then((res) => {
    if (res.success) {
      router.back();
    }
  });
};

const handleDelete = (row) => {
  const index = tableData.value.findIndex((item) => item.id === row.id);
  if (index > -1) {
    tableData.value.splice(index, 1);
  }
};

const getCountOrderDetail = () => {
  inventoryApi.getCountOrderDetail(id).then((res) => {
    if (res.success) {
      formData.value = res.data;
      formData.value.is_zero_counting =
        res.data.is_zero_counting == 1 ? true : false;
      tableData.value = res.data.items;
    }
  });
};

// 处理导入
const handleImport = () => {
  // 实现导入逻辑
};

// 处理导出
const handleExport = () => {
  inventoryApi.exportCountOrder(id).then((res) => {
    if (res.success) {
      window.open(res.data.data);
    }
  });
};

const printCountOrder = () => {
  inventoryApi.printCountOrder(id).then((res) => {
    if (res.success) {
      window.open(res.data.data);
    }
  });
};

// 处理数量变化
const handleQtyChange = (row) => {
  if (!row.counting_qty) {
    row.counting_qty = null;
    return;
  }
  const num = Number(row.counting_qty);
  if (num === 0) {
    row.counting_qty = null;
    return;
  }
  row.counting_qty = num;
};

// 获取差异列的样式
const getDifferenceStyle = (row) => {
  if (!row.counting_qty) return "";
  const diff = row.counting_qty - row.total_qty;
  return diff < 0 ? "color: #f56c6c" : "";
};

onMounted(() => {
  if (id) {
    getCountOrderDetail();
  }
});
</script>

<style lang="scss" scoped>
.stocktaking-page {
  .q-btn {
    height: 32px;
  }
}

:deep(.q-table) {
  border-radius: 4px;

  thead tr {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      background-color: #f5f7fa;
      padding: 16px;
    }
  }
}

.product-info,
.customer-info {
  > div {
    line-height: 1.4;
    &:first-child {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }
}

.stock-number {
  display: inline-block;
  min-width: 60px;
  padding: 4px 8px;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.q-table) {
  thead tr {
    height: 40px;
    background: #f5f7fa;

    th {
      padding: 8px 12px;
      font-weight: 500;
      color: #606266;
      white-space: nowrap;

      &:first-child {
        padding: 8px;
      }
    }
  }

  tbody td {
    padding: 8px 12px;
    color: #606266;

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

.q-input.q-field--outlined .q-field__control {
  height: 32px;
}

.q-menu {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>

