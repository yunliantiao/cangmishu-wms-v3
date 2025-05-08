<template>
  <div class="provider-info">
    <div class="search-bar bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.is_enabled"
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

    <div class="bg-white rounded-borders q-pa-md">
      <div class="header-operation q-mb-md">
        <div>
          <span class="q-mr-xs">选择 {{ selectedChannel.length }}</span>
          <q-btn flat text-color="blue" label="批量开启" @click="onEditStatus(true)" />
        </div>
        <q-btn icon="add" text-color="primary" padding="sm md" label="添加渠道" @click="onAdd"></q-btn>
      </div>

      <q-table
        :rows="channelList"
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
        selection="multiple"
        v-model:selected="selectedChannel"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" />
            </q-td>
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="is_enabled" :props="props">
              <q-toggle
                v-model="props.row.is_enabled"
                color="green"
                @update:model-value="(val) => onToggleStatus(props.row, val)"
              />
              <!-- <q-btn
                :color="props.row.is_enabled ? 'primary' : 'red'"
                :label="props.row.is_enabled ? '启用' : '停用'"
                dense
                flat
                no-caps
              /> -->
            </q-td>
            <q-td key="action" :props="props">
              <q-btn icon="editor" color="primary" size="sm" flat round @click="onEdit(props.row)">
                <q-tooltip anchor="top middle" :offset="[30, 30]">编辑</q-tooltip>
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

    <ChannelDialog
      v-model="showForm"
      :item="editItem"
      :providerInfo="providerInfo"
      @close="editItem = {}"
      @success="getList"
    ></ChannelDialog>
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import Pagination from '@/components/Pagination.vue';
import { useQuasar } from 'quasar';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import ChannelDialog from './components/ChannelDialog.vue';

const $q = useQuasar();
const route = useRoute();
const providerId = route.query.id;
const channelList = ref([]); // 渠道列表
const selectedChannel = ref([]);
const total = ref(0); // 总数量
const providerInfo = ref({}); // 物流商详情
const showForm = ref(false); // 显示标签弹窗
const editItem = ref({}); // 编辑item

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  is_enabled: '', // 1:启用 0:停用
  search_type: '',
  keywords: '',
});

const statusOptions = ref([
  {
    label: '全部状态',
    value: '',
  },
  {
    label: '启用',
    value: '1',
  },
  {
    label: '停用',
    value: '0',
  },
]);
const searchTypeOptions = ref([
  {
    label: '渠道名称',
    value: 'name',
  },
  {
    label: '渠道代码',
    value: 'code',
  },
]);

const tabColumns = [
  {
    name: 'code',
    label: '渠道代码',
    align: 'left',
  },
  {
    name: 'name',
    label: '物流渠道名称',
    align: 'left',
    sortable: false,
    style: 'width: 300px',
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

// 切换单个启用||停用
const onToggleStatus = (row, val) => {
  const ids = [row.id];
  onEditStatus(val, ids);
};

// 批量选择启用||禁用
const onEditStatus = (bool = true, ids = []) => {
  const channel_ids = ids.length ? ids : selectedChannel.value.map((item) => item.id);
  if (channel_ids.length === 0) {
    $q.notify({
      title: '提示',
      message: '请先勾选渠道',
    });
    return;
  }
  logisticsApi
    .updateChannelStatus(providerId, {
      is_enabled: bool,
      channel_ids: channel_ids,
    })
    .then((res) => {
      selectedChannel.value = [];
      getList();
    });
};

// 重置搜索
const onResetSearch = () => {
  pageParams.page = 1;
  pageParams.per_page = 10;
  pageParams.status = '';
  pageParams.search_type = 'custom_provider_name';
  pageParams.search_mode = '';
  pageParams.keywords = '';
};

const onAdd = () => {
  showForm.value = true;
};

const onEdit = (row) => {
  editItem.value = row;
  showForm.value = true;
};

const getList = () => {
  getChannelList();
};
// 渠道列表
const getChannelList = () => {
  logisticsApi.getProviderChannels(providerId, pageParams).then((res) => {
    channelList.value = res.data.items;
    total.value = res.data.meta.total;
  });
};
// 物流商详情
const getProviderInfo = () => {
  logisticsApi.getProviderInfo(providerId).then((res) => {
    providerInfo.value = res.data;
  });
};

// 生命周期钩子
onMounted(() => {
  getList();
  getProviderInfo();
});
</script>

<style lang="scss" scoped>
.provider-info {
  // 在此处添加样式
  .search-bar {
    .select-width {
      width: 150px;
    }
  }
  .header-operation {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
