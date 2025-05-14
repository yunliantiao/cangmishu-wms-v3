<template>
  <div class="wave-info-page">
    <div class="page-header">
      <div class="row items-center">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="q-mr-sm"
          @click="goBack"
        />
        <div class="text-h6">{{ trans("波次详情") }}</div>
        <q-space />
      </div>
    </div>

    <!-- 波次基本信息卡片 -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row justify-between">
          <div class="col-auto info-left">
            <div class="text-h6">{{ pageData.waveInfo?.wave_number }}</div>
            <div class="text-subtitle2">
              {{ getWaveTypeText(pageData.waveInfo?.wave_type) }}
            </div>
            <div
              class="text-subtitle2"
              :class="getStatusClass(pageData.waveInfo?.status)"
            >
              {{ pageData.status_name }}
            </div>

            <div
              class="flex justify-center items-center"
              style="gap: 10px"
              v-if="pageData.waveInfo != 'cancelled'"
            >
              <q-btn
                v-if="
                  !['completed', 'cancelled'].includes(
                    pageData.waveInfo?.status
                  )
                "
                outline
                :label="trans('作废波次')"
                @click="abandonWave"
              />
              <q-btn
                color="primary"
                :label="trans('打印拣货单')"
                @click="printPick"
              />
            </div>
          </div>
          <div class="col-auto info-right">
            <div class="text-subtitle2 justify-between flex">
              <div>
                {{ trans("物流组") }}:
                {{ pageData.waveInfo?.logistics_group || "-" }}
              </div>
              <div class="text-right">
                {{ pageData.waveInfo?.warehouse || "-" }}
              </div>
            </div>

            <div class="process-box">
              <Process :step="pageData.step" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 标签页 -->
    <div class="q-mb-md">
      <q-tabs
        v-model="pageData.activeTab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="packages" :label="trans('包裹信息')" />
        <q-tab name="logs" :label="trans('波次日志')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="pageData.activeTab" animated>
        <!-- 包裹信息面板 -->
        <q-tab-panel name="packages">
          <div class="row q-mb-md">
            <div class="col-auto">
              <q-select
                outlined
                dense
                v-model="pageData.customerFilter"
                multiple
                clearable
                :options="pageData.customerList"
                @update:model-value="getWaveDetail"
                :label="trans('全部客户')"
                class="filter-select"
                emit-value
                map-options
              />
            </div>
          </div>

          <CustomTable
            ref="customTableRef"
            :rows="pageData.packageData"
            row-key="id"
            @refresh="refresh"
            :show-error="
              ['pending', 'picking', 'packing'].includes(
                pageData.waveInfo?.status
              )
            "
          />
        </q-tab-panel>

        <!-- 波次日志面板 -->
        <q-tab-panel name="logs">
          <div class="logs-box">
            <div class="left-statics">
              <q-card flat bordered class="statics-card">
                <div class="statics-box">
                  <div class="text-h6 q-mb-md statics-title">
                    {{ trans("波次信息") }}
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">{{ trans("初始包裹数量") }}</div>
                    <div class="statics-value">
                      {{ pageData.waveInfo.package_count || 0 }}
                    </div>
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">
                      {{ trans("待拣货&待包装") }}
                    </div>
                    <div class="statics-value">
                      {{ pageData.waveInfo["package_count-picked_qty"] || 0 }}
                    </div>
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">{{ trans("已包装") }}</div>
                    <div class="statics-value">
                      {{ pageData.waveInfo.packed_qty || 0 }}
                    </div>
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">{{ trans("被释放") }}</div>
                    <div class="statics-value">
                      {{ pageData.waveInfo.packed_qty || 0 }}
                    </div>
                  </div>
                  <div class="statics-item error-item">
                    <div class="statics-label">{{ trans("异常") }}</div>
                    <div class="statics-value text-red">
                      {{ pageData.waveInfo.abnormal_qty || 0 }}
                    </div>
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">{{ trans("SKU种类") }}</div>
                    <div class="statics-value">
                      {{ pageData.waveInfo.sku_type_count || 0 }}
                    </div>
                  </div>
                  <div class="statics-item">
                    <div class="statics-label">{{ trans("商品数量") }}</div>
                    <div class="statics-value">
                      {{ pageData.waveInfo.item_count || 0 }}
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
            <div class="right-table">
              <q-table
                :rows="pageData.logs"
                :columns="pageData.logsColumns"
                row-key="time"
                flat
                bordered
                separator="cell"
                :hide-pagination="true"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="created_at" :props="props">
                      {{ props.row.created_at }}
                    </q-td>
                    <q-td key="remark" :props="props">
                      {{ props.row.remark }}
                    </q-td>
                    <q-td key="user_id" :props="props">
                      {{ props.row?.created_by?.name }}
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import WaveApi from "@/api/wave";
import NotifyUtils from "@/utils/message.js";
import Process from "./components/Process.vue";
import CustomTable from "./components/CustomTable.vue";
import trans from "@/i18n";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const customTableRef = ref(null);
import CustomerApi from "@/api/customer.js";

// 所有数据都存储在pageData中
const pageData = reactive({
  // 波次基本信息
  waveId: null,
  waveNumber: "",
  waveType: "",
  status: "",
  logisticsGroup: "-",
  warehouse: "USC",
  status_name: "",
  customerList: [],

  // 进度状态
  step: 4, // 1: 待拣货, 2: 待包装, 3: 包装中, 4: 已结束

  // 标签页
  activeTab: "packages",

  // 筛选选项
  customerFilter: [],

  // 表格数据
  selectedRows: [],

  // 包裹表格列定义
  packageColumns: [
    { name: "select", align: "center", label: "", field: "select" },
    {
      name: "packageInfo",
      align: "left",
      label: trans("包裹信息"),
      field: "packageInfo",
    },
    {
      name: "logisticsInfo",
      align: "left",
      label: trans("物流方式/运单号"),
      field: "logisticsInfo",
    },
    {
      name: "receiverInfo",
      align: "left",
      label: trans("收货人&地区"),
      field: "receiverInfo",
    },
    {
      name: "statusTime",
      align: "left",
      label: trans("状态&时间"),
      field: "statusTime",
    },
    {
      name: "actions",
      align: "center",
      label: trans("操作"),
      field: "actions",
    },
  ],

  // 包裹数据
  packageData: [],

  // 波次日志
  logs: [],
  logsColumns: [
    {
      name: "created_at",
      align: "center",
      label: trans("时间"),
      field: "created_at",
    },
    {
      name: "remark",
      align: "center",
      label: trans("操作"),
      field: "remark",
    },
    {
      name: "user_id",
      align: "center",
      label: trans("账号"),
      field: "user_id",
    },
  ],
});

// 返回上一页
const goBack = () => {
  router.push("/out/wave/list");
};

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "text-orange";
    case "picking":
      return "text-blue";
    case "packing":
      return "text-purple";
    case "completed":
      return "text-green";
    case "cancelled":
      return "text-red";
    default:
      return "";
  }
};

// 获取波次详情
const getWaveDetail = async () => {
  try {
    pageData.loading = true;
    let params = {
      customer_ids: pageData.customerFilter,
    };
    const { data } = await WaveApi.waveInfo(pageData.waveId, params);
    pageData.status_name = getStatusText(data.status);

    // 更新波次基本信息
    if (data) {
      pageData.waveInfo = data;

      // 设置当前步骤
      switch (pageData.waveInfo.status) {
        case "pending":
          pageData.step = 1;
          break;
        case "picking":
          pageData.step = 2;
          break;
        case "packing":
          pageData.step = 3;
          break;
        case "completed":
          pageData.step = 4;
          break;
        case "cancelled":
          pageData.step = 0;
          break;
        default:
          pageData.step = 1;
      }

      // 更新包裹数据
      if (data.packages && data.packages.length) {
        pageData.packageData = data.packages.map((row) => {
          row.checked = false;
          row.statusTimes = [
            { label: trans("创建"), time: row.created_at || "-" },
            { label: trans("波次"), time: row.wave_at || "-" },
            { label: trans("拣货"), time: row.picked_at || "-" },
            { label: trans("包装"), time: row.packed_at || "-" },
            { label: trans("发货"), time: row.shipped_at || "-" },
          ];

          return row;
        });
      } else {
        pageData.packageData = [];
      }
    }
  } catch (error) {
    console.error("获取波次详情失败:", error);
    NotifyUtils.errorMessage("获取波次详情失败: " + error.message);
  } finally {
    pageData.loading = false;
  }
};

// 获取波次日志
const getWaveLogs = async () => {
  const { data } = await WaveApi.waveLogs(pageData.waveId);
  console.log("波次日志:", data);
  pageData.logs = data;
};

// 获取波次类型文本
const getWaveTypeText = (type) => {
  const typeMap = {
    single_item: trans("单品单数"),
    multi_items: trans("单品多数"),
    mixed_items: trans("多品混包"),
    hot_wave: trans("爆款包裹"),
  };
  return typeMap[type] || type;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: trans("待拣货"),
    picking: trans("拣货中"),
    packing: trans("包装中"),
    completed: trans("已完成"),
    cancelled: trans("已作废"),
  };
  return statusMap[status] || status;
};

onMounted(() => {
  // 获取路由参数中的波次ID
  pageData.waveId = route.query.id;
  if (pageData.waveId) {
    // 获取波次详情
    getWaveDetail();
    getWaveLogs();
  }
  getCustomerList();
});

const getCustomerList = async () => {
  const { data } = await CustomerApi.getAllUser();
  pageData.customerList = data.map((row) => {
    return {
      label: row.name,
      value: row.id,
    };
  });
};

const refresh = () => {
  getWaveDetail();
  getWaveLogs();
};

const abandonWave = () => {
  $q.dialog({
    title: trans("确定要作废波次吗？"),
    message: trans("波次状态将会置为已作废，波次中的包裹状态置为待生成"),
    ok: trans("作废"),
    cancel: trans("取消"),
  }).onOk(async () => {
    console.log("作废波次");
    let params = {
      ids: [pageData.waveId],
    };
    await WaveApi.abandonWave(params);
    NotifyUtils.successMessage(trans("作废波次成功"));
    getWaveDetail();
  });
};

const printPick = async () => {
  console.log("打印拣货单");
  const { data } = await WaveApi.printWave(pageData.waveId);
  window.open(data.data, "_blank");
  NotifyUtils.successMessage(trans("打印拣货单成功"));
  if (pageData.waveInfo.is_print_pick_label) return;
  $q.dialog({
    title: trans("打印结果确认"),
    message: trans("是否打印成功"),
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
    await WaveApi.waveUpdateIsPrint(pageData.waveId);
    getWaveDetail();
  });
};
</script>

<style scoped lang="scss">
.wave-info-page {
  width: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.filter-select {
  width: 200px;
}

.progress-bar {
  height: 4px;
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

.text-green {
  color: #21ba45;
}

.text-orange {
  color: #f2c037;
}

.text-blue {
  color: #1976d2;
}

.text-purple {
  color: #9c27b0;
}

.text-red {
  color: #c10015;
}
.info-left {
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-right: 1px solid #e0e0e0;
}
.info-right {
  flex: 1;
  padding: 0 20px;
  .process-box {
  }
}

.logs-box {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  .left-statics {
    width: 400px;
    .statics-box {
      .statics-title {
        height: 40px;
        line-height: 40px;
        text-indent: 16px;
        background: #ebeef5;
        font-size: 14px;
        font-weight: bold;
      }
      .statics-item {
        padding: 0 16px;
        display: flex;
        align-items: center;
        font-size: 14px;

        justify-content: space-between;
        height: 32px;
      }
      .error-item {
        border-bottom: 1px dashed #e0e0e0;
      }
    }
  }
  .right-table {
    flex: 1;
  }
}
</style>
