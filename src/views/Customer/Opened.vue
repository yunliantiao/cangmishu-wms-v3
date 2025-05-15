<template>
  <div class="customer-page">
    <!-- 操作栏 -->
    <!-- <div class="action-bar flex-between-center m-b-50">
      <div class="text-h5 font-bold">
        已开户
      </div>
      <div>

      </div>
    </div> -->

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
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
            :label="trans('仓库')"
            class="warehouse-select"
            style="width: 150px"
          >
            <template v-slot:selected>
              <div v-if="pageParams.warehouse_id">
                {{
                  warehouseList.find((o) => o.id === pageParams.warehouse_id)
                    ?.name || trans("请选择")
                }}
              </div>
            </template>
          </q-select>
        </div>
        <KeywordSearch
          v-model:search_type="pageParams.search_type"
          v-model:search_value="pageParams.keywords"
          :searchTypeList="customerIdOptions"
          :showSearchMode="false"
        ></KeywordSearch>

        <div class="col-auto">
          <q-btn
            color="primary"
            :label="trans('查询')"
            icon="search"
            class="h-40"
            :loading="$store.state.btnLoading"
            @click="getCustomerList"
          />
        </div>
      </div>
    </div>
    <div class="main-table">
      <!-- 标签页 -->
      <div class="tabs-section q-mb-md top-bar">
        <q-tabs
          v-model="activeTab"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          @update:model-value="getCustomerList"
          class="text-grey-8"
        >
          <q-tab name="approved" :label="trans('审核通过')" />
          <q-tab name="used" :label="trans('已停用')" />
        </q-tabs>

        <div>
          <q-btn
            :label="trans('OMS地址')"
            color="primary"
            outline
            flat
            icon="link"
            class="q-mr-sm"
            @click="openOms(currentDomain)"
          >
          </q-btn>
          <q-btn
            :label="trans('开户')"
            color="primary"
            icon="add"
            flat
            unelevated
            @click="handleAddCustomer"
          >
            <q-tooltip>{{ trans("创建新客户账户") }}</q-tooltip>
          </q-btn>
        </div>
      </div>
      <!-- 数据表格 -->
      <q-table
        :rows="customers"
        :columns="columns"
        row-key="id"
        flat
        separator="horizontal"
        hide-pagination
        :loading="$store.state.btnLoading"
      >
        <template v-slot:loading>
          <div class="full-width row flex-center q-gutter-sm">
            <q-spinner-dots color="primary" size="2em" />
            <span>{{ trans("加载中...") }}</span>
          </div>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("无数据") }} </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <!-- TODO: -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="customerId" :props="props">
              <div class="customer-info">
                <div class="customer-id">{{ props.row.code || "--" }}</div>
                <div class="customer-name text-grey-8">
                  {{ props.row.name || "--" }}
                </div>
              </div>
            </q-td>
            <q-td key="contactWay" :props="props">
              <div class="contact-info">
                <div class="email-row">
                  <q-icon
                    name="email"
                    size="xs"
                    class="q-mr-xs"
                    color="black"
                  />
                  {{ props.row.email || "--" }}
                </div>
                <div v-if="props.row.phone_number" class="phone-row">
                  <q-icon
                    name="phone"
                    size="xs"
                    class="q-mr-xs"
                    color="black"
                  />
                  {{ props.row.phone_prefix }}
                  {{ props.row.phone_number || "--" }}
                </div>
              </div>
            </q-td>
            <q-td key="name" :props="props">
              <div>{{ props.row.name }}</div>
            </q-td>
            <q-td key="currency" :props="props">
              <div>{{ props.row.currency }}</div>
            </q-td>
            <q-td key="created_at" :props="props">
              <div>{{ props.row.created_at }}</div>
            </q-td>
            <q-td key="actions" :props="props" class="text-center">
              <div class="flex-center-center gap-20">
                <div
                  @click="handGetCode(props.row)"
                  v-if="!props.row.is_partner_code_used"
                >
                  <img
                    src="@/assets/images/customer/auth.png"
                    class="cursor-pointer w-20 h-20"
                    alt="授权码"
                  />
                  <q-tooltip>{{ trans("授权码") }}</q-tooltip>
                </div>

                <div @click="handleEditCustomer(props.row)">
                  <img
                    src="@/assets/images/customer/edit-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="编辑客户信息"
                  />
                  <q-tooltip>{{ trans("编辑客户信息") }}</q-tooltip>
                </div>
                <div @click="handleGetTempOmsToken(props.row.id)">
                  <img
                    src="@/assets/images/customer/share-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="跳转OMS登录"
                  />
                  <q-tooltip>{{ trans("跳转OMS登录") }}</q-tooltip>
                </div>
                <div
                  v-if="activeTab !== 'used'"
                  @click="handleDisableCustomer(props.row.id)"
                >
                  <img
                    src="@/assets/images/customer/close-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="停用客户"
                  />
                  <q-tooltip>{{ trans("停用客户") }}</q-tooltip>
                </div>
                <div
                  v-if="activeTab === 'used'"
                  @click="handleEnableCustomer(props.row.id)"
                >
                  <img
                    src="@/assets/images/customer/check-icon.png"
                    class="cursor-pointer w-20 h-20"
                    alt="启用客户"
                  />
                  <q-tooltip>{{ trans("启用客户") }}</q-tooltip>
                </div>
              </div>

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
          </q-tr>
        </template>
        <!-- TODO: -->
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
      :title="editCustomerId ? trans('编辑客户') : trans('开户')"
      width="700px"
      height="500px"
    >
      <q-form @submit="onSubmit" class="customer-form">
        <div class="row q-col-gutter-sm q-mb-sm">
          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">{{ trans("客户代码") }}</div>
              <div class="text-negative">*</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.code"
              :placeholder="trans('请输入')"
              class="q-mt-xs"
              :rules="[(val) => !!val || trans('客户姓名不能为空')]"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">{{ trans("邮箱") }}</div>
              <div class="text-negative">*</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.email"
              :placeholder="trans('请输入')"
              class="q-mt-xs"
              :rules="[
                (val) => !!val || trans('邮箱不能为空'),
                (val) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) ||
                  trans('请输入有效的邮箱地址'),
              ]"
            />
          </div>

          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2">{{ trans("公司名称") }}</div>
            </div>
            <q-input
              outlined
              dense
              v-model="formData.name"
              :placeholder="trans('请输入')"
              class="q-mt-xs"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">{{ trans("手机号") }}</div>
              <div class="text-negative">*</div>
            </div>
            <div class="row q-mt-xs">
              <q-select
                outlined
                dense
                v-model="formData.phone_prefix"
                :options="phoneCodes"
                :placeholder="trans('请选择')"
                class="col-4 q-pr-sm"
                :rules="[(val) => !!val || trans('请选择')]"
              />
              <q-input
                outlined
                dense
                v-model="formData.phone_number"
                :placeholder="trans('请输入')"
                class="col-8"
                :rules="[
                  (val) => !!val || trans('手机号不能为空'),
                  (val) => /^\d+$/.test(val) || trans('请输入有效的手机号'),
                ]"
              />
            </div>
          </div>

          <!-- 左侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">{{ trans("结算币种") }}</div>
              <div class="text-negative">*</div>
            </div>
            <q-select
              outlined
              dense
              v-model="formData.currency"
              :options="currencyOptions"
              :placeholder="trans('请选择')"
              class="q-mt-xs"
              :rules="[(val) => !!val || trans('请选择结算币种')]"
            />
          </div>

          <!-- 右侧列 -->
          <div class="col-6">
            <div class="row items-center form-label">
              <div class="text-subtitle2">{{ trans("国家/地区") }}</div>
            </div>
            <q-select
              outlined
              dense
              v-model="formData.country_code"
              :options="filteredCountries"
              option-value="code"
              option-label="name"
              map-options
              emit-value
              use-input
              input-debounce="300"
              @filter="filterCountries"
              :placeholder="trans('请选择或搜索')"
              class="q-mt-xs"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">{{
                    trans("未找到匹配的国家/地区")
                  }}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <!-- 仓库分配全宽度显示 -->
          <!-- <div class="col-12">
            <div class="row items-center form-label">
              <div class="text-subtitle2 q-mr-sm">{{ trans("分配仓库") }}</div>
            </div>
            <div class="row items-center q-mb-xs">
              <q-icon
                name="info_outline"
                size="16px"
                color="grey-7"
                class="q-mr-xs"
              />
              <div class="text-grey-7 text-caption">
                {{ trans("至少选择开启一个仓库并选择该仓库的计费策略") }}
              </div>
            </div>
            <div class="warehouse-table">
              <div
                class="warehouse-header row items-center bg-grey-2 q-px-md q-py-xs"
              >
                <div class="col-4 text-subtitle2">{{ trans("计费模板") }}</div>
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
                    emit-value
                    :placeholder="trans('请选择')"
                  />
                </div>
              </div>
            </div>
          </div> -->

          <!-- 备注全宽度显示 -->
          <div class="col-12">
            <div class="row items-center form-label">
              <div class="text-subtitle2">{{ trans("备注") }}</div>
            </div>
            <q-input
              outlined
              v-model="formData.remark"
              :placeholder="trans('请输入')"
              type="textarea"
              rows="2"
              class="q-mt-xs"
            />
          </div>
        </div>

        <div class="row justify-end q-gutter-sm q-py-sm">
          <q-btn
            :label="trans('取消')"
            color="grey-7"
            flat
            @click="dialogVisible = false"
          />
          <q-btn
            :label="trans('确认')"
            :loading="$store.state.btnLoading"
            type="submit"
            color="primary"
            unelevated
          />
        </div>
      </q-form>
    </Dialog>
    <Code ref="codeDialog"></Code>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import Dialog from "@/components/Dialog.vue";
import customerApi from "@/api/customer";
import Pagination from "@/components/Pagination.vue";
import warehouseApi from "@/api/warehouse";
import { useQuasar, Dialog as QuasarDialog } from "quasar";
import { copyText } from "@/utils/common";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";
import { useStore } from "vuex";
import Code from "./components/code.vue";
import trans from "@/i18n";

const billingOptions = ref([]);
const getBillingTemplate = async () => {
  const { data } = await customerApi.getBillingTemplate();
  console.log("data", data);

  billingOptions.value = data.items;
};

const store = useStore();
const customerIdOptions = [
  { label: trans("客户代码"), value: "code" },
  { label: trans("邮箱"), value: "email" },
  { label: trans("手机号"), value: "phone_number" },
  { label: trans("客户姓名"), value: "name" },
  { label: trans("公司名称"), value: "company" },
];

const dialogVisible = ref(false);
// 标签页
const activeTab = ref("approved");
const codeDialog = ref(null);

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

const customers = ref([]);
const warehouseList = ref([]);
const getWarehouseList = () => {
  warehouseApi.getWarehouseList().then((res) => {
    if (res.success) {
      warehouseList.value = res.data;
    }
  });
};

const currentDomain = ref("");
const getCurrentDomain = () => {
  customerApi.getCurrentDomain().then((res) => {
    if (res.success) {
      currentDomain.value = res.data;
    }
  });
};
const handleGetTempOmsToken = (id) => {
  customerApi.getTempOmsToken(id).then((res) => {
    if (res.success) {
      window.open(
        currentDomain.value + "/login?token=" + res.data.token,
        "_blank"
      );
    }
  });
};
const openOms = (domain) => {
  window.open(domain, "_blank");
};
getCurrentDomain();
// 分页配置
const pageParams = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  warehouse_id: "",
  is_active: 1,
  keywords: "",
  search_type: "code",
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
    label: trans("客户代码/姓名"),
    field: (row) => ({ id: row.id, code: row.code, name: row.name }),
    align: "center",
    style: "width:200px",
  },
  {
    name: "contactWay",
    label: trans("联系方式"),
    field: (row) => ({
      id: row.id,
      email: row.email,
      phone_prefix: row.phone_prefix,
      phone_number: row.phone_number,
    }),
    align: "center",
    style: "width:200px",
  },
  {
    name: "name",
    label: trans("公司名称"),
    field: "name",
    align: "center",
  },
  {
    name: "currency",
    label: trans("结算币种"),
    field: "currency",
    align: "center",
  },
  {
    name: "created_at",
    label: trans("创建时间"),
    field: "created_at",
    align: "center",
  },
  {
    name: "actions",
    label: trans("操作"),
    field: (row) => row,
    align: "center",
  },
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
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });
  editCustomerId.value = null;
  dialogVisible.value = true;
};

const handleEnableCustomer = (id) => {
  QuasarDialog.create({
    title: trans("启用客户"),
    message: trans("确定启用该客户吗？"),
    cancel: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
    title: trans("停用客户"),
    message: trans("确定停用该客户吗？"),
    cancel: true,
    ok: {
      label: trans("确认"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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

const filteredCountries = ref([]);

const filterCountries = (val, update) => {
  if (!val || val === "") {
    filteredCountries.value = store.state.countries;
    update();
    return;
  }

  const needle = val.toLowerCase();
  filteredCountries.value = store.state.countries.filter(
    (v) =>
      v.name.toLowerCase().includes(needle) ||
      v.code.toLowerCase().includes(needle)
  );
  update();
};

const handGetCode = async (row) => {
  const res = await customerApi.getAuthorizationCode(row.id);
  console.log("res", res);
  codeDialog.value.open(res.data);
};

// Initialize filtered countries
onMounted(() => {
  getBillingTemplate();
  filteredCountries.value = store.state.countries;
});
</script>

<style scoped lang="scss">
.customer-page {
  // 1.顶部
  .action-bar {
    .q-btn {
      height: 40px;
      font-weight: 500;
    }
  }
  // 2.tab切换
  .tabs-section {
    display: flex;
    justify-content: flex-start;
    border-bottom: 1px solid #e6e6e6;
    .q-tabs {
      &__content {
        height: 40px;
      }
      &__tab {
        font-weight: 500;
        letter-spacing: 0.5px;
      }
      .q-tab {
        padding: 0;
        &:not(:last-child) {
          margin-right: 50px;
        }
      }
    }
  }
  // 3.表格(客户代码/姓名)
  .customer-info {
    font-size: 14px;
    line-height: 16px;
    .customer-id {
      color: $primary;
      margin-bottom: 10px;
    }
    .customer-name {
      color: #1f1f1f;
    }
  }
  // 4.表格(联系方式)
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
}

.time-info {
  font-size: 13px;

  .create-time,
  .update-time {
    display: flex;
    align-items: center;
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

.top-bar {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
}
</style>
