<template>
  <div class="shelf-location-page">
    <!-- 筛选区域 -->
    <div class="filter-section bg-white q-pa-md q-mb-md rounded-borders">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="areaTypeFilter"
            :options="areaTypeOptions"
            label="全部货区类型"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="statusFilter"
            :options="statusOptions"
            label="全部状态"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="locationFilter"
            :options="locationFilterOptions"
            label="货架位编号"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="searchText"
            placeholder="请输入"
            class="select-width"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="searchTypeFilter"
            :options="searchTypeOptions"
            label="精确搜索"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="search"
            label="搜索"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="page_table_action">
      <!-- 操作按钮区域 -->
      <div class="row justify-between q-mb-sm">
        <div class="row items-center">
          <span class="q-mr-sm">选择 {{ selectedLocations.length }}</span>
          <q-btn-dropdown
            color="primary"
            label="导入/导出"
            icon="file_upload"
            flat
            class="q-ml-sm"
          >
            <q-list>
              <q-item clickable v-close-popup @click="handleImport">
                <q-item-section>导入</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleExport">
                <q-item-section>导出</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            color="primary"
            label="删除"
            icon="delete"
            flat
            class="q-ml-sm"
            @click="confirmBatchDelete"
          />
          <q-btn
            color="primary"
            label="打印标签"
            icon="print"
            flat
            class="q-ml-sm"
            @click="handlePrintLabels"
          />
          <!-- <q-btn
            color="primary"
            label="清理货架位"
            icon="cleaning_services"
            flat
            class="q-ml-sm"
            @click="handleCleanLocations"
          /> -->
        </div>

        <div>
          <!-- <q-btn
            outline
            color="primary"
            label="清理货架位设置"
            icon="settings"
            class="q-mr-sm"
            @click="showCleanSettings"
          /> -->
          <q-btn
            color="primary"
            label="单个新建"
            icon="add"
            class="q-mr-sm"
            @click="showCreateForm"
          />
          <q-btn
            color="primary"
            label="批量新建"
            icon="add"
            @click="showBatchCreateForm"
          />
        </div>
      </div>

      <!-- 货架位列表 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="shelfLocations"
          :columns="columns"
          row-key="id"
          flat
          bordered
          separator="horizontal"
          selection="multiple"
          v-model:selected="selectedLocations"
          :loading="$store.state.btnLoading"
          class="location-table"
          hide-bottom
          :pagination="{
            page: pageParams.page,
            rowsPerPage: pageParams.per_page,
          }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td key="locationCode" :props="props">
                {{ props.row.code }}
              </q-td>
              <q-td key="productInfo" :props="props">
                <div v-if="props.row.productInfo">
                  {{ props.row.productInfo }}
                </div>
                <div v-else>-</div>
              </q-td>
              <q-td key="areaType" :props="props">
                {{
                  areaTypeOptions.find(
                    (item) => item.value === props.row.warehouse_area_type
                  )?.label || "--"
                }}
              </q-td>
              <q-td key="areaCode" :props="props">
                {{ props.row.warehouse_area.code }}
              </q-td>
              <q-td key="locationSpec" :props="props">
                {{ props.row.locationSpec }}
              </q-td>
              <q-td key="pickPriority" :props="props">
                {{ props.row.sort }}
              </q-td>
              <q-td key="status" :props="props">
                <q-chip
                  dense
                  :color="getStatusColor(props.row.status).bg"
                  :text-color="getStatusColor(props.row.status).text"
                >
                  {{ props.row.status === "idle" ? "空闲" : "已存放" }}
                </q-chip>
              </q-td>
              <q-td key="time" :props="props">
                <div>创建 {{ props.row.created_at }}</div>
                <div>更新 {{ props.row.updated_at }}</div>
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    icon="edit"
                    size="sm"
                    @click="handleEdit(props.row)"
                  >
                    <q-tooltip>编辑</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    icon="delete"
                    size="sm"
                    @click="handleDelete(props.row)"
                  >
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span> 无数据 </span>
            </div>
          </template>
        </q-table>
        <div class="q-pa-md">
          <Pagination
            :total-count="pageParams.total"
            v-model:page="pageParams.page"
            v-model:rows-per-page="pageParams.per_page"
            @page-change="getShelfLocationList"
          />
        </div>
      </div>
    </div>

    <!-- 表单对话框 (可根据需要添加) -->
    <q-dialog v-model="formVisible" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ editMode ? "编辑货架位" : "新建货架位" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="handleSubmit" class="location-form">
            <div class="form-item">
              <div class="form-label">
                货区类型 <span class="required">*</span>
              </div>
              <q-select
                outlined
                dense
                v-model="area_type"
                :options="areaTypeOptions"
                @update:model-value="getGoodsAreaList"
                option-label="label"
                option-value="value"
                emit-value
                placeholder="请选择"
                :rules="[(val) => !!val || '请选择货区类型']"
              >
                <template v-slot:selected>
                  <div>
                    {{
                      areaTypeOptions.find((item) => item.value === area_type)
                        ?.label || "请选择"
                    }}
                  </div>
                </template>
              </q-select>
            </div>

            <div class="form-item">
              <div class="form-label">
                货区编号 <span class="required">*</span>
              </div>
              <q-select
                outlined
                dense
                v-model="formData.warehouse_area_id"
                :options="areaCodeOptions"
                option-label="code"
                option-value="id"
                placeholder="请选择"
                emit-value
                :rules="[(val) => !!val || '请选择货区编号']"
              >
                <template v-slot:selected>
                  <div>
                    {{
                      areaCodeOptions.find(
                        (item) => item.id === formData.warehouse_area_id
                      )?.code || "请选择"
                    }}
                  </div>
                </template>
              </q-select>
            </div>

            <div class="form-item">
              <div class="form-label">
                货架位编号 <span class="required">*</span>
              </div>
              <q-input
                outlined
                dense
                v-model="formData.code"
                placeholder="请输入"
                :rules="[(val) => !!val || '请输入货架位编号']"
              />
            </div>

            <div class="form-item">
              <div class="form-label">货架位规格</div>
              <q-select
                outlined
                dense
                v-model="formData.shelf_spec_id"
                :options="locationSpecOptions"
                option-label="name"
                option-value="id"
                emit-value
              >
                <template v-slot:selected>
                  <div>
                    {{
                      locationSpecOptions.find(
                        (item) => item.id === formData.shelf_spec_id
                      )?.name || "请选择"
                    }}
                  </div>
                </template>
              </q-select>
            </div>

            <div class="form-item">
              <div class="form-label">拣货优先级</div>
              <q-input
                outlined
                dense
                type="number"
                v-model.number="formData.sort"
                placeholder="请输入"
              />
            </div>

            <div class="form-item q-my-md">
              <q-checkbox
                v-model="formData.allow_mixed_products"
                label="商品混放"
                color="primary"
                class="custom-checkbox"
                :true-value="1"
                :false-value="0"
              >
                <q-icon name="help_outline" class="cursor-pointer">
                  <q-tooltip
                    >勾选此按钮，则货架位支持多个商品存放，未勾选则货架位只支持单个商品存放</q-tooltip
                  >
                </q-icon>
              </q-checkbox>
            </div>

            <div class="form-item">
              <q-checkbox
                v-model="formData.allow_mixed_batches"
                label="批次混放"
                color="primary"
                class="custom-checkbox"
                :true-value="1"
                :false-value="0"
              >
                <q-icon name="help_outline" class="q-ml-xs cursor-pointer">
                  <q-tooltip
                    >勾选此按钮，则货架位上单个商品多个入库批次支持存放，未勾选则只支持单个商品单个入库批次存放</q-tooltip
                  >
                </q-icon>
              </q-checkbox>
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
import { ref, computed } from "vue";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import Pagination from "@/components/Pagination.vue";
import settingApi from "@/api/setting";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();
// 筛选与搜索
const area_type = ref("");

const areaTypeOptions = [
  { label: "拣货区", value: "picking" },
  { label: "备货区", value: "staging" },
  { label: "不良品区", value: "defective" },
  { label: "转运区", value: "transit" },
]; //货区类型
const areaCodeOptions = ref([]);
// 货架位
const locationSpecOptions = ref([]);
const statusFilter = ref("全部状态");
const statusOptions = ["全部状态", "空闲", "已存放"];
const locationFilter = ref("货架位编号");
const locationFilterOptions = ["货架位编号", "货区编号"];
const searchText = ref("");
const searchTypeFilter = ref("精确搜索");
const searchTypeOptions = ["精确搜索", "模糊搜索"];

// 表格数据与选择
const selectedLocations = ref([]);

// 表单控制
const formVisible = ref(false);
const editMode = ref(false);
const formData = ref({
  warehouse_area_id: "", //货架区域
  shelf_spec_id: "", //货架规格
  code: "", //编号
  allow_mixed_products: 1, //允许混合产品
  allow_mixed_batches: 1, //允许混合批次
  length: "",
  width: "",
  height: "",
  remark: "",
  sort: "",
});

// 表格列定义
const columns = [
  {
    name: "locationCode",
    label: "货架位编号",
    field: "locationCode",
    align: "left",
  },
  {
    name: "productInfo",
    label: "商品信息",
    field: "productInfo",
    align: "left",
  },
  {
    name: "areaType",
    label: "货区类型",
    field: "areaType",
    align: "center",
  },
  {
    name: "areaCode",
    label: "货区编号",
    field: "areaCode",
    align: "center",
  },
  {
    name: "locationSpec",
    label: "货架位规格",
    field: "locationSpec",
    align: "center",
  },
  {
    name: "pickPriority",
    label: "拣货优先级",
    field: "pickPriority",
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: "状态",
    field: "status",
    align: "center",
  },
  {
    name: "time",
    label: "时间",
    field: "time",
    align: "center",
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
  },
];

// 货架位数据
const shelfLocations = ref([]);

const pageParams = ref({
  page: 1,
  per_page: 10,
  total: 0,
});

// 获取货架位列表
const getShelfLocationList = () => {
  settingApi.getShelfLocationList(pageParams.value).then((res) => {
    if (res.success) {
      shelfLocations.value = res.data.items;
      pageParams.value.total = res.data.meta.total;
      // 清空选中项
      selectedLocations.value = [];
    }
  });
};

// 获取状态对应的颜色
const getStatusColor = (status) => {
  switch (status) {
    case "idle":
      return { bg: "green-1", text: "green" };
    default:
      return { bg: "blue-1", text: "blue" };
  }
};

// 搜索方法
const handleSearch = () => {
  // 实际应用中这里会调用API搜索
  console.log("搜索条件:", {
    warehouse: warehouseFilter.value,
    areaType: areaTypeFilter.value,
    status: statusFilter.value,
    searchField: locationFilter.value,
    searchText: searchText.value,
    searchType: searchTypeFilter.value,
  });
};

// 表单显示
const showCreateForm = () => {
  editMode.value = false;
  formData.value = {
    warehouse_area_id: "", // 货架区域
    shelf_spec_id: "", // 货架规格
    code: "", // 编号
    allow_mixed_products: 1, // 允许混合产品
    allow_mixed_batches: 1, // 允许混合批次
    length: "",
    width: "",
    height: "",
    remark: "",
  };
  formVisible.value = true;
};

// 获取货区列表
const getGoodsAreaList = () => {
  settingApi
    .getGoodsAreaList({
      area_type: area_type.value,
    })
    .then((res) => {
      if (res.success) {
        areaCodeOptions.value = res.data.items;
      }
    });
};
// 获取货架规格列表
const getShelfSizeList = () => {
  settingApi.getShelfSpecList().then((res) => {
    if (res.success) {
      locationSpecOptions.value = res.data;
    }
  });
};
getShelfSizeList();
getShelfLocationList();

const showBatchCreateForm = () => {
  router.push({
    name: "batchAdd",
  });
};

const showImportForm = () => {
  $q.notify({
    message: "导入创建功能将在后续版本中提供",
    color: "info",
  });
};

// 编辑货架位
const handleEdit = (row) => {
  editMode.value = true;
  area_type.value = areaTypeOptions.find(
    (item) => item.value === row.warehouse_area_type
  ).value;
  formData.value = {
    id: row.id,
    warehouse_area_id: row.warehouse_area_id, // 货架区域
    code: row.code, // 编号
    allow_mixed_products: row.allow_mixed_products ? 1 : 0, // 允许混合产品
    allow_mixed_batches: row.allow_mixed_batches ? 1 : 0, // 允许混合批次
    shelf_spec_id: row.shelf_spec_id, // 货架规格
    sort: row.sort,
    length: row.length,
    width: row.width,
    height: row.height,
    remark: row.remark,
  };
  getGoodsAreaList();
  formVisible.value = true;
};

// 删除确认
const handleDelete = (row) => {
  QuasarDialog.create({
    title: "确认删除",
    message: `确定要删除货架位 "${row.code}" 吗？`,
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
    settingApi.deleteShelfLocation(row.id).then((res) => {
      if (res.success) {
        getShelfLocationList();
      }
    });
  });
};

// 批量删除
const confirmBatchDelete = () => {
  if (selectedLocations.value.length === 0) {
    $q.notify({
      message: "请先选择需要删除的货架位",
      color: "warning",
    });
    return;
  }

  QuasarDialog.create({
    title: "确认删除",
    message: `确定要删除选中的 ${selectedLocations.value.length} 个货架位吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // 实际应用中这里会调用批量删除API
    const selectedIds = selectedLocations.value.map((item) => item.id);
    shelfLocations.value = shelfLocations.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedLocations.value = [];
    $q.notify({
      message: "批量删除成功",
      color: "positive",
    });
  });
};

// 其他功能方法
const handleImport = () => {
  $q.notify({
    message: "导入功能将在后续版本中提供",
    color: "info",
  });
};

const handleExport = () => {
  $q.notify({
    message: "导出功能将在后续版本中提供",
    color: "info",
  });
};

const handlePrintLabels = () => {
  if (selectedLocations.value.length === 0) {
    $q.notify({
      message: "请先选择需要打印标签的货架位",
      color: "warning",
    });
    return;
  }

  $q.notify({
    message: "打印标签功能将在后续版本中提供",
    color: "info",
  });
};

const handleCleanLocations = () => {
  $q.notify({
    message: "清理货架位功能将在后续版本中提供",
    color: "info",
  });
};

const showCleanSettings = () => {
  $q.notify({
    message: "清理货架位设置功能将在后续版本中提供",
    color: "info",
  });
};

// 表单提交
const handleSubmit = async () => {
  let res = {};
  // 实际应用中这里会调用API保存数据
  if (editMode.value) {
    // 编辑模式
    res = await settingApi.updateShelfLocation(
      formData.value.id,
      formData.value
    );
  } else {
    // 新建模式
    res = await settingApi.addShelfLocation(formData.value);
  }

  if (res.success) {
    $q.notify({
      message: "操作成功",
      color: "positive",
    });
    formVisible.value = false;
    getShelfLocationList();
  }
};
</script>

<style lang="scss" scoped>
.shelf-location-page {
  .select-width {
    width: 150px;
  }

  .location-table {
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

.location-form {
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

.custom-checkbox {
  :deep(.q-checkbox__inner) {
    &:before {
      border-radius: 0;
    }

    .q-checkbox__bg {
      border-radius: 0;
    }
  }
}
</style>