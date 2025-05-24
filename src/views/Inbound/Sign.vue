<template>
  <div class="scan-sign-page">
    <!-- <div class="text-h5 text-center q-mb-lg">{{ trans("扫描签收") }}</div> -->

    <ScanTop
      :title="trans('扫描签收')"
      ref="scanTopRef"
      v-model:scanValue="scanCode"
      :placeholder="
        trans('请扫描入库单号/退货单号/运单号/ERP单号/平台订单号/箱唛')
      "
      @confirm="handleScan"
    />

    <div class="scan-container q-mx-auto" style="max-width: 1400px">
      <!-- 结果展示区 -->
      <div
        v-if="scanSuccess"
        class="result-container q-pa-lg q-my-md bg-white rounded-borders"
      >
        <div class="text-center q-mb-lg">
          <q-icon name="check_circle" color="green" size="md" class="q-mr-sm" />
          <span class="text-h6 text-green">{{ trans("签收成功!") }}</span>
          <div class="text-subtitle2 q-mt-sm">
            {{ trans("单据状态已更为“待入库”！") }}
          </div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- 详细信息表格 -->
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("客户") }}</div>
            <div>{{ scanData.customer?.name }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("入库单号") }}</div>
            <div>{{ scanData.system_order_number }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("自定义单号") }}</div>
            <div>{{ scanData.custom_order_number }}</div>
          </div>

          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("运单号") }}</div>
            <div>{{ scanData.tracking_number }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("到仓方式") }}</div>
            <div>
              {{
                scanData.arrival_method == "express_parcel"
                  ? trans("快递")
                  : trans("箱子")
              }}
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("SKU种类") }}</div>
            <div>{{ itemList.length }}</div>
          </div>
          <div class="col-6 col-md-3" v-if="scanData.arrival_method == 'box'">
            <div class="text-grey">{{ trans("箱数") }}</div>
            <div>{{ scanData.total_box_qty }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">{{ trans("商品数量") }}</div>
            <div>{{ totalQuantity }}</div>
          </div>

          <div class="col-12">
            <div class="text-grey">{{ trans("商品信息") }}</div>
            <div>{{ scanData.productInfo }}</div>
          </div>
        </div>

        <!-- 商品明细表格 -->
        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">{{ trans("商品明细") }}</div>
          <q-table
            :rows="itemList"
            :columns="itemColumns"
            row-key="id"
            flat
            dense
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
            wrap-cells
            class="no-scroll-x"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="product_spec_sku" :props="props">
                  {{ props.row.product_spec_sku }}
                </q-td>
                <q-td
                  key="product_name"
                  :props="props"
                  class="product-name-cell"
                >
                  <div class="product-info">
                    <img
                      :src="props.row.product_spec_image"
                      class="product-img"
                      @error="handleImgError"
                    />
                    <div class="product-text">
                      <div class="product-title">
                        {{ props.row.product_name }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ props.row.product_spec_name }}
                      </div>
                    </div>
                  </div>
                </q-td>
                <q-td key="quantity" :props="props" class="text-center">
                  {{ props.row.quantity }}
                </q-td>
                <q-td key="size" :props="props" class="text-center">
                  {{ props.row.product_spec_size_length }}×{{
                    props.row.product_spec_size_width
                  }}×{{ props.row.product_spec_size_height }}
                </q-td>
                <q-td key="weight" :props="props" class="text-center">
                  {{ props.row.product_spec_weight }}g
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
import { ref, onMounted, nextTick } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import inboundApi from "@/api/inbound";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";
import { playBeep } from "@/utils/voice.js";

const $q = useQuasar();
const scanCode = ref("");
const scanSuccess = ref(false);
const scanTopRef = ref(null);

const scanData = ref({});

const route = useRoute();
const id = route.query.id;

const itemList = ref([]);

// 表格列定义
const itemColumns = [
  {
    name: "product_spec_sku",
    label: trans("SKU"),
    field: "product_spec_sku",
    align: "left",
    style: "width: 120px",
  },
  {
    name: "product_name",
    label: trans("商品信息"),
    field: "product_name",
    align: "left",
    style: "width: 300px; max-width: 300px",
  },
  {
    name: "quantity",
    label: trans("数量"),
    field: "quantity",
    align: "center",
    style: "width: 80px",
  },
  {
    name: "size",
    label: trans("尺寸(cm)"),
    field: (row) =>
      `${row.product_spec_size_length}×${row.product_spec_size_width}×${row.product_spec_size_height}`,
    align: "center",
    style: "width: 120px",
  },
  {
    name: "weight",
    label: trans("重量(g)"),
    field: "product_spec_weight",
    align: "center",
    style: "width: 100px",
  },
];
const totalQuantity = ref(0);
// 处理扫描
const handleScan = () => {
  if (!scanCode.value) return;
  inboundApi
    .getSign({
      number: scanCode.value,
    })
    .then((res) => {
      if (res.success) {
        let quantity = 0;
        scanData.value = res.data;
        scanSuccess.value = true;
        // 转换回数组形式
        res.data.items.forEach((item) => {
          quantity += item.quantity;
        });
        const mergedItems = mergeSameSkuItems(res.data.items);
        itemList.value = mergedItems;
        totalQuantity.value = quantity;
        // 清空输入框，准备下一次扫描
        setTimeout(() => {
          scanCode.value = "";
          // 重新聚焦输入框
          nextTick(() => {
            scanTopRef.value.focus();
          });
        }, 500);
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
    }
  });

  // 将Map转换回数组
  return Array.from(skuMap.values());
};

// 处理图片加载错误
const handleImgError = (e) => {
  // e.target.src = "/src/assets/no-image.png"; // 替换为默认图片路径
};

onMounted(() => {
  // 页面加载后自动聚焦到扫描输入框
  // nextTick(() => {
  //   scanInput.value.focus();
  if (route.query.number) {
    scanCode.value = route.query.number;
    handleScan();
  }
  // });
});
</script>

<style lang="scss" scoped>
.scan-sign-page {
  min-height: 100vh;
  background-color: #f4f5f8;

  .scan-container {
    .q-input {
      font-size: 1.1rem;
    }
  }

  .result-container {
    border: 1px solid #eaeaea;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    .text-grey {
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .product-info {
      display: flex;
      align-items: center;

      .product-img {
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 4px;
        margin-right: 8px;
        object-fit: cover;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .product-text {
        width: 100%;

        .product-title {
          width: 100%;
          word-break: break-word;
          white-space: normal;
          line-height: 1.4;
          font-size: 13px;
        }
      }
    }

    .product-name-cell {
      max-width: 280px;
      width: 280px;
      white-space: normal;
    }

    .no-scroll-x {
      :deep(.q-table__container) {
        overflow-x: hidden !important;
      }

      :deep(.q-table) {
        table-layout: fixed;
        width: 100%;

        td {
          white-space: normal;
          word-break: break-word;
        }
      }
    }
  }
}
</style>