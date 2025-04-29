<template>
  <div class="tag-list-page">
    <!-- 搜索区域 -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-auto">
        <q-input
          outlined
          dense
          v-model="componentData.keyword"
          label="请输入"
          class="search-input"
        />
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="search"
          label="搜索"
          class="q-ml-sm"
          @click="handleSearch"
        />
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="row q-mb-md justify-between">
      <div class="col-auto">
        <!-- 左侧空白区域，可以放置其他按钮 -->
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="新增标记"
          @click="handleAddTag"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <q-table
      :rows="componentData.list"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :hide-pagination="true"
      separator="horizontal"
      :loading="loading"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <div class="row items-center">
              <q-icon
                name="bookmark"
                :color="props.row.style"
                class="q-mr-sm"
              />
              {{ props.row.name }}
            </div>
          </q-td>
          <q-td key="description" :props="props">
            {{ props.row.description }}
          </q-td>

          <q-td key="actions" :props="props">
            <div class="row justify-center q-gutter-xs">
              <q-btn
                flat
                round
                color="grey-7"
                icon="edit"
                @click="handleEdit(props.row)"
              >
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="grey-7"
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>无数据</span>
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
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import Pagination from "@/components/Pagination.vue";
import productApi from "@/api/product";
import TagForm from "./components/TagForm.vue";
import { useQuasar } from "quasar";

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
  { name: "name", align: "left", label: "标记名称", field: "name" },
  { name: "description", align: "left", label: "备注", field: "description" },
  { name: "actions", align: "center", label: "操作", field: "actions" },
];

// 搜索处理
const handleSearch = () => {
  console.log("搜索条件:", componentData);
  // 这里可以添加搜索逻辑
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
    title: "确认删除",
    message: `确定要删除标记 "${row.name}" 吗？`,
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
  const { data } = await productApi.getTagList({
    // page: componentData.page,
    // page_size: componentData.rowsPerPage,
    keyword: componentData.searchText,
  });
  console.log("initList", data);
  componentData.list = data;
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
  console.log("删除标记:", row);
  try {
    loading.value = true;
    const { data } = await productApi.deleteTag(row.id);
    initList();
  } catch (error) {
    q.notify({
      type: "negative",
      message: "删除失败: " + (error.message || "未知错误"),
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
</style>