<template>
  <div class="shelve-page">
    <!-- 扫描区域 -->
    <div v-if="!orderData">
      <ScanTop
        :title="trans('扫描上架')"
        ref="scanTopRef"
        :placeholder="trans('请扫描入库单号、ERP单号、运单号或箱唛')"
        v-model:scanValue="scanCode"
        @confirm="handleScan"
      ></ScanTop>
    </div>

    <!-- 订单信息区域 -->
    <template v-if="orderData">
      <!-- 顶部导航 -->
      <div class="scan-header">
        <div class="head-box">
          <span class="header-title">
            {{ trans("扫描上架") }}
          </span>
          <span class="head-title-2">{{ trans("ERP单号/入库单号") }} </span>

          <span class="head-number">
            {{ inboundInfo }}
          </span>
        </div>
        <div class="btn-box">
          <q-btn
            color="primary"
            @click="resetOrder"
            :label="trans('重置')"
            class="btn"
            outline
          />
          <q-btn
            color="primary"
            :label="trans('打印上架单')"
            :loading="$store.state.btnLoading"
            @click="handlePrint"
            class="btn"
            :disable="!isSuccess"
          />
          <q-btn
            color="primary"
            :label="trans('确认上架')"
            unelevated
            class="btn"
            :loading="$store.state.btnLoading"
            @click="handleConfirm"
            :disable="isSuccess"
          />
        </div>
      </div>

      <!-- 订单详情 -->
      <div class="order-info">
        <div class="info-item">
          <div class="info-label">{{ trans("客户") }}</div>
          <div class="info-value">{{ orderData.customer.name }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">{{ trans("运单号") }}</div>
          <div class="info-value">
            {{ orderData.tracking_number || "--" }}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">{{ trans("备注") }}</div>
          <div class="info-value">{{ orderData.remark || "--" }}</div>
        </div>
      </div>

      <!-- 上架模式选择 -->

      <!--  -->
      <div
        class="products-section"
        v-if="orderData.arrival_method != 'express_parcel'"
      >
        <div class="row">
          <q-radio
            v-model="arrivalMethod"
            val="express_parcel"
            size="xs"
            :label="trans('按商品上架')"
            class="q-mr-lg"
            @click="handleShelveMode"
            :disable="ShelfMode"
          />
          <q-radio
            @click="handleShelveMode"
            v-model="arrivalMethod"
            val="box"
            size="xs"
            :label="trans('按箱上架')"
            :disable="ShelfMode"
          />
        </div>
      </div>

      <!-- 商品上架模式 -->
      <div v-if="arrivalMethod === 'express_parcel'" class="product-shelve">
        <div class="">
          <div class="row justify-between q-mb-md">
            <!-- <div class="row items-center">
              <span class="q-mr-sm"
                >{{ trans("选择") }} {{ selectedProducts.length }}
              </span>
            </div> -->
            <div class="row items-center">
              <!-- <q-checkbox
                v-model="showShelfedItems"
                label="显示已上架商品"
                dense
                class="q-mr-md"
              />
              <q-select
                outlined
                dense
                v-model="productFilter"
                :options="productFilterOptions"
                style="width: 150px"
                class="q-mr-md"
              />
              <q-input
                outlined
                dense
                v-model="searchQuery"
                placeholder="请输入"
                class="search-input"
                style="width: 200px"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input> -->
            </div>
          </div>

          <!-- 商品表格 -->
          <q-table
            :rows="filteredProducts"
            :columns="productColumns"
            row-key="id"
            :pagination="pagination"
            v-model:selected="selectedProducts"
            selection="multiple"
            separator="horizontal"
            flat
            :loading="loading"
            :no-data-label="trans('暂无数据')"
            binary-state-sort
            hide-bottom
          >
            <!-- 商品信息列 -->
            <template v-slot:body-cell-product="props">
              <q-td :props="props">
                <div class="row items-start">
                  <img
                    :src="
                      props.row.product_spec_image ||
                      'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                    "
                    width="50"
                    height="50"
                    class="product-img q-mr-md"
                  />
                  <div>
                    <div class="product-name">
                      {{ props.row.product_spec_sku }}
                    </div>
                    <div class="product-spec q-mt-xs">
                      {{ props.row.product_name }}
                    </div>
                    <div class="product-sku q-mt-xs">
                      {{ props.row.product_spec_name }}
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- 上架货架位列 -->
            <template v-slot:header-cell-shelfLocation="props">
              <q-th :props="props" class="text-center">
                <div class="flex-center">
                  {{ trans("上架货架位") }}*
                  {{ trans("上架数量") }}
                  <q-btn
                    flat
                    dense
                    outline
                    color="primary"
                    class="all-btn"
                    :label="trans('(全部)')"
                    :disable="isSuccess"
                    @click="applyBatchProductQuantity"
                  />
                </div>
              </q-th>
            </template>

            <template v-slot:body-cell-shelfLocation="props">
              <q-td :props="props" class="text-center">
                <div class="shelf-location-cell">
                  <div class="huogui-box">
                    <div
                      v-for="(location, index) in props.row.shelfLocations"
                      :key="index"
                      class="shelf-location-item q-mb-xs"
                    >
                      <div class="select-input">
                        <q-select
                          dense
                          v-model="location.location"
                          :options="shelfOptions"
                          option-value="code"
                          option-label="code"
                          :disable="isSuccess"
                          use-input
                          hide-selected
                          borderless
                          fill-input
                          map-options
                          emit-value
                          new-value-mode="add"
                          class="huojia-select"
                          :placeholder="trans('请选择')"
                        />
                        <q-input
                          borderless
                          dense
                          v-model.number="location.quantity"
                          type="number"
                          class="huojia-input"
                          :disable="isSuccess"
                          @update:model-value="
                            handleShelfQtyUpdate(
                              props.row,
                              location.maxQuantity,
                              index
                            )
                          "
                          style="width: 70px"
                          :placeholder="trans('数量')"
                        />
                      </div>
                      <q-btn
                        :disabled="props.row.shelfLocations.length <= 1"
                        flat
                        round
                        dense
                        class="delete-btn"
                        icon="close"
                        size="xs"
                        padding="none"
                        v-if="!isSuccess"
                        @click="removeShelfLocation(props.row, index)"
                      />
                    </div>
                  </div>
                </div>

                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="add"
                  :label="trans('添加货架位')"
                  v-if="!isSuccess"
                  class="q-mt-xs"
                  @click="addShelfLocation(props.row)"
                  padding="xs"
                />
              </q-td>
            </template>

            <!-- 上架数量列 -->
            <!-- <template v-slot:header-cell-shelfQty="props">
              <q-th :props="props" class="text-center">
                <div class="flex-center">
                  <div>{{ trans("上架数量") }}</div>
                  <q-btn
                    flat
                    dense
                    outline
                    color="primary"
                    class="all-btn"
                    :label="trans('(全部)')"
                    :disable="isSuccess"
                    @click="applyBatchProductQuantity"
                  />
                </div>
              </q-th>
            </template> -->

            <!-- <template v-slot:body-cell-shelfQty="props">
              <q-td :props="props" class="text-center">
                <div
                  v-for="(location, index) in props.row.shelfLocations"
                  :key="index"
                  class="shelf-qty-item q-mb-sm"
                >
                  <q-input
                    outlined
                    dense
                    v-model.number="location.quantity"
                    type="number"
                    :disable="isSuccess"
                    @update:model-value="
                      handleShelfQtyUpdate(
                        props.row,
                        location.maxQuantity,
                        index
                      )
                    "
                    class="quantity-input"
                    style="width: 70px"
                    :placeholder="trans('数量')"
                  />
                </div>
              </q-td>
            </template> -->
          </q-table>
        </div>
      </div>

      <!-- 按箱上架模式 -->
      <div v-if="arrivalMethod === 'box'" class="box-shelve">
        <div class="q-pa-md">
          <div class="row justify-between q-mb-md">
            <!-- <div class="row items-center">
              <q-checkbox
                v-model="showShelfedBoxes"
                label="显示已上架箱子"
                dense
                class="q-mr-md"
              />
              <q-select
                outlined
                dense
                v-model="boxFilter"
                :options="boxFilterOptions"
                style="width: 150px"
                class="q-mr-md"
              />
              <q-input
                outlined
                dense
                v-model="boxSearchQuery"
                placeholder="请输入"
                class="search-input"
                style="width: 200px"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div> -->
            <div class="row items-center">
              <!-- <span class="q-mr-sm"
                >{{ trans("选择") }} {{ selectedProducts.length }}
              </span> -->
            </div>
          </div>

          <!-- 箱子表格 -->
          <q-table
            :rows="filteredBoxes"
            :columns="boxColumns"
            row-key="box_number"
            :pagination="boxPagination"
            flat
            separator="horizontal"
            :loading="loading"
            :no-data-label="trans('暂无数据')"
            binary-state-sort
            hide-bottom
            v-model:selected="selectedProducts"
            selection="multiple"
          >
            <!-- 箱子尺寸列 -->

            <template v-slot:body-cell-dimensions="props">
              <q-td :props="props">
                {{ props.row.size_length || "--" }} ×
                {{ props.row.size_width || "--" }} ×
                {{ props.row.size_height || "--" }}
              </q-td>
            </template>

            <!-- 箱子商品SKU列 -->
            <template v-slot:body-cell-items="props">
              <q-td :props="props">
                <div
                  v-for="(item, index) in props.row.items"
                  :key="index"
                  class="q-mb-xs"
                >
                  {{ item.product_spec_sku }} × {{ item.quantity }}
                </div>
              </q-td>
            </template>

            <!-- 上架货架位列 -->
            <template v-slot:body-cell-shelfLocation="props">
              <q-td :props="props" class="shelf-location-item q-mb-sm">
                <q-select
                  outlined
                  dense
                  v-model="props.row.shelf_location"
                  :options="shelfOptions"
                  option-value="code"
                  option-label="code"
                  :disable="isSuccess"
                  use-input
                  hide-selected
                  fill-input
                  map-options
                  emit-value
                  style="width: 150px"
                  :placeholder="trans('请选择')"
                />
              </q-td>
            </template>

            <!-- 上架数量列 -->
            <!-- <template v-slot:header-cell-shelfQuantity="props">
              <q-th :props="props" class="text-center">
                <div>上架数量</div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  class="all-btn"
                  label="全部"
                  size="sm"
                  @click="applyBatchBoxQuantity"
                />
              </q-th>
            </template> -->
            <!-- 
            <template v-slot:body-cell-shelfQuantity="props">
              <q-td :props="props" class="text-center">
                <q-input
                  outlined
                  dense
                  v-model.number="props.row.shelf_quantity"
                  type="number"
                  class="quantity-input"
                  style="width: 70px"
                  :placeholder="trans('数量') "
                />
              </q-td>
            </template> -->
          </q-table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useQuasar } from "quasar";
import inboundApi from "@/api/inbound";
import settingApi from "@/api/setting";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";
import Message from "@/utils/message";
import { playBeep } from "@/utils/voice.js";

const $q = useQuasar();
const store = useStore();
const route = useRoute();
const router = useRouter();
// 基础状态
const scanCode = ref("");
const arrivalMethod = ref(""); //=上架方式
const scanInput = ref(null);
const orderData = ref(null);
const loading = ref(false);
const showAddShelfDialog = ref(false);

// 商品状态
const products = ref([]);
const selectedProducts = ref([]);
const searchQuery = ref("");
const productFilter = ref("all");
const productFilterOptions = [
  { label: trans("全部"), value: "all" },
  { label: trans("商品SKU"), value: "sku" },
];
const showShelfedItems = ref(false);

// 箱子状态
const boxes = ref([]);
const boxSearchQuery = ref("");
const boxFilter = ref("all");

const showShelfedBoxes = ref(false);
const scanTopRef = ref(null);

// 货架位
const shelfOptions = ref([]);

// 分页
const pagination = ref({
  rowsPerPage: 50,
  sortBy: "id",
  descending: false,
  page: 1,
});

const boxPagination = ref({
  rowsPerPage: 50,
  sortBy: "box_number",
  descending: false,
  page: 1,
});

// 计算属性
const inboundInfo = computed(() => {
  if (!orderData.value) return "";
  return `${orderData.value.system_order_number} / ${orderData.value.custom_order_number}`;
});

// 表格列定义
const productColumns = computed(() => {
  return [
    {
      name: "product",
      required: true,
      label: trans("商品"),
      align: "left",
      field: (row) => row,
    },
    {
      name: "requestQty",
      align: "center",
      label: trans("申报数量"),
      field: "quantity",
    },
    {
      name: "receivedQty",
      align: "center",
      label: trans("收货数量"),
      field: "received_quantity",
    },
    {
      name: "shelvedQty",
      align: "center",
      label: trans("已上架"),
      field: "shelf_quantity",
    },
    {
      name: "shelfLocation",
      align: "center",
      label: trans("上架货架位"),
      field: (row) => row.shelfLocations,
    },
    // {
    //   name: "shelfQty",
    //   align: "center",
    //   label: trans("上架数量"),
    //   field: (row) => {
    //     return row.shelfLocations.reduce(
    //       (sum, loc) => sum + (loc.quantity || 0),
    //       0
    //     );
    //   },
    // },
  ];
});

const boxColumns = computed(() => {
  return [
    {
      name: "boxNumber",
      required: true,
      label: trans("箱号"),
      align: "left",
      field: "box_number",
    },
    {
      name: "dimensions",
      align: "center",
      label: trans("箱子尺寸"),
      field: (row) => row,
    },
    {
      name: "weight",
      align: "center",
      label: trans("箱子重量"),
      field: "weight",
      format: (val) => `${val || "--"} g`,
    },
    {
      name: "items",
      align: "center",
      label: trans("商品SKU"),
      field: (row) => row.items,
    },
    {
      name: "shelfLocation",
      align: "center",
      label: trans("上架货架位"),
      field: (row) => row.shelf_location,
    },
    //   {
    //     name: "shelfQuantity",
    //     align: "center",
    //     label: "上架数量",
    //     field: "shelf_quantity",
    //     sortable: false,
    //   },
  ];
});

// 计算属性
const orderInfo = computed(() => {
  if (!orderData.value) return "";
  return `${orderData.value.erp_number || ""} / ${
    orderData.value.inbound_number || ""
  }`;
});

const filteredProducts = computed(() => {
  if (!products.value) return [];
  let result = [...products.value];
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((p) => {
      if (productFilter.value === "sku") {
        return p.sku.toLowerCase().includes(query);
      } else {
        return (
          p.sku.toLowerCase().includes(query) ||
          p.product_name.toLowerCase().includes(query) ||
          p.spec_name.toLowerCase().includes(query)
        );
      }
    });
  }
  return result;
});

const handleShelfQtyUpdate = (row, maxQuantity, index) => {
  // 获取当前输入的数量
  const inputQty = row.shelfLocations[index].quantity;

  // 如果输入为空或负数，设置为0
  if (!inputQty || inputQty < 0) {
    row.shelfLocations[index].quantity = 0;
    return;
  }

  // 计算除了当前货架位外，其他货架位已经使用的数量
  const otherLocationsQty = row.shelfLocations.reduce((sum, loc, i) => {
    if (i !== index && loc.quantity) {
      return sum + loc.quantity;
    }
    return sum;
  }, 0);

  // 计算当前货架位可用的最大数量
  const availableQty =
    row.received_quantity - row.shelf_quantity - otherLocationsQty;

  // 如果输入的数量超过可用数量，限制为最大可用数量
  if (inputQty > availableQty) {
    row.shelfLocations[index].quantity = availableQty;
    $q.notify({
      type: "warning",
      message: trans("超出可上架数量，当前货架位最多可上架{count}个", {
        count: availableQty,
      }),
      position: "top",
    });
  }

  // 更新其他货架位的maxQuantity
  row.shelfLocations.forEach((loc, i) => {
    if (i !== index) {
      const remainingQty =
        row.received_quantity -
        row.shelf_quantity -
        row.shelfLocations.reduce((sum, l, j) => {
          if (j !== i && l.quantity) {
            return sum + l.quantity;
          }
          return sum;
        }, 0);
      loc.maxQuantity = remainingQty;
    }
  });
};

const filteredBoxes = computed(() => {
  if (!boxes.value) return [];

  let result = [...boxes.value];
  // 过滤已上架箱子
  if (!showShelfedBoxes.value) {
    result = result.filter((b) => !b.is_shelved);
  }
  // 搜索过滤
  if (boxSearchQuery.value) {
    const query = boxSearchQuery.value.toLowerCase();
    result = result.filter((b) => {
      if (boxFilter.value === "boxNumber") {
        return b.box_number.toLowerCase().includes(query);
      } else {
        return (
          b.box_number.toLowerCase().includes(query) ||
          b.items.some((item) => item.sku.toLowerCase().includes(query))
        );
      }
    });
  }
  return result;
});

const ShelfMode = ref(false);
const handleScan = async () => {
  if (!scanCode.value) return;
  inboundApi
    .scanShelfNumber({
      number: scanCode.value,
    })
    .then((res) => {
      if (res.success) {
        arrivalMethod.value = res.data.last_shelf_mode
          ? res.data.last_shelf_mode == "sku"
            ? "express_parcel"
            : "box"
          : res.data.arrival_method;

        if (res.data.last_shelf_mode) {
          ShelfMode.value = true;
        }
        orderData.value = res.data;
        let items = [];
        res.data.boxes.forEach((box) => {
          items.push(...box.items);
        });
        // 合并相同SKU的项目，汇总数量
        let mergedItems = mergeSameSkuItems(items);
        mergedItems.forEach((item) => {
          item.receivedQty = 0;
          item.shelfLocations = [
            {
              location: null,
              quantity: null,
              maxQuantity: item.received_quantity - item.shelf_quantity,
            },
          ];
        });
        boxes.value = res.data.boxes;
        products.value = mergedItems;
        playBeep(true);
      }
    })
    .catch(() => {
      playBeep(false);
    });
};

// 合并相同SKU的商品，汇总数量
const mergeSameSkuItems = (items) => {
  const skuMap = new Map();

  // 遍历所有商品，按SKU分组
  items.forEach((item) => {
    const sku = item.product_spec_sku;
    if (!sku) return;

    if (!skuMap.has(sku)) {
      // 首次遇到该SKU，直接添加到Map
      skuMap.set(sku, { ...item });
    } else {
      // 已存在该SKU，累加数量
      const existingItem = skuMap.get(sku);
      existingItem.quantity =
        (parseInt(existingItem.quantity) || 0) + (parseInt(item.quantity) || 0);

      existingItem.received_quantity =
        (parseInt(existingItem.received_quantity) || 0) +
        (parseInt(item.received_quantity) || 0);

      existingItem.shelf_quantity =
        (parseInt(existingItem.shelf_quantity) || 0) +
        (parseInt(item.shelf_quantity) || 0);
    }
  });

  // 将Map转换回数组
  return Array.from(skuMap.values());
};

const resetOrder = () => {
  orderData.value = null;
  products.value = [];
  boxes.value = [];
  selectedProducts.value = [];
  scanCode.value = "";
  searchQuery.value = "";
  boxSearchQuery.value = "";
  isSuccess.value = false;
  ShelfMode.value = false;
};

const handlePrint = () => {
  inboundApi.inboundPrintShelf(batchId.value).then((res) => {
    if (res.success) {
      window.open(res.data.data);
    }
  });
};
const isSuccess = ref(false);
const batchId = ref("");
const handleConfirm = async () => {
  let parasm = {};
  if (arrivalMethod.value === "box") {
    let items = getProductsFromParcels();
    if (items.length === 0) {
      Message.notify(trans("请选择货架位列"));
      return;
    }
    parasm = await inboundApi.confirmShelfBoxes(orderData.value.id, {
      items: items,
    });
  } else {
    let items = formatProductShelfData();
    if (items.length === 0) {
      Message.notify(trans("请选择货架位列,并设置上架数量"));
      return;
    }
    parasm = await inboundApi.confirmShelfSkus(orderData.value.id, {
      items,
    });
  }
  if (parasm.success) {
    isSuccess.value = true;
    ShelfMode.value = true;
    batchId.value = parasm.data.inbound_batch_number;
  }
};

const handleShelveMode = () => {
  selectedProducts.value = [];
  // if (arrivalMethod.value === "box") {
  //   boxes.value = orderData.value.boxes;
  // } else {
  //   // let items = [];
  //   // orderData.value.boxes.forEach((box) => {
  //   //   items.push(...box.items);
  //   // });
  //   // products.value = items;
  // }
};

const getProductsFromParcels = () => {
  const result = [];
  boxes.value.forEach((box) => {
    if (box.shelf_location) {
      result.push({
        box_number: box.box_number,
        warehouse_location_code: box.shelf_location,
      });
    }
  });
  return result;
};

// 格式化商品上架数据
const formatProductShelfData = () => {
  let result = [];
  products.value.forEach((p) => {
    if (screenShelfLocations(p).length) {
      result.push({
        sku: p.product_spec_sku,
        shelf_locations: screenShelfLocations(p),
      });
    }
  });
  return result;
};

const screenShelfLocations = (item) => {
  const shelfLocations = [];
  item.shelfLocations.forEach((shelfLocation) => {
    if (shelfLocation.location != null && shelfLocation.quantity != null) {
      shelfLocations.push({
        warehouse_location_code: shelfLocation.location,
        quantity: shelfLocation.quantity,
      });
    }
  });
  return shelfLocations;
};

// 货架位操作
const addShelfLocation = (product) => {
  product.shelfLocations.push({ location: null, quantity: null });
};

const removeShelfLocation = (product, index) => {
  product.shelfLocations.splice(index, 1);
};

// 获取货架位列表
const getShelfLocations = async () => {
  try {
    const res = await settingApi.getShelfLocationList();
    if (res.success) {
      shelfOptions.value = res.data.items || [];
    }
  } catch (error) {
    console.error("获取货架位错误:", error);
  }
};

// 添加批量设置箱子上架数量的方法
const applyBatchBoxQuantity = () => {
  if (boxes.value.length === 0) return;

  // 应用商品数量作为上架数量
  boxes.value.forEach((box) => {
    // 计算箱子中所有商品的数量总和
    const totalItems = box.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    box.shelf_quantity = totalItems;
  });

  $q.notify({
    type: "positive",
    message: trans("已应用商品数量作为上架数量"),
  });
};

// 批量设置商品上架数量
const applyBatchProductQuantity = () => {
  products.value.forEach((product) => {
    // 计算待上架数量：收货数量减去已上架数量
    const remainingQty = Math.max(
      0,
      product.received_quantity - (product.shelf_quantity || 0)
    );

    if (product.shelfLocations && remainingQty > 0) {
      // 如果有多个货架位，需要分配数量
      if (product.shelfLocations.length === 1) {
        // 只有一个货架位，直接分配全部数量
        product.shelfLocations[0].quantity = remainingQty;
      } else {
        // 有多个货架位，均分数量
        const avgQty = Math.floor(remainingQty / product.shelfLocations.length);
        let remainder = remainingQty % product.shelfLocations.length;

        product.shelfLocations.forEach((location) => {
          location.quantity = avgQty;
          if (remainder > 0) {
            location.quantity += 1;
            remainder--;
          }
        });
      }
    } else if (product.shelfLocations) {
      // 如果没有待上架数量，所有货架位设为0
      product.shelfLocations.forEach((location) => {
        location.quantity = 0;
      });
    }
  });

  $q.notify({
    type: "positive",
    message: trans("已应用待上架数量（收货数量 - 已上架数量）作为上架数量"),
  });
};

// 初始化
onMounted(() => {
  // 获取货架位列表
  getShelfLocations();
  if (route.query.number) {
    scanCode.value = route.query.number;
    handleScan();
  }
});
</script>

<style lang="scss" scoped>
.shelve-page {
  background: #f4f5f8;
  min-height: 100vh;
  // 模式选择样式
  .shelve-mode {
    border: 1px solid #eaeaea;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .delete-btn {
    margin-left: 4px;
    margin-top: 4px;
  }
  // 商品上架区域样式
  .product-shelve,
  .box-shelve {
    width: 1400px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    padding: 10px 20px;
    margin: 0 auto;

    // 商品图片
    .product-img {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      object-fit: contain;
      background-color: #f5f5f5;
      border: 1px solid #eaeaea;
    }

    // 商品信息
    .product-name {
      font-weight: 500;
      font-size: 14px;
    }

    .product-sku,
    .product-spec {
      font-size: 12px;
      color: #8592a6;
    }

    // 货架位样式
    .shelf-location-item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    // 上架数量样式
    .shelf-qty-item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
  }

  // 表格样式
  :deep(.q-table) {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      padding: 12px 16px;
      // background-color: #f5f7fa;
      white-space: nowrap;
    }

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      vertical-align: top;
    }

    tbody tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }

    .q-checkbox {
      margin-left: -4px;
    }
  }

  // 输入框统一样式
  // :deep(.q-field) {
  //   .q-field__control {
  //     &:hover {
  //       border-color: var(--q-primary);
  //     }

  //     &:focus-within {
  //       border-color: var(--q-primary);
  //       box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  //     }
  //   }
  // }

  // 按钮样式调整
  .q-btn {
    &.bg-grey-2 {
      background-color: #f5f5f5;

      &:hover {
        background-color: #e0e0e0;
      }
    }

    &[unelevated] {
      &.text-primary {
        color: white;
      }
    }
  }

  // 分页样式
  :deep(.q-table__bottom) {
    padding: 8px 16px;
    border-top: 1px solid #eaeaea;

    .q-table__control {
      font-size: 13px;
    }
  }

  // 添加货架位按钮样式
  .q-btn--dense.q-btn--flat {
    padding: 0 8px;
    height: 24px;
    min-height: 24px;
    font-size: 12px;
  }

  // 头部带操作按钮的样式
  .header-with-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.scan-header {
  padding: 0 calc((100vw - 1400px) / 2);
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  display: flex;
  height: 80px;
  justify-content: space-between;
  align-items: center;
  .head-box {
    display: flex;
    align-items: center;
    gap: 10px;
    .header-title {
      font-weight: 600;
      font-size: 24px;
      color: #1f1f1f;
    }
    .head-title-2 {
      font-weight: 500;
      font-size: 14px;
      color: #666666;
    }
    .head-number {
      font-weight: bold;
      font-size: 16px;
      color: #5745c5;
    }
  }

  .btn-box {
    display: flex;
    align-items: center;
    gap: 20px;
    .btn {
      border-radius: 9px 9px 9px 9px;
      padding: 0 32px;
      height: 42px;
    }
  }
}

.order-info {
  padding: 20px;
  width: 1400px;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  height: 60px;
  display: flex;
  gap: 20px;
  margin: 20px auto;
  .info-item {
    display: flex;
    align-items: center;
    gap: 20px;
    .info-label {
      font-weight: 500;
      font-size: 14px;
      color: #666666;
    }

    .info-value {
      font-weight: bold;
      font-size: 16px;
      color: #1f1f1f;
      width: 200px;
    }
  }
}

.products-section {
  width: 1400px;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  padding: 10px 20px;
  margin: 0 auto;
  margin-bottom: 20px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  .all-btn {
    font-weight: bold;
  }
}

.shelf-location-cell {
  width: 100%;
  text-align: center;
  .shelf-item {
    display: flex;
    align-items: center;
    margin-bottom: 0 !important;

    .shelf-select {
      flex: 1;
    }

    .delete-btn {
      margin-left: 4px;
      margin-top: 4px;
    }
  }

  .add-shelf-link {
    cursor: pointer;
    font-size: 12px;
    margin-top: 4px;
    display: inline-block;

    &:hover {
      text-decoration: underline;
    }
  }
}

.select-input {
  display: flex;
  border-radius: 9px 9px 9px 9px;
  border: 1px solid #f0f0f0;
  padding: 0 10px;
  .huojia-select {
    width: 182px;
    height: 32px;
    :deep(.q-field__native) {
      min-height: 32px !important;
      height: 32px;
    }
  }
  .huojia-input {
    width: 98px;
    height: 34px;
    border-left: 1px solid #f0f0f0;
  }

  .q-field__control {
    padding: 0 !important;
    height: 34px !important;
  }
  :deep(.q-field__native) {
    padding: 0 10px !important;
    height: 34px !important;
  }
  .q-field__control-container {
    height: 34px !important;
  }
  :deep(.q-input) {
    margin: 0 !important;
  }
  .q-field--dense .q-field__control {
    height: 34px !important;
  }
  :deep(.q-select) {
    margin: 0 !important;
  }
}

.huogui-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>