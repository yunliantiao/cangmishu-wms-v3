<template>
  <div class="scan-top">
    <div class="scan-title">
      {{ title }}
    </div>
    <div class="scan-input">
      <img src="@/assets/images/scan.png" alt="" />
      <q-input
        class="input-box"
        v-model="scanValue"
        ref="inputRef"
        :loading="$store.state.btnLoading"
        borderless
        :placeholder="placeholder"
        @keyup.enter="confirm"
      />
    </div>
    <div class="scan-desc">
      <img src="@/assets/images/warning.png" alt="" />
      {{ trans("请先切换成[EN]输入法") }}
    </div>
  </div>
</template>

<script setup>
import trans from "@/i18n";
import { ref, onMounted } from "vue";
const inputRef = ref(null);
const scanValue = defineModel("scanValue", {
  required: true,
});
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["confirm"]);

onMounted(() => {
  focus();
});
const confirm = () => {
  emit("confirm", scanValue.value);
};

const focus = () => {
  inputRef.value.focus();
};

const resetInputValue = () => {
  scanValue.value = "";
  focus();
};
defineExpose({
  focus,
  resetInputValue,
});
</script>

<style lang="scss" scoped>
.scan-top {
  height: 198px;
  background: #f2f0ff;
  border-radius: 0px 0px 0px 0px;
  padding: 0 calc((100vw - 1400px) / 2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  .scan-title {
    font-weight: 600;
    font-size: 24px;
    color: #1f1f1f;
    line-height: 30px;
    margin-bottom: 20px;
  }
  .scan-input {
    margin-bottom: 10px;
    padding: 18px;
    height: 64px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    border: 2px solid #5745c5;
    display: flex;
    align-items: center;
    gap: 12px;
    img {
      width: 26px;
      height: 26px;
    }
    .input-box {
      flex: 1;
      font-size: 16px;
      color: #1f1f1f;
    }
  }
  .scan-desc {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 12px;
    color: #666666;
    line-height: 14px;
    gap: 7px;
    img {
      width: 12px;
      height: 12px;
    }
  }
}
</style>
