<template>
  <div class="inventory-page">
    <div class="tab-header">
      <q-tabs
        v-model="currentTab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="list" label="库存清单" />
        <q-tab name="flow" label="库存流水" />
      </q-tabs>
      <q-separator />
    </div>
    <!-- 顶部标签页 -->
    <div class="tabs-container q-pa-none">
      <div class="search-bar q-pa-md">
        <div class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-select
              outlined
              dense
              v-model="categoryFilter"
              :options="categoryOptions"
              label="全部类目"
              class="select-width"
            />
          </div>
          <div class="col-auto">
            <q-select
              outlined
              dense
              v-model="customerFilter"
              :options="customerOptions"
              label="全部客户"
              class="select-width"
            />
          </div>
          <div class="col-auto">
            <q-input
              outlined
              dense
              v-model="skuFilter"
              label="商品SKU"
              class="select-width"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn color="primary" flat icon="search" label="精确搜索" />
          </div>
        </div>
      </div>

      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="list" class="q-pa-none page_table_action">
          <div class="tab-buttons q-py-xs">
            <q-tabs
              v-model="inventoryTab"
              dense
              class="text-primary"
              active-color="primary"
              indicator-color="primary"
              align="left"
              narrow-indicator
            >
              <q-tab name="all" label="全部" />
              <q-tab name="picked" label="拣货区" />
              <q-tab name="reserved" label="备货区" />
              <q-tab name="defective" label="不良品区" />
            </q-tabs>
          </div>

          <!-- 操作按钮区域 -->
          <div class="action-bar q-px-sm page_table_action q-py-xs">
            <div class="row items-center justify-between">
              <div>
                <span class="q-mr-sm">选择 {{ selectedInventory.length }}</span>
                <q-btn
                  color="primary"
                  flat
                  icon="get_app"
                  label="导出"
                  class="q-ml-sm"
                />
                <q-btn
                  color="primary"
                  flat
                  icon="print"
                  label="打印标签"
                  class="q-ml-sm"
                />
              </div>
            </div>
          </div>

          <!-- 库存清单表格 -->
          <div class="inventory-table bg-white">
            <q-table
              :rows="inventoryList"
              :columns="inventoryColumns"
              row-key="id"
              flat
              bordered
              separator="horizontal"
              selection="multiple"
              v-model:selected="selectedInventory"
              hide-pagination
              class="inventory-table-style"
              :loading="$store.state.btnLoading"
              :pagination="{
                page: listParams.page,
                rowsPerPage: 0,
              }"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-th>
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="{
                      'text-right': col.align === 'right',
                    }"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-td>
                  <q-td key="product_info" :props="props">
                    <div class="product-info">
                      <img :src="props.row.image" class="product-img" />
                      <div class="info-container">
                        <div class="sku-code">编号：{{ props.row.sku }}</div>
                        <div class="sku-code">SKU：{{ props.row.sku }}</div>
                        <div class="product-name">
                          名称：{{ props.row.product_name }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                  <q-td key="customer_info" :props="props">
                    {{ props.row.customer.name }}
                  </q-td>
                  <q-td key="in_transit_qty" :props="props">
                    {{ props.row.in_transit_qty }}
                  </q-td>
                  <q-td key="pending_receipt_qty" :props="props">
                    {{ props.row.pending_receipt_qty }}
                  </q-td>
                  <q-td key="pending_shelf_qty" :props="props">
                    {{ props.row.pending_shelf_qty }}
                  </q-td>
                  <q-td key="locked_qty" :props="props">
                    {{ props.row.locked_qty }}
                  </q-td>
                  <q-td
                    key="available_qty"
                    :props="props"
                    class="text-weight-bold"
                  >
                    {{ props.row.available_qty }}
                  </q-td>
                  <q-td key="defective_qty" :props="props">
                    {{ props.row.defective_qty }}
                  </q-td>
                  <q-td key="total_qty" :props="props">
                    {{ props.row.total_qty }}
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm">
                  <q-icon size="2em" name="sentiment_dissatisfied" />
                  <span>暂无数据</span>
                </div>
              </template>
            </q-table>
            <div class="q-pa-md">
              <Pagination
                :total-count="listParams.total"
                v-model:page="listParams.page"
                v-model:rows-per-page="listParams.per_page"
                @page-change="getInventoryList"
              />
            </div>
          </div>
        </q-tab-panel>
        <!-- 库存流水面板 -->
        <q-tab-panel name="flow" class="q-pa-none page_table_action">
          <!-- 操作按钮区域 -->
          <div class="action-bar q-px-sm q-py-xs">
            <div class="row items-center justify-between">
              <div>
                <span class="q-mr-sm">选择 {{ selectedFlow.length }}</span>
                <q-btn
                  color="primary"
                  flat
                  icon="get_app"
                  label="导出"
                  class="q-ml-sm"
                />
              </div>
              <div>
                <!-- <q-btn outline color="primary" icon="today" label="创建时间">
                  <q-icon name="arrow_downward" size="xs" />
                </q-btn> -->
              </div>
            </div>
          </div>

          <!-- 库存流水表格 -->
          <div class="flow-table bg-white">
            <q-table
              :rows="flowList"
              :columns="flowColumns"
              row-key="id"
              flat
              bordered
              separator="horizontal"
              selection="multiple"
              v-model:selected="selectedFlow"
              hide-pagination
              class="inventory-table-style flow-table-style"
              :loading="$store.state.btnLoading"
              :pagination="{
                page: flowParams.page,
                rowsPerPage: 0
              }"
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="flow-header-row">
                  <q-th auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-th>
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <!-- Group header row -->
                <template v-if="showGroupHeader(props.row, props.pageIndex)">
                  <q-tr class="group-header-row">
                    <q-td colspan="10">
                      <div class="row group-header items-center">
                        <div class="col-12 flex justify-between">
                          <div>
                            <span class="info-item q-mr-md"
                              >客户: {{ props.row.customer.name }} [{{
                                props.row.customer.code
                              }}]</span
                            >
                            <span class="info-item q-mr-md"
                              >类型: {{ props.row.type }}</span
                            >
                          </div>
                          <div>
                            <span class="info-item"
                              >时间: {{ props.row.created_at }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </q-td>
                  </q-tr>
                </template>

                <!-- Data row -->
                <q-tr :props="props" class="data-row">
                  <q-td auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-td>
                  <q-td key="product_info" style="width: 200px" :props="props">
                    <div>
                      <!-- 编号: {{ props.row.sku}}<br /> -->
                      SKU: {{ props.row.sku }}<br />
                      名称: {{ props.row.product_name }}
                    </div>
                  </q-td>
                  <q-td key="relevance_number" :props="props">
                    <div>
                      <!-- 订单号: {{ props.row.}}<br /> -->
                      包裹号: {{ props.row.reference_number }}
                    </div>
                  </q-td>
                  <q-td key="source_number" :props="props">
                    {{ props.row.package_number }}
                  </q-td>
                  <q-td key="batch_number" :props="props">
                    {{ props.row.inbound_batch_number }}
                  </q-td>
                  <q-td key="location" :props="props">
                    {{ props.row.warehouse_location_code }}
                  </q-td>
                  <q-td key="original_stock" :props="props">
                    {{ props.row.orgin_stock }}
                  </q-td>
                  <q-td key="stock_change" :props="props">
                    <span
                      :class="{
                        'text-negative': props.row.type != 'inbound',
                      }"
                    >
                      {{ props.row.type == "inbound" ? "+" : "-"
                      }}{{ props.row.stock }}
                    </span>
                  </q-td>
                  <q-td key="batch_qty" :props="props">
                    {{ props.row.inbound_batch_stock_after }}
                  </q-td>
                  <q-td key="stock_after" :props="props">
                    {{ props.row.stock_after }}
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm">
                  <q-icon size="2em" name="sentiment_dissatisfied" />
                  <span>暂无数据</span>
                </div>
              </template>
            </q-table>

            <!-- 分页 -->
            <div class="q-pa-md">
              <Pagination
                :total-count="flowParams.total"
                v-model:page="flowParams.page"
                v-model:rows-per-page="flowParams.per_page"
                @page-change="getStockStatement"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import inventoryApi from "@/api/inventory";
import Pagination from "@/components/Pagination.vue";

const $q = useQuasar();
const router = useRouter();

// 标签页切换控制
const currentTab = ref("list");
const inventoryTab = ref("all");

// 库存清单筛选
const categoryFilter = ref("全部类目");
const categoryOptions = ["全部类目", "服装", "电子产品", "家居用品"];
const customerFilter = ref("全部客户");
const customerOptions = ["全部客户", "PJ", "test", "Freddie79"];
const skuFilter = ref("");
const hideEmpty = ref(false);

// 库存流水筛选
const typeFilterFlow = ref("全部类型");
const typeOptions = ["全部类型", "入库", "出库", "盘点调整", "库存调整"];
const startDate = ref("2025-04-01");
const endDate = ref("2025-04-08");
const skuFilterFlow = ref("");

// 选中行
const selectedInventory = ref([]);
const selectedFlow = ref([]);

// 库存清单表格列定义
const inventoryColumns = [
  {
    name: "product_info",
    label: "商品信息",
    field: "product_info",
    align: "left",
  },
  {
    name: "customer_info",
    label: "客户信息",
    field: "customer_info",
    align: "left",
  },
  {
    name: "in_transit_qty",
    label: "在途数",
    field: "in_transit_qty",
    align: "center",
  },
  {
    name: "pending_receipt_qty",
    label: "待收数",
    field: "pending_receipt_qty",
    align: "center",
  },
  {
    name: "pending_shelf_qty",
    label: "待上架",
    field: "pending_shelf_qty",
    align: "center",
  },
  {
    name: "locked_qty",
    label: "不可用数",
    field: "locked_qty",
    align: "center",
  },
  {
    name: "available_qty",
    label: "可用数",
    field: "available_qty",
    align: "center",
  },
  {
    name: "defective_qty",
    label: "不良品数",
    field: "defective_qty",
    align: "center",
  },
  {
    name: "total_qty",
    label: "库存总数",
    field: "total_qty",
    align: "center",
  },
];
// 模拟库存清单数据
const inventoryList = ref([]);
// 分页参数
const listParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});
const getInventoryList = () => {
  inventoryApi.getInventoryList(listParams).then((res) => {
    if (res.success) {
      inventoryList.value = res.data.items;
      listParams.total = res.data.meta.total;
    }
  });
};

// 库存流水表格列定义
const flowColumns = [
  {
    name: "product_info",
    label: "商品信息",
    field: "product_info",
    align: "left",
  },
  {
    name: "relevance_number",
    label: "关联单据号",
    field: "relevance_number",
    align: "left",
  },
  {
    name: "source_number",
    label: "来源单据号",
    field: "source_number",
    align: "left",
  },
  {
    name: "batch_number",
    label: "批次号",
    field: "batch_number",
    align: "center",
  },
  {
    name: "location",
    label: "货架位",
    field: "location",
    align: "center",
  },
  {
    name: "original_stock",
    label: "货架位原库存",
    field: "original_stock",
    align: "center",
  },
  {
    name: "stock_change",
    label: "变化数量",
    field: "stock_change",
    align: "center",
  },
  {
    name: "batch_qty",
    label: "批次剩余数量",
    field: "batch_qty",
    align: "center",
  },
  {
    name: "stock_after",
    label: "变动后库存存量",
    field: "stock_after",
    align: "center",
  },
];
// 库存流水数据
const flowList = ref([
  // {
  //   id: "2304070001",
  //   reference_number: "REF20250407001",
  //   package_number: "PN3HB00006",
  //   batch_number: "BO20250401001",
  //   warehouse_location_code: "B-02-01",
  //   orgin_stock: 40,
  //   stock: -4,
  //   batch_qty: 36,
  //   stock_after: 36,
  //   createdAt: "2025-04-07 02:32:41",
  //   group_id: 1,
  //   group_info: {
  //     warehouse: "USC",
  //     customer: "PJ",
  //     customer_code: "CNO3HB00003",
  //     type: "销售出库",
  //     time: "2025-04-07 02:32",
  //   },
  // },
]);

const flowParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});

const getStockStatement = () => {
  inventoryApi.getStockStatement(flowParams).then((res) => {
    if (res.success) {
      flowList.value = res.data.items;
      flowParams.total = res.data.meta.total;
    }
  });
};

// In the script section, add the following function near other methods (after the flowList declaration)
const showGroupHeader = (row, index) => {
  // Show group header for first row
  if (index === 0) return true;

  const prevRow = flowList.value[index - 1];
  return prevRow && row.id !== prevRow.id;
};

onMounted(() => {
  getInventoryList();
  getStockStatement();
});
</script>

<style lang="scss" scoped>
.inventory-page {
  padding: 0;

  .tabs-container {
    border-radius: 4px;
    overflow: hidden;
  }

  .tab-header {
    margin-bottom: 16px;
    .q-tabs {
      height: 40px;
    }

    .q-tab {
      min-height: 40px;
      padding: 0 24px;
    }

    .q-tab--active {
      font-weight: 500;
    }
  }

  .search-bar {
    padding: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background-color: #ffffff;

    .select-width {
      width: 150px;
    }

    .date-input {
      width: 150px;
    }
  }

  .tab-buttons {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .q-tabs {
      height: 36px;
    }

    .q-tab {
      min-height: 36px;
    }
  }

  .action-bar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    // background-color: #f5f7fa;
  }

  .inventory-table-style {
    border: 1px solid rgba(0, 0, 0, 0.07);

    th {
      font-weight: 500;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.85);
      padding: 8px 16px;
      background-color: #f5f7fa;
      white-space: nowrap;
      height: 42px;
    }

    td {
      font-size: 13px;
      padding: 8px 16px;
      color: rgba(0, 0, 0, 0.75);
      white-space: normal;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      height: 48px;
    }

    .q-checkbox {
      width: 32px;
    }

    tbody tr {
      &:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.01);
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &.selected {
        background-color: rgba(25, 118, 210, 0.05);
      }
    }

    .product-info {
      display: flex;
      align-items: flex-start;

      .product-img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        object-fit: cover;
      }

      .info-container {
        display: flex;
        flex-direction: column;

        .sku-code {
          font-weight: 500;
          margin-bottom: 2px;
          color: rgba(0, 0, 0, 0.85);
        }

        .product-name {
          color: rgba(0, 0, 0, 0.6);
          font-size: 12px;
        }
      }
    }

    .text-negative {
      color: #f44336;
    }

    td.bg-blue-1 {
      background-color: rgba(33, 150, 243, 0.08);
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
    }

    th.bg-blue-1 {
      background-color: rgba(33, 150, 243, 0.1);
    }
  }

  .q-pa-md .row.items-center.justify-end {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 12px;
  }

  .flow-table-style {
    border: 1px solid rgba(0, 0, 0, 0.07);

    th {
      font-weight: 500;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.85);
      padding: 8px 16px;
      background-color: #f5f7fa;
      white-space: nowrap;
      height: 40px;
    }

    td {
      font-size: 13px;
      padding: 8px 12px;
      color: rgba(0, 0, 0, 0.75);
      white-space: normal;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .group-header-row {
      background-color: #f8fafc;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      td {
        padding: 10px 16px;
        background-color: #ebeef5;
      }
    }

    .group-header {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      font-size: 13px;

      .info-item {
        color: rgba(0, 0, 0, 0.75);
        padding-right: 8px;
        text-align: right;
      }
    }

    .data-row {
      background-color: #ffffff;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }

    .text-negative {
      color: #f56c6c;
      font-weight: 500;
    }

    .q-checkbox {
      margin: 0 8px;
    }
  }
}
</style> 