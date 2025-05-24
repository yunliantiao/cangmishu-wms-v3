<template>
  <div class="move-create-page">
    <div class="page-header">
      <div class="left-back">
        <!-- <q-btn flat dense icon="arrow_back" @click="$router.back()" /> -->
        <img src="@/assets/images/back.png" />
        <div class="text-h6 q-ml-sm">{{ trans("创建调整单") }}</div>
      </div>
      <div class="right-btn">
        <q-btn
          outline
          :label="trans('取消')"
          color="primary"
          class="btn"
          @click="$router.back()"
        />
        <q-btn
          unelevated
          color="primary"
          :label="trans('确认')"
          :loading="loading"
          class="btn"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="form-box">
      <!-- 基本信息 -->
      <div class="form-title">{{ trans("基本信息") }}</div>
      <q-form ref="formRef" class="q-gutter-md" @submit="handleSave">
        <div class="row">
          <div class="col-4">
            <q-select
              outlined
              dense
              v-model="formData.type"
              :options="moveTypeOptions"
              :label="trans('调整类型')"
              class="filter-item global-mt"
              :rules="rules.type"
              emit-value
              map-options
            >
              <template v-slot:append>
                <span class="text-red">*</span>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row" style="margin-top: -2px">
          <div class="col-8">
            <q-input
              outlined
              v-model="formData.remark"
              :label="trans('备注')"
              type="textarea"
              rows="4"
            />
          </div>
        </div>
      </q-form>

      <div class="bg-white rounded-borders global-mt">
        <div class="row items-center justify-between">
          <q-btn
            flat
            color="primary"
            :label="trans('选择商品')"
            @click="showProductSelector = true"
          />
        </div>

        <q-table
          flat
          :rows="formData.items"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          separator="horizontal"
          hide-pagination
          :loading="$store.state.btnLoading"
        >
          <template v-slot:header-cell-quantity="props">
            <q-th :props="props" class="text-center">
              <div class="row items-center justify-center">
                <div>{{ trans("调整数量") }}</div>
                <div class="batch-btn" @click="showBatchQuantityDialog">
                  ({{ trans("批量") }})
                </div>
              </div>
            </q-th>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                key="product"
                :props="props"
                :rowspan="getTotalRowspan(props.row)"
                class="product-info-cell"
              >
                <div class="product-info">
                  <div class="text-weight-medium">{{ props.row.sku }}</div>
                  <div class="text-grey-8">{{ props.row.product.name }}</div>
                  <div class="text-grey-8">{{ props.row.name }}</div>
                </div>
              </q-td>
              <q-td
                key="moveOutLocation"
                :props="props"
                class="move-location-cell"
              >
                <div class="row q-gutter-sm items-center">
                  <div>
                    <q-select
                      style="min-width: 250px"
                      outlined
                      dense
                      v-model="props.row.moveOutLocation[0].location_code"
                      :options="
                        props.row.moveOutShelfSkuVos.filter(
                          (loc) =>
                            !props.row.moveOutLocation.some(
                              (selected, selectedIndex) =>
                                selectedIndex !== 0 &&
                                selected.location_code ===
                                  loc.warehouse_location_code
                            )
                        )
                      "
                      option-label="warehouse_location_code"
                      option-value="warehouse_location_code"
                      emit-value
                      map-options
                      :placeholder="trans('请选择')"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      color="primary"
                      class="table-icon"
                      v-if="
                        props.row.moveOutShelfSkuVos.length > 1 &&
                        props.row.moveOutShelfSkuVos.length !=
                          props.row.moveOutLocation.length
                      "
                      @click="
                        props.row.moveOutLocation.push({
                          location_code: '',
                          quantity: null,
                          quantity_type: 'sub',
                        })
                      "
                    >
                      <img src="@/assets/images/add-1.png" />
                    </q-btn>
                    <q-btn
                      v-if="props.row.moveOutLocation.length > 1"
                      flat
                      dense
                      round
                      size="sm"
                      icon="close"
                      color="grey-6"
                      class="shadow-1 q-ml-sm"
                      @click="props.row.moveOutLocation.splice(0, 1)"
                    />
                  </div>
                </div>
              </q-td>
              <q-td key="availableStock" :props="props" class="text-center">
                <div class="stock-number">
                  {{
                    props.row.moveOutLocation[0].location_code
                      ? props.row.moveOutShelfSkuVos.find(
                          (loc) =>
                            loc.warehouse_location_code ===
                            props.row.moveOutLocation[0].location_code
                        )?.available_qty || 0
                      : 0
                  }}
                </div>
              </q-td>
              <q-td key="quantity" :props="props">
                <div class="row items-center justify-center q-gutter-x-sm">
                  <!-- <q-select
                    outlined
                    dense
                    v-model="props.row.moveOutLocation[0].quantity_type"
                    :options="[
                      { label: trans('增加'), value: 'add' },
                      { label: trans('减少'), value: 'sub' },
                    ]"
                    map-options
                    emit-value
                    style="width: 100px"
                  />
                  <q-input
                    outlined
                    dense
                    v-model.number="props.row.moveOutLocation[0].quantity"
                    type="number"
                    style="width: 100px"
                    :placeholder="trans('请输入')"
                  /> -->

                  <KeywordSearch
                    :searchTypeList="[
                      { label: trans('增加'), value: 'add' },
                      { label: trans('减少'), value: 'sub' },
                    ]"
                    :showSearchMode="false"
                    :placeholder="trans('请输入')"
                    v-model:search_value="props.row.moveOutLocation[0].quantity"
                    v-model:search_type="
                      props.row.moveOutLocation[0].quantity_type
                    "
                  />
                </div>
              </q-td>
              <q-td
                key="actions"
                :props="props"
                :rowspan="getTotalRowspan(props.row)"
              >
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  class="table-icon"
                  @click="handleDeleteItem(props.row)"
                >
                  <img src="@/assets/images/del.png" />

                  <q-tooltip>
                    {{ trans("删除") }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>

            <!-- 额外的货架位行 -->
            <template
              v-for="(location, locationIndex) in props.row.moveOutLocation"
              :key="locationIndex"
            >
              <q-tr v-if="locationIndex > 0">
                <q-td key="moveOutLocation" class="move-location-cell">
                  <div class="row q-gutter-sm items-center">
                    <div>
                      <q-select
                        style="min-width: 250px"
                        outlined
                        dense
                        v-model="location.location_code"
                        :options="
                          props.row.moveOutShelfSkuVos.filter(
                            (loc) =>
                              !props.row.moveOutLocation.some(
                                (selected, selectedIndex) =>
                                  selectedIndex !== locationIndex &&
                                  selected.location_code ===
                                    loc.warehouse_location_code
                              )
                          )
                        "
                        option-label="warehouse_location_code"
                        option-value="warehouse_location_code"
                        emit-value
                        map-options
                        :placeholder="trans('请选择')"
                      />
                    </div>
                    <div class="col-auto">
                      <q-btn
                        flat
                        dense
                        round
                        size="sm"
                        icon="add"
                        color="primary"
                        class="shadow-1"
                        v-if="
                          props.row.moveOutShelfSkuVos.length > 1 &&
                          props.row.moveOutShelfSkuVos.length !=
                            props.row.moveOutLocation.length
                        "
                        @click="
                          props.row.moveOutLocation.push({
                            location_code: '',
                            quantity: null,
                            quantity_type: 'sub',
                          })
                        "
                      />
                      <q-btn
                        flat
                        dense
                        round
                        size="sm"
                        icon="close"
                        color="grey-6"
                        class="shadow-1 q-ml-sm"
                        @click="
                          props.row.moveOutLocation.splice(locationIndex, 1)
                        "
                      />
                    </div>
                  </div>
                </q-td>
                <q-td key="availableStock" class="text-center">
                  <div class="stock-number">
                    {{
                      location.location_code
                        ? props.row.moveOutShelfSkuVos.find(
                            (loc) =>
                              loc.warehouse_location_code ===
                              location.location_code
                          )?.available_qty || 0
                        : 0
                    }}
                  </div>
                </q-td>
                <q-td key="quantity">
                  <div class="row items-center justify-center q-gutter-x-sm">
                    <KeywordSearch
                      :searchTypeList="[
                        { label: trans('增加'), value: 'add' },
                        { label: trans('减少'), value: 'sub' },
                      ]"
                      :showSearchMode="false"
                      :placeholder="trans('请输入')"
                      v-model:search_value="location.quantity"
                      v-model:search_type="location.quantity_type"
                    />

                    <!-- <q-select
                      outlined
                      dense
                      v-model="location.quantity_type"
                      :options="[
                        { label: trans('增加'), value: 'add' },
                        { label: trans('减少'), value: 'sub' },
                      ]"
                      map-options
                      emit-value
                      style="width: 100px"
                    />
                    <q-input
                      outlined
                      dense
                      v-model.number="location.quantity"
                      type="number"
                      style="width: 100px"
                      :placeholder="trans('请输入')"
                    /> -->
                  </div>
                </q-td>
              </q-tr>
            </template>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-my-lg">
              <span class="text-grey">{{ trans("暂无数据") }}</span>
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- 选择商品弹窗 -->
    <ProductSelector
      v-model="showProductSelector"
      @confirm="handleConfirmSelect"
    />

    <!-- 批量调整数量弹窗 -->
    <q-dialog v-model="showBatchDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ trans("调整数量") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                outlined
                dense
                v-model="batchQuantityForm.type"
                :options="[
                  { label: trans('增加'), value: 'add' },
                  { label: trans('减少'), value: 'sub' },
                ]"
                map-options
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model.number="batchQuantityForm.quantity"
                type="number"
                :placeholder="trans('调整数量')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="trans('取消')" color="grey" v-close-popup />
          <q-btn
            flat
            :label="trans('确认')"
            color="primary"
            @click="handleBatchSetQuantity"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, unref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import productApi from "@/api/product";
import settingApi from "@/api/setting";
import inventoryApi from "@/api/inventory";
import Pagination from "@/components/Pagination.vue";
import ProductSelector from "./components/ProductSelector.vue";
import trans from "@/i18n";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const showProductSelector = ref(false);
const searchKeywords = ref("");
const selectedProducts = ref([]);

const formRef = ref(null);

// 表单数据
const formData = reactive({
  type: "good",
  remark: "",
  items: [],
});

const rules = {
  type: [(val) => !!val || trans("请选择调整类型")],
  items: [(val) => val.length > 0 || trans("请添加调整商品")],
};

const validateQuantity = (item) => {
  const location = item.moveOutLocation[0];
  if (!location.location_code) {
    return trans("请选择货架位");
  }
  if (!location.quantity) {
    return trans("请输入调整数量");
  }
  if (!location.quantity_type) {
    return trans("请选择调整类型");
  }
  const quantity = Number(location.quantity);
  if (isNaN(quantity) || quantity === 0) {
    return trans("调整数量必须是非零数字");
  }
  // 减少库存时需要验证可用库存
  if (location.quantity_type === "sub" && quantity > item.availableStock) {
    return trans("调整数量不能大于可用库存");
  }
  return "";
};

// 选项数据

const moveTypeOptions = [
  { label: trans("良品调整"), value: "good" },
  //   { label: "不良品调整", value: "bad" },
];

// 表格列配置
const columns = [
  {
    name: "product",
    label: trans("商品信息"),
    align: "left",
    field: (row) => row,
    style: "width: 300px",
  },
  {
    name: "moveOutLocation",
    label: trans("货架位"),
    align: "left",
    field: (row) => row.moveOutLocation,
  },
  {
    name: "availableStock",
    label: trans("可用库存"),
    align: "center",
    field: (row) => row.availableStock,
  },
  {
    name: "quantity",
    label: trans("调整数量"),
    align: "center",
  },
  {
    name: "actions",
    label: trans("操作"),
    align: "center",
  },
];

const productColumns = [
  {
    name: "select",
    label: trans("选择"),
    field: "select",
  },
  {
    name: "info",
    label: trans("商品信息"),
    field: (row) => row,
  },
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
// 商品列表数据
const productList = ref([]);
const skuParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  search_mode: "fuzzy",
  search_type: "sku",
  keywords: "",
});
//获取sku列表
const getSkuList = () => {
  productApi.getSkuList(skuParams).then((res) => {
    if (res.success) {
      productList.value = res.data.items;
      skuParams.total = res.data.meta.total;
    }
  });
};

const shelfLocations = ref([]);
// 获取货架位列表
const getShelfLocationList = () => {
  settingApi.getShelfLocationList().then((res) => {
    if (res.success) {
      shelfLocations.value = res.data.items;
    }
  });
};
getShelfLocationList();
getSkuList();

// 添加新的响应式变量
const selectAll = ref(false);
const searchParams = reactive({
  customer: null,
  type: "sku",
  keywords: "",
});

// 处理保存
const handleSave = async () => {
  try {
    // 验证表单
    formRef.value?.validate().then(async (success) => {
      if (success) {
        // 验证每个商品的调整数量
        const errors = [];
        formData.items.forEach((item, index) => {
          const error = validateQuantity(item);
          if (error) {
            errors.push(`第 ${index + 1} 行：${error}`);
          }
        });

        if (errors.length > 0) {
          $q.notify({
            type: "warning",
            message: errors.join("\n"),
          });
          return;
        }

        // 构建请求数据
        let items = formData.items.map((item) => {
          return {
            sku: item.sku,
            adjustment: item.moveOutLocation.map((location) => {
              return {
                location_code: location.location_code,
                quantity: location.quantity,
                type: location.quantity_type,
              };
            }),
          };
        });
        try {
          // 调用创建接口
          await inventoryApi.createAdjustOrder({
            type: formData.type,
            remark: formData.remark,
            items: items,
          });
          router.back();
        } catch (error) {
          $q.notify({
            type: "negative",
            message: error.message || trans("创建调整单失败"),
          });
        }
      }
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || trans("表单验证失败"),
    });
  }
};

// 处理确认选择商品
const handleConfirmSelect = (selected) => {
  if (selected.length === 0) {
    $q.notify({
      type: "warning",
      message: trans("请选择商品"),
    });
    return;
  }
  getSkuLocations(selected);
};

const getSkuLocations = (selected) => {
  let code = selected.map((item) => item.sku);
  inventoryApi
    .getSkuLocations({
      code: code.join(","),
    })
    .then((res) => {
      if (res.success) {
        let arr = [];
        selected.forEach((item) => {
          arr.push({
            ...item,
            moveOutShelfSkuVos: res.data[item.sku] || [],
            moveOutLocation: [
              {
                location_code: "",
                quantity: null,
                quantity_type: "sub", // 默认为减少
              },
            ],
          });
        });
        console.log(arr);

        formData.items = arr;
      } else {
        $q.notify({
          type: "warning",
          message: trans("获取商品货架位信息失败"),
        });
      }
    })
    .catch(() => {
      $q.notify({
        type: "negative",
        message: trans("获取商品货架位信息失败"),
      });
    });
};

// 处理移除商品
const handleDeleteItem = (item) => {
  const index = formData.items.findIndex((i) => i.id === item.id);
  if (index > -1) {
    formData.items.splice(index, 1);
  }
};

// 处理全选
const handleSelectAll = (val) => {
  if (val) {
    selectedProducts.value = [...productList.value];
  } else {
    selectedProducts.value = [];
  }
};

// 清空选择
const clearSelected = () => {
  selectedProducts.value = [];
  selectAll.value = false;
};

// 修改计算总行数的方法
const getTotalRowspan = (row) => {
  // 确保 moveOutLocation 存在且是数组
  if (!row.moveOutLocation || !Array.isArray(row.moveOutLocation)) {
    return 1;
  }
  // 计算所有移出货架位的数量
  return Math.max(row.moveOutLocation.length, 1);
};

// 批量调整数量相关
const showBatchDialog = ref(false);
const batchQuantityForm = reactive({
  type: "sub",
  quantity: null,
});

// 显示批量调整数量弹窗
const showBatchQuantityDialog = () => {
  showBatchDialog.value = true;
};

// 批量设置调整数量
const handleBatchSetQuantity = () => {
  if (!batchQuantityForm.quantity) {
    $q.notify({
      type: "warning",
      message: trans("请输入调整数量"),
    });
    return;
  }

  formData.items.forEach((item) => {
    item.moveOutLocation.forEach((location) => {
      location.quantity_type = batchQuantityForm.type;
      location.quantity = batchQuantityForm.quantity;
    });
  });

  showBatchDialog.value = false;

  // 重置表单
  batchQuantityForm.quantity = null;
  batchQuantityForm.type = "sub";
};
</script>

<style lang="scss" scoped>
.move-create-page {
  min-height: 100vh;
  background: #f4f5f8;
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 calc((100vw - 1400px) / 2);
    height: 80px;
    background: #ffffff;
    border-radius: 0px 0px 0px 0px;

    .left-back {
      font-weight: 600;
      font-size: 20px;
      color: #1f1f1f;
      gap: 6px;
      display: flex;
      align-items: center;
      img {
        width: 24px;
        height: 24px;
      }
    }
    .right-btn {
      display: flex;
      gap: 20px;
      .btn {
        width: 130px;
        height: 44px;
        border-radius: 9px 9px 9px 9px;
      }
    }
  }

  .form-box {
    padding: 20px;
    width: 1400px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    .form-title {
      font-weight: 600;
      font-size: 20px;
      color: #1f1f1f;
    }
  }
  :deep(.q-table) {
    border-radius: 4px;

    thead tr {
      height: 54px;
      th {
        font-weight: 500;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        padding: 16px;
      }
    }

    tbody {
      td {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.75);
        padding: 8px 16px;
        border: 1px solid #ebeef5;
        vertical-align: middle;
        background-color: #fff;

        .q-btn {
          opacity: 0.8;
          transition: all 0.3s;

          &:hover {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      }
    }

    .move-location-cell {
      padding: 8px 16px;
      background-color: #fff;

      .q-field {
        .q-field__control {
          height: 32px;
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

    .product-info-cell {
      height: 100%;

      .product-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        > div {
          line-height: 1.4;

          &:first-child {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
          }

          &:not(:first-child) {
            color: rgba(0, 0, 0, 0.65);
            font-size: 13px;
          }
        }
      }
    }
  }
}

.batch-btn {
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  color: #1f1f1f;
  margin-left: 10px;
  color: #5745c5;
}

.modal_content {
  display: flex;
  gap: 15px;
  min-height: 320px;

  .vit_warp {
    border: 1px solid #ebeef5;
    padding: 16px;
    border-radius: 6px;
  }

  .view_list {
    border: 1px solid #ebeef5;
    padding: 16px;
    border-radius: 6px;
    width: 80%;
  }
}

.selected-list {
  max-height: 400px;
  overflow-y: auto;

  .selected-item {
    border: 1px solid #f0f0f0;
    padding: 0 8px;
    min-width: 125px;
    max-width: 182px;
    margin-bottom: 8px;
    background-color: rgba(0, 100, 250, 0.08);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>