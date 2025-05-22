<template>
  <div class="wave-setting-page">
    <span class="breadcrumb cursor-pointer" @click="$router.back()">
      <q-icon name="arrow_back" size="20px" class="cursor-pointer q-mr-sm" />
      <span class="text-h6 cursor-pointer">{{ trans("设置") }}</span>
    </span>

    <!-- 单品波次设置区域 -->
    <div class="main-table">
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ trans("单品波次设置") }}</div>
        <div class="setting-item">
          <div class="item-label">{{ trans("单品合并") }}</div>
          <div class="item-value">
            <q-toggle
              v-model="settings.singleWave.enableMerge"
              color="primary"
            />
            <span class="toggle-desc">{{
              trans("开启后将合并单品波次包裹中单品包装数量相同的单品")
            }}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">
            {{ trans("波次最大包裹量") }}
            <span class="required">*</span>
          </div>
          <div class="item-value">
            <q-input
              v-model.number="settings.singleWave.maxPackages"
              type="number"
              dense
              outlined
              class="number-input"
              :rules="[(val) => val > 0 || trans('请输入大于0的数字')]"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">{{ trans("面单打印方式") }}</div>
          <div class="item-value print-method">
            <q-select
              v-model="settings.singleWave.printMethod"
              :options="printMethodOptions"
              outlined
              dense
              dropdown-icon="expand_more"
              class="print-select"
            />
            <q-checkbox
              v-model="settings.singleWave.enableBatchPrint"
              :label="trans('立即发货')"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label"></div>
          <div class="print-flow">
            <div class="flow-item">{{ trans("扫描商品标签") }}</div>
            <div class="flow-arrow">→</div>
            <div class="flow-item">{{ trans("核对信息") }}</div>
            <div class="flow-arrow">→</div>
            <div class="flow-item">{{ trans("打印面单") }}</div>
          </div>
        </div>
      </q-card-section>
    </div>

    <!-- 多品混合波次设置区域 -->
    <div class="main-table">
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ trans("多品混合波次设置") }}</div>
        <div class="setting-item">
          <div class="item-label">
            {{ trans("波次最大包裹量") }}
            <span class="required">*</span>
          </div>
          <div class="item-value">
            <q-input
              v-model.number="settings.mixWave.maxPackages"
              type="number"
              dense
              outlined
              class="number-input"
            />
            <q-btn
              flat
              class="config-link"
              color="primary"
              icon-right="chevron_right"
              :label="trans('设置')"
              dense
              no-caps
              @click="goToSortFrameSettings"
            />
            <q-btn
              flat
              class="config-link"
              color="primary"
              icon-right="chevron_right"
              :label="trans('打印分拣框标签')"
              dense
              no-caps
              @click="goToPrintFrameLabels"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">{{ trans("分拣方式") }}</div>
          <div class="item-value">
            <div class="radio-group">
              <q-radio
                v-model="settings.mixWave.sortMethod"
                val="pickAndSort"
                :label="trans('边拣边分')"
                color="primary"
              />
              <q-radio
                v-model="settings.mixWave.sortMethod"
                val="pickThenSort"
                :label="trans('先拣后分')"
                color="primary"
              />
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">{{ trans("分拣打印面单") }}</div>
          <div class="item-value">
            <q-toggle
              v-model="settings.mixWave.enableSortPrint"
              color="primary"
            />
            <span class="toggle-desc">{{
              trans("当包裹分拣完成时打印包裹的运单")
            }}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">{{ trans("面单打印方式") }}</div>
          <div class="item-value print-method">
            <q-select
              v-model="settings.mixWave.printMethod"
              :options="printMethodOptions"
              outlined
              dense
              dropdown-icon="expand_more"
              class="print-select"
            />
            <q-checkbox
              v-model="settings.mixWave.enableBatchPrint"
              :label="trans('立即发货')"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="item-label"></div>
          <div class="print-flow">
            <div class="flow-item">{{ trans("扫描商品标签") }}</div>
            <div class="flow-arrow">→</div>
            <div class="flow-item">{{ trans("核对信息") }}</div>
            <div class="flow-arrow">→</div>
            <div class="flow-item">{{ trans("打印面单") }}</div>
          </div>
        </div>
      </q-card-section>
    </div>

    <!-- 复杂包装波次设置区域 -->
    <div class="main-table">
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ trans("爆款包装波次设置") }}</div>
        <div class="setting-item">
          <div class="item-label">{{ trans("开启爆款") }}</div>
          <div class="item-value">
            <q-toggle
              v-model="settings.complexWave.enablePopular"
              color="primary"
            />
            <span class="toggle-desc">{{ trans("开启爆款包装方式类型") }}</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">
            {{ trans("爆款定义") }}
            <span class="required">*</span>
          </div>
          <div class="item-value">
            <div class="popular-definition">
              <span>{{ trans("信息完全一致的爆款数量要大于") }}</span>
              <q-input
                v-model.number="settings.complexWave.popularThreshold"
                type="number"
                dense
                outlined
                class="threshold-input"
              />
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">
            {{ trans("波次最大包裹量") }}
            <span class="required">*</span>
          </div>
          <div class="item-value">
            <q-input
              v-model.number="settings.complexWave.maxPackages"
              type="number"
              dense
              outlined
              class="number-input"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="item-label">{{ trans("面单打印方式") }}</div>
          <div class="item-value print-method">
            <q-select
              v-model="settings.complexWave.printMethod"
              :options="printMethodOptions"
              outlined
              dense
              dropdown-icon="expand_more"
              class="print-select"
            />
            <q-checkbox
              v-model="settings.complexWave.enableBatchPrint"
              :label="trans('立即发货')"
            />
            <q-checkbox
              v-model="settings.complexWave.showSku"
              :label="trans('物流SKU')"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="item-label"></div>
          <div class="print-flow">
            <div class="flow-item">{{ trans("扫描拣货单") }}</div>
            <div class="flow-arrow">→</div>
            <div class="flow-item">{{ trans("批量打印") }}</div>
          </div>
        </div>
      </q-card-section>
    </div>

    <!-- 保存按钮 -->
    <!-- <div class="action-buttons">
      <q-btn color="primary" :label="trans('保存')" @click="saveSettings" />
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import trans from "@/i18n";
import { useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();

// 默认打印方式选项
const printMethodOptions = [
  { label: trans("扫描商品后逐个打印"), value: "printAfterScan" },
  { label: trans("全部扫完后批量打印"), value: "batchPrintAfterAll" },
];

// 设置数据
const settings = ref({
  singleWave: {
    enableMerge: false,
    maxPackages: 500,
    printMethod: {
      label: trans("扫描商品后逐个打印"),
      value: "printAfterScan",
    },
    enableBatchPrint: false,
  },
  mixWave: {
    maxPackages: 20,
    sortMethod: "pickAndSort",
    enableSortPrint: true,
    printMethod: {
      label: trans("扫描商品后逐个打印"),
      value: "printAfterScan",
    },
    enableBatchPrint: false,
  },
  complexWave: {
    enablePopular: true,
    popularThreshold: 3,
    maxPackages: 20,
    printMethod: {
      label: trans("扫描商品后逐个打印"),
      value: "printAfterScan",
    },
    enableBatchPrint: false,
    showSku: true,
  },
});

// 导航到分拣框设置
const goToSortFrameSettings = () => {
  router.push("/setting/sort-frame");
};

// 导航到打印分拣框标签
const goToPrintFrameLabels = () => {
  router.push("/setting/print-frame-labels");
};

// 保存设置
const saveSettings = async () => {
  try {
    // 这里添加您的保存逻辑
    // await SettingApi.saveWaveSettings(settings.value);

    $q.notify({
      type: "positive",
      message: trans("设置已保存"),
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message: trans("保存失败: {message}", {
        message: error.message || "未知错误",
      }),
    });
  }
};

onMounted(async () => {
  try {
    // 获取设置数据
    // const response = await SettingApi.getWaveSettings();
    // if (response && response.data) {
    //   settings.value = response.data;
    // }
  } catch (error) {
    console.error("获取设置数据失败", error);
  }
});
</script>

<style lang="scss" scoped>
.wave-setting-page {
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: #333;
}

.setting-card {
  background: #fff;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;

  .item-label {
    width: 150px;
    color: #333;
    font-size: 14px;
    flex-shrink: 0;
    .required {
      color: red;
      margin-left: 4px;
    }
  }

  .item-value {
    flex: 1;
    display: flex;
    align-items: center;

    .toggle-desc {
      margin-left: 8px;
      color: #666;
      font-size: 14px;
    }

    .config-link {
      margin-left: 12px;
    }
  }
}

.number-input {
  width: 120px;
}

.threshold-input {
  width: 80px;
  margin: 0 8px;
}

.popular-definition {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.print-method {
  display: flex;
  align-items: center;
  .print-select {
    width: 200px;
    margin-right: 16px;
  }
}

.print-flow {
  display: flex;
  align-items: center;
  // padding: 8px 0;
  color: #999;
  font-size: 13px;

  .flow-item {
    padding: 4px 0px;
  }

  .flow-arrow {
    margin: 0 8px;
    color: #ccc;
  }
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.radio-group {
  display: flex;
  align-items: center;

  .q-radio {
    margin-right: 24px;
  }
}
</style>
