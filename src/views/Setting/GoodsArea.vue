<template>
  <div class="goods-area-page">
    <!-- 筛选区域 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.area_type"
            :options="areaTypeOptionsForm"
            label="货区类型"
            class="filter-item"
            emit-value
            clearable
          >
            <template v-slot:selected>
              <div>
                {{
                  areaTypeOptionsForm.find(
                    (item) => item.value === pageParams.area_type
                  )?.label
                }}
              </div>
            </template>
          </q-select>
        </div>
        <div class="col-auto">
          <q-btn
            label="查询"
            color="primary"
            class="filter-btn"
            @click="fetchAreaList"
          />
        </div>
      </div>
    </div>

    <div class="main-table">
      <!-- 操作按钮区域 -->
      <div class="row justify-end q-mb-sm">
        <q-btn color="primary" class="filter-btn" @click="showCreateForm">
          <img src="@/assets/images/add.png" class="add-icon" />
          新建货区
        </q-btn>
      </div>

      <!-- 货区列表 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="areaList"
          :columns="columns"
          row-key="id"
          flat
          separator="horizontal"
          :loading="$store.state.btnLoading"
          class="area-table"
          hide-bottom
          :pagination="{
            page: pageParams.page,
            rowsPerPage: pageParams.per_page,
          }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="areaCode" :props="props">
                {{ props.row.code }}
              </q-td>
              <q-td key="areaType" :props="props">
                {{
                  areaTypeOptionsForm.find(
                    (item) => item.value === props.row.type
                  )?.label
                }}
              </q-td>
              <q-td key="time" :props="props">
                {{ props.row.created_at }}
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    class="table-icon"
                    size="sm"
                    @click="handleEdit(props.row)"
                  >
                    <img src="@/assets/images/edit.png" />
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    class="table-icon"
                    size="sm"
                    @click="handleDelete(props.row)"
                  >
                    <img src="@/assets/images/del.png" />
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="q-pa-md">
          <Pagination
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="fetchAreaList"
          />
        </div>
      </div>
    </div>

    <!-- 新建货区对话框 -->
    <q-dialog v-model="formVisible" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ editMode ? "编辑货区" : "新建货区" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="handleSubmit" class="area-form">
            <div class="form-item">
              <div class="form-label">
                货区类型 <span class="required">*</span>
              </div>
              <q-select
                outlined
                v-model="formData.type"
                :options="areaTypeOptionsForm"
                option-label="label"
                option-value="value"
                placeholder="请选择"
                emit-value
                :rules="[(val) => !!val || '请选择货区类型']"
              >
                <template v-slot:selected>
                  <div>
                    {{
                      areaTypeOptionsForm.find(
                        (item) => item.value === formData.type
                      )?.label || "请选择"
                    }}
                  </div>
                </template>
              </q-select>
            </div>
            <div class="form-item">
              <div class="form-label">
                货区编号 <span class="required">*</span>
              </div>
              <q-input
                outlined
                v-model="formData.code"
                placeholder="请输入"
                :rules="[(val) => !!val || '请输入货区编号']"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="确认"
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
import { ref, onMounted } from "vue";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import settingApi from "@/api/setting";
import Pagination from "@/components/Pagination.vue";

const $q = useQuasar();

// 筛选选项
const areaTypeFilter = ref("全部货区类型");
const areaTypeOptions = ["全部货区类型", "拣货区", "转运区"];
const areaTypeOptionsForm = [
  { label: "拣货区", value: "picking" },
  { label: "备货区", value: "staging" },
  { label: "不良品区", value: "defective" },
  { label: "转运区", value: "transit" },
];

// 表格列定义
const columns = [
  {
    name: "areaCode",
    label: "货区编号",
    field: "areaCode",
    align: "left",
  },
  {
    name: "areaType",
    label: "货区类型",
    field: "areaType",
    align: "center",
  },
  {
    name: "time",
    label: "时间",
    field: "createTime",
    align: "center",
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
  },
];

// 表单控制
const formVisible = ref(false);
const editMode = ref(false);
const formData = ref({
  code: "",
  type: "",
  //   remark: "",
});

// 货区列表数据
const areaList = ref([]);

// 初始化数据
onMounted(() => {
  fetchAreaList();
});

const pageParams = ref({
  page: 1,
  per_page: 10,
  total: 0,
  area_type: "",
});
// 获取货区列表
const fetchAreaList = async () => {
  settingApi.getGoodsAreaList(pageParams.value).then((res) => {
    if (res.success) {
      areaList.value = res.data.items;
      pageParams.value.total = res.data.meta.total;
    }
  });
};

// 显示创建表单
const showCreateForm = () => {
  editMode.value = false;
  formData.value = {
    type: "",
    code: "",
  };
  formVisible.value = true;
};

// 编辑货区
const handleEdit = (row) => {
  editMode.value = true;
  formData.value = {
    id: row.id,
    type: row.type,
    code: row.code,
  };
  formVisible.value = true;
};

// 删除货区
const handleDelete = (row) => {
  QuasarDialog.create({
    title: "确认删除",
    message: `确定要删除货区 "${row.code}" 吗？`,
    cancel: true,
    persistent: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(() => {
    settingApi.deleteGoodsArea(row.id).then((res) => {
      if (res.success) {
        $q.notify({
          message: "删除成功",
          color: "positive",
        });
        fetchAreaList();
      }
    });
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.type) {
    $q.notify({
      message: "请选择货区类型",
      color: "negative",
    });
    return;
  }

  if (!formData.value.code) {
    $q.notify({
      message: "请输入货区编号",
      color: "negative",
    });
    return;
  }
  let res = null;

  if (editMode.value) {
    // 编辑模式
    res = await settingApi.updateGoodsArea(formData.value.id, formData.value);
    $q.notify({
      message: "货区更新成功",
      color: "positive",
    });
  } else {
    // 新建模式
    res = await settingApi.addGoodsArea(formData.value);
    $q.notify({
      message: "货区创建成功",
      color: "positive",
    });
  }
  if (res.success) {
    formVisible.value = false;
    fetchAreaList();
  }
};
</script>

<style lang="scss" scoped>
.goods-area-page {
  .select-width {
    width: 150px;
  }

  .area-table {
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

.area-form {
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

    .q-textarea .q-field__control {
      height: auto;
      min-height: 100px;
    }
  }
}

.mt-50 {
  margin-top: 50px;
}
</style>