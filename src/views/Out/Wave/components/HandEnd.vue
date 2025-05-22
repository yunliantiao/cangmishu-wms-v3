<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          {{ trans("以下包裹打印面单失败，结束作业后，包裹状态置为“异常”") }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="componentData.list"
          :columns="componentData.columns"
          row-key="id"
          flat
          hide-bottom
          class="pack-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                align="center"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="package_number" :props="props">
                {{ props.row.package_number }}
              </q-td>

              <q-td key="product_info" :props="props">
                <div class="product-box">
                  <div
                    class="product-item"
                    v-for="item in props.row.items"
                    :key="item.id"
                  >
                    <div class="sku">{{ item.sku }}</div>
                    <div class="product-name text-overflow-1">
                      {{ item.product_name }}
                    </div>
                    <div class="sku-name">{{ item.sku_name }}</div>
                  </div>
                </div>
              </q-td>

              <q-td key="shelf_location" :props="props">
                <div class="product-box">
                  <div
                    class="product-item"
                    v-for="item in props.row.items"
                    :key="item.id"
                  >
                    {{ getStock(item.stock_locations) }}
                  </div>
                </div>
              </q-td>

              <q-td key="quantity" :props="props">
                <div class="product-box">
                  <div
                    class="product-item"
                    v-for="item in props.row.items"
                    :key="item.id"
                  >
                    {{ item.quantity }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" @click="close" />
        <q-btn color="primary" :label="trans('确认')" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from "vue";
import Message from "@/utils/message.js";
import trans from "@/i18n";

const emit = defineEmits(["confirm"]);

const componentData = reactive({
  visible: false,
  list: [],
  columns: [
    {
      name: "package_number",
      label: trans("包裹号/运单号"),
      field: "package_number",
      align: "left",
    },
    {
      name: "product_info",
      label: trans("商品信息"),
      field: "product_info",
      align: "left",
    },
    {
      name: "shelf_location",
      label: trans("货架位"),
      field: "shelf_location",
      align: "left",
    },
    {
      name: "quantity",
      label: trans("数量"),
      field: "quantity",
      align: "left",
    },
  ],
});

const open = (list = []) => {
  componentData.list = list;
  componentData.visible = true;
};

const close = () => {
  componentData.visible = false;
};

const handleConfirm = () => {
  emit("confirm");
  close();
};

const getStock = (stockLocations) => {
  console.log("stockLocations", stockLocations);

  return stockLocations.map((item) => item.warehouse_location_code).join(",");
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
.product-box {
  line-height: 16px;
  .product-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sku {
    font-weight: 500;
    font-size: 14px;
    color: #5745c5;
  }
  .product-name {
    font-weight: 600;
    font-size: 14px;
    color: #1f1f1f;
  }
  .sku-name {
    font-weight: 500;
    font-size: 14px;
    color: #1f1f1f;
  }
}
</style>
