<template>
  <q-dialog v-model="dialogVisible" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div>{{ isEdit ? '编辑渠道' : '添加渠道' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form ref="formRef" @submit="onSubmit">
          <q-input
            v-model="providerInfo.system_provider_name"
            placeholder="物流商"
            disable
            filled
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="providerInfo.name"
            placeholder="自定义账号名称"
            disable
            filled
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="form.name"
            placeholder="物流渠道名称 *"
            :rules="[(val) => !!val || '请输入名称']"
            outlined
            dense
          />
          <q-input
            v-model="form.code"
            placeholder="物流渠道代码 *"
            :rules="[(val) => !!val || '请输入代码']"
            outlined
            dense
          />
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
  code: '',
  label_template_id: '',
  shipment_provider_id: '',
});

// 监听 dialogVisible 打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value) {
        form.name = props.item.name || '';
        form.code = props.item.code || '';
        form.label_template_id = props.item.label_template_id || '';
        form.shipment_provider_id = props.item.shipment_provider_id || '';
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
  form.label_template_id = '';
  form.shipment_provider_id = '';
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
      emit('success');
      onDialogHide();
    })
    .catch((err) => {
      console.log('err', err);
    });
};
const onEdit = () => {
  logisticsApi
    .updateChannelInfo(props.providerInfo.id, props.item.id, form)
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

onMounted(() => {
  console.log('props', props);
});
</script>

<style scoped lang="scss">
.column {
  width: 500px;
}
</style>
