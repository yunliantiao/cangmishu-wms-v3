<template>
  <div class="customer-page">
    <!-- 搜索栏 -->
    <div class="search-bar q-mb-md">
      <div class="row q-col-gutter-md">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.warehouse_id"
            :options="warehouseList"
            option-value="id"
            option-label="name"
            emit-value
            clearable
            label="仓库"
            class="warehouse-select"
            style="width: 150px"
          >
            <template v-slot:selected>
              <div v-if="pageParams.warehouse_id">
                {{
                  warehouseList.find((o) => o.id === pageParams.warehouse_id)
                    ?.name || "请选择"
                }}
              </div>
            </template>
          </q-select>
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.search_type"
            :options="customerIdOptions"
            option-value="value"
            option-label="label"
            emit-value
            clearable
            label="搜索类型"
            class="customer-select"
            style="width: 150px"
          >
            <template v-slot:selected>
              <div v-if="pageParams.search_type">
                {{
                  customerIdOptions.find(
                    (o) => o.value === pageParams.search_type
                  )?.label || "请选择"
                }}
              </div>
            </template>
          </q-select>
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="pageParams.keywords"
            placeholder="请输入"
            style="width: 200px"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            label="查询"
            icon="search"
            class="full-width"
            :loading="$store.state.btnLoading"
            @click="getCustomerList"
          />
        </div>
      </div>
    </div>
    <div class="container">
      <!-- 标签页 -->
      <div class="tabs-section q-mb-md">
        <q-tabs
          v-model="activeTab"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          @update:model-value="getCustomerList"
          class="text-grey-8"
        >
          <q-tab name="approved" label="审核通过" />
          <q-tab name="used" label="已停用" />
        </q-tabs>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar row justify-between q-mb-md">
        <div>
          <!-- 左侧可能有其他操作按钮 -->
        </div>
    <div>
          <q-btn label="OMS地址" color="primary" flat class="q-mr-sm">
            <q-icon name="link" size="xs" class="q-ml-xs" />
          </q-btn>
          <q-btn
            label="开户"
            color="primary"
            icon="add"
            unelevated
            @click="handleAddCustomer"
          >
            <q-tooltip>创建新客户账户</q-tooltip>
          </q-btn>
        </div>
      </div>
      <!-- 数据表格 -->
      <q-table
        :rows="customers"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="horizontal"
        hide-pagination
        :loading="$store.state.btnLoading"
      >
        <template v-slot:loading>
          <div class="full-width row flex-center q-gutter-sm">
            <q-spinner-dots color="primary" size="2em" />
            <span>加载中...</span>
          </div>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span> 无数据 </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:body-cell-customerId="props">
          <q-td :props="props">
            <div class="customer-info">
              <span class="customer-id">{{ props.value.code || "--" }}</span>
              <span class="customer-name text-grey-8">
                {{ props.value.name || "--" }}
              </span>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-contactWay="props">
          <q-td :props="props">
            <div class="contact-info">
              <div class="email-row">
                <q-icon name="email" size="xs" class="q-mr-xs text-blue-7" />
                {{ props.value.email || "--" }}
              </div>
              <div v-if="props.row.phone_number" class="phone-row">
                <q-icon name="phone" size="xs" class="q-mr-xs text-green-7" />
                {{ props.value.phone_prefix }}
                {{ props.value.phone_number || "--" }}
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="contact-info">
              <div class="email-row">
                <q-icon name="email" size="xs" class="q-mr-xs text-blue-7" />
                {{ props.value || "--" }}
              </div>
              <div v-if="props.row.phone_number" class="phone-row">
                <q-icon name="phone" size="xs" class="q-mr-xs text-green-7" />
                {{ props.row.phone_prefix }}
                {{ props.row.phone_number || "--" }}
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              color="primary"
              @click="handleEditCustomer(props.row)"
              icon="edit"
              size="sm"
            >
              <q-tooltip>编辑客户信息</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              @click="handleDisableCustomer(props.row.id)"
              icon="block"
              size="sm"
              v-if="activeTab == 'approved'"
            >
              <q-tooltip>停用客户</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="positive"
              @click="handleEnableCustomer(props.row.id)"
              icon="check"
              size="sm"
              v-if="activeTab == 'used'"
            >
              <q-tooltip>启用客户</q-tooltip>
            </q-btn>
            <!-- <q-btn flat round color="grey-7" icon="more_horiz" size="sm">
              <q-menu>
                <q-list style="min-width: 120px">
                  <q-item clickable v-close-popup>
                    <q-item-section>查看明细</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>资金记录</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>导出数据</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn> -->
          </q-td>
        </template>
      </q-table>
      <!-- 分页 -->
      <div class="q-pa-md">
        <Pagination
          :total-count="pageParams.total"
          v-model:page="pageParams.page"
          v-model:rows-per-page="pageParams.per_page"
          @page-change="getCustomerList"
        />
      </div>
    </div>
    <Dialog
      v-model="dialogVisible"
      :footerShow="false"
      :title="editCustomerId ? '编辑客户' : '开户'"
      width="700px"
      height="500px"
    >
      <q-form @submit="onSubmit" class="customer-form">
        <div class="row q-col-gutter-sm q-mb-sm">
          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">客户代码</div>
              <div class="text-negative">*</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.code"
              placeholder="请输入"
              class="q-mt-xs"
              :rules="[(val) => !!val || '客户姓名不能为空']"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">邮箱</div>
              <div class="text-negative">*</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.email"
              placeholder="请输入"
              class="q-mt-xs"
              :rules="[
                (val) => !!val || '邮箱不能为空',
                (val) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) ||
                  '请输入有效的邮箱地址',
              ]"
            />
          </div>

          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2">公司名称</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.name"
              placeholder="请输入"
              class="q-mt-xs"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">手机号</div>
              <div class="text-negative">*</div>
            </div>
            <div class="row q-mt-xs">
              <q-select
                outlined
                dense
                v-model="formData.phone_prefix"
                :options="phoneCodes"
                placeholder="请选择"
                class="col-4 q-pr-sm"
                :rules="[(val) => !!val || '请选择国家代码']"
              />
              <q-input
                outlined
                dense
                v-model="formData.phone_number"
                placeholder="请输入"
                class="col-8"
                :rules="[
                  (val) => !!val || '手机号不能为空',
                  (val) => /^\d+$/.test(val) || '请输入有效的手机号',
                ]"
              />
            </div>
          </div>

          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">结算币种</div>
              <div class="text-negative">*</div>
            </div>
            <q-select
              outlined
              dense
              v-model="formData.currency"
              :options="currencyOptions"
              placeholder="请选择"
              class="q-mt-xs"
              :rules="[(val) => !!val || '请选择结算币种']"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2">国家/地区</div>
            </div>
            <q-select
              outlined
              dense
              v-model="formData.country_code"
              :options="countryOptions"
              option-value="code"
              option-label="name"
              map-options
              emit-value
              placeholder="请选择"
              class="q-mt-xs"
            />
          </div>
          <!-- 仓库分配全宽度显示 -->
          <div class="col-12">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">分配仓库</div>
            </div>
            <div class="row items-center q-mb-xs">
              <q-icon
                name="info_outline"
                size="16px"
                color="grey-7"
                class="q-mr-xs"
              />
              <div class="text-grey-7 text-caption">
                至少选择开启一个仓库并选择该仓库的计费策略
              </div>
            </div>
            <div class="warehouse-table">
              <div
                class="warehouse-header row items-center bg-grey-2 q-px-md q-py-xs"
              >
                <div class="col-4 text-subtitle2">计费模板</div>
                <!-- <div class="col-4 text-subtitle2">开启/关闭</div>
                <div class="col-4 text-subtitle2">
                  <div class="row items-center">
                    <div>计费模板</div>
                    <div class="text-negative q-ml-sm">*</div>
                    <q-icon
                      name="help_outline"
                      size="16px"
                      color="grey-7"
                      class="q-ml-xs"
                    />
                  </div>
                </div> -->
              </div>
              <div
                class="warehouse-row row items-center q-px-md q-py-sm border-bottom"
              >
                <div class="col-4">
                  <q-select
                    outlined
                    dense
                    v-model="formData.billing_template_id"
                    :options="billingOptions"
                    option-value="id"
                    option-label="name"
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 备注全宽度显示 -->
          <div class="col-12">
            <div class="row items-center form-label">
              <div class="text-subtitle2">备注</div>
            </div>
            <q-input
              outlined
              v-model="formData.remark"
              placeholder="请输入"
              type="textarea"
              rows="2"
              class="q-mt-xs"
            />
          </div>
        </div>

        <div class="row justify-end q-gutter-sm q-py-sm">
          <q-btn
            label="取消"
            color="grey-7"
            flat
            @click="dialogVisible = false"
          />
          <q-btn
            label="确认"
            :loading="$store.state.btnLoading"
            type="submit"
            color="primary"
            unelevated
          />
        </div>
      </q-form>
    </Dialog>
    </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import Dialog from "@/components/Dialog.vue";
import customerApi from "@/api/customer";
import Pagination from "@/components/Pagination.vue";
import warehouseApi from "@/api/warehouse";
import { useQuasar, Dialog as QuasarDialog } from "quasar";

const customerIdOptions = [
  { label: "客户代码", value: "code" },
  { label: "邮箱", value: "email" },
  { label: "手机号", value: "phone_number" },
  { label: "客户姓名", value: "name" },
  { label: "公司名称", value: "company" },
];

const dialogVisible = ref(false);
// 标签页
const activeTab = ref("approved");

// 表单数据
const formData = reactive({
  name: "",
  code: "",
  email: "",
  country_code: "",
  city: "",
  remark: "",
  phone_prefix: "",
  phone_number: "",
  currency: "",
  billing_template_id: "",
});

// 表单选项
const phoneCodes = ["+86"];
const currencyOptions = ["USD", "CNY"];
const countryOptions = [
  { name: "中国", code: "CN" },
  { name: "美国", code: "US" },
];
const billingOptions = [{ name: "标准计费", id: 1 }];

const customers = ref([]);
const warehouseList = ref([]);
const getWarehouseList = () => {
  warehouseApi.getWarehouseList().then((res) => {
    if (res.success) {
      warehouseList.value = res.data;
    }
  });
};
// 分页配置
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  warehouse_id: "",
  is_active: 1,
  keywords: "",
  search_type: "",
});
// 获取客户列表
const getCustomerList = () => {
  pageParams.is_active = activeTab.value == "used" ? 0 : 1;
  customerApi.getCustomerList(pageParams).then((res) => {
    if (res.success) {
      customers.value = res.data.items;
      pageParams.total = res.data.meta.total;
    }
  });
};
getCustomerList();
getWarehouseList();
// 表格配置
const columns = [
  {
    name: "customerId",
    label: "客户代码/姓名",
    field: (row) => ({ id: row.id, code: row.code, name: row.name }),
    align: "left",
  },
  {
    name: "contactWay",
    label: "联系方式",
    field: (row) => ({
      id: row.id,
      email: row.email,
      phone_prefix: row.phone_prefix,
      phone_number: row.phone_number,
    }),
    align: "left",
  },
  {
    name: "name",
    label: "公司名称",
    field: "name",
    align: "left",
  },
  { name: "currency", label: "结算币种", field: "currency", align: "left" },
  {
    name: "warehouseCount",
    label: "已分配仓库",
    field: (row) => 1,
    align: "center",
  },
  { name: "created_at", label: "创建时间", field: "created_at", align: "left" },
  { name: "actions", label: "操作", field: (row) => row, align: "center" },
];
const editCustomerId = ref(null);
//编辑
const handleEditCustomer = (row) => {
  editCustomerId.value = row.id;
  Object.keys(formData).forEach((key) => {
    formData[key] = row[key];
  });
  dialogVisible.value = true;
};
//开户
const handleAddCustomer = () => {
  editCustomerId.value = null;
  dialogVisible.value = true;
};

const handleEnableCustomer = (id) => {
  QuasarDialog.create({
    title: "启用客户",
    message: "确定启用该客户吗？",
    cancel: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-8",
    },
  }).onOk(() => {
    customerApi.enableCustomer(id).then((res) => {
      if (res.success) {
        getCustomerList();
      }
    });
  });
};
const handleDisableCustomer = (id) => {
  QuasarDialog.create({
    title: "停用客户",
    message: "确定停用该客户吗？",
    cancel: true,
    ok: {
      label: "确认",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-8",
    },
  }).onOk(() => {
    customerApi.disableCustomer(id).then((res) => {
      if (res.success) {
        getCustomerList();
      }
    });
  });
};

const onSubmit = () => {
  let api = editCustomerId.value
    ? customerApi.updateCustomer(editCustomerId.value, formData)
    : customerApi.createCustomer(formData);
  api.then((res) => {
    if (res.success) {
      dialogVisible.value = false;
      //   // 重置表单数据
      Object.keys(formData).forEach((key) => {
        formData[key] = "";
      });
      getCustomerList();
    }
  });
};
</script>

<style scoped lang="scss">
.customer-page {
  border-radius: 8px;
}
.container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}
.search-bar {
  background-color: #fff;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  .q-select,
  .q-input {
    .q-field__control {
      height: 36px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }

  .q-btn {
    height: 36px;
    width: 36px;
  }
}

.tabs-section {
  justify-content: flex-start;

  .q-tabs {
    &__content {
      height: 40px;
    }
    &__tab {
      font-weight: 500;
      letter-spacing: 0.5px;
    }
  }
}

.action-bar {
  .q-btn {
    &--unelevated {
      height: 36px;
      font-weight: 500;
      &:hover {
        opacity: 0.9;
      }
    }
    &--flat {
      font-weight: 500;
      &:hover {
        background: rgba(25, 118, 210, 0.05);
      }
    }
  }
}

.customer-info {
  .customer-id {
    color: #1976d2;
    font-size: 14px;
    margin-right: 4px;
  }
  .customer-name {
    font-size: 13px;
    margin-top: 4px;
  }
}

.contact-info {
  .email-row,
  .phone-row {
    display: flex;
    align-items: center;
    font-size: 13px;
  }
  .phone-row {
    margin-top: 4px;
  }
}

.time-info {
  font-size: 13px;

  .create-time,
  .update-time {
    display: flex;
    align-items: center;
  }
}

.q-table {
  border-radius: 4px;
  margin: 8px 16px 16px;

  thead tr {
    background-color: rgba(0, 0, 0, 0.02);
  }

  th {
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    padding: 12px 16px;
  }

  td {
    font-size: 14px;
    padding: 12px 16px;
    color: rgba(0, 0, 0, 0.75);
    white-space: nowrap;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  tbody tr {
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }

    .q-btn {
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
  }

  &__bottom {
    padding: 8px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.q-select {
  .q-field__marginal {
    height: 40px;
  }
}

// 客户表单样式
.customer-form {
  .text-subtitle2 {
    font-size: 14px;
    font-weight: 500;
  }

  .form-label {
    margin-top: 8px;
    margin-bottom: 2px;
  }

  .q-field {
    &--outlined .q-field__control {
      background: #fff;
      height: 32px;
    }
  }

  .q-chip {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.85);
  }

  .warehouse-table {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;

    .warehouse-header {
      background-color: rgba(0, 0, 0, 0.03);
      font-size: 14px;
    }

    .warehouse-row {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .border-bottom {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}
</style>
