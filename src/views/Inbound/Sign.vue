<template>
  <div class="scan-sign-page q-pa-md">
    <div class="text-h5 text-center q-mb-lg">扫描签收</div>

    <div class="scan-container q-mx-auto" style="max-width: 800px">
      <!-- 扫描输入框 -->
      <q-input
        outlined
        v-model="scanCode"
        placeholder="请扫描入库单号/退货单号/运单号/ERP单号/平台订单号/箱唛"
        class="q-mb-xs"
        ref="scanInput"
        @keyup.enter="handleScan"
      >
        <template v-slot:prepend>
          <q-icon name="qr_code_scanner" />
        </template>
      </q-input>

      <div class="text-caption text-grey q-mb-lg">
        <q-icon name="info" size="xs" /> 请先切换成[EN]输入法
      </div>

      <!-- 结果展示区 -->
      <div
        v-if="scanSuccess"
        class="result-container q-pa-lg q-my-md bg-white rounded-borders"
      >
        <div class="text-center q-mb-lg">
          <q-icon name="check_circle" color="green" size="md" class="q-mr-sm" />
          <span class="text-h6 text-green">签收成功!</span>
          <div class="text-subtitle2 q-mt-sm">单据状态已更为"待入库"！</div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- 详细信息表格 -->
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <div class="text-grey">客户</div>
            <div>{{ scanData.customer }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">入库单号</div>
            <div>{{ scanData.tracking_number }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">ERP单号</div>
            <div>{{ scanData.system_order_number }}</div>
          </div>

          <div class="col-6 col-md-3">
            <div class="text-grey">运单号</div>
            <div>{{ scanData.trackingNo }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">到仓方式</div>
            <div>
              {{
                scanData.arrival_method == "express_parcel" ? "快递" : "箱子"
              }}
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">SKU件类</div>
            <div>{{ scanData.skuCount }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-grey">商品数量</div>
            <div>{{ scanData.items.length }}</div>
          </div>

          <div class="col-12">
            <div class="text-grey">商品信息</div>
            <div>{{ scanData.productInfo }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import inboundApi from "@/api/inbound";

const $q = useQuasar();
const scanCode = ref("");
const scanSuccess = ref(false);
const scanInput = ref(null);

const scanData = ref({});

const route = useRoute();
const id = route.query.id;

// 处理扫描
const handleScan = () => {
  if (!scanCode.value) return;
  inboundApi
    .getSign({
      number: scanCode.value,
    })
    .then((res) => {
      if (res.success) {
        scanData.value = res.data;
        scanSuccess.value = true;
        // 清空输入框，准备下一次扫描
        setTimeout(() => {
          scanCode.value = "";
          // 重新聚焦输入框
          nextTick(() => {
            scanInput.value.focus();
          });
        }, 500);
      }
    });
};

onMounted(() => {
  // 页面加载后自动聚焦到扫描输入框
  nextTick(() => {
    scanInput.value.focus();
    if (id) {
      inboundApi.inboundDdSign(id).then((res) => {
        if (res.success) {
          scanData.value = res.data;
          scanSuccess.value = true;
        }
      });
    }
  });
});
</script>

<style lang="scss" scoped>
.scan-sign-page {
  //   min-height: 100vh;
  background-color: #f5f7fa;

  .scan-container {
    .q-input {
      font-size: 1.1rem;
    }
  }

  .result-container {
    border: 1px solid #eaeaea;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    .text-grey {
      font-size: 0.85rem;
      margin-bottom: 4px;
    }
  }
}
</style>