<template>
  <q-dialog v-model="componentData.visible" persistent>
    <q-card class="not-packing-dialog">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="warning" color="orange" class="q-mr-sm" />
        <div class="text-subtitle1">
          {{ trans("存在以下未分拣完成/未打印的包裹") }}
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-table
          :rows="componentData.list"
          :columns="componentData.columns"
          row-key="id"
          flat
          separator="cell"
          bordered
          hide-bottom
          class="not-packing-table"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="index">
                {{ props.row.index + 1 }}
              </q-td>
              <q-td class="new-td">
                <div class="table-content-box">
                  <div
                    v-for="item in props.row.boxes"
                    :key="item.sku"
                    class="table-content"
                  >
                    <div>{{ item.product_spec_sku }}</div>
                    <div class="text-grey-7" style="font-size: 12px">
                      {{ item.product_name + item.product_spec_name }}
                    </div>
                  </div>
                </div>
              </q-td>
              <q-td class="new-td">
                <div class="table-content-box">
                  <div
                    v-for="item in props.row.boxes"
                    :key="item.sku"
                    class="table-content"
                  >
                    {{ item.quantity - item.inFrame }}
                  </div>
                </div>
              </q-td>
              <q-td>
                {{ props.row.package_number }}
              </q-td>
              <q-td>
                {{ props.row.status < 2 ? trans("未打印") : trans("已打印") }}
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm q-pa-lg">
              <span class="text-grey">No Data</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-grey-7" style="font-size: 13px">
          {{
            trans(
              "强制结束后，未完成分拣的包裹将被标记为“分拣异常”移入异常列表"
            )
          }}<br />
          {{ trans("未完成打印的包裹将被标记为“面单打印失败”移入异常列表")
          }}<br />
          {{ trans("已打印面单的包裹可在“待发货”列表查看") }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="trans('取消')" @click="close" />
        <q-btn
          color="primary"
          :label="trans('强制结束')"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive } from "vue";
import trans from "@/i18n";

const emit = defineEmits(["confirm"]);

const componentData = reactive({
  visible: false,
  list: [],
  columns: [
    { name: "index", label: trans("分拣框"), field: "index", align: "left" },
    {
      name: "product",
      label: trans("商品信息"),
      field: "product",
      align: "left",
    },
    {
      name: "wait_qty",
      label: trans("待分拣"),
      field: "wait_qty",
      align: "left",
    },
    {
      name: "package_no",
      label: trans("包裹号"),
      field: "package_no",
      align: "left",
    },
    {
      name: "print_status",
      label: trans("面单状态"),
      field: "print_status",
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

defineExpose({ open });
</script>

<style scoped lang="scss">
.not-packing-dialog {
  min-width: 800px;
  max-width: 95vw;
}
.not-packing-table {
  margin-top: 8px;
  :deep(.q-table th) {
    background: #fafbfc;
    font-weight: 500;
    font-size: 14px;
    color: #222;
  }
  :deep(.q-table td) {
    font-size: 14px;
    color: #222;
    padding: 8px 16px;
    vertical-align: top;
  }
}

.new-td {
  padding: 0 !important;
  .table-content-box {
    .table-content {
      padding: 8px 16px;
      height: 70px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>