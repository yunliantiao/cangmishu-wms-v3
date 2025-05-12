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
        <q-btn color="primary" icon="add" label="新建" text-color="white" @click="onJumpAdd" />
      </div>
      <!-- 表格 -->
      <q-table
        :rows="strategyList"
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
            <q-td key="match_type" :props="props">
              {{ resultMatch(props.row.match_type) }}
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
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import Pagination from '@/components/Pagination.vue';
import { parseTime } from '@/utils/common.js';
import { useQuasar } from 'quasar';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const $q = useQuasar();

const strategyList = ref([]);
const total = ref(0);
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
  // keywords: '',
  // start_date: '',
  // end_date: '',
});

const tabColumns = [
  {
    name: 'name',
    label: '规则名称',
    align: 'left',
    sortable: false,
  },
  {
    name: 'match_type',
    label: '匹配方式',
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
      // pageParams.start_date = newVal.from;
      // pageParams.end_date = newVal.to;
    } else {
      timeObj.value.result = '';
      // pageParams.start_date = '';
      // pageParams.end_date = '';
    }
  },
  { deep: true }
);

const resultMatch = (match_type) => {
  if (match_type === 'postcode') {
    return '邮编全匹配';
  } else if (match_type === 'country') {
    return '国家/地区匹配';
  } else if (match_type === 'country_city') {
    return '国家/地区+城市匹配';
  } else {
    return '-';
  }
};

const onClearTime = () => {
  timeObj.value.time = {
    form: '',
    to: '',
  };
};

// 新增
const onJumpAdd = () => {
  router.push({
    path: '/logistics/cost/strategy',
  });
};

// 编辑
const onEdit = (row) => {
  router.push({
    path: '/logistics/cost/strategy',
    query: {
      id: row.id,
    },
  });
};

// 删除
const onDelete = (row) => {
  $q.dialog({
    title: '提示',
    message: '您是否确定要删除该分区规则？',
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
  // 重置时间选择器的值
  Object.assign(timeObj.value, {
    result: '',
    time: { from: '', to: '' },
  });
  // pageParams.keywords = '';
  // pageParams.start_date = '';
  // pageParams.end_date = '';
};

const getList = () => {
  getStrategyList();
};
const getStrategyList = () => {
  logisticsApi.getStrategyList(pageParams).then((res) => {
    strategyList.value = res.data.items;
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
