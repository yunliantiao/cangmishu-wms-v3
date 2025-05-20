<template>
  <div class="materials-list-page">
    <!-- 操作按钮区域 -->
    <!-- <div class="flex-between-center m-b-50">
      <div class="font-bold text-h5">{{ trans("包材") }}</div>
      <div class="">
        <q-btn
          color="primary"
          icon="add"
          :label="trans('新建包材')"
          @click="add"
        />
      </div>
    </div> -->

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
      <div class="row q-col-gutter-sm">
        <div class="row-auto">
          <q-input
            outlined
            dense
            clearable
            v-model="pageData.search.keywords"
            :placeholder="trans('标题')"
            class="search-input"
            style="width: 200px"
            @keyup.enter="initList"
          />
        </div>
        <div class="row-auto">
          <q-btn
            color="primary"
            icon="search"
            @click="initList"
            class="h-40"
            :label="trans('搜索')"
          />
        </div>
      </div>
    </div>

    <div class="main-table">
      <!-- 操作栏 -->
      <div class="action-bar">
        <!-- <span>{{ trans("选择") }} {{ pageData.selectedRows.length }}</span> -->
        <q-btn
          flat
          color="primary"
          icon="print"
          :label="trans('打印标签')"
          @click="printTags"
        />

        <q-btn
          color="primary"
          icon="add"
          flat
          :label="trans('新建包材')"
          @click="add"
        />
      </div>

      <!-- 表格 -->
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
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
              <q-checkbox v-model="props.selected" size="sm" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" size="sm" />
            </q-td>

            <q-td>
              <div class="row items-center">
                <img
                  :src="props.row.image"
                  class="material-img"
                  v-if="props.row.image"
                />
                <div v-else class="material-img no-img">
                  <q-icon
                    name="image_not_supported"
                    size="32px"
                    color="grey-5"
                  />
                  <div class="no-img-text">No Image</div>
                </div>
                <div class="ml-8">
                  <div class="">{{ props.row.name }}</div>
                  <div class="material-code">[{{ props.row.code }}]</div>
                </div>
              </div>
            </q-td>
            <q-td>{{ props.row.size }}</q-td>
            <q-td>{{ props.row.weight }}</q-td>
            <q-td>{{ props.row.price }}</q-td>
            <q-td>
              <div>{{ trans("创建") }} {{ props.row.created_at }}</div>
              <div>{{ trans("更新") }} {{ props.row.updated_at }}</div>
            </q-td>
            <q-td>
              <div class="flex-center-center">
                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  @click="edit(props.row)"
                >
                  <img
                    src="@/assets/images/product/edit-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="编辑"
                  />
                  <q-tooltip>{{ trans("编辑") }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  @click="del(props.row)"
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
      </q-table>
    </div>
    <Form ref="formRef" @refresh="initList"></Form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import ProductApi from "@/api/product.js";
import Form from "./components/Form.vue";
import { useQuasar } from "quasar";
import trans from "@/i18n";
import Message from "@/utils/message.js";

const $q = useQuasar();
const pageData = reactive({
  search: {
    keywords: "",
    search_type: "name",
    search_mode: "fuzzy",
  },
  // warehouses: ["USC"],
  columns: [
    {
      name: "info",
      label: trans("包材信息"),
      field: "info",
      align: "left",
      headerStyle: "font-size:16px;font-weight:bold",
    },
    {
      name: "size",
      label: trans("尺寸 (cm)"),
      field: "size",
      align: "left",
      headerStyle: "font-size:16px;font-weight:bold",
    },
    {
      name: "weight",
      label: trans("重量 (g)"),
      field: "weight",
      align: "left",
      headerStyle: "font-size:16px;font-weight:bold",
    },
    {
      name: "price",
      label: trans("售价"),
      field: "price",
      align: "left",
      headerStyle: "font-size:16px;font-weight:bold",
    },
    {
      name: "time",
      label: trans("时间"),
      field: "time",
      align: "left",
      headerStyle: "font-size:16px;font-weight:bold",
    },
    {
      name: "actions",
      label: trans("操作"),
      field: "actions",
      align: "center",
      headerStyle: "font-size:16px;font-weight:bold",
    },
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
    title: trans("提示"),
    message: trans("确定删除所选包材吗?"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
  if (pageData.selectedRows.length === 0) {
    Message.notify(trans("请选择包材"));
    return;
  }
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

  .action-bar {
    display: flex;
    align-items: center;
    padding: 10px 0;
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
