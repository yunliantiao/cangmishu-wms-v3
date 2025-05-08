<template>
  <div class="provider-page">
    <!-- 搜索栏区域 -->
    <div class="search-bar bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="状态"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.search_type"
            :options="searchTypeOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="搜索类型"
            class="select-width"
          />
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            clearable
            v-model="pageParams.keywords"
            placeholder="请输入关键字"
            style="max-width: 250px; min-width: 150px"
          ></q-input>
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.search_mode"
            :options="searchModeOptions"
            label="搜索模式"
            class="select-width"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
          />
        </div>
        <div class="col-auto">
          <q-btn outline color="grey" padding="sm md" label="重置" class="q-mr-sm" @click="onResetSearch" />
          <q-btn
            color="primary"
            icon="search"
            label="搜索"
            padding="sm md"
            :loading="$store.state.btnLoading"
            @click="getList"
          />
        </div>
      </div>
    </div>

    <!-- 卡片区域 -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <!-- 1 -->
      <div class="text-right">
        <q-btn color="primary" icon="add" label="添加物流商" text-color="white" @click="showForm = true" />
      </div>
      <!-- tab切换 -->
      <div class="tab-box q-mb-md">
        <q-tabs v-model="isCustom" dense align="left">
          <q-tab :name="false" label="对接物流商" />
          <q-tab :name="true" label="自定义物流商" />
        </q-tabs>
        <q-checkbox v-model="hideDisabled" color="primary" label="隐藏停用的物流商" />
      </div>
      <q-table
        :rows="filterProviderList"
        :columns="tabColumns"
        row-key="id"
        flat
        bordered
        hide-pagination
        :pagination="{
          page: pageParams.page,
          rowsPerPage: pageParams.per_page,
          total: total,
        }"
        :loading="$store.state.btnLoading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="system_provider_name" :props="props">
              {{ props.row.system_provider_name }}
            </q-td>
            <q-td key="created_at" :props="props">
              {{ props.row.created_at }}
            </q-td>
            <q-td key="is_enabled" :props="props">
              <q-btn
                :color="props.row.is_enabled ? 'primary' : 'red'"
                :label="props.row.is_enabled ? '启用' : '停用'"
                dense
                flat
                no-caps
              />
            </q-td>
            <q-td key="action" :props="props">
              <q-btn icon="editor" color="primary" size="sm" flat round @click="onEdit(props.row)">
                <q-tooltip anchor="top middle" :offset="[30, 30]">编辑</q-tooltip>
              </q-btn>
              <q-btn icon="description" color="primary" size="sm" flat round @click="onDetail(props.row)">
                <q-tooltip anchor="top middle" :offset="[30, 30]">详情</q-tooltip>
              </q-btn>
              <q-btn icon="delete" color="negative" size="sm" flat round @click="onDelete(props.row)">
                <q-tooltip anchor="top middle" :offset="[30, 30]">删除</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>无数据</span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
      </q-table>

      <!-- 分页 -->
      <div class="q-pa-md">
        <Pagination
          :total-count="total"
          v-model:page="pageParams.page"
          v-model:rows-per-page="pageParams.per_page"
          @page-change="getList"
        />
      </div>
    </div>

    <ProviderDialog v-model="showForm" :item="editItem" @close="editItem = {}" @success="getList"></ProviderDialog>
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import Pagination from '@/components/Pagination.vue';
import { useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProviderDialog from './components/ProviderDialog.vue';
const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const tabColumns = [
  {
    name: 'name',
    label: '账号名称',
    align: 'left',
    sortable: false,
    style: 'width: 300px',
  },
  {
    name: 'system_provider_name',
    label: '物流商',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '创建时间',
    align: 'center',
  },
  {
    name: 'is_enabled', // 是否启用
    label: '状态',
    align: 'center',
  },
  {
    name: 'action',
    label: '操作',
    align: 'center',
  },
];
const statusOptions = ref([
  {
    label: '全部状态',
    value: '',
  },
  {
    label: '启用',
    value: 'enabled',
  },
  {
    label: '停用',
    value: 'disabled',
  },
]);

const searchTypeOptions = ref([
  {
    label: '账号名称',
    value: 'custom_provider_name',
  },
  {
    label: '物流商',
    value: 'system_provider_name',
  },
]);

const searchModeOptions = ref([
  {
    label: '精确搜索',
    value: 'exact',
  },
  {
    label: '前缀搜索',
    value: 'prefix',
  },
  {
    label: '模糊搜索',
    value: 'fuzzy',
  },
]);

// 分页参数
const pageParams = reactive({
  type: '1', // 1对接物流商 2自定义物流商
  page: 1,
  per_page: 10,
  status: '', // 状态
  search_type: 'custom_provider_name',
  search_mode: '',
  keywords: '',
});
const total = ref(0);
const editItem = ref({});
const showForm = ref(false);
const providerList = ref([]);

// 隐藏停用的物流商
const hideDisabled = ref(false);
// 物流商类别
const isCustom = ref(false); // true 自定义物流商 false 对接物流商

// 过滤列表
const filterProviderList = computed(() => {
  // 先根据类型过滤
  let filteredList = providerList.value.filter((item) => {
    if (isCustom.value) {
      return item.is_custom;
    } else {
      return !item.is_custom;
    }
  });
  // 再根据是否隐藏停用的进行过滤
  if (hideDisabled.value) {
    filteredList = filteredList.filter((item) => item.is_enabled);
  }
  return filteredList;
});

// 重置搜索
const onResetSearch = () => {
  pageParams.page = 1;
  pageParams.per_page = 10;
  pageParams.status = '';
  pageParams.search_type = 'custom_provider_name';
  pageParams.search_mode = '';
  pageParams.keywords = '';
};

// 编辑
const onEdit = (row) => {
  editItem.value = row;
  showForm.value = true;
};

const onDetail = (row) => {
  router.push({
    path: '/logistics/offline/channel',
    query: {
      id: row.id,
    },
  });
};

// 删除
const onDelete = (row) => {
  $q.dialog({
    title: '提示',
    message: '您是否确定要删除该物流商？',
    ok: {
      label: '是',
      color: 'negative',
    },
    cancel: {
      label: '否',
      color: 'grey',
    },
    persistent: true,
  })
    .onOk(() => {
      // 调用接口删除数据
      logisticsApi.delProvider(row.id).then((res) => {
        // $q.notify({
        //   type: 'positive',
        //   message: '删除成功',
        // });
        getList();
      });
    })
    .onCancel(() => {});
};

// 获取列表
const getList = () => {
  // 调用接口获取数据
  getProvider();
};

// 获取物流商列表
const getProvider = () => {
  // 调用接口获取数据
  logisticsApi.getProviderList(pageParams).then((res) => {
    providerList.value = res.data.items;
    total.value = res.data.meta.total;
  });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss">
.provider-page {
  .search-bar {
    .select-width {
      width: 150px;
    }
  }

  .tab-box {
    display: flex;
    justify-content: space-between;
  }
}
</style>
