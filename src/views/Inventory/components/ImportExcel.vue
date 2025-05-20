<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="width: 550px; max-width: 95vw">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ trans("导入初始库存") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div
          class="upload-area q-mb-md"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <input
            type="file"
            ref="fileInput"
            accept=".xlsx,.xls"
            style="display: none"
            @change="handleFileChange"
          />
          <div class="flex flex-center column" style="height: 150px">
            <q-icon name="cloud_upload" size="50px" color="grey-5" />
            <div class="text-grey-7 q-mt-sm">
              {{ trans("点击或拖拽上传文件") }}
            </div>
          </div>
        </div>

        <!-- 显示已选择的文件名和删除按钮 -->
        <div v-if="selectedFile" class="selected-file q-mb-md">
          <div
            class="row items-center justify-between bg-grey-2 q-pa-sm rounded-borders"
          >
            <div class="ellipsis">
              <q-icon
                name="insert_drive_file"
                color="primary"
                size="xs"
                class="q-mr-xs"
              />
              {{ selectedFile.name }}
            </div>
            <q-btn
              round
              flat
              dense
              icon="close"
              size="sm"
              color="grey-7"
              @click.stop="clearSelectedFile"
            />
          </div>
        </div>

        <div class="q-mb-md">
          <q-btn
            outline
            color="primary"
            :label="trans('下载模板')"
            icon="download"
            @click="downloadTemplate"
          />
        </div>

        <q-card
          class="bg-blue-1 text-grey-8 q-pa-md"
          style="font-size: 13px"
          bordered
        >
          <div>{{ trans("使用说明:") }}</div>
          <ul class="q-mt-sm q-ml-md" style="padding-left: 20px">
            <li>{{ trans("点击添加文件按钮选择本地.xlsx文件上传") }}</li>
            <li>{{ trans("模板中的表头不可删除，不可修改") }}</li>
            <li>{{ trans("一次导入的数据记录不可超过3000条") }}</li>
            <li>{{ trans("若商品已存在库存增减中，则加减化失效") }}</li>
            <li>{{ trans("若同一个商品在两个货架区货位，则加减化失效") }}</li>
            <li>{{ trans("若商品SKU货架位置复，则以第一条为准") }}</li>
            <li>{{ trans("若上传时间格式错误，则认为当天为当天日期") }}</li>
            <li>
              {{
                trans(
                  "上传时间请遵循格式例如为YYYY/MM/DD(示例: 2023-06-10,2023/06/10)实仓格式导入失败"
                )
              }}
            </li>
            <li>
              {{
                trans(
                  '如果在"商品管理"中没有保护实际尺寸和重量，本数据中的实尺寸和重量必须填写'
                )
              }}
            </li>
          </ul>
        </q-card>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat :label="trans('关闭')" color="grey-7" v-close-popup />
        <q-btn
          :label="trans('导入')"
          color="primary"
          :disable="!selectedFile"
          @click="handleImport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";
import trans from "@/i18n";
import inventoryApi from "@/api/inventory";
import settingApi from "@/api/setting";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "import"]);

const visible = defineModel("modelValue", { type: Boolean });
const selectedFile = ref(null);
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
};

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
    fileInput.value.files = files; // 更新input的files属性
  }
};

// 清除已选择的文件
const clearSelectedFile = (event) => {
  event.stopPropagation(); // 防止触发上传区域的点击事件
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const downloadTemplate = async () => {
  const response = await settingApi.downloadTemplate({
    type: "import_initial_stock",
  });

  // 获取文件名
  const filename = `${trans("sku初始化库存模板")}.xlsx`;

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
};

const handleImport = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  await inventoryApi.importInventory(formData);
  emit("import", formData);
  // 导入完成后可以关闭弹窗
  visible.value = false;
};

// 暴露open方法给父组件
const open = () => {
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
  visible.value = true;
};

defineExpose({ open });
</script>

<style scoped lang="scss">
.upload-area {
  border: 2px dashed #dcdcdc;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: #f9f9f9;

  &:hover {
    border-color: #1976d2;
  }
}

.selected-file {
  max-width: 100%;

  .ellipsis {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

ul {
  list-style-type: disc;
  margin: 0;
  li {
    margin-bottom: 6px;
    font-size: 12px;
    line-height: 1.4;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>