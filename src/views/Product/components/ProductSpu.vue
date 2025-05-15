<template>
  <div class="product-spu">
    <!-- 表格 -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:selected="selected"
      selection="multiple"
      hide-pagination
      flat
      :loading="loading"
      :pagination="{
        rowsPerPage: 0,
      }"
    >
      <!-- 无数据时的显示 -->
      <template v-slot:no-data>
        <div
          v-if="!loading && (!rows || rows.length === 0)"
          class="full-width row flex-center q-my-lg"
        >
          <span class="text-grey">{{ trans("暂无数据") }} </span>
        </div>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th style="width: 48px; padding: 0 4px">
            <q-btn
              size="sm"
              color="grey-7"
              flat
              dense
              disable
              icon="keyboard_arrow_right"
            />
          </q-th>
          <q-th auto-width style="padding: 0 8px">
            <q-checkbox size="sm" color="primary" v-model="props.selected" />
          </q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :style="col.style"
            class="font-bold font-14"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- 主体数据 -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td style="width: 48px; padding: 0 4px">
            <q-btn
              size="sm"
              color="grey-7"
              flat
              dense
              @click="props.expand = !props.expand"
              :icon="
                props.expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
              "
            />
          </q-td>
          <q-td auto-width style="padding: 0 8px">
            <q-checkbox size="sm" color="primary" v-model="props.selected" />
          </q-td>
          <!-- SPU信息 -->
          <q-td
            key="spuInfo"
            :style="columns.find((col) => col.name === 'spuInfo').style"
          >
            <div class="row no-wrap items-center">
              <div class="q-mr-sm">
                <img
                  :src="
                    props.row?.main_image ||
                    'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                  "
                  style="object-fit: cover"
                  class="w-50 h-50 b-rd-4"
                />
              </div>
              <div class="ellipsis">
                <div>{{ props.row?.name || "-" }}</div>
                <div>SPU: {{ props.row?.id || "-" }}</div>
              </div>
            </div>
          </q-td>
          <q-td
            key="status"
            class="text-center"
            :style="columns.find((col) => col.name === 'status').style"
          >
            <div>
              {{
                props.row.allow_inbound ? trans("允许收货") : trans("暂停收货")
              }}
            </div>
            <div>
              {{
                props.row.allow_order ? trans("允许接单") : trans("暂停接单")
              }}
            </div>
          </q-td>
          <q-td
            key="category"
            class="text-center"
            :style="columns.find((col) => col.name === 'category').style"
          >
            {{ props.row?.category?.name || "-" }}
          </q-td>
          <q-td
            key="creator"
            class="text-center"
            :style="columns.find((col) => col.name === 'creator').style"
          >
            {{ props.row?.customer?.name || "-" }}
          </q-td>
          <q-td
            key="createTime"
            class="text-center"
            :style="columns.find((col) => col.name === 'createTime').style"
          >
            {{ props.row?.updated_at || "-" }}
          </q-td>
          <q-td
            key="operations"
            class="text-center"
            :style="columns.find((col) => col.name === 'operations').style"
          >
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="handleEdit(props.row)"
            />
            <!-- <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="handleSingleDelete(props.row)"
            /> -->
          </q-td>
        </q-tr>

        <!-- 展开后的SKU表格 -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" style="padding: 20px !important">
            <div>
              <q-table
                :rows="props.row.specs || []"
                :columns="skuColumns"
                row-key="id"
                flat
                hide-pagination
                class="sku-table"
              >
                <template v-slot:body-cell-skuInfo="slotProps">
                  <q-td :props="slotProps">
                    <div class="row no-wrap items-center">
                      <div class="q-mr-sm">
                        <img
                          :src="slotProps.row?.image"
                          style="
                            width: 50px;
                            height: 50px;
                            object-fit: cover;
                            border-radius: 4px;
                          "
                        />
                      </div>
                      <div class="ellipsis flex-c-start-start gap-10">
                        <div class="text-primary">
                          SKU: {{ slotProps.row?.sku || "-" }}
                        </div>
                        <div class="ellipsis">
                          {{ trans("名称") }}:
                          {{ slotProps.row?.product?.name || "-" }}
                        </div>
                        <div>
                          {{ trans("规格") }}: {{ slotProps.row?.name || "-" }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-applySpec="slotProps">
                  <q-td
                    :props="slotProps"
                    style="white-space: pre-line; text-align: center"
                  >
                    {{
                      `${slotProps.row.size_length || 0}*${
                        slotProps.row.size_width || 0
                      }*${slotProps.row.size_height || 0} cm\n${
                        slotProps.row.weight || 0
                      } g`
                    }}
                  </q-td>
                </template>

                <template v-slot:body-cell-realSpec="slotProps">
                  <q-td
                    :props="slotProps"
                    style="white-space: pre-line; text-align: center"
                  >
                    {{
                      `${slotProps.row.warehouse_size_length || 0}*${
                        slotProps.row.warehouse_size_width || 0
                      }*${slotProps.row.warehouse_size_height || 0} cm\n${
                        slotProps.row.warehouse_weight || 0
                      } g`
                    }}
                  </q-td>
                </template>

                <template v-slot:body-cell-timeInfo="slotProps">
                  <q-td :props="slotProps" style="text-align: center">
                    <div>
                      {{ trans("创建") }}: {{ slotProps.row.created_at || "-" }}
                    </div>
                    <div>
                      {{ trans("更新") }}: {{ slotProps.row.updated_at || "-" }}
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- 底部选中记录数显示 -->
      <template v-slot:bottom>
        <div v-if="selected.length > 0" class="q-pa-sm text-grey-8 text-center">
          {{ trans("已选择 {count} 条记录", { count: selected.length }) }}
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import api from "@/api/index";
import trans from "@/i18n";

const router = useRouter();
const $q = useQuasar();

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "add",
  "edit",
  "copy",
  "delete",
  "print",
  "import",
  "page-change",
  "void",
]);

// 表格数据
const selected = ref([]);

// SPU表格列定义
const columns = [
  {
    name: "spuInfo",
    required: true,
    label: "SPU",
    align: "left",
    field: (row) => row.name,
    style: "width: 25%",
  },
  {
    name: "status",
    label: trans("状态"),
    field: "status",
    align: "center",
    style: "width: 20%",
  },
  {
    name: "category",
    label: trans("分类"),
    field: "category",
    align: "center",
    style: "width: 20%",
  },
  {
    name: "creator",
    label: trans("创建人员"),
    field: "creator",
    align: "center",
    style: "width: 20%",
  },
  {
    name: "createTime",
    label: trans("创建时间"),
    field: "updated_at",
    align: "center",
    style: "width: 20%",
  },
  {
    name: "operations",
    label: trans("操作"),
    align: "center",
    style: "width: 15%",
  },
];

// SKU表格列定义
const skuColumns = [
  {
    name: "skuInfo",
    required: true,
    label: trans("SKU信息"),
    align: "left",
    field: (row) => row?.sku || "",
    style: "width: 35%;",
    headerStyle: "font-weight:bold;font-size:14px",
  },
  {
    name: "applySpec",
    label: trans("申报规格"),
    field: (row) =>
      `${row.size_length || 0}*${row.size_width || 0}*${
        row.size_height || 0
      } cm\n${row.weight || 0} g`,
    align: "center",
    style: "width: 20%",
    headerStyle: "font-weight:bold;font-size:14px",
  },
  {
    name: "realSpec",
    label: trans("实际规格"),
    field: (row) =>
      `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${
        row.warehouse_size_height || 0
      } cm\n${row.warehouse_weight || 0} g`,
    align: "center",
    style: "width: 20%",
    headerStyle: "font-weight:bold;font-size:14px",
  },
  {
    name: "timeInfo",
    label: trans("时间"),
    align: "center",
    format: (row) => ({
      created: row.created_at,
      updated: row.updated_at,
    }),
    style: "width: 15%",
    headerStyle: "font-weight:bold;font-size:14px",
  },
];

// 处理编辑按钮点击
const handleEdit = (row) => {
  router.push(`/product/edit/${row.id}`);
};

// 处理删除
const handleDelete = async () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: trans("请选择要删除的商品"),
      color: "warning",
    });
    return;
  }

  $q.dialog({
    title: trans("确认删除"),
    message: trans("确定要删除选中的 {count} 个商品吗？", {
      count: selected.value.length,
    }),
    cancel: {
      label: trans("取消"),
      flat: true,
    },
    ok: {
      label: trans("确认"),
      color: "negative",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delProduct({
        ids: selected.value.map((item) => item.id),
      });

      if (response.success) {
        selected.value = []; // 清空选中
        emit("refresh"); // 刷新列表
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

// 处理单个删除
const handleSingleDelete = (row) => {
  $q.dialog({
    title: trans("确认删除"),
    message: trans("确定要删除该商品吗？"),
    cancel: {
      label: trans("取消"),
      flat: true,
    },
    ok: {
      label: trans("确认"),
      color: "negative",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delProduct({
        ids: [row.id],
      });

      if (response.success) {
        emit("refresh"); // 刷新列表
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

// 暴露选中数据和方法给父组件
defineExpose({
  selected,
  handleDelete,
  handleEdit,
});
</script>

<style lang="scss" scoped>
.product-spu {
  width: 100%;

  // :deep(.q-table) {
  //   table {
  //     table-layout: fixed;
  //   }

  //   .q-td,
  //   .q-th {
  //     padding: 8px;
  //     overflow: hidden;
  //   }

  //   .q-table__top {
  //     padding: 0;
  //   }

  //   thead tr th {
  //     position: relative;
  //     background: #f5f5f5;
  //   }
  // }

  .sku-table {
    width: 100%;
    margin: 0;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
}
</style>
