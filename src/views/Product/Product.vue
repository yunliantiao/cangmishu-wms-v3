<template>
  <div class="product">
    <div class="search-bar">
      <!-- 搜索过滤区域 -->
      <div class="row q-col-gutter-sm">
        <!-- 时间筛选+类型 -->
        <DatePickerNew
          v-model:date_type="filters.date_type"
          v-model:start_date="filters.start_date"
          v-model:end_date="filters.end_date"
          :dateList="dateTypeOptions"
        ></DatePickerNew>

        <!-- 关键词搜索模块 -->
        <KeywordSearch
          v-model:search_mode="filters.search_mode"
          v-model:search_type="filters.search_type"
          v-model:search_value="filters.keywords"
          :searchTypeList="searchTypeOptions"
        ></KeywordSearch>

        <div>
          <q-btn
            color="primary"
            class="h-40"
            :label="trans('搜索')"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="main-table">
      <div class="tabs-section q-mb-md">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          align="left"
        >
          <q-tab name="sku" label="SKU" />
          <q-tab name="spu" label="SPU" />
          <!-- <q-tab name="combo" label="组合SKU" /> -->
        </q-tabs>
      </div>
      <!-- 产品表格sku -->
      <ProductSku
        v-if="tab === 'sku'"
        ref="productSkuRef"
        :rows="productData"
        :total-count="productData.length"
        :loading="loading"
        @copy="handleCopyProduct"
        @refresh="fetchData"
      ></ProductSku>

      <!-- 产品表格spu -->
      <ProductSpu
        v-if="tab === 'spu'"
        ref="productSpuRef"
        :rows="productData"
        :loading="loading"
        @refresh="fetchData"
      />

      <!-- 产品表格组合SKU -->
      <!-- <CombinationSku v-if="tab === 'combo'" :rows="productData" /> -->

      <!-- 分页 -->
      <div class="q-mt-md">
        <Pagination
          :total-count="pagination.total"
          v-model:page="pagination.page"
          :max-page="pagination.lastPage"
          v-model:rows-per-page="pagination.rowsPerPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import ProductSku from "./components/ProductSku.vue";
import ProductSpu from "./components/ProductSpu.vue";
import Pagination from "@/components/Pagination.vue";
import DatePickerNew from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import productApi from "@/api/product";
import trans from "@/i18n";

// import { useI18n } from "vue-i18n";

// const { t } = useI18n();

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// 加载状态
const loading = ref(false);

// 筛选条件
const filters = ref({
  date_type: "created_at",
  start_date: "",
  end_date: "",
  search_type: "sku",
  keywords: "",
  search_mode: "fuzzy",
});

// 日期类型选项
const dateTypeOptions = [
  { label: trans("创建时间"), value: "created_at" },
  { label: trans("更新时间"), value: "updated_at" },
];

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

// 选项卡
const tab = ref("sku");

// 表格数据
const productData = ref([]);

// 分页
const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  total: 0,
  lastPage: 1,
});

// 根据当前标签获取对应数据
const fetchData = async () => {
  // 防止重复请求
  if (loading.value) return;

  // 清空数据
  productData.value = [];
  loading.value = true;

  try {
    // 确保页码和每页数量始终是有效的数字
    const page = parseInt(pagination.value.page) || 1;
    const pageSize = parseInt(pagination.value.rowsPerPage) || 50;

    const params = {
      page,
      page_size: pageSize,
      date_type: filters.value.date_type,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      search_type: filters.value.search_type,
      keywords: filters.value.keywords,
      search_mode: filters.value.search_mode,
    };

    let response;

    // 根据当前标签页选择不同的API
    if (tab.value === "sku") {
      response = await productApi.getSkuList(params);
    } else if (tab.value === "spu") {
      response = await productApi.getProductList(params);
    }
    if (response && response.success) {
      productData.value = response.data.items || [];

      // 处理分页信息
      const meta = response.data.meta || {};
      pagination.value.total = meta.total || 0;
      pagination.value.lastPage = meta.last_page || 1;
      pagination.value.page = meta.current_page || 1;
      pagination.value.rowsPerPage = meta.per_page || 50;
    }
  } catch (error) {
    console.error("请求出错:", error);
  } finally {
    loading.value = false;
  }
};

// 监听标签页变化
watch(tab, () => {
  pagination.value.page = 1; // 切换标签页时重置为第一页
  fetchData();
});

// 组件挂载时执行一次数据获取
onMounted(() => {
  if (route.query.type) {
    tab.value = route.query.type;
  }
  fetchData();
});

// 处理编辑产品
const handleEditProduct = (product) => {
  router.push(`/product/addproduct?id=${product.id}`);
};

// 处理复制产品
const handleCopyProduct = (product) => {
  $q.notify({
    message: trans(`复制产品: {code}`, { code: product.sku }),
    color: "info",
  });
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.value.page = parseInt(page) || 1;
  pagination.value.rowsPerPage = parseInt(rowsPerPage) || 50;
  fetchData();
};

// 处理搜索按钮点击
const handleSearch = () => {
  pagination.value.page = 1; // 重置为第一页
  fetchData();
};

// 添加 ProductSku 组件的引用
const productSkuRef = ref(null);

// 添加 ProductSpu 组件的引用
const productSpuRef = ref(null);
</script>

<style lang="scss" scoped>
.product {
  // 2.tab切换
  .tabs-section {
    display: flex;
    justify-content: flex-start;
    border-bottom: 1px solid #e6e6e6;
    .q-tabs {
      &__content {
        height: 40px;
      }
      &__tab {
        font-weight: 500;
        letter-spacing: 0.5px;
      }
      .q-tab {
        padding: 0;
        &:not(:last-child) {
          margin-right: 50px;
        }
      }
    }
  }
}
</style>
