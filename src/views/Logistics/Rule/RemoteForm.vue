<template>
  <div>
    <q-card>
      <q-card-section>
        <div class="text-h6">
          <q-icon name="arrow_back" class="cursor-pointer" @click="router.back()"></q-icon>
          新建偏远地区规则
        </div>
      </q-card-section>
      <!-- 基本信息 -->
      <q-separator />
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="col-3">
            <div>
              规则名称
              <span class="text-red">*</span>
            </div>
            <q-input v-model="form.name" dense outlined placeholder="请输入" :rules="[(val) => !!val || '必填']" />
          </div>
          <div class="col-3">
            <div>
              类型
              <span class="text-red">*</span>
            </div>
            <q-select
              v-model="form.type"
              :options="typeOptions"
              placeholder="请选择"
              dense
              outlined
              map-options
              emit-value
              clearable
              use-input
              fill-input
              hide-selected
              :rules="[(val) => !!val || '必填']"
            />
          </div>
          <div class="col-3">
            <div>
              匹配方式
              <span class="text-red">*</span>
            </div>
            <q-select
              v-model="form.match_type"
              :options="matchOptions"
              placeholder="请选择"
              dense
              emit-value
              map-options
              outlined
              clearable
              use-input
              fill-input
              hide-selected
              :rules="[(val) => !!val || '必填']"
            />
          </div>
        </div>
      </q-card-section>

      <!-- 规则详情 -->
      <q-separator />
      <q-card-section>
        <div class="q-mb-md">
          <div class="text-subtitle1">规则详情</div>
        </div>

        <q-table flat :rows="form.rules" :columns="columns" row-key="id" :key="tableKey" hide-bottom>
          <template v-slot:body-cell-country_code="props">
            <q-td>
              <q-select
                v-model="props.row.country_code"
                :options="filteredCountryOptions"
                menu-anchor="bottom start"
                placeholder="请选择"
                dense
                emit-value
                use-input
                fill-input
                hide-selected
                outlined
                clearable
                :disable="isEdit"
                style="width: 150px"
                @filter="onFilterCountryCode"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-city="props">
            <q-td>
              <q-input v-model="props.row.city" dense outlined placeholder="请输入" :disable="isEdit" />
            </q-td>
          </template>
          <template v-slot:body-cell-postcode_start="props">
            <q-td>
              <q-input v-model="props.row.postcode_start" dense outlined placeholder="请输入" :disable="isEdit" />
            </q-td>
          </template>
          <template v-slot:body-cell-postcode_end="props">
            <q-td>
              <q-input v-model="props.row.postcode_end" dense outlined placeholder="请输入" :disable="isEdit" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td>
              <q-btn
                icon="delete"
                color="negative"
                flat
                dense
                :disable="isEdit"
                @click="onRemoveDetail(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>

        <div>
          <q-btn color="primary" icon="add" flat label="添加行" :disable="isEdit" @click="onAddDetail" />
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn label="取消" padding="sm md" color="primary" outline @click="onCancel" />
        <q-btn label="保存" padding="sm md" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import indexApi from '@/api/index';
import logisticsApi from '@/api/logistics';
import { uid, useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute(); // 路由参数
const router = useRouter();
const remoteId = route.query.id; // 偏远地区id

const $q = useQuasar();

const form = ref({
  name: '',
  type: '',
  match_type: '',
  rules: [{ id: uid(), country_code: '', city: '', postcode_start: '', postcode_end: '' }],
});
const tableKey = ref(Date.now()); // 初始 key
const countryOptions = ref([]);
const filteredCountryOptions = ref([]); // 过滤后的 countryOptions 数组

const typeOptions = [
  {
    label: '偏远地区',
    value: 'remote',
  },
  {
    label: '超偏远地区',
    value: 'very_remote',
  },
  {
    label: '超级偏远地区',
    value: 'super_remote',
  },
  {
    label: '超超偏远地区',
    value: 'ultra_remote',
  },
];
const matchOptions = [
  {
    label: '邮编全匹配',
    value: 'postcode',
  },
  {
    label: '国家/地区匹配',
    value: 'country',
  },
  {
    label: '国家/地区+城市匹配',
    value: 'country_city',
  },
];

const columns = [
  { name: 'country_code', label: '国家/地区', align: 'left', field: 'country_code' },
  { name: 'city', label: '城市', align: 'left', field: 'city' },
  { name: 'postcode_start', label: '开始邮编', align: 'left', field: 'postcode_start' },
  { name: 'postcode_end', label: '结束邮编', align: 'left', field: 'postcode_end' },
  { name: 'actions', label: '操作', align: 'center' },
];

const isEdit = computed(() => {
  return remoteId ? true : false;
});

const onAddDetail = () => {
  form.value.rules.push({
    id: uid(),
    country_code: '',
    city: '',
    postcode_start: '',
    postcode_end: '',
  });
};

const onRemoveDetail = (id) => {
  // 判断是否只剩一行数据,是则不允许删除
  if (form.value.rules.length === 1) {
    return $q.notify({
      color: 'negative',
      message: '至少保留一行数据',
      icon: 'report_problem',
    });
  }
  form.value.rules = form.value.rules.filter((item) => item.id !== id);
  tableKey.value = Date.now(); // 每次变动强制刷新
};

const onFilterCountryCode = (val, update, abort) => {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      filteredCountryOptions.value = countryOptions.value;
    } else {
      filteredCountryOptions.value = countryOptions.value.filter((opt) => opt.label.toLowerCase().includes(needle));
    }
  });
};

const onCancel = () => {
  router.back();
};

const onSubmit = () => {
  if (remoteId) {
    getEditForm();
  } else {
    getAddForm();
  }
};
const getCountryList = () => {
  indexApi.getCountries().then((res) => {
    countryOptions.value = res.data.map((item) => {
      return {
        label: item.name + ` (${item.code})`,
        value: item.code,
      };
    });
    filteredCountryOptions.value = countryOptions.value;
  });
};
const getAddForm = () => {
  logisticsApi.addRemote(form.value).then((res) => {
    router.back();
  });
};
const getEditForm = () => {
  logisticsApi.updateRemote(remoteId, form.value).then((res) => {
    router.back();
  });
};
const getDetailForm = () => {
  logisticsApi.getRemoteInfo(remoteId).then((res) => {
    form.value = res.data;
  });
};

onMounted(() => {
  if (remoteId) {
    getDetailForm();
  }
  getCountryList();
});
</script>
