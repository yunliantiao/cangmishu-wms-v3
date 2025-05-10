

<template>
  <div class="materials-list-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <!-- <q-select
        outlined
        dense
        v-model="pageData.search.warehouse"
        :options="pageData.warehouses"
        class="search-select"
        style="width: 120px"
        emit-value
        map-options
      /> -->

      <q-input
        outlined
        dense
        v-model="pageData.search.keywords"
        label="关键词"
        class="search-input"
        style="width: 200px"
        @keyup.enter="initList"
      />
      <q-btn
        color="primary"
        icon="search"
        @click="initList"
        class="search-btn"
        label="搜索"
      />
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <span>选择 {{ pageData.selectedRows.length }}</span>
      <q-btn
        flat
        color="primary"
        class="ml-16"
        label="打印标签"
        @click="printTags"
      />
      <q-btn
        color="primary"
        class="float-right"
        icon="add"
        @click="add"
        label="新建包材"
      />
    </div>

    <!-- 表格 -->
    <q-table
      :rows="pageData.rows"
      :columns="pageData.columns"
      row-key="id"
      flat
      bordered
      hide-bottom
      :rows-per-page-options="[0]"
      :rows-per-page="0"
      :show-pagination="false"
      selection="multiple"
      v-model:selected="pageData.selectedRows"
      class="materials-table"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width>
            <q-checkbox v-model="props.selected" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" />
          </q-td>

          <q-td>
            <div class="row items-center">
              <img
                :src="props.row.image"
                class="material-img"
                v-if="props.row.image"
              />
              <div v-else class="material-img no-img">
                <q-icon name="image_not_supported" size="32px" color="grey-5" />
                <div class="no-img-text">No Image</div>
              </div>
              <div class="ml-8">
                <div>{{ props.row.name }}</div>
                <div class="material-code">[{{ props.row.code }}]</div>
              </div>
            </div>
          </q-td>
          <q-td>{{ props.row.size }}</q-td>
          <q-td>{{ props.row.weight }}</q-td>
          <q-td>{{ props.row.price }}</q-td>
          <q-td>
            <div>创建 {{ props.row.created_at }}</div>
            <div>更新 {{ props.row.updated_at }}</div>
          </q-td>
          <q-td>
            <q-btn flat round icon="edit" @click="edit(props.row)" />
            <q-btn flat round icon="delete" @click="del(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <Form ref="formRef" @refresh="initList"></Form>
  </div>
</template>


<script setup>
import { onMounted, reactive, ref } from "vue";
import ProductApi from "@/api/product.js";
import Form from "./components/Form.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const pageData = reactive({
  search: {
    keywords: "",
    search_type: "name",
    search_mode: "fuzzy",
  },
  // warehouses: ["USC"],
  types: ["包材名称"],
  columns: [
    { name: "info", label: "包材信息", field: "info", align: "left" },
    { name: "size", label: "尺寸 (cm)", field: "size", align: "left" },
    { name: "weight", label: "重量 (g)", field: "weight", align: "left" },
    { name: "price", label: "售价", field: "price", align: "left" },
    { name: "time", label: "时间", field: "time", align: "left" },
    { name: "actions", label: "操作", field: "actions", align: "left" },
  ],
  rows: [],
  selectedRows: [],
});

const formRef = ref(null);

onMounted(() => {
  initList();
  // getWarehouseList();
});

const initList = async () => {
  let params = {
    ...pageData.search,
  };
  pageData.selectedRows = [];
  const { data } = await ProductApi.getMaterialsList(params);
  pageData.rows = data.map((row) => {
    row.size = `${row.dimensions.length}*${row.dimensions.width}*${row.dimensions.height}`;
    return row;
  });
};

const edit = (row) => {
  let form = JSON.parse(JSON.stringify(row));
  formRef.value.open(form);
};

const del = (row) => {
  $q.dialog({
    title: "提示",
    message: "确定删除所选包材吗?",
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
    // TODO: 实现删除逻辑
    ProductApi.delMaterial(row.id).then((res) => {
      if (res.success) {
        initList();
      }
    });
  });
};

const add = () => {
  formRef.value.open();
};

const printTags = async () => {
  let codes = pageData.selectedRows.map((row) => row.code);
  const { data } = await ProductApi.printTags({ codes });
  console.log("data", data);
  window.open(data.data, "_blank");
};
</script>

<style scoped lang="scss">
.materials-list-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 0;

  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 24px 0 24px;
  }

  .action-bar {
    display: flex;
    align-items: center;
    padding: 10px 24px;
    margin-bottom: 8px;
    .ml-16 {
      margin-left: 16px;
    }
    .float-right {
      margin-left: auto;
    }
  }

  .materials-table {
    margin: 0 8px 0 8px;
    :deep(.q-table__middle) {
      background: #fff;
    }
    :deep(th) {
      background: #f5f6fa;
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }
    :deep(td) {
      font-size: 14px;
      color: #333;
      padding: 8px 12px;
    }
  }

  .material-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fafbfc;
  }
  .no-img {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: #fafbfc;
    border: 1px solid #eee;
    border-radius: 4px;
    .no-img-text {
      font-size: 10px;
      color: #bbb;
      margin-top: 2px;
    }
  }
  .material-code {
    color: #b0b0b0;
    font-size: 13px;
  }
  .ml-8 {
    margin-left: 8px;
  }
}
</style>