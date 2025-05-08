<template>
  <q-dialog v-model="dialogVisible" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div>{{ isEdit ? '编辑物流组' : '添加物流组' }}</div>
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
          {{ form.provider_ids }}

          <q-select
            v-model="form.provider_ids"
            :options="providerList"
            menu-anchor="bottom start"
            placeholder="请选择"
            multiple
            use-chips
            stack-label
            emit-value
            map-options
            outlined
            clearable
            @filter="onFilterProviders"
          >
            <template v-slot:selected-item="scope">
              <q-chip
                removable
                dense
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                color="primary"
                text-color="secondary"
                class="q-ma-none"
              >
                <q-avatar color="secondary" text-color="white" :icon="scope.opt.icon" />
                {{ scope.opt.label }}
              </q-chip>
            </template>
          </q-select>
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

const form = reactive({
  name: '',
});

const providerList = ref([]);
const filterProviderList = ref([]);

// 监听 dialogVisible 打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value) {
        form.name = props.item.name || '';
        form.provider_ids = props.item.provider_ids || [];
      } else {
        onReset();
      }
    }
  }
);

// 搜索过滤
const onFilterProviders = (val, update, abort) => {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      filterProviderList.value = providerList.value;
    } else {
      filterProviderList.value = providerList.value.filter((opt) => opt.label.toLowerCase().includes(needle));
    }
  });
};

const onReset = () => {
  formRef.value?.reset();
  form.name = '';
};

const onSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  if (isEdit.value) {
    onEdit();
  } else {
    onAdd();
  }
};

const onDialogHide = () => {
  emit('update:modelValue', false);
  emit('close');
  onReset();
};

const onAdd = () => {
  logisticsApi
    .addGroup(form)
    .then((res) => {
      emit('success');
      onDialogHide();
    })
    .catch((err) => {});
};
const onEdit = () => {
  logisticsApi
    .updateGroup(props.item.id, form)
    .then((res) => {
      emit('success');
      onDialogHide();
    })
    .catch((err) => {});
};

const getProviderList = () => {
  logisticsApi.getProviderList().then((res) => {
    providerList.value = res.data.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    filterProviderList.value = providerList.value;
    console.log('filterProviderList.value::: ', JSON.parse(JSON.stringify(filterProviderList.value)));
  });
};

onMounted(() => {
  getProviderList();
});
</script>

<style scoped lang="scss">
.column {
  width: 500px;
}
</style>
