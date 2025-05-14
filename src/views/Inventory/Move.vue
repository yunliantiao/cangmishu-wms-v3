<template>
  <div class="move-page">
    <!-- 搜索过滤区域 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="searchParams.move_type"
            :options="moveTypeOptions"
            label="全部移货类型"
            class="select-width"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            clearable
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="searchParams.status"
            :options="statusOptions"
            label="全部状态"
            class="select-width"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            clearable
          />
        </div>
        <DatePicker
          v-model:start_date="searchParams.start_date"
          v-model:end_date="searchParams.end_date"
          :dateList="dateTypeOptions"
        ></DatePicker>

        <KeywordSearch
          v-model:search_type="searchParams.search_type"
          v-model:search_value="searchParams.keywords"
          v-model:search_mode="searchParams.search_mode"
          :searchModeList="$store.state.searchModeOptions"
          :searchTypeList="[
            {
              label: '商品SKU',
              value: 'sku',
            },
            {
              label: '移货编号',
              value: 'system_order_number',
            },
            {
              label: '商品名称',
              value: 'name',
            },
          ]"
        ></KeywordSearch>

        <div class="col-auto">
          <q-btn
            outline
            color="grey"
            label="重置"
            class="filter-btn"
            @click="resetSearch"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="search"
            class="filter-btn"
            label="搜索"
            :loading="$store.state.btnLoading"
            @click="getMoveOrderList"
          />
        </div>
      </div>
    </div>

    <div class="main-table">
      <!-- 操作按钮区域 -->
      <div class="row justify-between q-mb-sm">
        <div>
          <q-btn
            color="primary"
            label="创建移库单"
            icon="add"
            class="filter-btn"
            flat
            @click="createMove"
            unelevated
          />
        </div>
      </div>
      <!-- 数据表格 -->
      <div>
        <q-table
          :rows="moveList"
          :columns="columns"
          row-key="id"
          :pagination="{
            rowsPerPage: 0,
          }"
          v-model:selected="selectedRows"
          selection="multiple"
          separator="horizontal"
          class="inventory-table-style"
          :loading="$store.state.btnLoading"
          hide-bottom
          flat
        >
          <template v-slot:body="props">
            <!-- 分组标题行 -->
            <template v-if="showGroupHeader(props.row, props.pageIndex)">
              <q-tr class="group-header-row">
                <q-td colspan="8">
                  <div class="row group-header items-center">
                    <div class="col-12">
                      <span class="info-item q-mr-md"
                        >移库单号: {{ props.row.system_order_number }}</span
                      >
                    </div>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <q-tr :props="props">
              <q-td>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td key="info" :props="props">
                <div>
                  <div>
                    <div>SKU种类: {{ props.row.total_sku_type_qty }}</div>
                    <div>计划移货数量: {{ props.row.total_sku_qty }}</div>
                  </div>
                  <div class="q-mt-sm">
                    <q-btn
                      flat
                      dense
                      :icon="
                        props.expand
                          ? 'keyboard_arrow_up'
                          : 'keyboard_arrow_down'
                      "
                      @click="handleExpand(props)"
                      class="text-grey"
                    >
                      详情
                    </q-btn>
                  </div>
                </div>
              </q-td>
              <q-td key="move_type" :props="props">
                {{ getMoveTypeLabel(props.row.type) }}
              </q-td>
              <q-td key="operator" :props="props">
                创建：{{ props.row.created_by.name }}
              </q-td>
              <q-td key="created_at" :props="props">
                创建：{{ props.row.created_at }}
              </q-td>
              <q-td key="status" :props="props">
                {{ getStatusLabel(props.row.status) }}
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    v-if="props.row.status != 'completed'"
                    flat
                    round
                    color="grey-7"
                    icon="start"
                    @click="handleDetail(props.row, 'move')"
                  >
                    <q-tooltip>移货</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    icon="receipt_long"
                    @click="handleDetail(props.row, 'detail')"
                  >
                    <q-tooltip>详情</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    v-if="props.row.status != 'completed'"
                    color="grey-7"
                    icon="task_alt"
                    @click="forcedCompletion(props.row)"
                  >
                    <q-tooltip>强制完成</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    v-if="props.row.status == 'pending'"
                    round
                    color="grey-7"
                    icon="delete"
                    @click="deleteMove(props.row)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
            <q-tr>
              <q-td colspan="7" class="nav_sku_list" v-show="props.expand">
                <div class="row q-mt-sm">
                  <div
                    class="col-6"
                    v-for="item in props.row.items"
                    :key="item.id"
                  >
                    <div class="q-mb-sm">
                      <div>SKU：{{ item.product_spec_sku }}</div>
                      <div>规格：{{ item.product_spec_name }}</div>
                      <div>名称：{{ item.product_name || "-" }}</div>
                      <div>
                        移入数量：{{ item.transferred_qty }}/{{
                          item.total_qty
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <div class="q-mt-md">
          <Pagination
            :total-count="searchParams.total"
            v-model:page="searchParams.page"
            v-model:rows-per-page="searchParams.per_page"
            @page-change="getMoveOrderList"
          />
        </div>
      </div>
    </div>
    <!-- 移货单详情 -->
    <q-dialog v-model="showDetail">
      <q-card style="width: 1200px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ openType == "move" ? "移货" : "移货详情" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4">
              <q-input
                outlined
                dense
                label="移货编号"
                disable
                v-model="moveDetails.system_order_number"
              />
            </div>
            <div class="col-4">
              <q-select
                outlined
                dense
                label="移货类型"
                v-model="moveDetails.type"
                :options="moveTypeOptions"
                emit-value
                map-options
                disable
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                type="textarea"
                label="备注"
                v-model="moveDetails.remark"
                disable
              />
            </div>
          </div>

          <!-- 移货信息表格 -->
          <div class="move-detail-table">
            <q-table
              v-if="moveDetails.items?.length"
              flat
              bordered
              :rows="moveDetails.items"
              :columns="moveColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 0 }"
              separator="cell"
              hide-bottom
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-center"
                    :class="{ 'text-left': col.name === 'info' }"
                  >
                    {{ col.label }}
                    <template
                      v-if="
                        col.name === 'actualQuantity' && openType === 'move'
                      "
                    >
                      <q-btn
                        flat
                        dense
                        size="sm"
                        color="primary"
                        label="全部"
                        class="q-ml-sm"
                        @click="fillAllQuantities"
                      />
                    </template>
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <template
                  v-for="(item, itemIndex) in props.row.transfer"
                  :key="'transfer-' + itemIndex"
                >
                  <!-- 商品信息单元格，只在每个商品的第一行显示 -->
                  <q-tr>
                    <template v-if="itemIndex === 0">
                      <q-td
                        key="info"
                        :props="props"
                        :rowspan="getTotalTransferCount(props.row)"
                        class="product-info-cell"
                      >
                        <div class="product-info">
                          <div class="text-weight-medium">
                            {{ props.row.product_spec_sku }}
                          </div>
                          <div class="text-grey-8">
                            {{ props.row.product_spec_name }}
                          </div>
                          <div class="text-grey-8">
                            {{ props.row.product_name }}
                          </div>
                        </div>
                      </q-td>
                    </template>

                    <!-- 移出货架位信息 -->
                    <q-td
                      key="moveOut"
                      :rowspan="item.to.length"
                      class="move-location-cell text-center"
                    >
                      {{ item.from.location_code }}
                    </q-td>
                    <q-td
                      key="moveQuantity"
                      :rowspan="item.to.length"
                      class="text-center"
                    >
                      {{ item.from.quantity }}
                    </q-td>

                    <!-- 第一个移入货架位信息 -->
                    <q-td key="moveIn" class="move-location-cell text-center">
                      {{ item.to[0].location_code }}
                    </q-td>
                    <q-td key="planQuantity" class="text-center">
                      <div v-if="openType === 'move'">
                        {{ item.to[0].quantity - (item.to[0].actual_qty || 0) }}
                      </div>
                      <div v-else>
                        {{ item.to[0].quantity }}
                      </div>
                    </q-td>
                    <q-td key="actualQuantity" class="text-center">
                      <q-input
                        v-if="openType === 'move'"
                        outlined
                        dense
                        type="number"
                        v-model.number="item.to[0].qty"
                        placeholder="请输入"
                      />
                      <template v-else>{{
                        item.to[0].actual_qty || "-"
                      }}</template>
                    </q-td>
                  </q-tr>

                  <!-- 其他移入货架位信息 -->
                  <template
                    v-for="(to, toIndex) in item.to"
                    :key="'to-' + toIndex"
                  >
                    <q-tr v-if="toIndex > 0">
                      <q-td key="moveIn" class="move-location-cell text-center">
                        {{ to.location_code }}
                      </q-td>
                      <q-td key="planQuantity" class="text-center">
                        <div v-if="openType === 'move'">
                          {{ to.quantity - (to.actual_qty || 0) }}
                        </div>
                        <div v-else>
                          {{ to.quantity }}
                        </div>
                      </q-td>
                      <q-td key="actualQuantity" class="text-center">
                        <q-input
                          v-if="openType === 'move'"
                          outlined
                          dense
                          type="number"
                          v-model.number="to.qty"
                          placeholder="请输入"
                        />
                        <template v-else>{{ to.actual_qty || "-" }}</template>
                      </q-td>
                    </q-tr>
                  </template>
                </template>
              </template>
            </q-table>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="确认"
            v-if="openType === 'move'"
            color="primary"
            @click="handleConfirmMove"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import inventoryApi from "@/api/inventory";
import Pagination from "@/components/Pagination.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import DatePicker from "@/components/DatePickerNew/Index.vue";

const $q = useQuasar();
const selectedRows = ref([]);
const router = useRouter();
// 搜索参数
const searchParams = ref({
  search_type: "sku",
  search_mode: "fuzzy",
  date_type: "",
  start_date: "",
  end_date: "",
  user_id: "",
  status: "",
  type: "",
  keywords: "",
  page: 1,
  per_page: 10,
  total: 0,
});

const operatorOptions = [];

const moveTypeOptions = [{ label: "商品移货", value: "normal" }];

const statusOptions = [
  { label: "待移货", value: "pending" },
  { label: "部分移货", value: "partially" },
  { label: "移货完成", value: "completed" },
  { label: "作废", value: "cancelled" },
];

const dateTypeOptions = [
  { label: "创建时间", value: "created_at" },
  { label: "更新时间", value: "updated_at" },
];
// 表格列定义
const columns = [
  {
    name: "info",
    required: true,
    label: "商品信息/移库信息",
    align: "left",
    field: (row) => row,
    style: "width: 40%",
  },
  {
    name: "move_type",
    label: "移货类型",
    align: "center",
    field: "move_type",
  },
  {
    name: "operator",
    label: "操作人",
    align: "center",
    field: "operator",
  },
  {
    name: "created_at",
    label: "时间",
    align: "center",
    field: "created_at",
  },
  {
    name: "status",
    label: "状态",
    align: "center",
    field: "status",
  },
  {
    name: "actions",
    label: "操作",
    align: "center",
  },
];
// 数据列表
const moveList = ref([]);

const handleExpand = (row) => {
  inventoryApi.getMoveOrderDetail(row.row.id).then((res) => {
    if (res.success) {
      row.row.items = res.data.items;
      row.expand = !row.expand;
    }
  });
};

const getMoveOrderList = () => {
  inventoryApi.getMoveOrderList(searchParams.value).then((res) => {
    if (res.success) {
      moveList.value = res.data.items;
      searchParams.value.total = res.data.meta.total;
    }
  });
};
getMoveOrderList();

const moveDetails = ref({
  items: [], // 初始化为空数组
  system_order_number: "",
  type: "",
  remark: "",
});
const showDetail = ref(false); // 初始化为 false

// 移货表格列配置
const moveColumns = [
  {
    name: "info",
    label: "商品信息",
    field: (row) => row,
    style: "width: 200px",
    align: "left",
  },
  {
    name: "moveOut",
    label: "移出货架位",
    field: (row) => row.transfer?.[0]?.from?.location_code,
    style: "width: 150px",
    align: "center",
  },
  {
    name: "moveQuantity",
    label: "待移货数量",
    field: (row) => row.transfer?.[0]?.from?.quantity,
    style: "width: 100px",
    align: "center",
  },
  {
    name: "moveIn",
    label: "移入货架位",
    field: (row) => row.transfer?.[0]?.to,
    style: "width: 150px",
    align: "center",
  },
  {
    name: "planQuantity",
    label: "待移入数量",
    field: (row) => row.transfer?.[0]?.to?.[0]?.quantity,
    style: "width: 100px",
    align: "center",
  },
  {
    name: "actualQuantity",
    label: "实际移入数量",
    field: (row) => row.transfer?.[0]?.to?.[0]?.qty,
    style: "width: 150px",
    align: "center",
  },
];

// 填充所有实际数量
const fillAllQuantities = () => {
  if (!moveDetails.value.items) return;

  moveDetails.value.items.forEach((item) => {
    if (!item.transfer) return;

    item.transfer.forEach((transfer) => {
      if (!transfer.to) return;

      transfer.to.forEach((to) => {
        to.qty = to.quantity - to.actual_qty;
      });
    });
  });
};

// 处理确认移货
const handleConfirmMove = async () => {
  try {
    // 检查是否所有必填的qty都已填写
    const hasEmptyQty = moveDetails.value.items.some((item) =>
      item.transfer.some((transfer) =>
        transfer.to.some((to) => to.qty === "" || to.qty === null)
      )
    );

    if (hasEmptyQty) {
      $q.notify({
        type: "warning",
        message: "请填写所有实际移入数量",
      });
      return;
    }
    let items = [];
    moveDetails.value.items.forEach((item) => {
      item.transfer.forEach((transfer) => {
        transfer.to.forEach((to) => {
          items.push({
            id: to.id,
            qty: to.qty,
          });
        });
      });
    });
    await inventoryApi.confirmMove(moveDetails.value.id, { items: items });
    $q.notify({
      type: "positive",
      message: "移货成功",
    });

    showDetail.value = false;
    getMoveOrderList();
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "移货失败",
    });
  }
};

const openType = ref("move");
// 处理移货按钮点击
const handleDetail = async (row, type) => {
  openType.value = type;
  try {
    const res = await inventoryApi.getMoveOrderDetail(row.id);
    if (res.success) {
      // 初始化数据时，为每个 to 项添加 qty 字段
      const items = res.data.items.map((item) => ({
        ...item,
        transfer: item.transfer.map((transfer) => ({
          ...transfer,
          to: transfer.to.map((to) => ({
            ...to,
            qty: "",
          })),
        })),
      }));

      moveDetails.value = {
        ...res.data,
        items,
      };
      showDetail.value = true;
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      type: "negative",
      message: error.message || "获取移货单详情失败",
    });
    showDetail.value = false;
  }
};

// 状态颜色
const statusColorMap = {
  pending: { bg: "blue-1", text: "blue" },
  partial: { bg: "orange-1", text: "orange" },
  completed: { bg: "green-1", text: "green" },
};
// 添加 showGroupHeader 函数
const showGroupHeader = (row, index) => {
  // 第一行显示标题
  if (index === 0) return true;

  // 如果当前行的group_id与前一行不同，显示标题
  const prevRow = moveList.value[index - 1];
  return prevRow && row.id !== prevRow.id;
};
// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || { bg: "grey-4", text: "grey-8" };
};

// 获取移货类型标签
const getMoveTypeLabel = (type) => {
  const option = moveTypeOptions.find((opt) => opt.value === type);
  return option ? option.label : type;
};

// 获取状态标签
const getStatusLabel = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchParams.value).forEach((key) => {
    searchParams.value[key] = "";
  });
  searchParams.value.page = 1;
  searchParams.value.per_page = 10;
  searchParams.value.total = 0;
  searchParams.value.search_type = "sku";
  searchParams.value.search_mode = "fuzzy";
  getMoveOrderList();
};

// 创建移库单
const createMove = () => {
  // TODO: 实现创建移库单逻辑
  router.push({
    name: "create-move",
  });
};

// 删除移库单
const deleteMove = (row) => {
  $q.dialog({
    title: "确认删除",
    message: "确认删除该移货任务吗？",
    cancel: true,
    persistent: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(() => {
    // TODO: 实现删除逻辑
    inventoryApi.deleteMove(row.id).then((res) => {
      if (res.success) {
        getMoveOrderList();
      }
    });
  });
};

const forcedCompletion = (row) => {
  $q.dialog({
    title: "确认强制完成",
    message: "确认强制完成移货任务吗？",
    cancel: true,
    persistent: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(() => {
    inventoryApi.forcedCompletion(row.id).then((res) => {
      if (res.success) {
        getMoveOrderList();
      }
    });
  });
};

// 计算一个商品的总行数（所有移出货架位的所有移入货架位数量之和）
const getTotalTransferCount = (row) => {
  return row.transfer.reduce((total, transfer) => {
    return total + transfer.to.length;
  }, 0);
};
</script>

<style lang="scss" scoped>
.move-page {
  .select-width {
    width: 150px;
  }

  .date-input {
    width: 150px;
  }
  .nav_sku_list {
    padding: 0 48px;
  }
  .group-header-row {
    background-color: #f8fafc;

    td {
      padding: 8px 16px;
      border-top: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
    }
  }

  :deep(.q-table) {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }

    td {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
    }
  }

  :deep(.q-table__card) {
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .product-info-cell {
    background-color: #fff;
    padding: 12px 16px;

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      > div {
        line-height: 1.4;
      }
    }
  }

  .location-info {
    .text-weight-medium {
      font-size: 14px;
      line-height: 1.4;
    }
  }
}
.move-detail-table {
  :deep(.q-table) {
    border: 1px solid #ebeef5;

    .q-table__container {
      border-radius: 0;
    }

    thead tr {
      background-color: #f5f7fa;
    }

    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      padding: 16px;
      height: 54px;
      border: 1px solid #ebeef5;
    }

    td {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      padding: 8px 16px;
      border: 1px solid #ebeef5;
      background-color: #fff;
      position: relative;

      &[rowspan] {
        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: -1px;
          bottom: 0;
          width: 1px;
          background-color: #ebeef5;
        }
      }
    }

    .product-info-cell {
      .product-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        > div {
          line-height: 1.4;
        }

        .text-weight-medium {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
        }

        .text-grey-8 {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }

    .move-location-cell {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }

    .q-input {
      .q-field__control {
        height: 32px;
        min-height: 32px;
      }
    }
  }
}
.main-table {
  padding-top: 10px;
}
</style>


