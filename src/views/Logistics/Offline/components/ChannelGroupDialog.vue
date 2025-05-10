<template>
  <q-dialog v-model="dialogVisible" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div>移入物流组</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form ref="formRef" @submit="onSubmit">
          <q-select
            outlined
            dense
            v-model="form.group_id"
            :options="groupOptions"
            option-label="label"
            option-value="value"
            map-options
            emit-value
            clearable
            label="请选择物流组"
            class="select-width"
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
import { computed, onMounted, reactive, ref } from 'vue';

const $q = useQuasar();
const emit = defineEmits(['update:modelValue', 'success']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => {},
  },
});

// 使用计算属性替代 ref + watch 的方式
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const groupOptions = ref([]); // 物流组列表
const formRef = ref(null);
const form = reactive({
  group_id: '',
});

const onDialogHide = () => {
  emit('update:modelValue', false);
  emit('close');
  onReset();
};

const onReset = () => {
  formRef.value?.reset();
  form.group_id = '';
};

const onSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  onAdd();
};

const onAdd = () => {
  logisticsApi
    .moveChannelGroup(props.item.provider.id, props.item.id, form)
    .then((res) => {
      console.log('res', res);
      emit('success');
      onDialogHide();
    })
    .catch((err) => {
      console.log('err', err);
    });
};

const getGroupList = () => {
  logisticsApi
    .getGroupList()
    .then((res) => {
      console.log('res', res);
      groupOptions.value = res.data.items.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    })
    .catch((err) => {
      console.log('err', err);
    });
};

onMounted(() => {
  console.log('props', props);
  getGroupList();
});
</script>

<style scoped lang="scss">
.column {
  width: 500px;
}
</style>
