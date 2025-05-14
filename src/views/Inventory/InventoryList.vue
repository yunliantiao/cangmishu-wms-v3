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
          <!-- <div class="col-auto">
            <q-select
              outlined
              dense
              v-model="categoryFilter"
              :options="categoryOptions"
              label="全部类目"
              class="select-width"
            />
          </div> -->
          <!-- <div class="col-auto">
            <q-select
              outlined
              dense
              v-model="pageParams.customer_id"
              :options="customerList"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              clearable
              label="客户"
              class="select-width"
            />
          </div> -->
          <div class="col-auto" v-if="currentTab == 'flow'">
            <q-select
              outlined
              dense
              v-model="logTypeFilter"
              :options="logType"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              clearable
              label="类型"
              class="select-width"
            />
          </div>
          <!-- 时间筛选 -->
          <div class="col-auto" v-if="currentTab == 'flow'">
            <DatePickerNew
              v-model:start_date="start_date"
              v-model:end_date="end_date"
              :showSelect="false"
            ></DatePickerNew>
          </div>

          <!-- 关键词搜索模块 -->
          <div class="col-auto">
            <KeywordSearch
              v-model:search_mode="pageParams.search_mode"
              v-model:search_type="pageParams.search_type"
              v-model:search_value="pageParams.keywords"
              :searchTypeList="searchType"
            ></KeywordSearch>
          </div>

          <div class="col-auto">
            <q-btn outline color="grey" label="重置" class="q-mr-sm h-40" @click="resetSearch" />
            <q-btn
              color="primary"
              :loading="$store.state.btnLoading"
              icon="search"
              class="h-40"
              label="搜索"
              @click="onSearch"
            />
          </div>
        </div>
      </div>

      <q-tab-panels v-model="currentTab" animated>
        <!-- TODO: 库存清单 -->
        <q-tab-panel name="list" class="q-pa-none">
          <!-- <div class="tab-buttons q-py-xs">
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
          </div> -->

          <div class="main-table">
            <!-- 操作按钮区域 -->
            <div class="action-bar q-py-md">
              <div class="row items-center justify-between">
                <div>
                  <span class="q-mr-sm">选择 {{ selectedInventory.length }}</span>
                  <!-- <q-btn
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
                /> -->
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
                class="flow-table-style"
                v-model:selected="selectedInventory"
                hide-pagination
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
                  <q-tr :props="props" class="inventory-row">
                    <q-td auto-width>
                      <q-checkbox v-model="props.selected" />
                    </q-td>
                    <q-td key="product_info" style="width: 35%" :props="props">
                      <div class="product-info">
                        <img
                          :src="
                            props.row.image ||
                            'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                          "
                          class="product-img"
                        />
                        <div class="info-container">
                          <div class="text-primary hover-copy" @click="$copy(props.row.sku)">
                            SKU: {{ props.row?.sku }}
                          </div>
                          <div class="text-overflow-1">
                            {{ props.row?.product_name }}
                          </div>
                          <div>规格: {{ props.row?.name }}</div>
                        </div>
                      </div>
                    </q-td>
                    <q-td key="customer_info" :props="props">
                      {{ props.row.customer.name }}
                    </q-td>
                    <q-td key="in_transit_qty" :props="props">
                      <div class="cursor-pointer hover-number" @click="showDrawer('in_transit', props.row)">
                        {{ props.row.in_transit_qty }}
                        <q-icon name="arrow_drop_down" size="xs" class="hover-icon" />
                      </div>
                    </q-td>
                    <q-td key="pending_receipt_qty" :props="props">
                      <div class="cursor-pointer hover-number" @click="showDrawer('pending_receipt', props.row)">
                        {{ props.row.pending_receipt_qty }}
                        <q-icon name="arrow_drop_down" size="xs" class="hover-icon" />
                      </div>
                    </q-td>
                    <q-td key="pending_shelf_qty" :props="props">
                      <div class="cursor-pointer hover-number" @click="showDrawer('pending_shelf', props.row)">
                        {{ props.row.pending_shelf_qty }}
                        <q-icon name="arrow_drop_down" size="xs" class="hover-icon" />
                      </div>
                    </q-td>
                    <q-td key="locked_qty" :props="props">
                      <div class="cursor-pointer hover-number" @click="showDrawer('locked', props.row)">
                        {{ props.row.locked_qty }}
                        <q-icon name="arrow_drop_down" size="xs" class="hover-icon" />
                      </div>
                    </q-td>
                    <q-td key="available_qty" :props="props">
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
          </div>
        </q-tab-panel>
        <!-- TODO: 库存流水面板 -->
        <q-tab-panel name="flow" class="q-pa-none">
          <div class="main-table">
            <!-- 操作按钮区域 -->
            <div class="action-bar q-py-md">
              <div class="row items-center justify-between">
                <div>
                  <span class="q-mr-sm">选择 {{ selectedFlow.length }}</span>
                  <!-- <q-btn
                  color="primary"
                  flat
                  icon="get_app"
                  label="导出"
                  class="q-ml-sm"
                /> -->
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
                separator="horizontal"
                selection="multiple"
                v-model:selected="selectedFlow"
                hide-pagination
                class="flow-table-style"
                :loading="$store.state.btnLoading"
                :pagination="{
                  page: flowParams.page,
                  rowsPerPage: 0,
                }"
              >
                <template v-slot:header="props">
                  <q-tr :props="props" class="flow-header-row">
                    <q-th auto-width>
                      <q-checkbox v-model="props.selected" />
                    </q-th>
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <!-- Group header row -->
                  <template v-if="showGroupHeader(props.row, props.pageIndex)">
                    <q-tr class="group-header-row">
                      <q-td colspan="10">
                        <div class="group-header flex-between-center p-x-10">
                          <div>
                            <span class="info-item q-mr-lg">客户: {{ props.row.customer.name }}</span>
                            <span class="info-item q-mr-lg">类型: {{ props.row.type }}</span>
                          </div>
                          <div>
                            <span class="info-item">时间: {{ props.row.created_at }}</span>
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
                    <q-td key="product_info" style="width: 35%" :props="props">
                      <div class="text-primary hover-copy" @click="$copy(props.row.sku)">SKU: {{ props.row?.sku }}</div>
                      <div class="text-overflow-1">
                        {{ props.row?.product_name }}
                      </div>
                      <div>规格: {{ props.row?.name }}</div>
                    </q-td>
                    <q-td key="relevance_number" :props="props">
                      <div>包裹号: {{ props.row.reference_number }}</div>
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
                      <span>
                        <div
                          v-if="props.row.type == 'adjustment'"
                          :class="{
                            'text-negative': props.row.stock < 0,
                          }"
                        >
                          {{ props.row.stock }}
                        </div>
                        <div
                          v-else
                          :class="{
                            'text-negative': props.row.type != 'inbound',
                          }"
                        >
                          {{ props.row.type == 'inbound' ? '+' : '-' }}{{ props.row.stock }}
                        </div>
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
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- 右侧弹出的对话框 -->
    <q-dialog
      v-model="dialogVisible"
      position="right"
      :maximized="$q.screen.lt.md"
      transition-show="slide-left"
      transition-hide="slide-right"
      full-height
    >
      <q-card style="width: 30vw; max-width: 1400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="dialog-content">
          <div class="product-info q-mb-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="info-item">
                  <span class="label">SKU：</span>
                  <span class="info-value">{{ currentProduct?.sku }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 数量详情表格 -->
          <div class="detail-table">
            <q-table
              :rows="detailData"
              :columns="detailColumns"
              row-key="id"
              flat
              bordered
              :pagination="{ rowsPerPage: 0 }"
              :loading="tableLoading"
              class="detail-table-container"
              :virtual-scroll="detailData.length > 20"
              style="height: calc(100vh - 170px)"
              hide-bottom
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td v-for="col in props.cols" :key="col.name" :props="props">
                    {{ col.value }}
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm q-pa-md text-grey">
                  <q-icon size="2em" name="inbox" />
                  <span>暂无数据</span>
                </div>
              </template>
              <template v-slot:loading>
                <div class="full-width row flex-center q-pa-md">
                  <q-spinner color="primary" size="2em" />
                  <span class="q-ml-sm">加载中...</span>
                </div>
              </template>
            </q-table>
            <div class="q-pa-md">
              <Pagination
                :total-count="detailPageParams.total"
                v-model:page="detailPageParams.page"
                v-model:rows-per-page="detailPageParams.per_page"
                @page-change="getStockDetail"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import customerApi from '@/api/customer';
import inventoryApi from '@/api/inventory';
import DatePickerNew from '@/components/DatePickerNew/Index.vue';
import KeywordSearch from '@/components/KeywordSearch/Index.vue';
import Pagination from '@/components/Pagination.vue';
import { useQuasar } from 'quasar';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

// 标签页切换控制
const currentTab = ref('list'); // list: 库存清单, flow: 库存流水
const inventoryTab = ref('all');

// 库存清单筛选
const categoryFilter = ref('全部类目');
const categoryOptions = ['全部类目', '服装', '电子产品', '家居用品'];
const searchType = ref([
  {
    label: '按SKU',
    value: 'sku',
  },
  {
    label: '按名称',
    value: 'name',
  },
]);
const hideEmpty = ref(false);

const searchTypeOptions = [
  {
    label: '精确搜索',
    value: 'exact',
  },
  {
    label: '模糊搜索',
    value: 'like',
  },
  {
    label: '前缀搜索',
    value: 'prefix',
  },
];

// 库存流水筛选
const start_date = ref('');
const end_date = ref('');
const logTypeFilter = ref('');
const logType = ref([
  {
    label: '入库',
    value: 'inbound',
  },
  {
    label: '出库',
    value: 'outbound',
  },
  {
    label: '退货',
    value: 'return',
  },
  {
    label: '调整库存',
    value: 'adjustment',
  },
  {
    label: '初始库存',
    value: 'initial',
  },
]);
// 选中行
const selectedInventory = ref([]);
const selectedFlow = ref([]);

// 库存清单表格列定义
const inventoryColumns = [
  {
    name: 'product_info',
    label: '商品信息',
    field: 'product_info',
    align: 'left',
  },
  {
    name: 'customer_info',
    label: '客户信息',
    field: 'customer_info',
    align: 'left',
  },
  {
    name: 'in_transit_qty',
    label: '在途数',
    field: 'in_transit_qty',
    align: 'center',
  },
  {
    name: 'pending_receipt_qty',
    label: '待收数',
    field: 'pending_receipt_qty',
    align: 'center',
  },
  {
    name: 'pending_shelf_qty',
    label: '待上架',
    field: 'pending_shelf_qty',
    align: 'center',
  },
  // {
  //   name: "locked_qty",
  //   label: "不可用数",
  //   field: "locked_qty",
  //   align: "center",
  // },
  {
    name: 'locked_qty',
    label: '锁定库存',
    field: 'locked_qty',
    align: 'center',
  },
  {
    name: 'available_qty',
    label: '可用数',
    field: 'available_qty',
    align: 'center',
  },
  {
    name: 'defective_qty',
    label: '不良品数',
    field: 'defective_qty',
    align: 'center',
  },
  {
    name: 'total_qty',
    label: '库存总数',
    field: 'total_qty',
    align: 'center',
  },
];

const onSearch = () => {
  if (currentTab.value == 'list') {
    getInventoryList();
  } else {
    getStockStatement();
  }
};
const resetSearch = () => {
  start_date.value = '';
  end_date.value = '';
  logTypeFilter.value = '';
  pageParams.search_type = 'name';
  pageParams.search_mode = 'exact';
  pageParams.keywords = '';
  onSearch();
};
//
const pageParams = reactive({
  search_type: 'name',
  search_mode: 'exact',
  keywords: '',
});
// 模拟库存清单数据
const inventoryList = ref([]);
// 分页参数
const listParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});
const getInventoryList = () => {
  inventoryApi
    .getInventoryList({
      ...listParams,
      ...pageParams,
    })
    .then((res) => {
      if (res.success) {
        inventoryList.value = res.data.items;
        listParams.total = res.data.meta.total;
      }
    });
};

const customerList = ref([]);
// 获取客户列表
const getCustomerList = async () => {
  const res = await customerApi.getCustomerAll();
  if (res.success) {
    customerList.value = res.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
};

// 库存流水表格列定义
const flowColumns = [
  {
    name: 'product_info',
    label: '商品信息',
    field: 'product_info',
    align: 'left',
  },
  {
    name: 'relevance_number',
    label: '关联单据号',
    field: 'relevance_number',
    align: 'left',
  },
  {
    name: 'source_number',
    label: '来源单据号',
    field: 'source_number',
    align: 'left',
  },
  {
    name: 'batch_number',
    label: '批次号',
    field: 'batch_number',
    align: 'center',
  },
  {
    name: 'location',
    label: '货架位',
    field: 'location',
    align: 'center',
  },
  {
    name: 'original_stock',
    label: '货架位原库存',
    field: 'original_stock',
    align: 'center',
  },
  {
    name: 'stock_change',
    label: '变化数量',
    field: 'stock_change',
    align: 'center',
  },
  {
    name: 'batch_qty',
    label: '批次剩余数量',
    field: 'batch_qty',
    align: 'center',
  },
  {
    name: 'stock_after',
    label: '变动后库存存量',
    field: 'stock_after',
    align: 'center',
  },
];
// 库存流水数据
const flowList = ref([]);

const flowParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});

const getStockStatement = () => {
  inventoryApi
    .getStockStatement({
      ...flowParams,
      ...pageParams,
      log_type: logTypeFilter.value,
      start_date: start_date.value,
      end_date: end_date.value,
    })
    .then((res) => {
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

// 弹窗控制
const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentProduct = ref(null);
const detailData = ref([]);
const detailColumns = ref([
  {
    name: 'relation_number',
    label: '关联单据号',
    field: 'relation_number',
    align: 'left',
  },
  {
    name: 'relation_type',
    label: '类型',
    field: (row) => {
      return row.relation_type === 'standard_inbound' ? '标准入库' : '--';
    },
    align: 'center',
  },
  {
    name: 'relation_qty',
    label: '数量',
    field: 'relation_qty',
    align: 'center',
  },
]);
const tableLoading = ref(false);
const detailPageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
});

// 当前操作的类型
const currentType = ref('');

// 获取详情数据
const getStockDetail = () => {
  tableLoading.value = true;

  if (!currentProduct.value) {
    tableLoading.value = false;
    return;
  }

  switch (currentType.value) {
    case 'in_transit':
      inventoryApi
        .getStockDetail(currentProduct.value.id, {
          ...detailPageParams,
        })
        .then((res) => {
          if (res.success) {
            detailData.value = res.data.items;
            detailPageParams.total = res.data.meta.total;
          }
        })
        .finally(() => {
          tableLoading.value = false;
        });
      break;
    case 'pending_receipt':
      inventoryApi
        .getPendingInboundOrders(currentProduct.value.id, {
          ...detailPageParams,
        })
        .then((res) => {
          if (res.success) {
            detailData.value = res.data.items;
            detailPageParams.total = res.data.meta.total;
          }
        })
        .finally(() => {
          tableLoading.value = false;
        });
      break;
    case 'pending_shelf':
      inventoryApi
        .getPendingShelfOrders(currentProduct.value.id, {
          ...detailPageParams,
        })
        .then((res) => {
          if (res.success) {
            detailData.value = res.data.items;
            detailPageParams.total = res.data.meta.total;
          }
        })
        .finally(() => {
          tableLoading.value = false;
        });
      break;
    case 'locked':
      inventoryApi
        .getLockedStockOrders(currentProduct.value.id, {
          ...detailPageParams,
        })
        .then((res) => {
          if (res.success) {
            detailData.value = res.data.items;
            detailPageParams.total = res.data.meta.total;
          }
        })
        .finally(() => {
          tableLoading.value = false;
        });
      break;
  }
};

const showDrawer = async (type, row) => {
  detailData.value = [];
  currentProduct.value = row;
  currentType.value = type; // 保存当前操作类型
  dialogVisible.value = true;

  // 重置分页参数
  detailPageParams.page = 1;
  detailPageParams.per_page = 10;
  detailPageParams.total = 0;

  switch (type) {
    case 'in_transit':
      dialogTitle.value = '在途数详情';
      break;
    case 'pending_receipt':
      dialogTitle.value = '待收数详情';
      break;
    case 'pending_shelf':
      dialogTitle.value = '待上架详情';
      break;
    case 'locked':
      dialogTitle.value = '锁定库存详情';
      break;
  }

  // 调用统一的获取详情方法
  getStockDetail();
};

onMounted(() => {
  getInventoryList();
  getStockStatement();
  getCustomerList();
});
</script>

<style lang="scss" scoped>
.inventory-page {
  padding: 0;

  .q-tab-panels {
    background-color: transparent;
  }

  .action-bar {
  }

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
      width: 180px;
      margin: 0 !important;

      :deep(.q-field__control) {
        height: 36px;
        background: white;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--q-primary);
        }

        &:focus-within {
          border-color: var(--q-primary);
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
      }

      :deep(.q-field__label) {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        top: 8px;
      }

      :deep(.q-icon) {
        color: rgba(0, 0, 0, 0.45);
        font-size: 20px;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          color: var(--q-primary);
          background: rgba(0, 0, 0, 0.04);
        }
      }
    }

    .date-separator {
      display: flex;
      align-items: center;
      padding: 0 8px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      user-select: none;
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

  .product-info {
    display: flex;
    align-items: flex-start;
    align-items: center;

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
        color: $primary;
        font-size: 14px;
      }

      .product-name {
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  // 对应tr标签
  .group-header-row {
    background-color: #f8fafc;
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    td {
      background-color: #ebeef5;
    }

    .group-header {
      .info-item {
        color: rgba(0, 0, 0, 0.75);
      }
    }
  }

  .inventory-table-style {
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
    th {
      // font-weight: 500;
      // font-size: 13px;
      // color: rgba(0, 0, 0, 0.85);
      // padding: 8px 16px;
      // background-color: #f5f7fa;
      // white-space: nowrap;
      // height: 40px;
    }

    td {
      // font-size: 13px;
      // padding: 8px 12px;
      // color: rgba(0, 0, 0, 0.75);
      white-space: normal;
      // border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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

// :deep(.q-date) {
//   border-radius: 8px;
//   box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

//   .q-date__header {
//     background: var(--q-primary);
//     padding: 16px;
//     border-radius: 8px 8px 0 0;
//   }

//   .q-date__content {
//     padding: 12px;
//   }

//   .q-date__calendar-item {
//     height: 32px;
//     width: 32px;

//     &:hover:not(.q-date__calendar-item--active) {
//       background: rgba(0, 0, 0, 0.04);
//     }

//     &.q-date__calendar-item--active {
//       background: var(--q-primary);
//       color: white;
//       font-weight: 500;
//     }
//   }

//   .q-date__today {
//     color: var(--q-primary);
//     font-weight: 500;
//   }

//   .q-date__navigation {
//     height: 36px;

//     .q-btn {
//       margin: 0 4px;
//       padding: 4px;

//       &:hover {
//         background: rgba(0, 0, 0, 0.04);
//       }
//     }
//   }
// }

// 响应式布局优化
@media (max-width: 600px) {
  .inventory-page {
    .search-bar {
      .date-input {
        width: 140px;
      }

      .date-separator {
        padding: 0 4px;
      }
    }
  }
}

.hover-number {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;

  &:hover {
    background: rgba(var(--q-primary), 0.1);
  }

  .hover-icon {
    opacity: 0;
    margin-left: 2px;
    transition: opacity 0.2s ease;
  }
}

.inventory-row:hover {
  .hover-number .hover-icon {
    opacity: 1;
  }
}

.detail-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 4px;
  overflow: hidden;

  .detail-table-container {
    flex: 1;

    :deep(.q-table) {
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      height: 100%;

      thead tr {
        th {
          font-weight: 500;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.85);
          background: #f5f7fa;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
      }

      tbody tr {
        td {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.65);
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        &:hover {
          background: rgba(0, 0, 0, 0.02);
        }
      }
    }
  }
}

.drawer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding-top: 16px;
  padding-bottom: 16px;
  background: white;
  position: relative;
  z-index: 1;

  .text-h6 {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.custom-backdrop {
  display: none;
}

// 弹窗样式
:deep(.q-dialog__inner) {
  & > div {
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
  }
}

.dialog-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.product-info {
  flex-shrink: 0;
}
</style>
