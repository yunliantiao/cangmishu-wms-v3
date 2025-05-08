<template>
  <q-dialog v-model="dialogVisible" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div>{{ isEdit ? '编辑物流商' : '添加物流商' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-tabs v-if="!isEdit" v-model="providerType" dense align="left" class="q-mb-md">
          <q-tab name="1" label="对接物流商" />
          <q-tab name="2" label="自定义物流商" />
        </q-tabs>

        <q-form ref="formRef" @submit="onSubmit">
          <q-select
            v-if="providerType === '1'"
            v-model="form.code"
            :options="systemProviders"
            :disable="isEdit"
            option-label="name"
            option-value="code"
            label="对接物流商 *"
            :rules="[(val) => !!val || '请选择物流商']"
            map-options
            emit-value
            outlined
            dense
          />
          <q-input
            v-model="form.name"
            label="自定义账号名称 *"
            :rules="[(val) => !!val || '请输入服务商名称']"
            outlined
            dense
          />
          <q-input v-model="form.remark" label="备注" type="textarea" outlined dense />
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
import { useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const $q = useQuasar();
const emit = defineEmits(['update:modelValue', 'success']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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

const providerType = ref('1'); // 1:对接物流商 2:自定义物流商
const systemProviders = ref([]);

const form = reactive({
  name: '',
  code: '',
  remark: '',
  is_custom: false, // 是否自定义
  credentials: {
    client_id: 'ITC0893791',
    client_secret: 'axzc2utvPbfc9UbJDOh+7w==',
  },
});

// 监听 providerType 变化,修改 is_custom
watch(providerType, (newVal) => {
  // '1' || '2'
  // 1:对接物流商 2:自定义物流商
  // false:对接物流商 true:自定义物流商
  form.is_custom = newVal === '2';
});

// 监听 dialogVisible 打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value) {
        providerType.value = props.item.is_custom ? '2' : '1';
        form.name = props.item.name || '';
        form.remark = props.item.remark || '';
        form.code = props.item.code || '';
        form.is_custom = props.item.is_custom || false;
        form.credentials = props.item.credentials || {};
      } else {
        onReset();
      }
    }
  }
);

const onDialogHide = () => {
  emit('update:modelValue', false);
  emit('close');
  onReset();
};

const onReset = () => {
  formRef.value?.reset();
  form.code = '';
  form.name = '';
  form.remark = '';
  providerType.value = '1';
};

const onSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  console.log('form', JSON.parse(JSON.stringify(form)));
  if (isEdit.value) {
    onEdit();
  } else {
    onAdd();
  }
};

const onAdd = () => {
  logisticsApi
    .addProvider(form)
    .then((res) => {
      console.log('res', res);
      $q.notify({
        type: 'positive',
        message: '添加成功',
      });
      emit('success');
      onDialogHide();
    })
    .catch((err) => {
      console.log('err', err);
      $q.notify({
        type: 'negative',
        message: err.message || '添加失败',
      });
    });
};
const onEdit = () => {
  logisticsApi
    .editProvider(props.item.id, form)
    .then((res) => {
      console.log('res', res);
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

// 获取系统物流商列表
const getSystemProviders = async () => {
  const res = await logisticsApi.getSystemProviders();
  systemProviders.value = res.data;
};

onMounted(() => {
  getSystemProviders();
  console.log('props', props);
});
</script>

<style scoped lang="scss">
.column {
  width: 600px;
}
</style>
