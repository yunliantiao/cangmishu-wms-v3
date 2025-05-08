<template>
  <div class="logistics-fuel">
    <div class="search-bar bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-input
            v-model="timeObj.result"
            placeholder="时间范围"
            class="q-mb-md"
            outlined
            dense
            clearable
            style="width: 260px"
            @clear="onClearTime"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="timeObj.time" mask="YYYY-MM-DD" range />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-input
            v-model="pageParams.keywords"
            style="width: 250px"
            placeholder="请输入规则名称"
            outlined
            dense
            clearable
            @keyup="(e) => e.key === 'Enter' && getList()"
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
      <div class="text-right q-mb-md">
        <q-btn color="primary" icon="add" label="新建" text-color="white" @click="showForm = true" />
      </div>
      <!-- 表格 -->
      <q-table
        :rows="fuelList"
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
            <q-td key="rate_formatted" :props="props">
              {{ props.row.rate_formatted }}
            </q-td>
            <q-td key="effective_date" :props="props">
              <span>{{ parseTime(props.row.effective_date, '{y}-{m}-{d}') }}</span>
              ~
              <span>{{ parseTime(props.row.expired_date, '{y}-{m}-{d}') }}</span>
            </q-td>
            <q-td key="created_at" :props="props">
              <div>
                <span class="text-grey">创建：</span>
                {{ parseTime(props.row.created_at, '{y}-{m}-{d}') }}
              </div>
              <div>
                <span class="text-grey">更新：</span>
                {{ parseTime(props.row.updated_at, '{y}-{m}-{d}') }}
              </div>
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
    <FuelDialog v-model="showForm" :item="editItem" @close="editItem = {}" @success="getList"></FuelDialog>
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import Pagination from '@/components/Pagination.vue';
import { parseTime } from '@/utils/common.js';
import { useQuasar } from 'quasar';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import FuelDialog from './components/FuelDialog.vue';

const router = useRouter();
const $q = useQuasar();

const fuelList = ref([]);
const total = ref(0);
const showForm = ref(false);
const editItem = ref({});
const timeObj = ref({
  result: '',
  time: {
    form: '', // 开始时间
    to: '', // 结束时间
  },
});

// 分页参数
const pageParams = reactive({
  page: 1,
  per_page: 10,
  keywords: '',
  start_date: '',
  end_date: '',
});

const tabColumns = [
  {
    name: 'name',
    label: '规则名称',
    align: 'left',
    sortable: false,
  },
  {
    name: 'rate_formatted',
    label: '费率',
    align: 'center',
  },
  {
    name: 'effective_date',
    label: '有效期',
    align: 'center',
  },
  {
    name: 'created_at',
    label: '时间',
    align: 'center',
  },
  {
    name: 'action',
    label: '操作',
    align: 'center',
  },
];

// 监听时间选择变化
watch(
  () => timeObj.value.time,
  (newVal) => {
    if (newVal.from && newVal.to) {
      timeObj.value.result = `${newVal.from} ~ ${newVal.to}`;
      pageParams.start_date = newVal.from;
      pageParams.end_date = newVal.to;
    } else {
      timeObj.value.result = '';
      pageParams.start_date = '';
      pageParams.end_date = '';
    }
  },
  { deep: true }
);

const onClearTime = () => {
  timeObj.value.time = {
    form: '',
    to: '',
  };
};

// 编辑
const onEdit = (row) => {
  editItem.value = {
    ...row,
    effective_date: row.effective_date?.split(' ')[0] || '',
    expired_date: row.expired_date?.split(' ')[0] || '',
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
      // 调用接口删除数据
      logisticsApi.delFuel(row.id).then((res) => {
        // $q.notify({
        //   type: 'positive',
        //   message: '删除成功',
        // });
        getList();
      });
    })
    .onCancel(() => {
    });
};

const onResetSearch = () => {
  // 重置时间选择器的值
  Object.assign(timeObj.value, {
    result: '',
    time: { from: '', to: '' },
  });
  pageParams.keywords = '';
  pageParams.start_date = '';
  pageParams.end_date = '';
};

const getList = () => {
  getFuelList();
};
const getFuelList = () => {
  logisticsApi.getFuelList(pageParams).then((res) => {
    fuelList.value = res.data.items;
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
