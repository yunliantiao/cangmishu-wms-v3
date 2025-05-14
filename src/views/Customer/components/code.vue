<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 380px; max-width: 95vw; position: relative">
      <!-- 关闭按钮 -->
      <q-btn
        icon="close"
        flat
        round
        dense
        class="close-btn"
        v-close-popup
        @click="close"
      />
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ trans("授权码") }}</div>
        <div class="code-box q-mb-md">
          {{ qrcode }}
        </div>
        <div class="text-grey-7 q-mb-md" style="font-size: 14px">
          {{ trans("请复制上面的授权码分享到需要使用的用户") }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          :label="trans('关闭')"
          color="grey"
          v-close-popup
          @click="close"
        />
        <q-btn color="primary" :label="trans('复制')" @click="copyQrcode" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import Message from "@/utils/message";
import trans from "@/i18n";

const visible = ref(false);
const qrcode = ref("");

function open(code) {
  qrcode.value = code;
  visible.value = true;
}
function close() {
  visible.value = false;
}
function copyQrcode() {
  if (!qrcode.value) return;
  navigator.clipboard.writeText(qrcode.value).then(() => {
    Message.successMessage(trans("已复制"));
  });
}

defineExpose({ open });
</script>

<style scoped lang="scss">
.code-box {
  font-size: 22px;
  font-weight: bold;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px 12px;
  text-align: center;
  word-break: break-all;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>