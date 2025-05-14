<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="width: 90vw; max-width: 1400px">
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h6">{{ trans("选择货架位") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="scroll">
        <div class="row items-center q-col-gutter-sm q-mb-md flex-wrap">
          <div class="col-12 col-sm-auto">
            <q-select
              outlined
              dense
              v-model="params.area_type"
              :options="areaTypeOptions"
              :label="trans('货区类型')"
              option-label="label"
              option-value="value"
              emit-value
              clearable
              map-options
              class="search-type-select"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-select
              outlined
              dense
              v-model="params.search_type"
              :options="locationFilterOptions"
              clearable
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :label="trans('货架位')"
              class="search-type-select"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-input
              outlined
              dense
              v-model="params.keywords"
              :placeholder="trans('批量搜索用逗号隔开')"
              class="keywords-input"
              style="min-width: 200px"
            />
          </div>
          <div class="col-auto col-sm-auto">
            <q-select
              outlined
              dense
              v-model="params.search_mode"
              :options="searchTypeOptions"
              clearable
              map-options
              emit-value
              :label="trans('搜索模式')"
              class="select-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              color="primary"
              :label="trans('搜索')"
              @click="getShelfLocationList"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-grow">
            <div>
              <Pagination
                :total-count="params.total"
                v-model:page="params.page"
                v-model:rows-per-page="params.per_page"
                @page-change="getShelfLocationList"
              />
            </div>
          </div>
        </div>

        <div class="modal_content">
          <div class="view_list">
            <div v-if="!$store.state.btnLoading">
              <q-table
                :rows="locationList"
                :columns="[
                  {
                    name: 'select',
                    label: ' ',
                    align: 'center',
                    style: 'width: 50px',
                  },
                  {
                    name: 'code',
                    label: trans('货架位编码'),
                    align: 'left',
                    field: 'code',
                  },
                  {
                    name: 'warehouse_area_type',
                    label: trans('货区类型'),
                    align: 'left',
                    field: 'warehouse_area_type',
                  },
                  {
                    name: 'warehouse_area',
                    label: trans('货区编号'),
                    align: 'left',
                    field: 'warehouse_area',
                  },
                ]"
                row-key="id"
                flat
                bordered
                :pagination="{ rowsPerPage: 0 }"
                hide-bottom
                virtual-scroll
                style="height: 400px"
                :loading="$store.state.btnLoading"
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
                    <q-td key="code" :props="props">
                      {{ props.row.code }}
                    </q-td>
                    <q-td key="warehouse_area_type" :props="props">
                      {{
                        areaTypeOptions.find(
                          (item) => item.value === props.row.warehouse_area_type
                        )?.label || "--"
                      }}
                    </q-td>
                    <q-td key="warehouse_area" :props="props">
                      <div>{{ props.row.warehouse_area.code }}</div>
                    </q-td>
                  </q-tr>
                </template>
                <template v-slot:no-data>
                  <div class="full-width row flex-center q-pa-md text-grey-7">
                    {{ trans("暂无数据") }}
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
        <q-btn flat :label="trans('取消')" color="grey" v-close-popup />
        <q-btn
          unelevated
          :label="trans('确认')"
          color="primary"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import settingApi from "@/api/setting";
import Pagination from "@/components/Pagination.vue";
import trans from "@/i18n";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const areaTypeOptions = [
  { label: trans("拣货区"), value: "picking" },
  { label: trans("备货区"), value: "staging" },
  { label: trans("不良品区"), value: "defective" },
  { label: trans("转运区"), value: "transit" },
]; //货区类型

const locationFilterOptions = [
  {
    label: trans("货位编号"),
    value: "code",
  },
  {
    label: trans("SKU 编号"),
    value: "sku",
  },
  {
    label: trans("货架位规格"),
    value: "shelf_spec",
  },
];

const emit = defineEmits(["update:modelValue", "confirm"]);

// 搜索类型选项
const searchTypeOptions = [
  {
    label: trans("精确搜索"),
    value: "exact",
  },
  {
    label: trans("模糊搜索"),
    value: "like",
  },
  {
    label: trans("前缀搜索"),
    value: "prefix",
  },
];

// 商品列表数据
const locationList = ref([]);
const selectedProducts = ref([]);
const progress = ref(0);

const params = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  status: "",
  area_type: "",
  search_type: "",
  keywords: "",
  search_mode: "exact",
});

// 添加计算属性
const allSelected = computed({
  get: () => {
    return (
      locationList.value.length > 0 &&
      selectedProducts.value.length === locationList.value.length
    );
  },
  set: (val) => {
    selectedProducts.value = val ? [...locationList.value] : [];
  },
});

// 获取货架位列表
const getShelfLocationList = () => {
  settingApi.getShelfLocationList(params).then((res) => {
    if (res.success) {
      locationList.value = res.data.items;
      params.total = res.data.meta.total;
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
      getShelfLocationList();
    }
  },
  { immediate: true, deep: true }
);

// 初始化
// getShelfLocationList();
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