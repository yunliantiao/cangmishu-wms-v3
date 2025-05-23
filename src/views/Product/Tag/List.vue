<template>
  <div class="tag-list-page">
    <!-- 操作按钮区域 -->
    <!-- <div class="flex-between-center m-b-50">
      <div class="">
        <q-btn
          color="primary"
          icon="add"
          :label="trans('新增标记')"
          @click="handleAddTag"
        />
      </div>
    </div> -->

    <TopBack :title="trans('商品标记')"></TopBack>

    <!-- 搜索区域 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="componentData.keyword"
            clearable
            :placeholder="trans('请输入')"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            :label="trans('搜索')"
            class="filter-btn"
            @click="handleSearch"
          />
        </div>
      </div>
    </div>
    <div class="main-table">
      <q-btn
        color="primary"
        icon="add"
        flat
        :label="trans('新增标记')"
        @click="handleAddTag"
      />

      {{ loading }}
      <!-- 数据表格 -->
      <q-table
        :rows="componentData.list"
        :columns="columns"
        row-key="id"
        flat
        :hide-pagination="true"
        separator="horizontal"
        :loading="loading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              <div class="flex-start-center">
                <q-icon
                  name="bookmark"
                  :color="props.row.style"
                  class="q-mr-sm font-18"
                />
                <span>{{ props.row.name }}</span>
              </div>
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>

            <q-td key="actions" :props="props">
              <div class="flex-center-center">
                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  @click="handleEdit(props.row)"
                >
                  <img
                    src="@/assets/images/product/edit-icon.png"
                    class="cursor-pointer w-20 h-20"
                    :alt="trans('编辑')"
                  />
                  <q-tooltip>{{ trans("编辑") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  @click="confirmDelete(props.row)"
                >
                  <img
                    src="@/assets/images/product/delete-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="删除"
                  />
                  <q-tooltip>{{ trans("删除") }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("无数据") }}</span>
          </div>
        </template>
      </q-table>

      <!-- <div class="q-mt-md">
        <Pagination
          :total-count="componentData.total"
          v-model:page="componentData.page"
          :max-page="componentData.lastPage"
          v-model:rows-per-page="componentData.rowsPerPage"
          @page-change="handlePageChange"
        />
      </div> -->

      <TagForm
        v-model:visible="componentData.showTagForm"
        :edit-data="componentData.currentEditTag"
        @submit="handleTagSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import Pagination from "@/components/Pagination.vue";
import productApi from "@/api/product";
import TagForm from "./components/TagForm.vue";
import { useQuasar } from "quasar";
import trans from "@/i18n";

const q = useQuasar();

// 筛选选项
const componentData = reactive({
  keyword: "",
  total: 0,
  lastPage: 1,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 2,
  showTagForm: false,
  list: [],
  currentEditTag: {
    name: "",
    description: "",
    style: "",
    id: "",
  },
});

// 表格相关
const loading = ref(false);

// 表格列定义
const columns = [
  {
    name: "name",
    align: "left",
    label: trans("标记名称"),
    field: "name",
    headerStyle: "font-size:16px;font-weight:bold",
    style: "width:45%",
  },
  {
    name: "description",
    align: "left",
    label: trans("备注"),
    field: "description",
    headerStyle: "font-size:16px;font-weight:bold",
    style: "width:35%",
  },
  {
    name: "actions",
    align: "center",
    label: trans("操作"),
    field: "actions",
    headerStyle: "font-size:16px;font-weight:bold",
    style: "width:20%",
  },
];

// 搜索处理
const handleSearch = () => {
  console.log("搜索条件:", componentData);
  // 这里可以添加搜索逻辑
  initList();
};

// 添加标记
const handleAddTag = () => {
  componentData.currentEditTag = {
    name: "",
    description: "",
    style: "",
    id: "",
  };
  componentData.showTagForm = true;
};

// 编辑
const handleEdit = (row) => {
  console.log("编辑标记:", row);
  // 这里可以添加打开编辑标记对话框的逻辑
  componentData.currentEditTag = { ...row };
  componentData.showTagForm = true;
};

// 确认删除
const confirmDelete = (row) => {
  q.dialog({
    title: trans("确认删除"),
    message: trans(`确定要删除标记 {name} 吗？`, { name: row.name }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    handleDelete(row);
  });
};

onMounted(() => {
  // 初始化加载数据
  console.log("页面加载完成，初始化数据");
  initList();
});

const handlePageChange = ({ page, rowsPerPage }) => {
  componentData.page = page;
  componentData.rowsPerPage = rowsPerPage;
  initList();
};

const initList = async () => {
  loading.value = true;
  const { data } = await productApi.getTagList({
    // page: componentData.page,
    // page_size: componentData.rowsPerPage,
    keyword: componentData.keyword,
  });
  componentData.list = data;
  loading.value = false;
};

const handleTagSubmit = async (params) => {
  let data;
  if (params.id) {
    data = await productApi.updateTag(params.id, params);
  } else {
    data = await productApi.addTag(params);
  }
  console.log("data", data);
  componentData.page = 1;
  initList();
};

const handleDelete = async (row) => {
  try {
    const { data } = await productApi.deleteTag(row.id);
    initList();
  } catch (error) {
    q.notify({
      type: "negative",
      message: trans("删除失败: {message}", {
        message: error.message || "未知错误",
      }),
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.tag-list-page {
  width: 100%;
}

.filter-select {
  width: 200px;
}

.search-input {
  width: 200px;
}

/* 表格样式优化 */
:deep(.q-table th) {
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

:deep(.q-table td) {
  font-size: 14px;
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.75);
}

:deep(.q-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

.main-table {
  padding-top: 10px;
}
</style>
