<template>
  <div class="warehouse-page">
    <div class="row justify-end">
      <q-btn color="primary" class="filter-btn" @click="showCreateForm">
        <img src="@/assets/images/add.png" class="add-icon" />
        新建
      </q-btn>
    </div>

    <div class="main-table">
      <q-table
        :rows="warehouseList"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        class="warehouse-table"
        hide-bottom
        :loading="loading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="warehouseId" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="warehouseName" :props="props">
              {{ props.row.name }}
            </q-td>
            <!-- <q-td key="warehouseType" :props="props"> 1 </q-td> -->
            <q-td key="country" :props="props">
              {{
                $store.state.countries.find(
                  (item) => item.code == props.row.country_code
                )?.name || ""
              }}
            </q-td>
            <q-td key="receiveStatus" :props="props">
              <q-chip
                dense
                :color="props.row.allow_inbound ? 'green-1' : 'orange-1'"
                :text-color="props.row.allow_inbound ? 'green' : 'orange'"
                class="text-weight-medium"
              >
                {{ props.row.allow_inbound ? "正常收货" : "禁止收货" }}
              </q-chip>
            </q-td>
            <q-td key="orderStatus" :props="props">
              <q-chip
                dense
                :color="props.row.allow_order ? 'green-1' : 'orange-1'"
                :text-color="props.row.allow_order ? 'green' : 'orange'"
                class="text-weight-medium"
              >
                {{ props.row.allow_order ? "正常接单" : "禁止接单" }}
              </q-chip>
            </q-td>
            <q-td key="creator" :props="props">
              {{ props.row.owner.name }}
            </q-td>
            <q-td key="createTime" :props="props">
              {{ props.row.created_at }}
            </q-td>
            <q-td key="actions" :props="props">
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  class="table-icon"
                  size="sm"
                  @click="toggleInbound(props.row)"
                >
                  <img
                    src="@/assets/images/stop.png"
                    v-if="props.row.allow_inbound"
                  />
                  <img src="@/assets/images/start.png" v-else />
                  <q-tooltip
                    >{{ props.row.allow_inbound ? "暂停收货" : "允许收货" }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="table-icon"
                  size="sm"
                  @click="toggleOrder(props.row)"
                >
                  <img
                    src="@/assets/images/stop-order.png"
                    v-if="props.row.allow_order"
                  />
                  <img src="@/assets/images/start-order.png" v-else />
                  <q-tooltip
                    >{{ props.row.allow_order ? "暂停接单" : "允许接单" }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  size="sm"
                  class="table-icon"
                  @click="showEditForm(props.row)"
                >
                  <img src="@/assets/images/edit.png" />
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <!-- <q-btn flat round color="grey-7" icon="delete" size="sm" @click="confirmDelete(props.row)">
                  <q-tooltip>删除</q-tooltip>
                </q-btn> -->
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- 仓库表单组件 -->
    <WarehouseForm
      v-model="formVisible"
      :edit-mode="editMode"
      :warehouse-data="currentWarehouse"
      @created="handleWarehouseCreated"
      @updated="handleWarehouseUpdated"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import warehouseApi from "@/api/warehouse";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import WarehouseForm from "@/components/WarehouseForm.vue";

const $q = useQuasar();

// 表单控制
const formVisible = ref(false);
const editMode = ref(false);
const currentWarehouse = ref({});
const loading = ref(false);

// 表格列定义
const columns = [
  {
    name: "warehouseId",
    label: "仓库编号",
    field: "warehouseId",
    align: "left",
  },
  {
    name: "warehouseName",
    label: "仓库名称",
    field: "warehouseName",
    align: "left",
  },
  {
    name: "country",
    label: "国家/地区",
    field: "country",
    align: "center",
  },
  {
    name: "receiveStatus",
    label: "收货状态",
    field: "receiveStatus",
    align: "center",
  },
  {
    name: "orderStatus",
    label: "接单状态",
    field: "orderStatus",
    align: "center",
  },
  {
    name: "creator",
    label: "创建人",
    field: "creator",
    align: "center",
  },
  {
    name: "createTime",
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

// 仓库列表数据
const warehouseList = ref([]);

// 获取仓库列表
const getWarehouseList = async () => {
  loading.value = true;
  try {
    const res = await warehouseApi.getWarehouseList();
    if (res.success) {
      warehouseList.value = res.data;
    }
  } catch (error) {
    console.error("获取仓库列表失败", error);
  } finally {
    loading.value = false;
  }
};

// 显示新建表单
const showCreateForm = () => {
  editMode.value = false;
  currentWarehouse.value = {};
  formVisible.value = true;
};

// 显示编辑表单
const showEditForm = (warehouse) => {
  editMode.value = true;
  currentWarehouse.value = warehouse;
  formVisible.value = true;
};

// 处理仓库创建成功
const handleWarehouseCreated = (data) => {
  getWarehouseList();
  $q.notify({
    message: "仓库创建成功",
    color: "positive",
  });
};

// 处理仓库更新成功
const handleWarehouseUpdated = (data) => {
  getWarehouseList();
  $q.notify({
    message: "仓库更新成功",
    color: "positive",
  });
};

const toggleOrder = (warehouse) => {
  warehouseApi.toggleOrder(warehouse.id).then((res) => {
    if (res.success) {
      getWarehouseList();
    }
  });
};
const toggleInbound = (warehouse) => {
  warehouseApi.toggleInbound(warehouse.id).then((res) => {
    if (res.success) {
      getWarehouseList();
    }
  });
};
// 确认删除
const confirmDelete = (warehouse) => {
  QuasarDialog.create({
    title: "确认删除",
    message: `确定要删除仓库 "${warehouse.name}" 吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteWarehouse(warehouse.id);
  });
};

// 删除仓库
const deleteWarehouse = async (id) => {
  try {
    const res = await warehouseApi.deleteWarehouse({ id });
    if (res.success) {
      getWarehouseList();
      $q.notify({
        message: "仓库删除成功",
        color: "positive",
      });
    }
  } catch (error) {
    console.error("删除仓库失败", error);
    $q.notify({
      message: "删除仓库失败",
      color: "negative",
    });
  }
};

// 初始化加载数据
getWarehouseList();
</script>

<style lang="scss" scoped>
.warehouse-page {
  .search-bar {
    margin-top: 50px;
  }
  .warehouse-table {
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
</style>