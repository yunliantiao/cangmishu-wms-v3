<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">导入</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- 上传区域 -->
        <div
          class="upload-area flex flex-center column q-pa-lg"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".xlsx,.xls,.csv"
            @change="handleFileChange"
          />
          <q-icon name="cloud_upload" size="48px" color="grey-6" />
          <div class="text-grey-6 q-mt-sm">点击或拖拽文件到此处上传</div>
          <div class="text-grey-6 q-mt-xs text-caption">
            支持 .xlsx, .xls, .csv 格式
          </div>
          <div v-if="selectedFile" class="selected-file q-mt-md">
            <q-chip
              removable
              @remove="clearFile"
              color="primary"
              text-color="white"
            >
              {{ selectedFile.name }}
            </q-chip>
          </div>
        </div>

        <!-- 下载模板 -->
        <div class="text-center q-mt-md">
          <q-btn
            flat
            color="primary"
            icon="download"
            label="下载导入模板"
            @click="handleDownloadTemplate"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn
          color="primary"
          label="开始导入"
          :loading="uploading"
          :disable="!selectedFile"
          @click="handleUpload"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import settingApi from "@/api/setting";

const $q = useQuasar();

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(["success"]);

// 响应式变量
const dialogVisible = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// 处理拖拽
const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// 验证并设置文件
const validateAndSetFile = (file) => {
  const validTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];

  if (!validTypes.includes(file.type)) {
    $q.notify({
      type: "negative",
      message: t("请上传正确的文件格式(.xlsx, .xls, .csv)"),
    });
    return;
  }  

  selectedFile.value = file;
};

// 清除已选文件
const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 处理下载模板
const handleDownloadTemplate = async () => {
  try {
    const response = await settingApi.downloadTemplate({ type: props.type });

    // 获取文件名
    const filename = `导入模板.xlsx`;

    // 创建 Blob 对象
    const blob = new Blob([response], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    $q.notify({
      type: "positive",
      message: "下载成功",
    });
  } catch (error) {
    console.error("下载模板失败:", error);
    $q.notify({
      type: "negative",
      message: "下载失败",
    });
  }
};

// 处理上传
const handleUpload = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();

    if (props.type === "import_shelf") {     
      formData.append("file", selectedFile.value);
      await settingApi.importTemplates(formData);
    } else {
      // 其他类型的导入待实现
      console.log(`上传${props.type}文件`, selectedFile.value);
    }

    $q.notify({
      type: "positive",
      message: "导入成功",
    });

    emit("success");
    dialogVisible.value = false;
    clearFile();
  } catch (error) {
    console.error("导入失败:", error);
    $q.notify({
      type: "negative",
      message: error.response?.data?.message || "导入失败",
    });
  } finally {
    uploading.value = false;
  }
};

// 打开弹窗方法
const open = () => {
  dialogVisible.value = true;
};

// 暴露方法给父组件
defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  min-height: 200px;

  &:hover {
    border-color: var(--q-primary);
  }
}
</style> 