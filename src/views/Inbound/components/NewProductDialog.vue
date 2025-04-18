<template>
  <q-dialog v-model="isVisible">
    <q-card
      style="
        max-width: 1200px;
        width: 80%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      "
    >
      <q-card-section class="row items-center">
        <div class="text-h6" v-if="boxNumber != 'NewSku'&&boxNumber">箱号:{{ boxNumber }}</div>
        <div class="text-h6" v-else>新品维护</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="scroll" style="flex: 1; overflow: auto">
        <!-- 商品尺寸和重量表格 -->
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="25%">商品信息</th>
                <th width="25%">
                  <div v-if="!boxNumber" class="header-with-action">
                    <div>箱子</div>
                  </div>
                </th>
                <th width="30%" class="text-center">
                  <div>
                    <div>实际体积</div>
                    <q-btn flat dense class="all-btn" label="全部">
                      <q-menu anchor="bottom middle" self="top middle">
                        <q-card style="min-width: 350px" class="q-pa-md">
                          <div class="q-mb-md">
                            <q-radio
                              v-model="dimensionsMode"
                              val="customer"
                              label="应用客户申报尺寸"
                            />
                          </div>
                          <div class="q-mb-md">
                            <q-radio
                              v-model="dimensionsMode"
                              val="manual"
                              label="统一修改为"
                            />
                          </div>

                          <div class="row q-col-gutter-md q-mb-lg">
                            <div class="col-4">
                              <q-input
                                outlined
                                v-model="dimensions.length"
                                label="长"
                                type="number"
                                :disable="dimensionsMode !== 'manual'"
                                dense
                              >
                                <template v-slot:append>
                                  <div class="text-grey-8">cm</div>
                                </template>
                              </q-input>
                            </div>
                            <div class="col-4">
                              <q-input
                                outlined
                                v-model="dimensions.width"
                                label="宽"
                                type="number"
                                :disable="dimensionsMode !== 'manual'"
                                dense
                              >
                                <template v-slot:append>
                                  <div class="text-grey-8">cm</div>
                                </template>
                              </q-input>
                            </div>
                            <div class="col-4">
                              <q-input
                                outlined
                                v-model="dimensions.height"
                                label="高"
                                type="number"
                                :disable="dimensionsMode !== 'manual'"
                                dense
                              >
                                <template v-slot:append>
                                  <div class="text-grey-8">cm</div>
                                </template>
                              </q-input>
                            </div>
                          </div>

                          <div class="row justify-end">
                            <q-btn
                              flat
                              label="取消"
                              color="grey-7"
                              v-close-popup
                            />
                            <q-btn
                              unelevated
                              label="确认"
                              color="primary"
                              @click="applyBatchDimensions"
                              v-close-popup
                            />
                          </div>
                        </q-card>
                      </q-menu>
                    </q-btn>
                  </div>
                </th>
                <th width="20%">
                  <div class="header-with-action">
                    <div>实际重量</div>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      class="all-btn"
                      label="全部"
                      size="sm"
                    >
                      <q-menu anchor="bottom middle" self="top middle">
                        <q-card style="min-width: 300px" class="q-pa-md">
                          <div class="text-subtitle2 q-mb-sm">实际重量设置</div>
                          <div class="q-mb-md">
                            <q-radio
                              v-model="weightMode"
                              val="customer"
                              label="应用客户申报重量"
                            />
                          </div>
                          <div class="q-mb-md">
                            <q-radio
                              v-model="weightMode"
                              val="manual"
                              label="统一修改为"
                            />
                            <q-input
                              v-if="weightMode === 'manual'"
                              outlined
                              v-model="weight"
                              label="重量"
                              type="number"
                              dense
                              class="q-mt-sm"
                              style="width: 120px"
                            >
                              <template v-slot:append>
                                <div class="text-grey-8">g</div>
                              </template>
                            </q-input>
                          </div>

                          <div class="row justify-end">
                            <q-btn
                              flat
                              label="取消"
                              color="grey-7"
                              v-close-popup
                            />
                            <q-btn
                              unelevated
                              label="确认"
                              color="primary"
                              @click="applyBatchWeight"
                              v-close-popup
                            />
                          </div>
                        </q-card>
                      </q-menu>
                    </q-btn>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>
                  <div class="product-info">
                    <!-- <img
                      :src="product.image || 'https://via.placeholder.com/50'"
                      width="50"
                      height="50"
                      class="product-img"
                    /> -->
                    <div class="product-details">
                      <div class="product-name">{{ product.product_name }}</div>
                      <div class="product-sku">
                        SKU: {{ product.product_spec_sku }}
                      </div>
                      <div class="product-spec">
                        名称: {{ product.product_spec_name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div
                    class="quantity-display"
                    v-for="box in product.box_numbers"
                    :key="box"
                  >
                    <div>{{ box }};</div>
                  </div>
                </td>
                <td>
                  <div class="dimensions-inputs">
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="product.product_spec_actual_length"
                      class="dimension-input"
                    />
                    <span class="dimension-separator">×</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="product.product_spec_actual_width"
                      class="dimension-input"
                    />
                    <span class="dimension-separator">×</span>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="product.product_spec_actual_height"
                      class="dimension-input"
                    />
                    <span class="dimension-unit">cm</span>
                  </div>
                  <div class="dimension-info">
                    <div class="customer-dim">
                      客户申报: {{ product.product_spec_size_length }}×{{
                        product.product_spec_size_width
                      }}×{{ product.product_spec_size_height }} cm
                    </div>
                    <div class="volume-display">
                      {{
                        calculateVolume(
                          product.product_spec_size_length,
                          product.product_spec_size_width,
                          product.product_spec_size_height
                        )
                      }}
                      cm³
                    </div>
                  </div>
                </td>
                <td>
                  <div class="weight-input-container">
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model="product.product_spec_actual_weight"
                      class="weight-input"
                    />
                    <span class="weight-unit">g</span>
                  </div>
                  <div class="weight-info">
                    <div class="customer-weight">
                      客户申报: {{ product.product_spec_weight }}g
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn unelevated label="确认" :loading="$store.state.btnLoading" color="primary" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import inboundApi from "@/api/inbound";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Array,
    default: () => [],
  },
  boxNumber: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:visible", "update:products", "confirm"]);

const $q = useQuasar();
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

// 表格列定义
const productColumns = [
  {
    name: "product",
    required: true,
    label: "商品信息",
    align: "left",
    field: (row) => row,
    style: "width: 60%",
  },
  {
    name: "quantity",
    align: "center",
    label: "数量",
    field: "quantity",
  },
  {
    name: "box_numbers",
    align: "center",
    label: "箱子",
    field: "box_numbers",
  },
];

// 控制气泡菜单显示
const showDimensionsMenu = ref(false);
const showWeightMenu = ref(false);

// 尺寸设置
const dimensionsMode = ref("customer");
const uniformSize = ref(null);
const dimensions = reactive({
  length: null,
  width: null,
  height: null,
});

// 重量设置
const weightMode = ref("customer");
const weight = ref(null);

// 计算体积
const calculateVolume = (length, width, height) => {
  if (!length || !width || !height) return "0.00";
  return (length * width * height).toFixed(2);
};

// 初始化数据 - 当对话框打开时初始化
onMounted(() => {
  // 初始化批量设置选项
  dimensionsMode.value = "customer";
  weightMode.value = "customer";
});

// 应用批量设置尺寸到所有商品
const applyBatchDimensions = () => {
  if (props.products.length === 0) return;

  props.products.forEach((product) => {
    if (dimensionsMode.value === "customer") {
      // 应用客户申报的尺寸
      product.product_spec_actual_length = product.product_spec_size_length;
      product.product_spec_actual_width = product.product_spec_size_width;
      product.product_spec_actual_height = product.product_spec_size_height;
    } else if (dimensionsMode.value === "uniform" && uniformSize.value) {
      // 应用统一尺寸
      product.product_spec_actual_length = uniformSize.value;
      product.product_spec_actual_width = uniformSize.value;
      product.product_spec_actual_height = uniformSize.value;
    } else if (dimensionsMode.value === "manual") {
      // 应用手动输入的尺寸
      if (dimensions.length)
        product.product_spec_actual_length = dimensions.length;
      if (dimensions.width)
        product.product_spec_actual_width = dimensions.width;
      if (dimensions.height)
        product.product_spec_actual_height = dimensions.height;
    }
  });

  showDimensionsMenu.value = false;

  $q.notify({
    type: "positive",
    message: "已应用批量尺寸设置",
  });
};

// 应用批量设置重量到所有商品
const applyBatchWeight = () => {
  if (props.products.length === 0) return;

  props.products.forEach((product) => {
    if (weightMode.value === "customer") {
      // 应用客户申报的重量
      product.product_spec_actual_weight = product.product_spec_weight;
    } else if (weightMode.value === "manual" && weight.value) {
      // 应用手动输入的重量
      product.product_spec_actual_weight = weight.value;
    }
  });

  showWeightMenu.value = false;

  $q.notify({
    type: "positive",
    message: "已应用批量重量设置",
  });
};

// 应用全部预报数量作为收货数量
const applyFullQuantity = () => {
  if (props.products.length === 0) return;
  props.products.forEach((product) => {
    if (product.quantity > product.received_quantity) {
      product.put_away_quantity = product.quantity - product.received_quantity;
    } else {
      product.put_away_quantity = 0;
    }
  });

  $q.notify({
    type: "positive",
    message: "已应用预报数量作为收货数量",
  });
};

// 确认按钮处理
const handleConfirm = () => {
  inboundApi
    .updateNewProducts(props.id, {
      items: props.products.map((item) => ({
        sku: item.product_spec_sku,
        actual_length: item.product_spec_actual_length,
        actual_width: item.product_spec_actual_width,
        actual_height: item.product_spec_actual_height,
        actual_weight: item.product_spec_actual_weight,
      })),
    })
    .then((res) => {
      if (res.success) {
        if (props.boxNumber) {
          // 如是是改箱子里面的某个商品
          emit("updateNewProducts");
        } else {
          // 如果是确认收货
          emit("confirm");
        }
        isVisible.value = false;
        $q.notify({
          type: "positive",
          message: "商品信息已更新",
        });
      }
    });
};

defineExpose({
  calculateVolume,
});
</script>

<style lang="scss" scoped>
.q-dialog__inner > div {
  overflow: visible !important;
}

// 自定义表格样式
.table-container {
  margin-top: 16px;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #eaeaea;

  th {
    background-color: #f5f7fa;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 14px;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #eaeaea;

    .text-primary {
      color: var(--q-primary);
      font-size: 12px;
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #eaeaea;
    vertical-align: top;
    background-color: #fff;
  }
}

// 商品信息样式
.product-info {
  display: flex;
  align-items: flex-start;

  .product-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-right: 12px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }

  .product-details {
    flex: 1;

    .product-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .product-sku,
    .product-spec {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 2px;
    }
  }
}

// 尺寸输入样式
.dimensions-inputs {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .dimension-input {
    width: 80px;
  }

  .dimension-separator {
    margin: 0 4px;
  }

  .dimension-unit {
    margin-left: 4px;
  }
}

.dimension-info {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);

  .customer-dim {
    margin-bottom: 4px;
  }
}

// 重量输入样式
.weight-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .weight-input {
    width: 100px;
  }

  .weight-unit {
    margin-left: 8px;
  }
}

.weight-info {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

// 数量展示样式
.quantity-display {
  display: flex;
  align-items: center;

  .quantity-input {
    width: 80px;
  }

  .quantity-separator {
    margin-left: 8px;
  }
}

.input-spacing {
  margin: 5px 0 !important;
}

.cursor-pointer {
  cursor: pointer;
}

.all-btn {
  min-height: unset;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(25, 118, 210, 0.08);

  &:hover {
    background-color: rgba(25, 118, 210, 0.16);
  }
}
</style> 