<template>
  <div class="warehouse-page">
    <div class="row justify-end">
      <q-btn color="primary" class="filter-btn" @click="showCreateForm">
        <img src="@/assets/images/add.png" class="add-icon" />
        新建拣货车
      </q-btn>
    </div>

    <div class="main-table">
      <div class="row justify-end q-mb-md">
        <q-btn color="primary" label="打印" @click="handlePrint" />
      </div>
      <q-table
        :rows="pageData.list"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        class="warehouse-table"
        hide-bottom
        selection="multiple"
        v-model:selected="pageData.selectedRows"
        :loading="pageData.loading"
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
          <q-tr :props="props" align="center">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" />
            </q-td>
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="size" :props="props">
              {{ props.row.size_length }}
              *
              {{ props.row.size_width }}
              *
              {{ props.row.size_height }}
            </q-td>
            <q-td key="status" :props="props">
              {{ props.row.status == "available" ? "空闲" : "占用" }}
            </q-td>
            <q-td key="created_at" :props="props">
              {{ props.row.created_at }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
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
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  size="sm"
                  class="table-icon"
                  @click="confirmDelete(props.row)"
                >
                  <img src="@/assets/images/del.png" />
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <PickCarForm ref="pickCarFormRef" @refresh="getPickCarList" />
    <PrintForm ref="printFormRef" @confirm="handlePrintConfirm" />
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from "vue";
import settingApi from "@/api/setting";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import PickCarForm from "./components/PickerCarForm.vue";
import PrintForm from "./components/PrintForm.vue";
import Message from "@/utils/message.js";

const $q = useQuasar();
const pickCarFormRef = ref(null);
const printFormRef = ref(null);

const pageData = reactive({
  list: [],
  loading: false,
  selectedRows: [],
});

const columns = [
  {
    name: "code",
    label: "拣货车编号",
    field: "code",
    align: "left",
  },
  {
    name: "name",
    label: "名称",
    field: "name",
    align: "left",
  },
  {
    name: "size",
    label: "尺寸",
    field: "size",
    align: "left",
  },
  {
    name: "status",
    label: "状态",
    field: "status",
    align: "left",
  },
  {
    name: "created_at",
    label: "创建时间",
    field: "created_at",
    align: "center",
  },
  {
    name: "description",
    label: "描述",
    field: "description",
    align: "center",
  },
  {
    name: "actions",
    label: "操作",
    field: "actions",
    align: "center",
  },
];

onMounted(() => {
  getPickCarList();
});

const getPickCarList = async () => {
  pageData.loading = true;
  try {
    const res = await settingApi.getPickCarList();
    if (res.success) {
      pageData.list = res.data;
    }
  } catch (error) {
    console.error("获取拣货车列表失败", error);
  } finally {
    pageData.loading = false;
  }
};

const showCreateForm = () => {
  pickCarFormRef.value.open();
};

const showEditForm = (pickCar) => {
  pickCarFormRef.value.open(pickCar);
};

const confirmDelete = (pickCar) => {
  QuasarDialog.create({
    title: "确认删除",
    message: `确定要删除拣货车 "${pickCar.code}" 吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deletePickCar(pickCar.id);
  });
};

const deletePickCar = async (id) => {
  try {
    const res = await settingApi.deletePickCar(id);
    if (res.success) {
      getPickCarList();
      Message.notify("拣货车删除成功");
    }
  } catch (error) {
    console.error("删除拣货车失败", error);
    Message.notify("删除拣货车失败");
  }
};

const handlePrint = () => {
  console.log(pageData.selectedRows);
  if (pageData.selectedRows.length === 0) {
    Message.notify("请选择拣货车");
    return;
  }

  printFormRef.value.open();
};

const handlePrintConfirm = async (form) => {
  const codes = pageData.selectedRows.map((item) => item.code);
  const { data } = await settingApi.printPickCarLabel({ ...form, codes });
  console.log("data", data);
  window.open(data.data, "_blank");
  Message.successMessage("打印成功");
};
</script>

<style lang="scss" scoped>
.pick-car-page {
  .pick-car-table {
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

    .q-checkbox {
      font-size: 1.2em;
    }
  }
}

.select-box {
  padding: 10px;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}
</style>
