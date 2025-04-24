<template>
  <div class="create-count-page">
    <div class="row items-center justify-between q-pa-md bg-white q-mb-md">
      <div class="row items-center">
        <q-btn flat dense icon="arrow_back" @click="$router.back()" />
        <div class="text-h6 q-ml-sm">
          {{ id ? "编辑盘点单" : "创建盘点单" }}
        </div>
      </div>
      <div>
        <q-btn
          outline
          label="取消"
          color="grey"
          class="q-mr-sm"
          @click="$router.back()"
        />
        <q-btn
          outline
          class="q-mr-sm"
          label="保存"
          color="primary"
          :loading="$store.state.btnLoading"
          @click="handleSave('save')"
        />
        <q-btn
          unelevated
          label="开始盘点"
          color="primary"
          :loading="$store.state.btnLoading"
          @click="handleSave('start')"
        />
      </div>
    </div>
    <div class="q-mb-md">
      <!-- 基本信息 -->
      <div class="bg-white rounded-borders q-pa-lg q-mb-md">
        <div class="text-subtitle1 q-mb-md">基本信息</div>
        <q-form ref="formRef" class="q-gutter-md" @submit="handleSave">
          <div class="row q-mb-md">
            <div class="col-4">
              <q-select
                outlined
                v-model="formData.type"
                :options="inventoryTypes"
                label="盘点类型"
                @update:model-value="handleTypeChange"
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
              <div>0库存是否参加盘点</div>
              <q-radio
                v-model="formData.is_zero_counting"
                :val="true"
                label="是"
              />
              <span class="q-ml-md"></span>
              <q-radio
                v-model="formData.is_zero_counting"
                :val="false"
                label="否"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-8">
              <q-input
                outlined
                v-model="formData.remark"
                label="备注"
                type="textarea"
                rows="4"
              />
            </div>
          </div>
        </q-form>
      </div>
      <div class="bg-white rounded-borders q-pa-lg">
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-subtitle1">盘点信息</div>
          <q-btn
            outline
            color="primary"
            label="选择商品"
            icon="add"
            @click="selectGoods"
          />
        </div>
        <div>
          <q-table
            flat
            :rows="tableData"
            :columns="columns"
            row-key="id"
            separator="horizontal"
            :pagination="{
              rowsPerPage: 0,
            }"
            :loading="$store.state.btnLoading"
            hide-pagination
          >
            <template v-slot:no-data>
              <div class="full-width row flex-center q-my-lg">
                <span class="text-grey">暂无数据</span>
              </div>
            </template>
            <!-- 自定义表头 -->
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width class="text-center"> # </q-th>
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <!-- 自定义行 -->
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width class="text-center">
                  {{ props.rowIndex + 1 }}
                </q-td>
                <q-td key="sku" :props="props">
                  <div v-if="props.row.sku">
                    {{ props.row.sku }}
                  </div>
                  <div v-else>
                    {{ props.row.product_spec_sku }}
                  </div>
                </q-td>
                <q-td key="name" :props="props">
                  <div v-if="props.row.product?.name">
                    {{ props.row.product?.name }}
                  </div>
                  <div v-else>
                    {{ props.row.product_name }}
                  </div>
                </q-td>
                <q-td key="customer" :props="props">
                  {{ props.row.customer?.name }}
                </q-td>
                <q-td key="location" :props="props">
                  {{ props.row.warehouse_location_code || "-" }}
                </q-td>
                <q-td key="type" :props="props">
                  {{
                    $store.state.areaTypeOptions.find(
                      (item) => item.value == props.row.warehouse_area_type
                    )?.label || "-"
                  }}
                </q-td>
                <q-td key="actions" :props="props" class="text-center">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="删除"
                    @click="handleDelete(props.row)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </div>

    <!-- 选择商品弹窗 -->
    <CountProduct
      v-model="showProductSelector"
      @confirm="handleConfirmSelect"
    />
    <CountStocks v-model="showStocksSelector" @confirm="handleConfirmSelect" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CountProduct from "./components/CountProduct.vue";
import CountStocks from "./components/CountStocks.vue";
import { useQuasar } from "quasar";
import inventoryApi from "@/api/inventory";
import settingApi from "@/api/setting";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const id = route.query.id;
const $q = useQuasar();
const formRef = ref(null);
const rules = {
  type: [(val) => !!val || "请选择盘点类型"],
};
const showProductSelector = ref(false);
const showStocksSelector = ref(false);

const inventoryTypes = ref([
  { label: "商品+货架位", value: "product_location" },
  { label: "货架位", value: "location_only" },
]);

const formData = ref({
  type: "",
  remark: "",
  is_zero_counting: true,
  items: [],
});

const columns = [
  {
    name: "sku",
    label: "商品SKU",
    align: "left",
    field: "sku",
  },
  {
    name: "name",
    label: "商品名称",
    align: "left",
    field: (row) => row.product?.name || "-",
  },
  {
    name: "customer",
    label: "客户",
    align: "left",
    field: (row) => {
      const code = row.customer?.code || "-";
      return `${row.customer?.name || "-"} [${code}]`;
    },
  },
  {
    name: "location",
    label: "货架位",
    align: "left",
    field: (row) => row.location || "B-001",
  },
  {
    name: "type",
    label: "货区类型",
    align: "left",
    field: (row) => row.type || "拣货区",
  },
  {
    name: "actions",
    label: "操作",
    align: "center",
  },
];

const selectGoods = () => {
  if (!formData.value.type) {
    $q.notify({
      type: "warning",
      message: "请选择盘点类型",
    });
    return;
  }
  if (formData.value.type == "product_location") {
    showProductSelector.value = true;
  } else {
    showStocksSelector.value = true;
  }
};

const tableData = ref([]);

const handleConfirmSelect = (products) => {
  if (formData.value.type == "product_location") {
    tableData.value = products;
  } else {
    let location_code = products.map((item) => item.code);
    getStocksLocations(location_code);
  }
};

const getStocksLocations = (val) => {
  settingApi
    .getStocksLocations({
      keywords: val.join(","),
      search_type: "location_code",
      search_mode: "exact",
    })
    .then((res) => {
      if (res.success) {
        tableData.value = res.data.items;
      }
    });
};

const handleTypeChange = (val) => {
  if (tableData.value.length) {
    $q.dialog({
      title: "提示",
      message: "更换盘点类型，将会清空已添加的商品，确定要更换吗？",
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
    })
      .onOk(() => {
        tableData.value = [];
      })
      .onCancel(() => {
        formData.value.type =
          val == "location_only" ? "product_location" : "location_only";
      });
  }
};

const handleSave = async (type) => {
  if (!formData.value.type) {
    $q.notify({
      type: "warning",
      message: "请选择盘点类型",
    });
    return;
  }

  if (tableData.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "请选择商品",
    });
    return;
  }
  let items = tableData.value.map((item) => {
    return {
      sku: item.sku || item.product_spec_sku,
      location_code: item.warehouse_location_code,
    };
  });
  let params = {
    type: formData.value.type,
    is_zero_counting: formData.value.is_zero_counting,
    remark: formData.value.remark,
    items: items,
  };
  let res = {};
  if (id) {
    res = await inventoryApi.updateCountOrder(id, params);
  } else {
    res = await inventoryApi.createCountOrder(params);
  }
  if (res.success) {
    if (type == "save") {
      router.back();
    } else {
      startCount(res.data.id);
    }
  }
};

const startCount = (id) => {
  inventoryApi.startCount(id).then((res) => {
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
onMounted(() => {
  if (id) {
    getCountOrderDetail();
  }
});
</script>

<style lang="scss" scoped>
.create-count-page {
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
</style>

