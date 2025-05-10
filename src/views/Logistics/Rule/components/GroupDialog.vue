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
          <q-select
            class="auto-grow-select"
            v-model="form.channel_ids"
            :options="filterChannelList"
            use-input
            fill-input
            hide-selected
            multiple
            emit-value
            map-options
            clearable
            outlined
            :placeholder="selectedProviders.length ? '' : '请选择'"
            @filter="onFilterProviders"
            :input-debounce="0"
          >
            <!-- 显示已选项 -->
            <template v-slot:prepend>
              <div class="row items-center q-gutter-xs">
                <q-chip
                  v-for="(opt, index) in selectedProviders"
                  :key="opt.value"
                  dense
                  removable
                  color="primary-5"
                  text-color="primary"
                  @remove="removeProviderAt(index)"
                >
                  {{ opt.label }}
                </q-chip>
              </div>
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
  channel_ids: [],
});

const channelList = ref([]); // 全部渠道
const filterChannelList = ref([]); // 回显过滤后的渠道

// 选中项对应的完整对象
const selectedProviders = computed(() => {
  const ids = form.channel_ids;
  if (!Array.isArray(ids)) return [];
  return channelList.value.filter((opt) => form.channel_ids.includes(opt.value));
});

// 监听 dialogVisible 打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value) {
        form.name = props.item.name || '';
        getGroupInfo();
      } else {
        onReset();
      }
    } else {
      onReset();
    }
  }
);

// 搜索过滤
const onFilterProviders = (val, update, abort) => {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      filterChannelList.value = channelList.value;
    } else {
      filterChannelList.value = channelList.value.filter((opt) => opt.label.toLowerCase().includes(needle));
    }
  });
};

// 删除某个选项
const removeProviderAt = (index) => {
  form.channel_ids.splice(index, 1);
};

const onReset = () => {
  formRef.value?.reset();
  form.name = '';
  form.channel_ids = [];
  getChannelList();
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

const getChannelList = () => {
  logisticsApi
    .getChannelAllList({
      group_type: 'ungroup',
    })
    .then((res) => {
      const data = res.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      channelList.value = data;
      filterChannelList.value = channelList.value;
    });
};

// 获取物流组信息,赋值物流商ids
const getGroupInfo = () => {
  logisticsApi.getGroupInfo(props.item.id).then((res) => {
    form.channel_ids = res.data.channels.map((item) => item.id);
    const channels = res.data.channels.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    console.log(`channels -->`, channels);
    channelList.value.unshift(...channels);
    filterChannelList.value = channelList.value;
  });
};

onMounted(() => {
  getChannelList();
});
</script>

<style scoped lang="scss">
.column {
  min-width: 500px;

  .auto-grow-select :deep(.q-field__prepend) {
    height: auto;
    padding: 10px 0;
  }
}
</style>
