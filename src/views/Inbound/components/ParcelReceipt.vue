<template>
  <div class="parcel-receipt">
    <div class="section-header q-px-lg q-py-md">
      <div class="row justify-between items-center q-mb-md">
        <div class="text-subtitle1 text-weight-medium">包裹收货</div>
      </div>
    </div>

    <!-- 收货列表 -->
    <div class="q-pa-md">
      <div class="row justify-between items-center q-mb-sm">
        <div class="row items-center">
          <!-- <span>选择 {{ selectedBoxes.length }} </span>
          <q-btn-dropdown
            color="primary"
            label="批量操作"
            icon="settings"
            flat
            :disable="!selectedBoxes.length"
            class="q-ml-sm"
          >
            <q-list>
              <q-item clickable v-close-popup @click="handlePrintSelected">
                <q-item-section>打印选中</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handlePrintAll">
                <q-item-section>打印全部</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown> -->
        </div>

        <div class="row items-center">
          <!-- <div class="q-mr-md">
            <q-checkbox v-model="showReceived" label="显示已收货箱子" />
          </div> -->
          <span class="text-weight-medium q-mr-sm"
            >箱子总数: {{ parcels.length }}</span
          >
        </div>
      </div>

      <q-table
        :rows="filteredParcels"
        :columns="columns"
        row-key="id"
        flat
        bordered
        selection="multiple"
        v-model:selected="selectedBoxes"
        :pagination="{ rowsPerPage: 50 }"
        hide-bottom
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width>
              <q-checkbox v-model="props.selected" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
              <div
                v-if="col.subLabel"
                class="text-caption text-primary q-mt-xs cursor-pointer"
                @click="fillAllQuantities"
              >
                {{ col.subLabel }}
              </div>
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" />
            </q-td>
            <q-td
              key="box_number"
              :props="props"
              class="cursor-pointer"
              @click="handleBoxClick(props.row)"
            >
              {{ props.row.box_number }}
            </q-td>
            <q-td key="dimensions" :props="props">
              {{ getDimensions(props.row) }}
            </q-td>
            <q-td key="weight" :props="props">
              {{ props.row.weight || "--" }}
            </q-td>
            <q-td key="products" :props="props">
              <div
                v-for="item in props.row.items"
                :key="item.id"
                class="product-item q-mb-xs"
              >
                <div>
                  {{ item.product_spec_sku }}
                  <span v-if="isNewSku(item)" class="new-sku">new</span>
                </div>
                <div class="text-caption text-grey-8">
                  {{ item.product_name }}
                </div>
                <div class="text-caption">{{ item.product_spec_name }}</div>
              </div>
            </q-td>
            <q-td key="received_quantity" :props="props">
              <div
                v-for="item in props.row.items"
                :key="item.id"
                class="product-item q-mb-xs"
              >
                <div class="row items-center">
                  <div class="col">
                    <q-input
                      outlined
                      dense
                      :model-value="item.put_away_quantity"
                      @update:model-value="updateReceiveQuantity(item, $event)"
                      type="number"
                      min="0"
                      :max="item.quantity"
                      class="q-mb-xs"
                    />
                  </div>
                  <div class="col-auto">
                    <span class="text-grey-8 q-ml-sm"
                      >/ {{ item.quantity }}</span
                    >
                  </div>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import { useQuasar } from "quasar";

const props = defineProps({
  parcels: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["print", "update:parcels", "handle-box-click"]);

const $q = useQuasar();

// 数据
const selectedBoxes = ref([]);
const showReceived = ref(true);

// 过滤已收货的箱子
const filteredParcels = computed(() => {
  if (showReceived.value) {
    return props.parcels;
  } else {
    return props.parcels.filter((parcel) => {
      // 判断箱子是否已完全收货
      return !parcel.items.every(
        (item) => item.put_away_quantity >= item.quantity
      );
    });
  }
});

// 表格列定义
const columns = [
  {
    name: "box_number",
    required: true,
    label: "箱号",
    align: "left",
    field: "box_number",
  },
  {
    name: "dimensions",
    label: "箱子尺寸",
    align: "center",
    field: (row) => getDimensions(row),
  },
  { name: "weight", label: "箱子重量", align: "center", field: "weight" },
  {
    name: "products",
    label: "商品SKU",
    align: "left",
    field: "items",
    style: "width: 40%",
  },
  {
    name: "received_quantity",
    label: "收货/预报数量",
    subLabel: "全部",
    align: "center",
    field: "items",
    style: "width: 15%",
  },
];

const handleBoxClick = (row) => {
  emit("handleBoxClick", row);
};

const isNewSku = (item) => {
  return !item.product_spec_actual_weight;
};

// 格式化尺寸数据
const getDimensions = (row) => {
  if (row.size_length && row.size_width && row.size_height) {
    return `${row.size_length} × ${row.size_width} × ${row.size_height}`;
  }
  return "--";
};

// 方法
const handlePrint = () => {
  emit("print", props.parcels);
  $q.notify({
    type: "info",
    message: "准备打印包裹标签...",
  });
};

const handlePrintSelected = () => {
  if (selectedBoxes.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "请先选择箱子",
    });
    return;
  }

  emit("print", selectedBoxes.value);
  $q.notify({
    type: "info",
    message: `准备打印${selectedBoxes.value.length}个箱子标签...`,
  });
};

const handlePrintAll = () => {
  emit("print", props.parcels);
  $q.notify({
    type: "info",
    message: `准备打印${props.parcels.length}个箱子标签...`,
  });
};

const fillAllQuantities = () => {
  // 克隆数据避免直接修改props
  const updatedParcels = JSON.parse(JSON.stringify(props.parcels));

  updatedParcels.forEach((parcel) => {
    parcel.items.forEach((item) => {
      if (item.quantity > item.received_quantity) {
        item.put_away_quantity =
          item.quantity - item.received_quantity;
      } else {
        item.put_away_quantity = 0;
      }
    });
  });

  // 通知父组件更新数据
  emit("update:parcels", updatedParcels);
  $q.notify({
    type: "positive",
    message: "已将所有商品的预报数量填入收货数量",
    position: "top",
  });
};

const updateReceiveQuantity = (item, value) => {
  // 将空字符串转为null，其他转为数字
  item.put_away_quantity = value === "" ? null : Number(value);

  // 通知父组件数据已更新
  emit("update:parcels", props.parcels);
};

// 暴露更多数据给父组件
defineExpose({
  parcels: props.parcels,
  selectedBoxes, // 暴露选中的箱子
  getSelectedItems: () => {
    // 返回选中箱子中的所有商品
    const selectedItems = [];
    selectedBoxes.value.forEach((box) => {
      box.items?.forEach((item) => {
        selectedItems.push({ ...item, boxNumber: box.box_number });
      });
    });
    return selectedItems;
  },
  validateData: () => {
    // 提供数据验证方法给父组件
    let valid = true;
    let errorMessage = "";

    props.parcels.forEach((parcel) => {
      parcel.items.forEach((item) => {
        // 检查是否有未填写的收货数量
        if (item.put_away_quantity === null) {
          valid = false;
          errorMessage = `包裹 ${parcel.box_number} 中的商品 ${item.product_spec_sku} 未填写收货数量`;
        }
      });
    });

    return { valid, errorMessage };
  },
});
</script>

<style lang="scss" scoped>
.parcel-receipt {
  .section-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  .new-sku {
    color: red;
    padding: 0 5px;
    border-radius: 5px;
    background-color: #f0f0f0;
    border: 1px solid red;
    border-radius: 10px;
    margin-left: 5px;
  }

  :deep(.q-table th) {
    font-weight: 500;
    font-size: 14px;
    background-color: #f5f7fa;
  }

  :deep(.q-table td) {
    padding: 8px 12px !important;
    vertical-align: top;
  }

  .product-item {
    padding: 8px 0;

    &:not(:last-child) {
      border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
    }
  }
}
</style>