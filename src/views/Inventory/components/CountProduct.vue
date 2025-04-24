<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="width: 90vw; max-width: 1400px">
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h6">选择商品</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="scroll">
        <div class="row items-center q-col-gutter-sm q-mb-md flex-wrap">
          <div class="col-12 col-sm-auto">
            <q-select
              outlined
              dense
              v-model="skuParams.search_type"
              :options="searchTypeOptions"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              class="search-type-select"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-input
              outlined
              dense
              v-model="skuParams.keywords"
              placeholder="批量搜索用逗号隔开"
              class="keywords-input"
              style="min-width: 200px"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-select
              outlined
              dense
              v-model="skuParams.search_mode"
              :options="searchModeOptions"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              class="search-mode-select"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              color="primary"
              label="搜索"
              @click="getSkuList"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-grow">
            <div>
              <Pagination
                :total-count="skuParams.total"
                v-model:page="skuParams.page"
                v-model:rows-per-page="skuParams.per_page"
                @page-change="getSkuList"
              />
            </div>
          </div>
        </div>

        <div class="modal_content">
          <div class="view_list">
            <div v-if="!$store.state.btnLoading">
              <q-table
                :rows="productList"
                :columns="[
                  {
                    name: 'select',
                    label: ' ',
                    align: 'center',
                    style: 'width: 50px',
                  },
                  {
                    name: 'sku',
                    label: '商品SKU',
                    align: 'left',
                    field: 'sku',
                  },
                  {
                    name: 'name',
                    label: '商品名称',
                    align: 'left',
                    field: 'name',
                  },
                  {
                    name: 'customer',
                    label: '客户',
                    align: 'left',
                    field: (row) => 'test',
                  },
                  {
                    name: 'location',
                    label: '货架位',
                    align: 'left',
                    field: (row) => 'B-01-01',
                  },
                ]"
                row-key="id"
                flat
                bordered
                :pagination="{ rowsPerPage: 0 }"
                hide-bottom
                virtual-scroll
                :loading="$store.state.btnLoading"
                style="height: 400px"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width>
                      <q-checkbox v-model="allSelected" />
                    </q-th>
                    <q-th
                      v-for="col in props.cols.filter(
                        (col) => col.name !== 'select'
                      )"
                      :key="col.name"
                      :props="props"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-checkbox v-model="selectedProducts" :val="props.row" />
                    </q-td>
                    <q-td key="sku" :props="props">
                      {{ props.row.product_spec_sku }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.product_name}}
                    </q-td>
                    <q-td key="customer" :props="props">
                      <div>{{ props.row.customer.name }}</div>
                    </q-td>
                    <q-td key="location" :props="props">
                      {{ props.row.warehouse_location_code }}
                      <div>
                        [{{
                          $store.state.areaTypeOptions.find(
                            (item) =>
                              item.value === props.row.warehouse_area_type
                          )?.label || "-"
                        }}]
                      </div>
                    </q-td>
                  </q-tr>
                </template>
                <template v-slot:no-data>
                  <div class="full-width row flex-center q-pa-md text-grey-7">
                    暂无数据
                  </div>
                </template>
              </q-table>
            </div>
            <div v-if="$store.state.btnLoading">
              <div class="full-width row flex-center q-my-lg">
                <q-linear-progress
                  v-model="progress"
                  color="primary"
                  class="q-mt-md"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey" v-close-popup />
        <q-btn unelevated label="确认" color="primary" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed , watch } from "vue";
import productApi from "@/api/product";
import Pagination from "@/components/Pagination.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

// 搜索类型选项
const searchTypeOptions = [
  { label: "名字搜索", value: "name" },
  { label: "SKU搜索", value: "sku" },
];

// 搜索模式选项
const searchModeOptions = [
  { label: "精确搜索", value: "exact" },
  { label: "模糊搜索", value: "fuzzy" },
  { label: "前缀搜索", value: "prefix" },
];

// 商品列表数据
const productList = ref([]);
const selectedProducts = ref([]);
const progress = ref(0);

const skuParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  search_mode: "fuzzy",
  search_type: "sku",
  keywords: "",
});

// 添加计算属性
const allSelected = computed({
  get: () => {
    return (
      productList.value.length > 0 &&
      selectedProducts.value.length === productList.value.length
    );
  },
  set: (val) => {
    selectedProducts.value = val ? [...productList.value] : [];
  },
});

// 获取sku列表
const getSkuList = () => {
  productApi.getStocksLocations(skuParams).then((res) => {
    if (res.success) {
      productList.value = res.data.items;
      skuParams.total = res.data.meta.total;
    }
  });
};

// 确认选择
const handleConfirm = () => {
  emit("confirm", selectedProducts.value);
  emit("update:modelValue", false);
};

watch(
  () => props.modelValue,
  (newProducts) => {
    if (newProducts) {
      getSkuList();
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.modal_content {
  min-height: 320px;

  .view_list {
    .q-table {
      height: 300px;

      thead tr {
        height: 40px;
        background-color: #f5f7fa !important;

        th {
          padding: 8px 12px;
          font-weight: 500;
          color: #606266;
          border-bottom: 1px solid #ebeef5;
          border-right: 1px solid #ebeef5;
          white-space: nowrap;
          background-color: #f5f7fa !important;

          &:first-child {
            padding: 8px;
          }
        }
      }

      tbody {
        tr:first-child td {
          border-top: none;
        }
      }

      tbody td {
        padding: 8px 12px;
        border-bottom: 1px solid #ebeef5;
        border-right: 1px solid #ebeef5;
        color: #606266;
        background: white;

        &:first-child {
          padding: 8px;
        }

        .text-grey-7 {
          font-size: 12px;
          margin-top: 4px;
          color: #909399;
        }
      }

      tr:hover {
        td {
          background: #f5f7fa;
        }
      }
    }
  }
}

.search-type-select,
.search-mode-select {
  min-width: 120px;
  @media (max-width: 768px) {
    width: 100%;
  }
}

.keywords-input {
  @media (max-width: 768px) {
    width: 100%;
  }
}
</style> 