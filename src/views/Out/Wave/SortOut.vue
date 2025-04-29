<template>
  <div class="scan-page">
    <div class="scan-header">
      <div class="title">扫描分拣</div>
    </div>

    <div class="scan-input-container">
      <div class="input-box">
        <q-icon name="lightbulb" size="24px" class="light-icon" />
        <input
          type="text"
          class="scan-input"
          placeholder="请扫描或输入波次号"
          v-model="scanValue"
          ref="scanInput"
        />
      </div>
      <div class="input-hint">
        <q-icon name="info_outline" size="16px" color="grey-7" />
        <span>请先切换为EN输入法</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

const scanInput = ref(null);
const scanValue = ref("");

onMounted(() => {
  nextTick(() => {
    scanInput.value.focus();
  });
});
</script>

<style scoped>
.scan-page {
  width: 100%;
  height: 100vh;
  /* background-color: #f0f2f5; */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
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
