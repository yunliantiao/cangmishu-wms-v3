<template>
  <div class="wave-list-page">
    <!-- 顶部标签页 -->
    <div class="search-bar" style="padding-top: 10px">
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
          <q-tab name="all" :label="trans('全部')" />
          <q-tab name="pending" :label="trans('待拣货')" />
          <q-tab name="picking" :label="trans('待包装')" />
          <q-tab name="packing" :label="trans('包装中')" />
          <q-tab name="completed" :label="trans('已完成')" />
          <q-tab name="cancelled" :label="trans('已作废')" />
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
            :label="trans('拣货单类型')"
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
            :label="trans('物流组没有')"
            class="filter-select"
            emit-value
            map-options
          />
        </div>
        <DatePickerNew
          v-model:date_type="pageData.filterOptions.date_type"
          v-model:start_date="pageData.filterOptions.start_date"
          v-model:end_date="pageData.filterOptions.end_date"
          :dateList="pageData.timeTypeOptions"
        ></DatePickerNew>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageData.filterOptions.pick_print_status"
            :options="pageData.printStatusOptions"
            :label="trans('拣货单打印')"
            class="filter-select"
            emit-value
            map-options
          />
        </div>

        <KeywordSearch
          v-model:search_type="pageData.filterOptions.search_type"
          v-model:search_value="pageData.filterOptions.keywords"
          v-model:search_mode="pageData.filterOptions.search_mode"
          :searchTypeList="pageData.waveNumberOptions"
          :searchModeList="searchModeOptions"
        ></KeywordSearch>

        <div class="col-auto">
          <q-btn
            color="primary"
            :label="trans('查询')"
            class="filter-btn"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>
    <!-- 操作按钮区域 -->
    <div class="main-table">
      <div class="col-auto">
        <q-btn
          color="primary"
          flat
          v-if="!['all', 'cancelled'].includes(pageData.filterOptions.status)"
          :label="trans('打印拣货单')"
          icon="print"
          class="q-mr-sm"
          @click="handlePrintPicking"
        />

        <q-btn
          color="primary"
          flat
          :label="trans('分配拣货员')"
          v-if="pageData.filterOptions.status == 'pending'"
          icon="person"
          class="q-mr-sm"
          @click="handleAssignPicker"
        />
        <q-btn
          color="primary"
          flat
          :label="trans('作废波次')"
          v-if="['pending', 'picking'].includes(pageData.filterOptions.status)"
          icon="delete"
          class="q-mr-sm"
          @click="handleCancelWave"
        />
        <q-btn-dropdown color="primary" flat :label="trans('导出')">
          <q-list>
            <q-item clickable v-close-popup @click="handleExport('ids')">
              <q-item-section>{{ trans("按勾选导出") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleExport">
              <q-item-section>{{ trans("按筛选导出") }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <q-table
        :rows="pageData.waveData"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        selection="multiple"
        v-model:selected="pageData.selectedRows"
        class="global-mt"
        :pagination="pageData.pagination"
        :loading="pageData.loading"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width>
              <q-checkbox v-model="props.selected" size="sm" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" align="center">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" size="sm" />
            </q-td>
            <q-td key="wave_number" :props="props">
              <span class="hover-copy" @click="$copy(props.row.wave_number)">
                {{ props.row.wave_number }}
              </span>
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
            </q-td>
            <q-td key="status" :props="props">
              {{ getStatusDesc(props.row.status) }}
            </q-td>

            <q-td key="pack_by" :props="props">
              {{ props.row.pack_by?.name }}
            </q-td>
            <q-td key="created_at" :props="props">
              <div>{{ trans("生成") }}:{{ props.row.created_at }}</div>
            </q-td>

            <q-td key="is_print_pick_label" :props="props">
              <!-- {{
                props.row.is_print_pick_label
                  ? trans("已打印")
                  : trans("未打印")
              }} -->

              <span class="table-icon">
                <img
                  src="@/assets/images/print-success.png"
                  v-if="props.row.is_print_pick_label"
                />
                <img src="@/assets/images/print.png" v-else />
              </span>
            </q-td>
            <q-td key="actions" :props="props">
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  class="table-icon"
                  :disable="props.row.pack_by && !props.row.pack_by?.is_self"
                  v-if="['packing', 'picking'].includes(props.row.status)"
                  @click="handlePack(props.row)"
                >
                  <img src="@/assets/images/package.png" />
                  <q-tooltip>{{ trans("开始打包") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  size="sm"
                  class="table-icon"
                  @click="handleViewDetails(props.row)"
                >
                  <img src="@/assets/images/detail.png" />
                  <q-tooltip>{{ trans("查看详情") }}</q-tooltip>
                </q-btn>

                <span>
                  <q-btn
                    flat
                    round
                    v-if="
                      props.row.status != 'completed' &&
                      props.row.status != 'cancelled'
                    "
                    size="sm"
                    class="table-icon"
                    @click="handlePrint(props.row)"
                  >
                    <img src="@/assets/images/print.png" />
                    <q-tooltip>{{ trans("打印") }}</q-tooltip>
                  </q-btn>
                </span>

                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  v-if="
                    !['completed', 'cancelled', 'packing'].includes(
                      props.row.status
                    )
                  "
                  class="table-icon"
                  @click="handleAbandon(props.row)"
                >
                  <img src="@/assets/images/del.png" class="" />
                  <q-tooltip>{{ trans("作废") }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("无数据") }}</span>
          </div>
        </template>

        <template v-slot:bottom>
          <div class="row items-center justify-between full-width">
            <Pagination
              :total-count="pageData.pagination.rowsNumber"
              v-model:page="pageData.pagination.page"
              v-model:rows-per-page="pageData.pagination.rowsPerPage"
              @page-change="onPageChange"
            />
          </div>
        </template>
      </q-table>
    </div>

    <!-- 数据表格 -->

    <PickerUser
      ref="pickerUserRef"
      :pickerOptions="pageData.pickerOptions"
      @confirm="handleConfirmPickerUser"
    ></PickerUser>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from "vue";
import WaveApi from "@/api/wave";
import teamApi from "@/api/team";
import PickerUser from "./components/PickerUser.vue";
import { useQuasar } from "quasar";
import NotifyUtils from "@/utils/message.js";
import { useRouter } from "vue-router";
import DatePickerNew from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import Message from "@/utils/message.js";
import trans from "@/i18n";
import Pagination from "@/components/Pagination.vue";
import { useStore } from "vuex";
const store = useStore();

const $q = useQuasar();
const router = useRouter();

// 所有数据都存储在pageData中
const pageData = reactive({
  // 筛选选项
  filterOptions: {
    wave_type: null,
    status: "pending",
    logistics_group_ids: null,
    date_type: "created_at",
    start_date: "",
    end_date: "",
    pick_print_status: null,
    search_type: "wave_number",
    keywords: "",
    search_mode: "exact",
  },

  // 表格相关
  loading: false,
  selectedRows: [],
  pagination: {
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10,
    sortBy: "time",
    descending: true,
  },

  // 下拉选项
  waveTypeOptions: [
    { label: trans("全部波次类型"), value: null },
    { label: trans("单品单件"), value: "single_item" },
    { label: trans("单品多件"), value: "multi_items" },
    { label: trans("多品混包"), value: "mixed_items" },
    { label: trans("爆款包裹"), value: "hot_wave" },
  ],

  logisticsGroupOptions: [
    { label: trans("全部物流组"), value: null },
    { label: trans("物流组 A"), value: "group_a" },
    { label: trans("物流组 B"), value: "group_b" },
  ],

  timeTypeOptions: [
    { label: trans("生成时间"), value: "created_at" },
    { label: trans("拣货时间"), value: "picked_at" },
  ],

  printStatusOptions: [
    { label: trans("已打印"), value: "printed" },
    { label: trans("未打印"), value: "unprint" },
  ],

  waveNumberOptions: [
    { label: trans("波次号"), value: "wave_number" },
    { label: trans("拣货员"), value: "picker_name" },
  ],

  pickerOptions: [],

  // 列表数据
  waveData: [],
});

const searchModeOptions = computed(() => {
  return store.state.searchModeOptions.map((item) => {
    return { label: trans(item.label), value: item.value };
  });
});

const pickerUserRef = ref(null);
// 表格列定义
const columns = computed(() => {
  let list = [
    {
      name: "wave_number",
      align: "left",
      label: trans("波次号"),
      field: "wave_number",
    },
    {
      name: "wave_type",
      align: "center",
      label: trans("波次类型"),
      field: "wave_type",
    },
    {
      name: "logistics_group_ids",
      align: "center",
      label: trans("物流组"),
      field: "logistics_group_ids",
    },
    {
      name: "package_count",
      align: "center",
      label: trans("包裹数量"),
      field: "package_count",
    },
    {
      name: "sku_type_count",
      align: "center",
      label: trans("商品种类"),
      field: "sku_type_count",
    },
    {
      name: "item_count",
      align: "center",
      label: trans("商品数量"),
      field: "item_count",
    },
    {
      name: "picker",
      align: "center",
      label: trans("拣货员"),
      field: "picker",
    },
    {
      name: "status",
      align: "center",
      label: trans("状态"),
      field: "status",
    },
    {
      name: "pack_by",
      align: "center",
      label: trans("打包员"),
      field: "pack_by",
    },
    {
      name: "created_at",
      align: "center",
      label: trans("时间"),
      field: "created_at",
    },
    {
      name: "is_print_pick_label",
      align: "center",
      label: trans("拣货单打印"),
      field: "is_print_pick_label",
    },
    {
      name: "actions",
      align: "center",
      label: trans("操作"),
      field: "actions",
    },
  ];

  return list;
});
// 页面变化处理
const onPageChange = () => {
  console.log(
    trans("页面变化"),
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
    Message.notify("请选择波次");
    return;
  }
  console.log("打印拣货单:", pageData.selectedRows);
  let ids = pageData.selectedRows.map((row) => row.id);
  let params = {
    ids,
  };
  const { data } = await WaveApi.batchPrintPicking(params);
  window.open(data.data, "_blank");

  $q.dialog({
    title: trans("打印结果确认"),
    message: trans(
      "波次:拣货单已成功生成。如果已成功打印，请点击 “标记为已打印”"
    ),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("标记为已打印"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
    NotifyUtils.tipsMessage(trans("请选择波次"));
    return;
  }
  pickerUserRef.value.openDialog();
};

const handleConfirmPickerUser = async (pickerUserId) => {
  if (!pickerUserId) {
    NotifyUtils.tipsMessage(trans("请选择拣货员"));
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
    NotifyUtils.tipsMessage(trans("请选择要作废的波次"));
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
      NotifyUtils.tipsMessage(trans("请勾选波次"));
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
      title: trans("打印结果确认"),
      message: trans(
        "波次:拣货单已成功生成。如果已成功打印，请点击 “标记为已打印”"
      ),
      cancel: true,
      persistent: true,
      ok: {
        label: trans("标记为已打印"),
        color: "primary",
      },
      cancel: {
        label: trans("取消"),
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
    title: trans("提示"),
    message: trans("是否确认取消打印？"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
    title: trans("提示"),
    message: trans("确认作废所选波次?"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
      query: {
        number: row.wave_number,
      },
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
    single_item: trans("单品单件"),
    multi_items: trans("单品多件"),
    mixed_items: trans("多品混包"),
    hot_wave: trans("爆款包裹"),
  };
  return typeMap[type] || trans("未知");
};

const getStatusDesc = (status) => {
  const statusMap = {
    pending: trans("待拣货"),
    picking: trans("待包装"),
    packing: trans("包装中"),
    completed: trans("已完成"),
    cancelled: trans("已作废"),
  };
  return statusMap[status] || trans("未知");
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
.main-table {
  padding-top: 20px;
}
</style>