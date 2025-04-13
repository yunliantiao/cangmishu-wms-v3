<template>
  <div class="warehouse-warrant">
    <!-- 状态筛选导航 -->
    <div class="status-nav bg-white rounded-borders q-pa-sm q-mb-md">
      <div class="row q-gutter-x-md">
        <q-btn
          v-for="status in statusOptions"
          :key="status.value"
          flat
          :color="statusNav === status.value ? 'primary' : 'grey-7'"
          :label="status.label"
          class="status-btn"
          @click="handleStatusNav(status.value)"
        />
      </div>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="search-bar bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div 
          v-for="filter in filterOptions" 
          :key="filter.field" 
          class="col-auto"
        >
          <q-select
            outlined
            dense
            v-model="filterValues[filter.field]"
            :options="filter.options"
            :label="filter.label"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input
                outlined
                dense
                v-model="dateRange.start"
                :label="dateRange.startLabel"
                readonly
                class="date-input"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateRange.start" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-auto self-center">To</div>
            <div class="col">
              <q-input
                outlined
                dense
                v-model="dateRange.end"
                :label="dateRange.endLabel"
                readonly
                class="date-input"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateRange.end" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-sm q-mt-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="searchConfig.field"
            :options="searchFieldOptions"
            label="入库单号"
          />
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="searchConfig.text"
            placeholder="请输入"
            style="width: 380px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="searchConfig.type"
            :options="searchTypeOptions"
            label="精确搜索"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            label="查询"
            icon="search"
              :loading="$store.state.btnLoading"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="page_table_action">
      <!-- 操作按钮区域 -->
      <div class="row justify-between q-mb-sm">
        <div class="row items-center">
          <span class="q-mr-sm">选择 {{ selectedRows.length }}</span>
          <q-btn
            color="primary"
            label="打印入库单"
            icon="print"
            flat
            class="q-ml-sm"
            :disable="!selectedRows.length"
            @click="handleBatchPrint"
          />
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="warehouseOrders"
          :columns="columns"
          :loading="$store.state.btnLoading"
          row-key="id"
          flat
          bordered
          separator="horizontal"
          selection="multiple"
          v-model:selected="selectedRows"
          hide-pagination
          :pagination="{
            rowsPerPage: pageParams.per_page,
            page: pageParams.page,
            total: pageParams.total
          }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td key="orderInfo" :props="props">
                <div class="column">
                  <div>入库单号: {{ props.row.custom_order_number }}</div>
                  <div>ERP单号: {{ props.row.system_order_number }}</div>
                </div>
              </q-td>
              <q-td key="customer" :props="props">
                {{ props.row.customer.name}}
              </q-td>
              <q-td key="trackingNumber" :props="props">
                <div class="text-primary">{{ props.row.tracking_number || '--' }}</div>
              </q-td>
              <q-td key="arrivalMethod" :props="props">
                {{ props.row.arrival_method }}
              </q-td>
              <q-td key="boxCount" :props="props">
                <div class="text-primary text-weight-medium">{{ props.row.total_box_qty }}</div>
              </q-td>
              <q-td key="skuInfo" :props="props">
                <div class="text-primary">
                  <q-btn
                    v-if="props.row.skuCount > 0"
                    flat
                    dense
                    no-caps
                    color="primary"
                    :label="`多个 (${props.row.skuCount})`"
                    @click="viewSkuDetails(props.row)"
                  />
                  <span v-else>{{ props.row.skuInfo }}</span>
                </div>
              </q-td>
              <q-td key="status" :props="props">
                <q-chip
                  dense
                  :color="getStatusColor(props.row.status).bg"
                  :text-color="getStatusColor(props.row.status).text"
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>
              <q-td key="time" :props="props">
                <div class="text-grey-8 column">
                  <template v-for="(time, type) in getOrderTimes(props.row)" :key="type">
                    <div v-if="time">{{ type }}: {{ time }}</div>
                  </template>
                </div>
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row justify-center q-gutter-xs">
                  <q-btn flat round color="grey-7" icon="add_box" size="sm" @click="signFor(props.row)">
                    <q-tooltip>签收</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="grey-7" icon="fact_check" size="sm" @click="handleVerify(props.row)">
                    <q-tooltip>核验</q-tooltip>
                  </q-btn>
                  <!-- <q-btn flat round color="grey-7" icon="more_horiz" size="sm">
                    <q-menu>
                      <q-list style="min-width: 120px">
                        <q-item clickable v-close-popup @click="viewDetails(props.row)">
                          <q-item-section>详情</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="printOrder(props.row)">
                          <q-item-section>打印</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn> -->
                </div>
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
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import Pagination from "@/components/Pagination.vue";
import inboundApi from "@/api/inbound";

const $q = useQuasar();
const router = useRouter();

// 状态选项配置
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '已预报', value: 'reported' },
  { label: '运输中', value: 'processing' },
  { label: '待入库', value: 'pending' },
  { label: '入库中', value: 'receiving' },
  { label: '已完成', value: 'completed' }
];

// 筛选器配置
const filterOptions = [
  {
    field: 'customer',
    label: '全部客户',
    options: ['全部客户', 'PJ', 'test']
  },
  {
    field: 'approvalStatus',
    label: '全部审核状态',
    options: ['全部审核状态', '待审核', '已审核', '已拒绝']
  },
  {
    field: 'arrivalMethod',
    label: '全部到仓方式',
    options: ['全部到仓方式', '箱', '快递包裹']
  },
  {
    field: 'receiveStatus',
    label: '全部收货状态',
    options: ['全部收货状态', '待入库', '已入库', '已拒收']
  },
  {
    field: 'shelfStatus',
    label: '全部上架状态',
    options: ['全部上架状态', '待上架', '已上架', '部分上架']
  },
  {
    field: 'timeType',
    label: '创建时间',
    options: ['创建时间', '入库时间', '上架时间', '完成时间']
  }
];

// 搜索字段选项
const searchFieldOptions = ['入库单号', 'ERP单号', '运单号'];
const searchTypeOptions = ['精确搜索', '模糊搜索'];

// 状态导航
const statusNav = ref('all');
// 筛选值
const filterValues = reactive({});
// 初始化筛选值
filterOptions.forEach(filter => {
  filterValues[filter.field] = filter.options[0];
});

// 日期范围
const dateRange = reactive({
  start: '2025-01-08',
  end: '2025-04-08',
  startLabel: '2025-01-08',
  endLabel: '2025-04-08'
});

// 搜索配置
const searchConfig = reactive({
  field: '入库单号',
  text: '',
  type: '精确搜索'
});

// 选中行
const selectedRows = ref([]);
// 表格数据
const warehouseOrders = ref([]);

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0
});

// 状态颜色映射
const statusColorMap = {
  '已预报': { bg: 'blue-1', text: 'blue' },
  '运输中': { bg: 'orange-1', text: 'orange' },
  '待入库': { bg: 'purple-1', text: 'purple' },
  '入库中': { bg: 'teal-1', text: 'teal' },
  '已完成': { bg: 'green-1', text: 'green' }
};
// 签收
const signFor = (row) => {
  console.log(row);
  router.push({
    path: '/inbound/sign',
    query: {
      id: row.id
    }
  })
}

// 获取状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || { bg: 'grey-4', text: 'grey-8' };
};

// 获取订单时间信息
const getOrderTimes = (order) => {
  return {
    '创建': order.created_at,
    '预计到达时间': order.estimated_arrival_date,
    '签收': order.sign_at,
    '处理': order.processTime,
    '完成': order.completeTime
  };
};

// 处理状态导航切换
const handleStatusNav = (status) => {
  statusNav.value = status;
  pageParams.page = 1;
  getList();
};

// 处理搜索
const handleSearch = () => {
  pageParams.page = 1;
  getList();
};

// 处理分页变化
const handlePageChange = ({ page, rowsPerPage }) => {
  pageParams.page = page;
  pageParams.per_page = rowsPerPage;
  getList();
};

// 获取列表数据
const getList = async () => {
  const res = await inboundApi.getWarehouseWarrant(pageParams);
  if (res.success) {
    warehouseOrders.value = res.data.items;
    pageParams.total = res.data.meta.total;
    selectedRows.value = [];
  }
};

// 批量打印
const handleBatchPrint = () => {
  if (selectedRows.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: '请先选择要打印的入库单'
    });
    return;
  }
  // TODO: 实现批量打印逻辑
};

// 查看SKU详情
const viewSkuDetails = (row) => {
  // TODO: 实现查看SKU详情逻辑
};

// 查看详情
const viewDetails = (row) => {
  // TODO: 实现查看详情逻辑
};

// 打印单个入库单
const printOrder = (row) => {
  // TODO: 实现打印单个入库单逻辑
};

// 编辑入库单
const handleEdit = (row) => {
  // TODO: 实现编辑入库单逻辑
};

// 复制入库单
const handleCopy = (row) => {
  // TODO: 实现复制入库单逻辑
};

// 核验入库单
const handleVerify = (row) => {
  // TODO: 实现核验入库单逻辑
};

// 表格列配置
const columns = [
  {
    name: 'orderInfo',
    label: '单号',
    field: 'orderInfo',
    align: 'left'
  },
  {
    name: 'customer',
    label: '客户',
    field: 'customer',
    align: 'left'
  },
  {
    name: 'trackingNumber',
    label: '运单号',
    field: 'trackingNumber',
    align: 'left'
  },
  {
    name: 'arrivalMethod',
    label: '到仓方式',
    field: 'arrivalMethod',
    align: 'center'
  },
  {
    name: 'boxCount',
    label: '总箱数',
    field: 'boxCount',
    align: 'center'
  },
  {
    name: 'skuInfo',
    label: 'SKU*Qty',
    field: 'skuInfo',
    align: 'center'
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'center'
  },
  {
    name: 'time',
    label: '时间',
    field: 'time',
    align: 'left'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center'
  }
];

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.warehouse-warrant {
  .status-nav {
    .status-btn {
      min-width: 80px;
      font-size: 14px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }
    }
  }

  .search-bar {
    .select-width {
      width: 150px;
    }

    .date-input {
      width: 150px;
    }
  }

  .q-table {
    th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      background-color: #f5f7fa;
      padding: 12px 16px;
    }

    td {
      font-size: 14px;
      padding: 12px 16px;
      color: rgba(0, 0, 0, 0.75);
      white-space: normal;
    }

    tbody {
      tr {
        &:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }

        .q-btn {
          opacity: 0.7;
          transition: opacity 0.3s ease;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>