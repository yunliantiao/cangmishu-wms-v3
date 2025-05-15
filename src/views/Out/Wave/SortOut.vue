<template>
  <div class="scan-page">
    <ScanTop
      ref="scanTopRef"
      :title="trans('扫描分拣')"
      :placeholder="trans('请扫描或输入波次号')"
      v-model:scanValue="scanValue"
      @confirm="search"
    ></ScanTop>
    <!-- <div class="scan-header">
      <div class="title">{{ trans("扫描分拣") }}</div>
    </div>

    <div class="scan-input-container">
      <div class="input-box">
        <q-icon name="lightbulb" size="24px" class="light-icon" />
        <input
          type="text"
          class="scan-input"
          :placeholder="trans('请扫描或输入波次号')"
          @keyup.enter="search"
          v-model="scanValue"
          ref="scanInput"
        />
      </div>
      <div class="input-hint">
        <q-icon name="info_outline" size="16px" color="grey-7" />
        <span>{{ trans("请先切换为EN输入法") }}</span>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import outApi from "@/api/out.js";
import Message from "@/utils/message.js";
import { useRouter } from "vue-router";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";

const router = useRouter();
const scanInput = ref(null);
const scanValue = ref("");

onMounted(() => {
  nextTick(() => {
    scanInput.value.focus();
  });
});

const search = async () => {
  // WA0042E900011
  if (scanValue.value.length == 0) {
    Message.notify(trans("请扫描或输入波次号"));
    return;
  }
  const { data } = await outApi.getOrderInfoByWaveOrder({
    number: scanValue.value,
  });
  console.log("data", data);

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
