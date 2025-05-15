<template>
  <div class="scan-page">
    <ScanTop
      ref="scanTopRef"
      :title="trans('扫描包装')"
      :placeholder="trans('请扫描或输入波次号')"
      v-model:scanValue="pageData.scanValue"
      @confirm="search"
    ></ScanTop>
    <!-- <div class="scan-header">
      <div class="title">{{ trans("扫描包装") }}</div>
    </div>

    <div class="scan-input-container">
      <div class="input-box">
        <q-icon name="lightbulb" size="24px" class="light-icon" />
        <input
          type="text"
          class="scan-input"
          :placeholder="trans('请扫描或输入波次号')"
          @keyup.enter="search"
          v-model="pageData.scanValue"
          ref="scanInput"
        />
      </div>
      <div class="input-hint">
        <q-icon name="info_outline" size="16px" color="grey-7" />
        <span>{{ trans("请先切换为EN输入法") }}</span>
      </div>
    </div> -->

    <div class="scan-main-table">
      <q-table
        :rows="pageData.waveData"
        :columns="pageData.columns"
        row-key="id"
        flat
        style="width: 100%"
        separator="horizontal"
        :loading="pageData.loading"
        :hide-pagination="true"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="wave_number" :props="props">
              {{ props.row.wave_number }}
            </q-td>

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

            <q-td key="picker" :props="props">
              {{ props.row.pick_by?.name }}
            </q-td>

            <q-td key="picker" :props="props">
              {{ props.row.pack_by?.name }}
            </q-td>

            <q-td key="status" :props="props">
              {{ getStatusDesc(props.row.status) }}
            </q-td>

            <q-td key="actions" :props="props">
              <q-btn
                flat
                round
                class="table-icon"
                size="sm"
                @click="handlePack(props.row)"
              >
                <img src="@/assets/images/package.png" />
                <q-tooltip>{{ trans("开始打包") }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                class="table-icon"
                size="sm"
                @click="handlePrint(props.row)"
              >
                <img src="@/assets/images/print.png" />
                <q-tooltip>{{ trans("打印") }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from "vue";
import WaveApi from "@/api/wave.js";
import outApi from "@/api/out.js";
import Message from "@/utils/message.js";
import { useRouter } from "vue-router";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";

const router = useRouter();
const scanInput = ref(null);

const pageData = reactive({
  waveData: [],
  // 表格列定义
  columns: [
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
      name: "picker",
      align: "center",
      label: trans("拣货员"),
      field: "picker",
    },
    {
      name: "picker",
      align: "center",
      label: trans("打包员"),
      field: "picker",
    },
    { name: "status", align: "center", label: trans("状态"), field: "status" },
    {
      name: "actions",
      align: "center",
      label: trans("操作"),
      field: "actions",
    },
  ],
  loading: false,
  scanValue: "",
});

onMounted(() => {
  nextTick(() => {
    scanInput.value.focus();
  });
  getList();
});

const getTypeDesc = (type) => {
  const typeMap = {
    single_item: trans("单品单件"),
    multi_items: trans("单品多件"),
    mixed_items: trans("多品混包"),
    hot_wave: trans("爆款包裹"),
  };
  return typeMap[type] || trans("未知");
};

const getList = async () => {
  pageData.loading = true;
  const { data } = await WaveApi.getWaveList({
    status: "packing",
    page: 1,
    per_page: 999,
  });

  pageData.waveData = data.data;
  pageData.loading = false;
  // if (data.wave_type == "mixed_items") {
  //   router.push({
  //     path: "/out/wave/pigeonholes",
  //     query: {
  //       number: data.wave_number,
  //     },
  //   });
  //   return;
  // } else {
  //   // 去往打包，选择包材页面
  //   router.push({
  //     path: "/out/wave/packaging",
  //     query: {
  //       wave_number: data.wave_number,
  //     },
  //   });
  // }
};

const search = async () => {
  if (pageData.scanValue.length == 0) {
    Message.notify(trans("请扫描或输入波次号"));
    return;
  }

  const { data } = await outApi.getOrderInfoByWaveOrder({
    number: pageData.scanValue,
  });
  if (!data.is_print_pick_label) {
    Message.notify(trans("该波次未打印拣货标签"));
    return;
  }

  // 去往打包，选择包材页面
  router.push({
    path: "/out/wave/packaging",
    query: {
      wave_number: data.wave_number,
    },
  });
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

const handlePrint = async (row) => {
  const { data } = await WaveApi.printWave(row.id);
  window.open(data.data, "_blank");
};

const handlePack = (row) => {
  // 多品混包 需要分拣台
  router.push({
    path: "/out/wave/packaging",
    query: {
      wave_number: row.wave_number,
    },
  });
};
</script>

<style scoped>
.scan-page {
  min-height: 100vh;
  background-color: #f4f5f8;
}

.scan-header {
  margin-bottom: 40px;
}

.title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
}

.scan-input-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-box {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  padding: 0 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.light-icon {
  color: #909399;
  margin-right: 10px;
}

.scan-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 16px;
}

.input-hint {
  display: flex;
  align-items: center;
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
