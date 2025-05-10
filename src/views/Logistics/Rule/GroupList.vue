<template>
  <div class="logistics-fuel">
    <div class="search-bar bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-input
            v-model="pageParams.keywords"
            style="width: 250px"
            placeholder="请输入物流组名称"
            outlined
            dense
            clearable
            @keyup="(e) => e.key === 'Enter' && getList()"
          ></q-input>
        </div>
        <div class="col-auto">
          <q-select
            outlined
            dense
            v-model="pageParams.search_mode"
            :options="searchModeOptions"
            placeholder="搜索模式"
            class="select-width"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            use-input
            fill-input
            hide-selected
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

    <div class="bg-white rounded-borders q-pa-md">
      <div class="text-right q-mb-md">
        <q-btn color="primary" icon="add" label="新建" text-color="white" @click="onJumpAdd" />
      </div>
      <!-- 表格 -->
      <q-table
        :rows="groupList"
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
            <q-td key="channel_count" :props="props">
              {{ props.row.channel_count }}
            </q-td>

            <q-td key="action" :props="props">
              <q-btn icon="editor" color="primary" size="sm" flat round @click="onEdit(props.row)">
                <q-tooltip anchor="top middle" :offset="[30, 30]">编辑</q-tooltip>
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
      <Pagination
        :total-count="total"
        v-model:page="pageParams.page"
        v-model:rows-per-page="pageParams.per_page"
        @page-change="getList"
      />
    </div>
    <GroupDialog v-model="showForm" :item="editItem" @close="editItem = {}" @success="getList"></GroupDialog>
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import Pagination from '@/components/Pagination.vue';
import { useQuasar } from 'quasar';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import GroupDialog from './components/GroupDialog.vue';

const router = useRouter();
const $q = useQuasar();

const showForm = ref(false);
const editItem = ref({});
const groupList = ref([]);
const total = ref(0);

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  keywords: '',
  search_mode: '',
});

const searchModeOptions = [
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
];

const tabColumns = [
  {
    name: 'name',
    label: '物流组名称',
    align: 'left',
    sortable: false,
  },
  {
    name: 'channel_count',
    label: '物流数量',
    align: 'center',
  },
  {
    name: 'action',
    label: '操作',
    align: 'center',
  },
];

// 新增
const onJumpAdd = () => {
  editItem.value = {};
  showForm.value = true;
};

// 编辑
const onEdit = (row) => {
  editItem.value = {
    ...row,
  };
  showForm.value = true;
};

// 删除
const onDelete = (row) => {
  $q.dialog({
    title: '提示',
    message: '您是否确定要删除该燃油规则？',
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
      // console.log('确定')
      // 调用接口删除数据
      logisticsApi.delZones(row.id).then((res) => {
        // $q.notify({
        //   type: 'positive',
        //   message: '删除成功',
        // });
        getList();
      });
    })
    .onCancel(() => {
      // console.log('取消')
    });
};

const onResetSearch = () => {
  pageParams.keywords = '';
  pageParams.search_mode = '';
};

const getList = () => {
  getGroupList();
};
const getGroupList = () => {
  logisticsApi.getGroupList(pageParams).then((res) => {
    groupList.value = res.data.items;
    total.value = res.data.meta.total;
  });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.logistics-fuel {
  .search-bar {
    .select-width {
      width: 150px;
    }
  }
}
</style>
