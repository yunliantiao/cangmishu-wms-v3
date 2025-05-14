<template>
  <div class="categories-page">
    <div class="main-table">
      <q-btn
        color="primary"
        class="filter-btn"
        flat
        icon="add"
        @click="handleAddCategory(null)"
      >
        新增分类
      </q-btn>
      <!-- 分类树 -->
      <div class="col-12">
        <q-tree
          :nodes="categories"
          node-key="id"
          default-expand-all
          v-model:selected="selectedCategory"
          :loading="$store.state.btnLoading"
        >
          <template v-slot:default-header="prop">
            <div class="row items-center full-width">
              <div>{{ prop.node.name }}</div>
              <q-space />
              <div class="row" v-if="prop.node.code !== 'uncategorized'">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  class="table-icon"
                  @click.stop="handleAddCategory(prop.node)"
                >
                  <img src="@/assets/images/add-1.png" />
                  <q-tooltip>添加子分类</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  class="table-icon"
                  size="sm"
                  @click.stop="handleEditCategory(prop.node)"
                >
                  <img src="@/assets/images/edit.png" />
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  class="table-icon"
                  size="sm"
                  @click.stop="handleDeleteCategory(prop.node)"
                >
                  <img src="@/assets/images/del.png" />
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
        </q-tree>
      </div>
    </div>

    <!-- 添加/编辑分类对话框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEdit ? "编辑分类" : "新增分类" }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="handleSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="form.name"
              label="分类名称"
              :rules="[(val) => !!val || '请输入分类名称']"
            />
            <div class="row justify-end q-mt-md">
              <q-btn label="取消" color="primary" flat v-close-popup />
              <q-btn
                label="确定"
                type="submit"
                color="primary"
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">确认删除</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          确认删除分类？如该分类存在子分类，子分类数据将会被一并删除，且应用了该分类的商品将变成未分类！
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="确定"
            color="negative"
            @click="confirmDelete"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useQuasar } from "quasar";
import categoriesApi from "@/api/categories";

const $q = useQuasar();

// 分类数据
const categories = ref([
  //   {
  //     id: 1,
  //     label: "未分类",
  //     code: "uncategorized",
  //     children: [],
  //   },
]);

const getCategoryTree = async () => {
  const res = await categoriesApi.getCategoryTree();
  if (res.success) {
    categories.value = res.data;
  }
};

getCategoryTree();

// 选中的分类
const selectedCategory = ref(null);

// 对话框控制
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEdit = ref(false);
const currentNode = ref(null);

// 表单数据
const form = reactive({
  name: "",
});

// 重置表单
const resetForm = () => {
  form.name = "";
};

// 添加分类
const handleAddCategory = (node) => {
  isEdit.value = false;
  currentNode.value = node;
  resetForm();
  showDialog.value = true;
};

// 编辑分类
const handleEditCategory = (node) => {
  isEdit.value = true;
  currentNode.value = node;
  form.name = node.name;
  showDialog.value = true;
};

// 删除分类
const handleDeleteCategory = (node) => {
  currentNode.value = node;
  showDeleteDialog.value = true;
};

// 确认删除
const confirmDelete = () => {
  // TODO: 调用API删除分类
  categoriesApi.deleteCategory(currentNode.value.id).then((res) => {
    if (res.success) {
      getCategoryTree();
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  let data = {};
  // TODO: 调用API保存分类
  if (isEdit.value) {
    // 编辑分类
    data = await categoriesApi.updateCategory(currentNode.value.id, {
      name: form.name,
    });
  } else {
    data = await categoriesApi.createCategory({
      name: form.name,
      parent_id: currentNode.value?.id || null,
      description: "",
    });
  }

  if (data.success) {
    showDialog.value = false;
    getCategoryTree();
  }
};
</script>

<style lang="scss" scoped>
.categories-page {
  .search-bar {
    margin-top: 50px;
  }
  .q-tree {
    .q-tree__node-header {
      padding: 8px;
      border-radius: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }
    }
  }
}

.main-table {
  padding-top: 10px;
}
</style>

