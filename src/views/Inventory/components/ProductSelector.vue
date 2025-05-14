<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="width: 90vw; max-width: 1400px">
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h6">{{ trans("选择商品") }}</div>
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
              :placeholder="trans('批量搜索用逗号隔开')"
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
              :label="trans('搜索')"
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
            <div class="row q-col-gutter-sm" v-if="!$store.state.btnLoading">
              <div
                v-for="item in productList"
                :key="item.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card flat bordered class="product-card">
                  <q-card-section class="q-pa-sm">
                    <div class="row items-start">
                      <div class="col-auto">
                        <q-checkbox v-model="selectedProducts" :val="item" />
                      </div>
                      <div class="col product-info">
                        <div class="sku text-weight-medium">{{ item.sku }}</div>
                        <div class="name text-caption">{{ item.name }}</div>
                        <div class="product-name text-caption">
                          {{ item.product.name }}
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
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
          <div class="selected-wrapper">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="row justify-between items-center q-mb-sm">
                  <div>{{ trans("已选") }}:{{ selectedProducts.length }}</div>
                  <div>
                    <q-btn
                      flat
                      dense
                      class="q-ml-sm text-primary"
                      :label="trans('清空')"
                      @click="clearSelected"
                    />
                  </div>
                </div>
                <div class="selected-list">
                  <div
                    v-for="item in selectedProducts"
                    :key="item.id"
                    class="selected-item q-py-xs text-caption"
                  >
                    {{ item.sku }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
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
import { ref, reactive, watch } from "vue";
import productApi from "@/api/product";
import Pagination from "@/components/Pagination.vue";
import trans from "@/i18n";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

// 搜索类型选项
const searchTypeOptions = [
  { label: trans("名字搜索"), value: "name" },
  { label: trans("SKU搜索"), value: "sku" },
];

// 搜索模式选项
const searchModeOptions = [
  { label: trans("精确搜索"), value: "exact" },
  { label: trans("模糊搜索"), value: "fuzzy" },
  { label: trans("前缀搜索"), value: "prefix" },
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

// 获取sku列表
const getSkuList = () => {
  productApi.getSkuList(skuParams).then((res) => {
    if (res.success) {
      productList.value = res.data.items;
      skuParams.total = res.data.meta.total;
    }
  });
};

// 清空选择
const clearSelected = () => {
  selectedProducts.value = [];
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
  display: flex;
  flex-direction: row;
  gap: 15px;
  min-height: 320px;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  .view_list {
    border: 1px solid #ebeef5;
    padding: 16px;
    border-radius: 6px;
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .selected-wrapper {
    width: 200px;
    min-width: 200px;
    @media (max-width: 768px) {
      width: 100%;
      min-width: 100%;
    }
  }
}

.product-card {
  height: 100%;

  .q-card__section {
    height: 100%;
  }
}

.product-info {
  min-width: 0;
  padding-left: 8px;

  > div {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .sku {
    font-size: 14px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .name,
  .product-name {
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.selected-list {
  max-height: 400px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-height: 200px;
  }

  .selected-item {
    border: 1px solid #f0f0f0;
    padding: 8px;
    margin-bottom: 8px;
    background-color: rgba(0, 100, 250, 0.08);
    border-radius: 4px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    &:last-child {
      margin-bottom: 0;
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