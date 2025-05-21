<template>
  <div class="scan-page">
    <ScanTop
      ref="scanTopRef"
      :title="trans('扫描分拣')"
      :placeholder="trans('请扫描或输入波次号')"
      v-model:scanValue="scanValue"
      @confirm="search"
    ></ScanTop>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import outApi from "@/api/out.js";
import Message from "@/utils/message.js";
import { useRouter } from "vue-router";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";
import { playBeep } from "@/utils/voice";

const router = useRouter();
const scanTopRef = ref(null);
const scanValue = ref("");

// 清除输入框的值，并聚焦
const inputErrorAndInputFocus = () => {
  playBeep(false);
  scanTopRef.value.resetInputValue();
};

const search = async () => {
  // WA0042E900011
  if (scanValue.value.length == 0) {
    Message.notify(trans("请扫描或输入波次号"));
    inputErrorAndInputFocus();
    return;
  }
  try {
    const { data } = await outApi.getOrderInfoByWaveOrder({
      number: scanValue.value,
    });

    if (data.status == "completed") {
      Message.notify(trans("该波次已完成"));
      inputErrorAndInputFocus();
      return;
    }
    if (!data.pick_by.is_self) {
      Message.notify(trans("您无法对该波次进行分拣"));
      inputErrorAndInputFocus();
      return;
    }
    playBeep(true);
    if (data.wave_type == "mixed_items") {
      router.push({
        path: "/out/wave/pigeonholes",
        query: {
          number: data.wave_number,
        },
      });
      return;
    } else {
      // 去往打包，选择包材页面
      router.push({
        path: "/out/wave/packaging",
        query: {
          wave_number: data.wave_number,
        },
      });
    }
  } catch (error) {
    playBeep(false);
    // Message.notify(trans("波次号不存在"));
  }
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
