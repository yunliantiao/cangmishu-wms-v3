<template>
  <div class="shelf-page">
    <TopBack :title="trans('货架管理')"></TopBack>

    <div class="main-table">
      <q-btn
        color="primary"
        icon="add"
        flat
        class="filter-btn"
        @click="showCreateForm"
      >
        {{ trans("新建货架") }}
      </q-btn>
      <q-table
        :rows="shelfSizeList"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        class="shelf-table"
        :loading="$store.state.btnLoading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="sizeName" :props="props">
              <Copy :text="props.row.name"></Copy>
            </q-td>
            <q-td key="size_length" :props="props">
              {{ props.row.size_length }} cm
            </q-td>
            <q-td key="size_width" :props="props">
              {{ props.row.size_width }} cm
            </q-td>
            <q-td key="size_height" :props="props">
              {{ props.row.size_height }} cm
            </q-td>
            <q-td key="volume" :props="props">
              {{ props.row.volume }} cm³
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="created_at" :props="props">
              {{ props.row.created_at }}
            </q-td>
            <q-td key="actions" :props="props">
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  class="table-icon"
                  @click="showEditForm(props.row)"
                >
                  <img src="@/assets/images/edit.png" />
                  <q-tooltip>{{ trans("编辑") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  size="sm"
                  class="table-icon"
                  @click="confirmDelete(props.row)"
                >
                  <img src="@/assets/images/del.png" />
                  <q-tooltip>{{ trans("删除") }} </q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- 货架规格表单对话框 -->
    <q-dialog v-model="formVisible" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ editMode ? trans("编辑货架规格") : trans("新建货架规格") }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="handleSubmit" class="shelf-form">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="form-item">
                  <div class="form-label">
                    {{ trans("货架位规格名称") }}
                    <span class="required">*</span>
                  </div>
                  <q-input
                    outlined
                    dense
                    v-model="formData.name"
                    :placeholder="trans('请输入规格名称')"
                    :rules="[(val) => !!val || trans('请输入规格名称')]"
                  />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-item">
                  <div class="form-label">
                    {{ trans("备注") }}
                  </div>
                  <q-input
                    outlined
                    dense
                    v-model="formData.description"
                    :placeholder="trans('请输入备注')"
                  />
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <div class="form-item">
                  <div class="form-label">
                    {{ trans("长 (cm)") }} <span class="required">*</span>
                  </div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="formData.size_length"
                    :placeholder="trans('请输入')"
                    :rules="[
                      (val) => (!!val && val > 0) || trans('请输入大于0的数值'),
                    ]"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="form-item">
                  <div class="form-label">
                    {{ trans("宽 (cm)") }} <span class="required">*</span>
                  </div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="formData.size_width"
                    :placeholder="trans('请输入')"
                    :rules="[
                      (val) => (!!val && val > 0) || trans('请输入大于0的数值'),
                    ]"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="form-item">
                  <div class="form-label">
                    {{ trans("高 (cm)") }} <span class="required">*</span>
                  </div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="formData.size_height"
                    :placeholder="trans('请输入')"
                    :rules="[
                      (val) => (!!val && val > 0) || trans('请输入大于0的数值'),
                    ]"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="trans('确定')"
            color="primary"
            @click="handleSubmit"
            :loading="$store.state.btnLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import settingApi from "@/api/setting";
import trans from "@/i18n";
const $q = useQuasar();

// 表单控制
const formVisible = ref(false);
const editMode = ref(false);
const currentShelfSize = ref(null);

// 表单数据
const formData = ref({
  name: "",
  size_length: null,
  size_width: null,
  size_height: null,
  description: "",
});

// 表格列定义
const columns = [
  {
    name: "sizeName",
    label: trans("货架位规格名称"),
    field: "name",
    align: "left",
  },
  {
    name: "size_length",
    label: trans("长"),
    field: "size_length",
    align: "center",
  },
  {
    name: "size_width",
    label: trans("宽"),
    field: "size_width",
    align: "center",
  },
  {
    name: "size_height",
    label: trans("高"),
    field: "size_height",
    align: "center",
  },
  {
    name: "volume",
    label: trans("体积"),
    field: "volume",
    align: "center",
  },
  {
    name: "description",
    label: trans("备注"),
    field: "description",
    align: "left",
  },
  {
    name: "created_at",
    label: trans("时间"),
    field: "created_at",
    align: "center",
  },
  {
    name: "actions",
    label: trans("操作"),
    field: "actions",
    align: "center",
  },
];

// 货架规格列表数据
const shelfSizeList = ref([]);

const getShelfSizeList = async () => {
  settingApi.getShelfSpecList().then((res) => {
    if (res.success) {
      shelfSizeList.value = res.data;
    }
  });
};

const deleteShelfSize = async (id) => {
  // 模拟 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = shelfSizeList.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        shelfSizeList.value.splice(index, 1);
      }
      resolve({
        success: true,
      });
    }, 300);
  });
};

// 显示新建表单
const showCreateForm = () => {
  editMode.value = false;
  formData.value = {
    name: "",
    size_length: null,
    size_width: null,
    size_height: null,
    description: "",
  };
  formVisible.value = true;
};

// 显示编辑表单
const showEditForm = (row) => {
  editMode.value = true;
  formData.value = {
    name: row.name,
    size_length: row.size_length,
    size_width: row.size_width,
    size_height: row.size_height,
    volume: row.volume,
    description: row.description,
  };
  currentShelfSize.value = row;
  formVisible.value = true;
};

// 确认删除
const confirmDelete = (row) => {
  QuasarDialog.create({
    title: trans("确认删除"),
    message: trans("确定要删除货架规格 {name} 吗？", { name: row.name }),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确定"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
    },
  }).onOk(() => {
    settingApi.deleteShelfSpec(row.id).then((res) => {
      if (res.success) {
        $q.notify({
          message: trans("删除成功"),
          color: "positive",
        });
        getShelfSizeList();
      }
    });
  });
};

// 处理表单提交
const handleSubmit = async () => {
  if (editMode.value) {
    // 编辑模式
    await settingApi
      .updateShelfSpec(currentShelfSize.value.id, formData.value)
      .then((res) => {
        if (res.success) {
          formVisible.value = false;
          $q.notify({
            message: trans("货架规格更新成功"),
            color: "positive",
          });
        }
      });
  } else {
    // 新建模式
    await settingApi.addShelfSpec(formData.value).then((res) => {
      if (res.success) {
        formVisible.value = false;
      }
    });
  }
  getShelfSizeList();
};

// 初始化加载数据
getShelfSizeList();
</script>

<style lang="scss" scoped>
.shelf-page {
  .shelf-table {
    .q-table th {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      padding: 12px 16px;
      background-color: #f5f7fa;
    }

    .q-table td {
      font-size: 14px;
      padding: 12px 16px;
      color: rgba(0, 0, 0, 0.75);
    }
  }
}

.shelf-form {
  .form-item {
    margin-bottom: 16px;

    .form-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.75);
      margin-bottom: 8px;
      font-weight: 500;

      .required {
        color: #f56c6c;
        margin-right: 4px;
      }
    }

    .q-field {
      .q-field__control {
        height: 36px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #1976d2;
        }
      }

      &.q-field--focused .q-field__control {
        box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
      }
    }
  }
}
.main-table {
  padding-top: 10px;
}
</style>

