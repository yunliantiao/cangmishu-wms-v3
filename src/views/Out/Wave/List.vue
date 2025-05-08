<template>
  <div class="wave-list-page">
    <!-- 顶部标签页 -->
    <div class="q-mb-md">
      <q-tabs
        v-model="pageData.filterOptions.status"
        class="text-grey"
        active-color="primary"
        @update:model-value="handleSearch"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="all" label="全部" />
        <q-tab name="pending" label="待拣货" />
        <q-tab name="picking" label="待包装" />
        <q-tab name="packing" label="包装中" />
        <q-tab name="completed" label="已完成" />
        <q-tab name="cancelled" label="已作废" />
      </q-tabs>
    </div>

    <!-- 筛选条件区域 -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="pageData.filterOptions.wave_type"
          :options="pageData.waveTypeOptions"
          label="拣货单类型"
          class="filter-select"
          emit-value
          map-options
        />
      </div>
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="pageData.filterOptions.logistics_group_ids"
          :options="pageData.logisticsGroupOptions"
          label="物流组没有"
          class="filter-select"
          emit-value
          map-options
        />
      </div>
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="pageData.filterOptions.date_type"
          :options="pageData.timeTypeOptions"
          label="时间类型"
          class="filter-select"
          emit-value
          map-options
        >
          <template v-slot:append>
            <q-icon name="schedule" />
          </template>
        </q-select>
      </div>
      <div class="col-auto">
        <q-input
          outlined
          dense
          v-model="pageData.filterOptions.start_date"
          label="开始时间"
          readonly
          class="date-input"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="pageData.filterOptions.start_date"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-auto self-center">To</div>
      <div class="col-auto">
        <q-input
          outlined
          dense
          v-model="pageData.filterOptions.end_date"
          label="结束时间"
          readonly
          class="date-input"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="pageData.filterOptions.end_date"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="pageData.filterOptions.pick_print_status"
          :options="pageData.printStatusOptions"
          label="拣货单打印"
          class="filter-select"
          emit-value
          map-options
        />
      </div>
    </div>
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-select
          outlined
          dense
          v-model="pageData.filterOptions.search_type"
          :options="pageData.waveNumberOptions"
          label="请选择"
          class="filter-select"
          emit-value
          map-options
        />
      </div>
      <div class="col-auto">
        <q-input
          outlined
          dense
          v-model="pageData.filterOptions.keywords"
          label="请输入"
          class="search-input"
        />
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="search"
          label="精确搜索"
          class="q-ml-sm"
          @click="handleSearch"
        />
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="row q-mb-sm items-center">
      <div class="col-auto">
        <span class="q-mr-sm">选择 {{ pageData.selectedRows.length }}</span>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          flat
          v-if="!['all', 'cancelled'].includes(pageData.filterOptions.status)"
          label="打印拣货单"
          icon="print"
          class="q-mr-sm"
          @click="handlePrintPicking"
        />

        <q-btn
          color="primary"
          flat
          label="分配拣货员"
          v-if="pageData.filterOptions.status == 'pending'"
          icon="person"
          class="q-mr-sm"
          @click="handleAssignPicker"
        />
        <q-btn
          color="primary"
          flat
          label="作废波次"
          v-if="['pending', 'picking'].includes(pageData.filterOptions.status)"
          icon="delete"
          class="q-mr-sm"
          @click="handleCancelWave"
        />
        <q-btn-dropdown color="primary" flat label="导出">
          <q-list>
            <q-item clickable v-close-popup @click="handleExport('ids')">
              <q-item-section>按勾选导出</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleExport">
              <q-item-section>按筛选导出</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="col-grow text-right">
        <!-- <q-btn
          color="primary"
          outline
          label="生成时间"
          icon="schedule"
          @click="toggleSortByTime"
        >
          <q-icon name="arrow_downward" size="xs" class="q-ml-xs" />
        </q-btn> -->
      </div>
    </div>

    <!-- 数据表格 -->
    <q-table
      :rows="pageData.waveData"
      :columns="pageData.columns"
      row-key="id"
      flat
      bordered
      separator="horizontal"
      selection="multiple"
      v-model:selected="pageData.selectedRows"
      :pagination="pageData.pagination"
      :loading="pageData.loading"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-model="props.selected" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>
          <q-td key="wave_number" :props="props">
            {{ props.row.wave_number }}
          </q-td>
          <!-- <q-td key="warehouse" :props="props">
            {{ props.row.warehouse }}
          </q-td> -->
          <q-td key="wave_type" :props="props">
            {{ getTypeDesc(props.row.wave_type) }}
          </q-td>
          <q-td key="logistics_group_ids" :props="props">
            {{ props.row.logistics_group_ids }}暂无
          </q-td>
          <q-td key="package_count" :props="props">
            {{ props.row.package_count }}
          </q-td>
          <q-td key="sku_type_count" :props="props">
            {{ props.row.sku_type_count }}
          </q-td>
          <q-td key="item_count" :props="props">
            {{ props.row.item_count }}
          </q-td>
          <q-td key="picker" :props="props">
            {{ props.row.pick_by?.name }}
            <!-- <q-select
              outlined
              dense
              @change="handlePickerChange(props.row)"
              v-model="props.row.pick_by.id"
              :options="pageData.pickerOptions"
              class="picker-select"
            >
            </q-select> -->
          </q-td>
          <q-td key="created_at" :props="props">
            <div>生成:{{ props.row.created_at }}</div>
            <!-- <div v-if="props.row.status != 'pending'">
              拣货:{{ props.row.updated_at }}
            </div> -->
          </q-td>
          <q-td key="status" :props="props">
            {{ getStatusDesc(props.row.status) }}
          </q-td>
          <q-td key="is_print_pick_label" :props="props">
            {{ props.row.is_print_pick_label ? "已打印" : "未打印" }}
          </q-td>
          <q-td key="actions" :props="props">
            <div class="row justify-center q-gutter-xs">
              <q-btn
                flat
                round
                color="grey-7"
                icon="token"
                v-if="['packing', 'picking'].includes(props.row.status)"
                @click="handlePack(props.row)"
              >
                <q-tooltip>开始打包</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="grey-7"
                icon="description"
                @click="handleViewDetails(props.row)"
              >
                <q-tooltip>查看详情</q-tooltip>
              </q-btn>

              <span>
                <q-btn
                  flat
                  round
                  v-if="
                    props.row.status != 'completed' &&
                    props.row.status != 'cancelled'
                  "
                  color="grey-7"
                  icon="print"
                  @click="handlePrint(props.row)"
                >
                  <q-tooltip>打印</q-tooltip>
                </q-btn>
              </span>

              <q-btn
                flat
                round
                color="grey-7"
                v-if="
                  !['completed', 'cancelled', 'packing'].includes(
                    props.row.status
                  )
                "
                icon="no_sim"
                @click="handleAbandon(props.row)"
              >
                <q-tooltip>作废</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>无数据</span>
        </div>
      </template>

      <template v-slot:bottom>
        <div class="row items-center justify-between full-width">
          <div>Total: {{ pageData.pagination.rowsNumber }}</div>
          <div class="row items-center">
            <span class="q-mr-sm"
              >{{ pageData.pagination.page }}/{{
                Math.ceil(
                  pageData.pagination.rowsNumber /
                    pageData.pagination.rowsPerPage
                )
              }}</span
            >
            <q-pagination
              v-model="pageData.pagination.page"
              :max="
                Math.ceil(
                  pageData.pagination.rowsNumber /
                    pageData.pagination.rowsPerPage
                )
              "
              :max-pages="6"
              boundary-links
              direction-links
              @update:model-value="onPageChange"
            />
          </div>
          <div>
            <!-- <q-select
              v-model="pageData.pagination.rowsPerPage"
              :options="[10, 20, 50, 100]"
              label="每页行数"
              dense
              outlined
              options-dense
              style="width: 120px"
              @update:model-value="onPageChange"
            /> -->
          </div>
        </div>
      </template>
    </q-table>
    <PickerUser
      ref="pickerUserRef"
      :pickerOptions="pageData.pickerOptions"
      @confirm="handleConfirmPickerUser"
    ></PickerUser>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import WaveApi from "@/api/wave";
import teamApi from "@/api/team";
import PickerUser from "./components/PickerUser.vue";
import { useQuasar } from "quasar";
import NotifyUtils from "@/utils/message.js";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();

// 所有数据都存储在pageData中
const pageData = reactive({
  // 筛选选项
  filterOptions: {
    wave_type: null,
    status: "pending",
    logistics_group_ids: null,
    date_type: null,
    start_date: "",
    end_date: "",
    pick_print_status: null,
    search_type: "wave_number",
    keywords: "",
  },

  // 表格相关
  loading: false,
  selectedRows: [],
  pagination: {
    page: 1,
    rowsPerPage: 50,
    rowsNumber: 11,
    sortBy: "time",
    descending: true,
  },

  // 表格列定义
  columns: [
    {
      name: "wave_number",
      align: "left",
      label: "波次号",
      field: "wave_number",
    },
    // { name: "warehouse", align: "center", label: "仓库", field: "warehouse" },
    {
      name: "wave_type",
      align: "center",
      label: "波次类型",
      field: "wave_type",
    },
    {
      name: "logistics_group_ids",
      align: "center",
      label: "物流组",
      field: "logistics_group_ids",
    },
    {
      name: "package_count",
      align: "center",
      label: "包裹数量",
      field: "package_count",
    },
    {
      name: "sku_type_count",
      align: "center",
      label: "商品种类",
      field: "sku_type_count",
    },
    {
      name: "item_count",
      align: "center",
      label: "商品数量",
      field: "item_count",
    },
    { name: "picker", align: "center", label: "拣货员", field: "picker" },
    { name: "created_at", align: "center", label: "时间", field: "created_at" },
    // { name: "picker", align: "center", label: "打包员", field: "picker" },
    { name: "status", align: "center", label: "状态", field: "status" },
    {
      name: "is_print_pick_label",
      align: "center",
      label: "拣货单打印",
      field: "is_print_pick_label",
    },
    { name: "actions", align: "center", label: "操作", field: "actions" },
  ],

  // 下拉选项
  waveTypeOptions: [
    { label: "全部波次类型", value: null },
    { label: "单品单件", value: "single_item" },
    { label: "单品多件", value: "multi_items" },
    { label: "多品混包", value: "mixed_items" },
    { label: "爆款包裹", value: "hot_wave" },
  ],

  logisticsGroupOptions: [
    { label: "全部物流组", value: null },
    { label: "物流组 A", value: "group_a" },
    { label: "物流组 B", value: "group_b" },
  ],

  timeTypeOptions: [
    { label: "生成时间", value: "created_at" },
    { label: "拣货时间", value: "picked_at" },
  ],

  printStatusOptions: [
    { label: "已打印", value: "printed" },
    { label: "未打印", value: "unprint" },
  ],

  waveNumberOptions: [
    { label: "波次号", value: "wave_number" },
    { label: "拣货员", value: "picker_name" },
  ],

  pickerOptions: [],

  // 列表数据
  waveData: [],
});

const pickerUserRef = ref(null);
// 页面变化处理
const onPageChange = () => {
  console.log(
    "页面变化:",
    pageData.pagination.page,
    pageData.pagination.rowsPerPage
  );
  initList();
};

// 搜索处理
const handleSearch = () => {
  console.log("搜索条件:", pageData.filterOptions);
  pageData.pagination.page = 1;
  pageData.selectedRows = [];
  initList();
};

// 排序切换
const toggleSortByTime = () => {
  pageData.pagination.descending = !pageData.pagination.descending;
  console.log("排序方向:", pageData.pagination.descending ? "降序" : "升序");
  initList();
};

// 打印拣货单
const handlePrintPicking = async () => {
  if (pageData.selectedRows.length === 0) {
    alert("请选择要打印的波次");
    return;
  }
  console.log("打印拣货单:", pageData.selectedRows);
  let ids = pageData.selectedRows.map((row) => row.id);
  let params = {
    ids,
  };
  const { data } = await WaveApi.batchPrintPicking(params);
  console.log("打印拣货单--1:", data);
  window.open(data.data, "_blank");

  $q.dialog({
    title: "打印结果确认",
    message: "波次:拣货单已成功生成。如果已成功打印，请点击 “标记为已打印”",
    cancel: true,
    persistent: true,
    ok: {
      label: "标记为已打印",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(async () => {
    await WaveApi.batchSetIsPrint(params);
    initList();
  });
};

// 分配拣货员
const handleAssignPicker = () => {
  if (pageData.selectedRows.length === 0) {
    NotifyUtils.tipsMessage("请选择波次");
    return;
  }
  pickerUserRef.value.openDialog();
};

const handleConfirmPickerUser = async (pickerUserId) => {
  if (!pickerUserId) {
    NotifyUtils.tipsMessage("请选择拣货员");
    return;
  }
  console.log("确认拣货员:", pickerUserId);
  const params = {
    ids: pageData.selectedRows.map((row) => row.id),
    picker_user_id: pickerUserId,
  };
  const { data } = await WaveApi.batchAssignPickers(params);
  console.log("分配拣货员:", data);
  pageData.selectedRows = [];
  initList();
};

// 作废波次
const handleCancelWave = () => {
  if (pageData.selectedRows.length === 0) {
    // alert("请选择要作废的波次");
    NotifyUtils.tipsMessage("请选择要作废的波次");
    return;
  }
  let ids = pageData.selectedRows.map((row) => row.id);
  abandon(ids);
};

// 导出
const handleExport = async (str) => {
  let params = {};
  if (str == "ids") {
    let selected = pageData.selectedRows;
    if (!selected.length) {
      NotifyUtils.tipsMessage("请勾选波次");
      return;
    }
    params = {
      ids: selected.map((row) => row.id),
    };
  } else {
    params = getParams();
  }
  const { data } = await WaveApi.exportWave(params);
  console.log("导出:", data);
  window.open(data.data, "_blank");
};
// 打印
const handlePrint = async (row) => {
  const { data } = await WaveApi.printWave(row.id);
  window.open(data.data, "_blank");
  if (!row.is_print_pick_label) {
    $q.dialog({
      title: "打印结果确认",
      message: "波次:拣货单已成功生成。如果已成功打印，请点击 “标记为已打印”",
      cancel: true,
      persistent: true,
      ok: {
        label: "标记为已打印",
        color: "primary",
      },
      cancel: {
        label: "取消",
        color: "grey-7",
      },
    }).onOk(async () => {
      await WaveApi.waveUpdateIsPrint(row.id);
      initList();
    });
  }
};

// 取消打印
const handleCancelPrintPicking = (row) => {
  $q.dialog({
    title: "提示",
    message: "是否确认取消打印？",
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
  }).onOk(async () => {
    await WaveApi.waveCancelIsPrint(row.id);
    initList();
  });
};

// 废弃单个
const handleAbandon = (row) => {
  let ids = [row.id];
  abandon(ids);
};

const abandon = (ids) => {
  $q.dialog({
    title: "提示",
    message: "确认作废所选波次?",
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
  }).onOk(async () => {
    await WaveApi.abandonWave({ ids });
    initList();
  });
};

// 查看详情
const handleViewDetails = (row) => {
  console.log("查看波次详情:", row);
  router.push({
    path: "/out/wave/info",
    query: { id: row.id },
  });
};

const handlePack = (row) => {
  // 多品混包 需要分拣台
  if (row.wave_type == "mixed_items") {
    router.push({
      path: "/out/wave/pigeonholes",
    });
  } else {
    router.push({
      path: "/out/wave/packaging",
      query: {
        wave_number: row.wave_number,
      },
    });
  }
};

onMounted(() => {
  // 初始化加载数据
  console.log("页面加载完成，初始化数据");
  initList();
  getPikerUserList();
});

const getPikerUserList = async () => {
  const { data } = await teamApi.getStaffList({ page: 1, per_page: 999 });
  console.log("picker", data);

  pageData.pickerOptions = data.data.map((row) => {
    return {
      label: row.fullname,
      value: row.user_id,
    };
  });
};

const getParams = () => {
  let params = {
    ...pageData.filterOptions,
    page: pageData.pagination.page,
    per_page: pageData.pagination.rowsPerPage,
    sort_by: pageData.pagination.sortBy,
    sort_desc: pageData.pagination.descending ? 1 : 0,
  };
  return params;
};

const initList = async () => {
  pageData.loading = true;

  try {
    const params = getParams();
    if (params.status == "all") {
      delete params.status;
    }

    const { data } = await WaveApi.getWaveList(params);
    console.log("data", data);

    if (data && data.data) {
      pageData.waveData = data.data;
      pageData.pagination.rowsNumber = data.meta.total || 0;
    }
  } catch (error) {
    console.error("获取波次列表失败:", error);
  } finally {
    pageData.loading = false;
  }
};

const getTypeDesc = (type) => {
  const typeMap = {
    single_item: "单品单件",
    multi_items: "单品多件",
    mixed_items: "多品混包",
    hot_wave: "爆款包裹",
  };
  return typeMap[type] || "未知";
};

const getStatusDesc = (status) => {
  const statusMap = {
    pending: "待拣货",
    picking: "待包装",
    packing: "包装中",
    completed: "已完成",
    cancelled: "已作废",
  };
  return statusMap[status] || "未知";
};
</script>

<style scoped>
.wave-list-page {
  width: 100%;
}

.filter-select {
  width: 200px;
}

.date-input {
  width: 150px;
}

.search-input {
  width: 200px;
}

.picker-select {
  width: 150px;
}

/* 表格样式优化 */
:deep(.q-table th) {
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

:deep(.q-table td) {
  font-size: 14px;
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.75);
}

:deep(.q-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>