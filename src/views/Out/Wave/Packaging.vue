<template>
  <div class="packaging-page">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="title">
          {{ trans("扫描包装") }}
        </span>
        <span class="wave-number">
          {{ pageData.waveInfo.wave_number }}
          ({{ getDesc(pageData.waveInfo.wave_type) }})
        </span>
      </div>
      <div class="right">
        <q-btn
          color="primary"
          :label="trans('挂起')"
          outline
          class="rt-btn"
          @click="handUp"
        />
        <q-btn
          color="primary"
          class="rt-btn"
          :label="trans('结束作业')"
          @click="handEnd"
        />
      </div>
    </div>

    <div v-if="pageData.packageType == 'scanBatchPrint'">
      <ScanBatchPrint
        :waveInfo="pageData.waveInfo"
        :materialsList="pageData.materialsList"
        :rows="pageData.rows"
        :loading="pageData.loading"
        v-model:successPackage="pageData.successPackage"
      ></ScanBatchPrint>
    </div>

    <!-- <div v-if="pageData.packageType == 'oneByOnePrint'">
      <OneByOnePrint></OneByOnePrint>
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import OutApi from "@/api/out.js";
import { useRoute, useRouter } from "vue-router";
import ProductApi from "@/api/product.js";
import { useQuasar } from "quasar";
import trans from "@/i18n";
import ScanBatchPrint from "./components/packaging/ScanBatchPrint.vue";
// import OneByOnePrint from "./components/packaging/OneByOnePrint.vue";

const $q = useQuasar();
const route = useRoute();
const handEndRef = ref(null);

const pageData = reactive({
  wave_number: "",
  rows: [],
  loading: false,
  materialsList: [],
  waveInfo: {},
  // 已经标记打印的包裹数量
  successPackage: 0,
  // 包裹总数
  packageCount: 0,
  // 包裹类型 oneByOnePrint 扫描商品逐个打印  scanBatchPrint 批量打印
  packageType: "scanBatchPrint",
});

const router = useRouter();

watch(
  () => pageData.successPackage,
  (newVal) => {
    if (
      pageData.successPackage == pageData.packageCount &&
      pageData.packageCount > 0
    ) {
      $q.dialog({
        title: trans("包装作业已完成, 请结束作业"),
        message: trans("可前往“包裹管理”查看待发货的包裹"),
        cancel: true,
        persistent: true,
        ok: {
          label: trans("结束作业"),
          color: "primary",
        },
        cancel: {
          label: trans("取消"),
          color: "grey-7",
        },
      }).onOk(async () => {
        handEndConfirm();
      });
    }
  }
);

onMounted(() => {
  pageData.wave_number = route.query.wave_number;
  getWaveInfo();
  getMaterialsList();
});

const getMaterialsList = async () => {
  const { data } = await ProductApi.getMaterialsList();
  pageData.materialsList = data.map((row) => {
    return {
      label: row.name,
      value: row.id,
    };
  });
};

const getWaveInfo = async () => {
  pageData.loading = true;
  try {
    const { data } = await OutApi.getOrderInfoByWaveOrder({
      number: pageData.wave_number,
    });
    pageData.waveInfo = data;
    pageData.packageCount = data.packages.length;
  } catch (error) {
    console.error("获取波次信息失败", error);
  } finally {
    pageData.loading = false;
  }
};

const getDesc = (type) => {
  if (type == "single_item") {
    return trans("单品单数");
  } else if (type == "multi_items") {
    return trans("单品多件");
  } else if (type == "mixed_items") {
    return trans("多品混包");
  }
};

const handUp = () => {
  $q.dialog({
    title: trans("确定挂起包装作业？"),
    message: trans("挂起后，波次状态保持为“包装中”"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确定"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
      color: "grey-7",
    },
  }).onOk(async () => {
    await OutApi.handUpWave(pageData.waveInfo.id);
    router.go(-1);
  });
};
const handEnd = () => {
  let notPrintList = pageData.rows.filter((row) => {
    return !row.is_print_shipping_label;
  });
  // 如果还有没标记打印的包裹  需要弹窗提示
  if (notPrintList.length) {
    handEndRef.value.open(notPrintList);
  } else {
    $q.dialog({
      title: trans("确定结束作业？"),
      message: trans("包装作业已全部完成！可前往“包裹管理”查看待发货的包裹"),
      cancel: true,
      persistent: true,
      ok: {
        label: trans("确定"),
        color: "primary",
      },
      cancel: {
        label: trans("取消"),
        color: "grey-7",
      },
    }).onOk(async () => {
      handEndConfirm();
    });
  }
};

const handEndConfirm = async () => {
  await OutApi.packingWaveOver(pageData.waveInfo.id);
  router.go(-1);
};
</script>

<style scoped lang="scss">
.packaging-page {
  min-height: 100vh;
  width: 100vw;
  background: #f4f5f8;
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    padding: 0 calc((100% - 1400px) / 2);
    font-size: 16px;
    font-weight: 500;
    background-color: #fff;
    .left {
      display: flex;
      align-items: center;
      gap: 10px;
      .title {
        font-weight: 600;
        font-size: 24px;
        color: #1f1f1f;
        line-height: 30px;
      }
      .wave-number {
        font-weight: bold;
        font-size: 16px;
        color: #5745c5;
      }
    }
    .right {
      display: flex;
      align-items: center;
      gap: 20px;
      .rt-btn {
        padding: 0 20px;
        height: 42px;
        border-radius: 9px 9px 9px 9px;
      }
    }
  }
}
</style>