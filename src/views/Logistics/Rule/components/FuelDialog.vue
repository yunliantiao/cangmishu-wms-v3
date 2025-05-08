<template>
  <q-dialog v-model="dialogVisible" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div>{{ isEdit ? '编辑燃油规则' : '添加燃油规则' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form ref="formRef" @submit="onSubmit">
          <q-input
            v-model="form.name"
            placeholder="名称 *"
            :rules="[(val) => !!val || '请输入名称']"
            outlined
            dense
            clearable
          />
          <q-input
            v-model.number="form.rate"
            placeholder="费率 (1-100) *"
            min="1"
            max="100"
            type="number"
            :rules="[(val) => !!val || '请输入费率']"
            outlined
            dense
            @update:model-value="onChangeRate"
          />

          <q-input
            v-model="form.effective_date"
            :rules="[validateDate]"
            label="生效时间 *"
            class="q-mb-md"
            outlined
            dense
            clearable
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.effective_date" mask="YYYY-MM-DD" :options="dateRules" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            outlined
            dense
            v-model="form.expired_date"
            label="失效时间 *"
            placeholder="失效时间 *"
            clearable
            class="q-mb-md"
            :rules="[validateDate]"
            @clear="form.expired_date = ''"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.expired_date" mask="YYYY-MM-DD" :options="dateRules" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input v-model="form.remarks" label="备注" type="textarea" outlined dense></q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey-8" v-close-popup />
        <q-btn label="确定" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import { parseTime } from '@/utils/common.js';
import { useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const $q = useQuasar();
const emit = defineEmits(['update:modelValue', 'success']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  providerInfo: {
    type: Object,
    default: () => ({}),
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});

// 使用计算属性替代 ref + watch 的方式
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 是否编辑模式（根据 item.id 判断）
const isEdit = computed(() => !!props.item?.id);

const formRef = ref(null);

const form = reactive({
  name: '',
  rate: null,
  effective_date: '', // 生效
  expired_date: '', // 失效
  remarks: '',
});

// 监听 dialogVisible 打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value) {
        form.name = props.item.name || '';
        form.rate = props.item.rate || '';
        form.effective_date = props.item.effective_date || '';
        form.expired_date = props.item.expired_date || '';
        form.remarks = props.item.remarks || '';
      } else {
        onReset();
      }
    }
  }
);

const onChangeRate = (val) => {
  if (val === '' || val === null) {
    form.rate = '';
    return;
  }
  // 移除非数字字符
  const numVal = val.toString().replace(/[^\d]/g, '');
  // 转换为数字并验证范围
  const num = Number(numVal);
  if (num > 100) {
    form.rate = '100';
  } else {
    form.rate = numVal || '';
  }
};

const validateDate = (val) => {
  if (!val) return '请选择日期';

  // 验证YYYY-MM-DD格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(val)) {
    return '日期格式不正确';
  }

  // 验证日期是否有效
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    return '无效的日期';
  }

  return true;
};
// 日选择器限制规则
const dateRules = (date) => {
  // 获取今天的日期并格式化为YYYY/MM/DD
  const today = new Date();
  const formattedToday = parseTime(today, '{y}/{m}/{d}');
  // 比较日期是否大于或等于今天
  return date >= formattedToday;
};
const onDialogHide = () => {
  emit('update:modelValue', false);
  emit('close');
  onReset();
};

const onReset = () => {
  formRef.value?.reset();
  form.name = '';
  form.rate = '';
  form.effective_date = '';
  form.expired_date = '';
  form.remarks = '';
};

const onSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  form.rate = Number(form.rate);
  if (isEdit.value) {
    onEdit();
  } else {
    onAdd();
  }
};

const onAdd = () => {
  logisticsApi
    .addFuel(form)
    .then((res) => {
      emit('success');
      onDialogHide();
    })
    .catch((err) => {
    });
};
const onEdit = () => {
  logisticsApi
    .updateFuel(props.item.id, form)
    .then((res) => {
      // $q.notify({
      //   type: 'positive',
      //   message: '更新成功',
      // });
      emit('success');
      onDialogHide();
    })
    .catch((err) => {
      // $q.notify({
      //   type: 'negative',
      //   message: err.message || '更新失败',
      // });
    });
};

onMounted(() => {
});
</script>

<style scoped lang="scss">
.column {
  width: 500px;
}
</style>
