<template>
  <div class="">
    <!-- 筛选条件区域 -->
    <div class="search-bar">
      <div class="row q-col-gutter-md">
        <!-- 包裹类型选择 -->
        <div class="col-12">
          <div class="row items-center">
            <div class="text-subtitle2 q-mr-md">{{ trans("包裹类型") }}</div>
            <q-checkbox
              v-model="packageTypes.allTypes"
              @update:model-value="checkAll"
              :label="trans('全部')"
            />
            <q-checkbox
              @update:model-value="(value) => otherBox(value, 'singleUnit')"
              v-model="packageTypes.singleUnit"
              :label="trans('单品单数')"
            />
            <q-checkbox
              @update:model-value="(value) => otherBox(value, 'multiProducts')"
              v-model="packageTypes.multiProducts"
              :label="trans('单品多数')"
            />
            <q-checkbox
              v-model="packageTypes.multiSku"
              @update:model-value="(value) => otherBox(value, 'multiSku')"
              :label="trans('多品混包')"
            />
          </div>
        </div>

        <!-- 筛选条件第一行 -->
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.customer_ids"
            :options="customerOptions"
            multiple
            option-label="label"
            option-value="value"
            @update:model-value="handleRefresh"
            map-options
            emit-value
            clearable
            :label="trans('客户')"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.platforms"
            :multiple="true"
            :options="platformOptions"
            @update:model-value="handleRefresh"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            :label="trans('全部平台')"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.sources"
            :multiple="true"
            :options="orderSourceOptions"
            option-label="label"
            option-value="value"
            map-options
            @update:model-value="handleRefresh"
            emit-value
            clearable
            :label="trans('全部订单来源')"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.product_tag_ids"
            :multiple="true"
            :options="productMarkOptions"
            option-label="label"
            option-value="value"
            @update:model-value="handleRefresh"
            map-options
            emit-value
            clearable
            :label="trans('商品标记')"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.category_ids"
            :options="productCategoryOptions"
            option-label="label"
            option-value="value"
            @update:model-value="handleRefresh"
            map-options
            :multiple="true"
            emit-value
            clearable
            :label="trans('商品分类')"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="filterOptions.warehouse_area_ids"
            :options="regionOptions"
            option-label="label"
            option-value="value"
            @update:model-value="handleRefresh"
            map-options
            emit-value
            :multiple="true"
            clearable
            :label="trans('货区')"
            class="select-width"
          />
        </div>

        <div class="col-auto relative-box">
          <q-input
            outlined
            dense
            v-model="skuMap.labels"
            :label="trans('SKU*数量')"
            class="select-width"
          >
            <template v-slot:append>
              <q-icon name="search" @click="showSkuDialog" />
            </template>
          </q-input>

          <div class="absolute-top-right" @click="showSkuDialog"></div>
        </div>

        <!-- 筛选条件第二行 -->
        <div class="col-auto">
          <DatePickerNew
            v-model:date_type="filterOptions.date_type"
            v-model:start_date="filterOptions.start_date"
            v-model:end_date="filterOptions.end_date"
            :dateList="timeOptions"
          ></DatePickerNew>
        </div>

        <KeywordSearch
          v-model:search_type="filterOptions.search_type"
          v-model:search_value="filterOptions.keywords"
          v-model:search_mode="filterOptions.search_mode"
          :searchTypeList="productSkuOptions"
          :searchModeList="searchModeOptions"
        ></KeywordSearch>
        <div class="col-auto">
          <q-btn
            outline
            color="primary"
            :label="trans('重置')"
            class="filter-btn"
            @click="resetFilters"
          />
        </div>

        <div class="col-auto">
          <q-btn
            color="primary"
            :label="trans('查询')"
            class="filter-btn"
            @click="initList"
          />
        </div>
      </div>
    </div>

    <div class="main-table">
      <!-- 物流区域 -->
      <div class="text-subtitle1 q-mb-md">物流</div>

      <div class="row">
        <div class="col-10 col-md-6">
          <q-tree
            :nodes="logisticsNodes"
            node-key="id"
            tick-strategy="leaf"
            v-model:ticked="selectedLogistics"
          />
        </div>

        <div class="col-14 col-md-5">
          <div class="row q-col-gutter-md">
            <div class="col-4 text-center">
              <div class="text-subtitle2">{{ trans("包裹数量") }}</div>
              <div class="text-h4 text-primary">
                {{ searchResult.total_package_count }}
              </div>
            </div>
            <div class="col-4 text-center">
              <div class="text-subtitle2">{{ trans("商品种类") }}</div>
              <div class="text-h4 text-primary">
                {{ searchResult.total_sku_count }}
              </div>
            </div>
            <div class="col-4 text-center">
              <div class="text-subtitle2">{{ trans("商品数量") }}</div>
              <div class="text-h4 text-primary">
                {{ searchResult.total_item_count }}
              </div>
            </div>
          </div>

          <div class="q-col-gutter-md setting">
            <div class="col-md-6">
              <div class="row items-center">
                <div class="col-2 text-subtitle2">
                  {{ trans("分类规则") }} <span class="text-red">*</span>
                </div>
                <div class="col-8 flex">
                  <q-select
                    outlined
                    dense
                    v-model="settings.wave_rule"
                    :options="sortRuleOptions"
                    option-label="label"
                    option-value="value"
                    map-options
                    emit-value
                    @update:model-value="ruleChange"
                    :label="trans('分类规则')"
                    class="full-width"
                  >
                  </q-select>
                </div>
                <div class="col-2">
                  <q-btn flat round icon="help_outline">
                    <q-tooltip anchor="top middle" self="center middle">
                      {{
                        trans(
                          "按系统规则分波即根据包裹类型分为单品波次和多品混包波次；按包裹汇总分波即为筛选的包裹合到一起分波，不按照包裹类型区分"
                        )
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="row items-center gap-20px">
                <div class="col-2 text-subtitle2">
                  {{ trans("包裹排序") }} <span class="text-red">*</span>
                </div>
                <div class="col-8">
                  <q-select
                    outlined
                    dense
                    v-model="settings.package_order"
                    :options="packageOrderOptions"
                    option-label="label"
                    option-value="value"
                    map-options
                    emit-value
                    :label="trans('排序')"
                    class="full-width"
                  />
                </div>
              </div>
            </div>

            <div class="col-md-6" v-if="settings.showOtherRules">
              <div class="row items-center gap-20px">
                <div class="col-2 text-subtitle2">
                  {{ trans("包裹数量上限") }} <span class="text-red">*</span>
                </div>
                <div class="col-8">
                  <q-input
                    outlined
                    :rules="[(val) => val > 0]"
                    dense
                    v-model="settings.package_limit"
                    :label="trans('请输入')"
                  >
                  </q-input>
                </div>
              </div>
            </div>

            <div
              class="col-md-6"
              style="padding-top: 0 !important"
              v-if="settings.showOtherRules"
            >
              <div class="row items-center gap-20px">
                <div class="col-2 text-subtitle2"></div>
                <div class="col-8">
                  <q-checkbox
                    v-model="settings.package_limit_not_enough"
                    :label="trans('数量不足上线的包裹生成尾波')"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mt-md">
            <div class="col-12">
              <q-btn
                color="primary"
                icon="done"
                :label="trans('生成')"
                @click="generateWave"
              />
              <!-- <div class="q-mt-sm text-grey-7">前往设置波次规则 ></div> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <SkuDialog
      ref="skuDialogRef"
      @skuConfirm="handleSkuCountConfirm"
    ></SkuDialog>
    <GenerateWave
      ref="generateWaveRef"
      @handleRefresh="initList"
    ></GenerateWave>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import customerApi from "@/api/customer";
import productApi from "@/api/product";
import categoryApi from "@/api/categories";
import settingApi from "@/api/setting.js";
import SkuDialog from "./components/SkuDialog.vue";
import waveApi from "@/api/wave.js";
import GenerateWave from "./components/GenerateDialog.vue";
import { getTodayDate, getThirtyDaysAgoDate } from "@/utils/common.js";
import DatePickerNew from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import trans from "@/i18n";

import { useQuasar } from "quasar";
const q = useQuasar();

// 筛选选项
const filterOptions = reactive({
  customer_ids: [],
  platforms: [],
  sources: [],
  product_tag_ids: [],
  category_ids: [],
  warehouse_area_ids: [],
  start_date: getThirtyDaysAgoDate(),
  end_date: getTodayDate(),
  search_type: "product_spec_sku",
  keywords: "",
  search_mode: "exact",
  date_type: "created_at",
});

const packageTypes = reactive({
  allTypes: true,
  singleUnit: true,
  multiProducts: true,
  multiSku: true,
});

const skuMap = reactive({
  labels: "",
  list: [],
});

const searchResult = reactive({
  total_package_count: 0,
  total_sku_count: 0,
  total_item_count: 0,
});

const skuDialogRef = ref(null);
const generateWaveRef = ref(null);

// 设置选项
const settings = reactive({
  wave_rule: "system_rule",
  package_order: "created_at_sort",
  package_limit: 1,
  package_limit_not_enough: false,
  showOtherRules: false,
});

// 物流节点
const logisticsNodes = ref([
  {
    id: 1,
    label: "物流项目",
    children: [
      {
        id: 2,
        label: "Jesse美国空运专线",
        tickable: true,
      },
    ],
  },
]);

const selectedLogistics = ref([2]);

// 重置筛选条件
const resetFilters = () => {
  let params = {
    customer_ids: [],
    platforms: [],
    sources: [],
    product_tag_ids: [],
    category_ids: [],
    warehouse_area_ids: [],
    createTime: "",
    start_date: "",
    end_date: "",
    search_type: "",
    keywords: "",
    search_mode: "",
    date_type: "created_at",
  };

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(filterOptions, key)) {
      filterOptions[key] = params[key];
    }
  }

  skuMap.labels = "";
  skuMap.list = [];

  for (const key in packageTypes) {
    packageTypes[key] = true;
  }

  filterOptions.search_type = "product_spec_sku";
  filterOptions.keywords = "";
  filterOptions.search_mode = "exact";

  filterOptions.date_type = "created_at";
  filterOptions.start_date = getThirtyDaysAgoDate();
  filterOptions.end_date = getTodayDate();
};

// 下拉选项
const customerOptions = ref([]);
const platformOptions = ref([
  {
    label: "customer",
    value: "customer",
  },
  {
    label: "dsfulfill",
    value: "dsfulfill",
  },

  {
    label: "other",
    value: "other",
  },
]);
const orderSourceOptions = ref([
  {
    label: trans("ERP推送"),
    value: "erp_push",
  },
  {
    label: trans("OMS创建"),
    value: "oms_create",
  },
  {
    label: trans("平台推送"),
    value: "platform_push",
  },
]);
const productMarkOptions = ref([]);
const productCategoryOptions = ref([
  {
    label: trans("商品分类"),
    value: "product_category",
  },
]);
const regionOptions = ref([]);
const timeOptions = ref([
  {
    label: trans("生成时间"),
    value: "created_at",
  },
]);
const productSkuOptions = ref([
  { label: trans("SKU 类型"), value: "product_spec_sku" },
  { label: trans("产品名称"), value: "product_name" },
  { label: trans("系统订单号"), value: "system_order_number" },
  { label: trans("ERP单号"), value: "order_number" },
]);
const templateOptions = ref([
  {
    label: trans("筛选模板"),
    value: "template",
  },
]);
const sortRuleOptions = ref([
  {
    label: trans("系统规则"),
    value: "system_rule",
  },
  {
    label: trans("包裹汇总规则"),
    value: "package_group_rule",
  },
]);
const packageOrderOptions = ref([
  {
    label: trans("按创建时间顺序排序"),
    value: "created_at_sort",
  },
  {
    label: trans("按SKU顺序排序"),
    value: "sku_sort",
  },
  {
    label: trans("按货架位拣货优先级排序"),
    value: "location_sort",
  },
  {
    label: trans("按商品数量从大到小排序"),
    value: "quantity_sort",
  },
  {
    label: trans("按货区编码顺序排序"),
    value: "area_sort",
  },
]);

const searchModeOptions = ref([
  {
    label: trans("精确搜索"),
    value: "exact",
  },
  {
    label: trans("模糊搜索"),
    value: "fuzzy",
  },
  {
    label: trans("前缀"),
    value: "prefix",
  },
]);

onMounted(() => {
  getCustomerList();
  getTagList();
  getCategoryList();
  getWarehouseAreas();
  initList();
});

const getCustomerList = async () => {
  const { data } = await customerApi.getCustomerList();
  if (data?.items) {
    customerOptions.value = data.items.map((row) => {
      return {
        label: row.name,
        value: row.id,
      };
    });
  }
};

const getTagList = async () => {
  try {
    const res = await productApi.getTagList({ page: 1, page_size: 999 });
    productMarkOptions.value = res.data.map((row) => {
      return {
        label: row.name,
        value: row.id,
      };
    });
  } catch (error) {
    q.notify({
      type: "negative",
      message: error.message,
    });
  }
};

const getCategoryList = async () => {
  const { data } = await categoryApi.getCategories();
  if (data.length) {
    productCategoryOptions.value = data.map((row) => {
      return {
        label: row.name,
        value: row.id,
      };
    });
  }
};

const getWarehouseAreas = async () => {
  const { data } = await settingApi.getGoodsAreaList({ page: 1 });
  console.log("getWarehouseAreas", data);
  regionOptions.value = data.items.map((row) => {
    return {
      label: row.code,
      value: row.code,
    };
  });
};

// const getSkuList = async () => {
//   const { data } = await productApi.getSkuList({
//     page: 1,
//     page_size: 999,
//   });
//   console.log("getSkuList", data);
//   productSkuOptions.value = data.items.map((row) => {
//     return {
//       label: row.sku,
//       value: row.sku,
//     };
//   });
// };

const getParams = () => {
  let params = {
    ...filterOptions,
    package_order: "created_at_sort",
    ...settings,
    package_types: [],
    category_ids: filterOptions.category_ids,
    product_tag_ids: filterOptions.product_tag_ids || [],
    category_ids: filterOptions.category_ids || [],
    sources: filterOptions.sources || [],
    platforms: filterOptions.platforms || [],
    customer_ids: filterOptions.customer_ids || [],
    warehouse_area_ids: filterOptions.warehouse_area_ids || [],
  };

  // 包裹类型映射 为true则push到筛选数组里面
  let packageTypeMap = {
    singleUnit: "single_item",
    multiProducts: "multi_items",
    multiSku: "mixed_items",
  };

  // 遍历包裹类型映射 为true则push到筛选数组里面
  for (const key in packageTypeMap) {
    if (packageTypes[key]) {
      params.package_types.push(packageTypeMap[key]);
    }
  }

  if (skuMap.list?.length) {
    params.tags_sku_qty = skuMap.list.map((row) => {
      return row.tags_sku_qty;
    });
  }
  return params;
};

const initList = async () => {
  const params = getParams();
  if (!params.start_date) {
    q.notify({
      color: "red",
      message: trans("请选择开始日期"),
    });
    return;
  }
  if (!params.end_date) {
    q.notify({
      color: "red",
      message: trans("请选择结束日期"),
    });
    return;
  }
  const { data } = await waveApi.previewWaveAndCount(params);
  searchResult.total_package_count = data.total_package_count;
  searchResult.total_sku_count = data.total_sku_count;
  searchResult.total_item_count = data.total_item_count;
};

const checkAll = (value) => {
  for (const key in packageTypes) {
    if (value) {
      packageTypes[key] = true;
    } else {
      packageTypes[key] = false;
    }
  }
  handleRefresh();
};

const otherBox = (value, key) => {
  console.log("otherBox", value, key);
  if (!value) {
    packageTypes.allTypes = false;
    handleRefresh();
    return;
  }

  let bool = false;
  for (const key in packageTypes) {
    if (packageTypes[key]) {
      bool = true;
    } else {
      bool = false;
    }
  }
  packageTypes.allTypes = bool;
  handleRefresh();
};

const handleSkuCountConfirm = (skus) => {
  skuMap.labels = skus
    .map((row) => {
      return row.tags_sku_qty;
    })
    .join(",");
  skuMap.list = [...skus];
  handleRefresh();
};

const showSkuDialog = () => {
  skuDialogRef.value.show = true;
};

const generateWave = () => {
  const params = getParams();
  generateWaveRef.value.handleSearch(params);
};

const ruleChange = (value) => {
  if (value == "package_group_rule") {
    settings.showOtherRules = true;
  } else {
    settings.showOtherRules = false;
    settings.package_limit = 1;
    settings.package_limit_not_enough = false;
  }
};

const handleRefresh = () => {
  initList();
};
</script>

<style lang="scss" scoped>
.text-red {
  color: red;
}

.select-width {
  width: 200px;
}

.date-input {
  width: 150px;
}

.setting {
  margin-top: 10px;
}
.help {
  margin-left: 10px;
  cursor: pointer;
}
.relative-box {
  position: relative;
  .absolute-top-right {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
}
</style>

