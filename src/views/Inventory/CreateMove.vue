<template>
  <div class="move-create-page">
    <div class="row items-center justify-between q-pa-md bg-white q-mb-md">
      <div class="row items-center">
        <q-btn flat dense icon="arrow_back" @click="$router.back()" />
        <div class="text-h6 q-ml-sm">{{ trans("创建移货单") }}</div>
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
          class="btn"
          :label="trans('保存')"
          :loading="loading"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="form-box">
      <!-- 基本信息 -->
      <div class="bg-white rounded-borders">
        <div class="form-title">{{ trans("基本信息") }}</div>
        <div class="row q-col-gutter-x-lg">
          <div class="col-4">
            <q-select
              outlined
              v-model="formData.moveType"
              :options="moveTypeOptions"
              :label="trans('库存类型')"
              :rules="[(val) => !!val || trans('请选择库存类型')]"
              emit-value
              class="filter-item global-mt"
              dense
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
      </div>

      <!-- 移货信息 -->
      <div class="bg-white rounded-borders global-mt">
        <div class="row items-center justify-between">
          <!-- <div class="text-subtitle1">{{ trans("移货信息") }}</div> -->
          <q-btn
            color="primary"
            class="filter-btn"
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
          <template v-slot:body="props">
            <!-- 主行 - 只渲染第一组数据 -->
            <q-tr :props="props">
              <q-td
                key="info"
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
              <q-td key="moveOut" :props="props" class="move-location-cell">
                <div class="row q-gutter-sm items-center">
                  <div class="col">
                    <q-select
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
                      clearable
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
                          quantity: 0,
                          to: [{ location_code: '', quantity: 0 }],
                        })
                      "
                    />
                    <q-btn
                      flat
                      dense
                      v-if="props.row.moveOutLocation.length > 1"
                      round
                      size="sm"
                      icon="close"
                      color="grey-6"
                      class="shadow-1"
                      @click="
                        props.row.moveOutLocation.splice(locationIndex, 1)
                      "
                    />
                  </div>
                </div>
              </q-td>
              <q-td key="stock" :props="props" class="text-center">
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
              <q-td key="moveQuantity" :props="props">
                <q-input
                  outlined
                  dense
                  v-model.number="props.row.moveOutLocation[0].quantity"
                  type="number"
                  :placeholder="trans('请输入')"
                />
              </q-td>
              <q-td key="moveIn" :props="props" class="move-location-cell">
                <div
                  v-for="(to, toIndex) in props.row.moveOutLocation[0].to"
                  :key="toIndex"
                  class="row q-gutter-sm items-center q-mb-sm"
                >
                  <div class="col">
                    <q-select
                      outlined
                      dense
                      v-model="to.location_code"
                      :options="shelfLocations"
                      option-label="code"
                      option-value="code"
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
                      @click="
                        props.row.moveOutLocation[0].to.push({
                          location_code: '',
                          quantity: 0,
                        })
                      "
                    />
                    <q-btn
                      v-if="props.row.moveOutLocation[0].to.length > 1"
                      flat
                      dense
                      round
                      size="sm"
                      icon="close"
                      color="grey-6"
                      class="q-ml-xs shadow-1"
                      @click="
                        props.row.moveOutLocation[0].to.splice(toIndex, 1)
                      "
                    />
                  </div>
                </div>
              </q-td>
              <q-td key="moveInQuantity" :props="props">
                <div
                  class="q-mb-sm"
                  v-for="(to, toIndex) in props.row.moveOutLocation[0].to"
                  :key="toIndex"
                >
                  <q-input
                    outlined
                    dense
                    v-model.number="to.quantity"
                    type="number"
                    :placeholder="trans('请输入')"
                  />
                </div>
              </q-td>
              <q-td
                key="actions"
                :props="props"
                :rowspan="getTotalRowspan(props.row)"
                style="vertical-align: middle"
              >
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  color="grey-6"
                  icon="delete"
                  class="shadow-1"
                  @click="handleRemoveItem(props.row)"
                />
              </q-td>
            </q-tr>

            <!-- 额外的移出货架位行 -->
            <template
              v-for="(location, locationIndex) in props.row.moveOutLocation"
              :key="locationIndex"
            >
              <q-tr v-if="locationIndex > 0">
                <q-td key="moveOut" class="move-location-cell">
                  <div class="row q-gutter-sm items-center">
                    <div class="col">
                      <q-select
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
                        clearable
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
                            quantity: 0,
                            to: [{ location_code: '', quantity: 0 }],
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
                        class="shadow-1"
                        @click="
                          props.row.moveOutLocation.splice(locationIndex, 1)
                        "
                      />
                    </div>
                  </div>
                </q-td>
                <q-td key="stock" class="text-center">
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
                <q-td key="moveQuantity">
                  <q-input
                    outlined
                    dense
                    v-model.number="location.quantity"
                    type="number"
                    :placeholder="trans('请输入')"
                  />
                </q-td>
                <q-td key="moveIn" class="move-location-cell">
                  <div
                    v-for="(to, toIndex) in location.to"
                    :key="toIndex"
                    class="row q-gutter-sm items-center q-mb-sm"
                  >
                    <div class="col">
                      <q-select
                        outlined
                        dense
                        v-model="to.location_code"
                        :options="shelfLocations"
                        option-label="code"
                        option-value="code"
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
                        @click="
                          location.to.push({ location_code: '', quantity: 0 })
                        "
                      />
                      <q-btn
                        v-if="location.to.length > 1"
                        flat
                        dense
                        round
                        size="sm"
                        icon="close"
                        color="grey-6"
                        class="q-ml-xs shadow-1"
                        @click="location.to.splice(toIndex, 1)"
                      />
                    </div>
                  </div>
                </q-td>
                <q-td key="moveInQuantity">
                  <div
                    class="q-mb-sm"
                    v-for="(to, toIndex) in location.to"
                    :key="toIndex"
                  >
                    <q-input
                      outlined
                      dense
                      v-model.number="to.quantity"
                      type="number"
                      :placeholder="trans('请输入')"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>
          </template>
          <!-- 无数据时的显示 -->
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
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import productApi from "@/api/product";
import settingApi from "@/api/setting";
import inventoryApi from "@/api/inventory";
import Pagination from "@/components/Pagination.vue";
import ProductSelector from "./components/ProductSelector.vue";
import trans from "@/i18n";

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const showProductSelector = ref(false);
const searchKeywords = ref("");
const selectedProducts = ref([]);

// 表单数据
const formData = reactive({
  moveType: "normal",
  remark: "",
  items: [], // 初始化为空数组
});

// 选项数据

const moveTypeOptions = [{ label: trans("商品移货"), value: "normal" }];

// 表格列配置
const columns = [
  {
    name: "info",
    label: trans("商品信息"),
    field: (row) => row,
    style: "width: 200px",
    align: "left",
  },
  {
    name: "moveOut",
    label: trans("移出货架位"),
    field: "moveOutLocation",
    style: "width: 200px",
    align: "left",
  },
  {
    name: "stock",
    label: trans("可用库存"),
    field: "availableStock",
    style: "width: 100px",
    align: "center",
  },
  {
    name: "moveQuantity",
    label: trans("移货数量"),
    field: "moveQuantity",
    style: "width: 150px",
    align: "left",
  },
  {
    name: "moveIn",
    label: trans("移入货架位"),
    field: "moveInLocation",
    style: "width: 200px",
    align: "left",
  },
  {
    name: "moveInQuantity",
    label: trans("移入数量"),
    field: "moveInQuantity",
    style: "width: 150px",
    align: "left",
  },
  {
    name: "actions",
    label: trans("操作"),
    field: "actions",
    align: "center",
    style: "width: 80px",
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
  if (!formData.moveType) {
    $q.notify({
      type: "warning",
      message: trans("请填写必填项"),
    });
    return;
  }

  if (formData.items.length === 0) {
    $q.notify({
      type: "warning",
      message: trans("请选择要移货的商品"),
    });
    return;
  }

  // 验证移货数量和移入数量
  for (const item of formData.items) {
    // 验证是否选择了移出货架位
    const hasEmptyMoveOut = item.moveOutLocation.some(
      (location) => !location.location_code
    );
    if (hasEmptyMoveOut) {
      $q.notify({
        type: "negative",
        message: trans(`商品 {sku} 请选择移出货架位`, { sku: item.sku }),
      });
      return;
    }

    for (const location of item.moveOutLocation) {
      // 验证移货数量是否填写
      if (!location.quantity || location.quantity <= 0) {
        $q.notify({
          type: "negative",
          message: trans(
            `商品 {sku} 在货架位 {location_code} 的移货数量必须大于0`,
            {
              sku: item.sku,
              location_code: location.location_code,
            }
          ),
        });
        return;
      }

      // 获取当前货架位的可用库存
      const availableStock =
        item.moveOutShelfSkuVos.find(
          (loc) => loc.warehouse_location_code === location.location_code
        )?.available_qty || 0;

      // 验证移货数量不能大于可用库存
      if (location.quantity > availableStock) {
        $q.notify({
          type: "negative",
          message: trans(
            `商品 {sku} 在货架位 {location_code} 的移货数量不能大于可用库存 {availableStock}`,
            {
              sku: item.sku,
              location_code: location.location_code,
              availableStock: availableStock,
            }
          ),
        });
        return;
      }

      // 验证是否选择了移入货架位
      const hasEmptyMoveIn = location.to.some((to) => !to.location_code);
      if (hasEmptyMoveIn) {
        $q.notify({
          type: "negative",
          message: trans(
            `商品 {sku} 在货架位 {location_code} 请选择移入货架位`,
            {
              sku: item.sku,
              location_code: location.location_code,
            }
          ),
        });
        return;
      }

      // 验证移入数量是否填写
      const hasEmptyQuantity = location.to.some(
        (to) => !to.quantity || to.quantity <= 0
      );
      if (hasEmptyQuantity) {
        $q.notify({
          type: "negative",
          message: trans(
            `商品 {sku} 在货架位 {location_code} 的移入数量必须大于0`,
            {
              sku: item.sku,
              location_code: location.location_code,
            }
          ),
        });
        return;
      }

      // 计算该移出货架位对应的所有移入数量之和
      const totalMoveInQuantity = location.to.reduce(
        (sum, to) => sum + (to.quantity || 0),
        0
      );

      // 验证移入数量之和必须等于移货数量
      if (totalMoveInQuantity !== location.quantity) {
        $q.notify({
          type: "negative",
          message: trans(
            `商品 {sku} 在货架位 {location_code} 的移入数量之和必须等于移货数量`,
            {
              sku: item.sku,
              location_code: location.location_code,
            }
          ),
        });
        return;
      }
    }
  }

  let items = formData.items.map((item) => {
    return {
      sku: item.sku,
      transfer: item.moveOutLocation.map((location) => {
        return {
          from: [location],
        };
      }),
    };
  });
  loading.value = true;
  try {
    // TODO: 调用保存API
    await inventoryApi.createMoveOrder({
      type: formData.moveType,
      remark: formData.remark,
      items: items,
    });
    router.back();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || trans("保存失败"),
    });
  } finally {
    loading.value = false;
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
                quantity: 0,
                to: [
                  {
                    location_code: "",
                    quantity: 0,
                  },
                ],
              },
            ],
          });
        });
        formData.items = arr;
      }
    });
};

// 处理移除商品
const handleRemoveItem = (item) => {
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
</script>

<style lang="scss" scoped>
.move-create-page {
  :deep(.q-table) {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      height: 54px;
      padding: 16px;
    }

    td {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      padding: 8px 16px;
      border: 1px solid #ebeef5;
      vertical-align: middle;

      .q-btn {
        opacity: 0.8;
        transition: all 0.3s;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }
    }

    .move-location-cell {
      padding: 8px 16px;
      background-color: #fff;
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
        }
      }
    }
  }
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

.right-btn {
  display: flex;
  gap: 20px;
  .btn {
    min-width: 130px;
    height: 44px;
    border-radius: 9px 9px 9px 9px;
  }
}

.form-box {
  padding: 20px;
  margin: 20px auto;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  .form-title {
    font-weight: 600;
    font-size: 20px;
    color: #1f1f1f;
  }
}
</style>