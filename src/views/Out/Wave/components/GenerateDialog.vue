<template>
  <q-dialog v-model="componentData.isOpen" persistent>
    <q-card style="width: 900px; max-width: 90vw">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ trans("预览") }}</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          @click="componentData.isOpen = false"
        />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-auto">
            <q-select
              outlined
              dense
              v-model="componentData.waveType"
              @update:model-value="handleWaveType"
              :options="componentData.waveTypeOptions"
              :label="trans('全部波次类型')"
              class="filter-select"
              emit-value
              map-options
            />
          </div>
          <div class="col-auto">
            <q-select
              outlined
              @update:model-value="handleSearch"
              dense
              v-model="componentData.logisticsGroup"
              :options="logisticsGroupOptions"
              :label="trans('全部物流组')"
              class="filter-select"
              emit-value
              map-options
            />
          </div>
        </div>

        <div class="row items-center q-mb-md">
          <div class="col-auto">
            <span
              >{{ trans("选择") }} {{ componentData.selectedRows.length }}</span
            >
          </div>
          <div class="col-auto q-ml-md">
            <q-btn
              color="primary"
              outline
              :label="trans('分配拣货员')"
              @click="handleAssignPicker"
            />
          </div>
        </div>

        <q-table
          :rows="componentData.list"
          :columns="columns"
          row-key="id"
          flat
          bordered
          separator="horizontal"
          selection="multiple"
          :hide-pagination="true"
          v-model:selected="componentData.selectedRows"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width>
                <q-checkbox v-model="props.selected" size="sm" />
              </q-th>
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" size="sm" />
              </q-td>
              <q-td key="batch_number" :props="props">
                {{ props.row.batch_number }}
              </q-td>
              <q-td key="wave_type" :props="props">
                {{ getLabel(props.row.wave_type) }}
              </q-td>
              <q-td key="logisticsGroup" :props="props">
                {{ props.row.logisticsGroup }}
              </q-td>
              <q-td key="package_count" :props="props">
                {{ props.row.package_count }}
              </q-td>
              <q-td key="sku_type_count" :props="props">
                {{ props.row.sku_type_count }}
              </q-td>
              <q-td key="item_count" :props="props">
                {{ props.row.item_count }}
              </q-td>
              <q-td key="picker" :props="props">
                <q-select
                  outlined
                  dense
                  v-model="props.row.picker_user_id"
                  :options="componentData.pickerOptions"
                  class="picker-select"
                  emit-value
                  map-options
                >
                </q-select>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat :label="trans('取消')" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          :label="trans('生成')"
          color="primary"
          @click="handleGenerate"
        />
      </q-card-actions>
    </q-card>
    <PickerUser
      ref="pickerUserRef"
      @confirm="confirmPickerUser"
      :pickerOptions="componentData.pickerOptions"
    ></PickerUser>
  </q-dialog>
</template>

<script setup>
import { defineProps, reactive, onMounted, ref } from "vue";
import waveApi from "@/api/wave.js";
import teamApi from "@/api/team.js";
import { useQuasar } from "quasar";
import PickerUser from "./PickerUser.vue";
import trans from "@/i18n";

import { useStore } from "vuex";
const store = useStore();
const q = useQuasar();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  previewData: {
    type: Array,
    default: () => [],
  },
});
const pickerUserRef = ref(null);

// 筛选选项
const componentData = reactive({
  waveType: null,
  logisticsGroup: null,
  params: null,
  waveTypeOptions: [
    { label: trans("全部波次类型"), value: null },
    { label: trans("单品单数"), value: "single_item" },
    { label: trans("单品多数"), value: "multi_items" },
    { label: trans("多品混包"), value: "mixed_items" },
  ],
  logisticsGroupOptions: [
    { label: trans("全部物流组"), value: null },
    { label: trans("物流组 A"), value: "group_a" },
    { label: trans("物流组 B"), value: "group_b" },
  ],
  pickerOptions: [],
  list: [],
  isOpen: false,
  selectedRows: [],
});

// 表格列定义
const columns = [
  {
    name: "batch_number",
    align: "center",
    label: trans("序号"),
    field: "batch_number",
  },
  {
    name: "wave_type",
    align: "left",
    label: trans("波次类型"),
    field: "wave_type",
  },
  {
    name: "logisticsGroup",
    align: "left",
    label: trans("物流组"),
    field: "logisticsGroup",
  },
  {
    name: "package_count",
    align: "center",
    label: trans("包裹数量"),
    field: "package_count",
  },
  {
    name: "sku_type_count",
    align: "center",
    label: trans("商品种类"),
    field: "sku_type_count",
  },
  {
    name: "item_count",
    align: "center",
    label: trans("商品数量"),
    field: "item_count",
  },
  { name: "picker", align: "center", label: trans("拣货员"), field: "picker" },
];

// 分配拣货员
const handleAssignPicker = () => {
  pickerUserRef.value.openDialog();
};
const emit = defineEmits(["handleRefresh"]);

onMounted(() => {
  getPikerUserList();
});

const getLabel = (value) => {
  let obj = {
    single_item: trans("单品单数"),
    multi_items: trans("单品多数"),
    mixed_items: trans("多品混包"),
  };
  return obj[value];
};

// 生成波次
const handleSearch = (params) => {
  componentData.params = params;
  componentData.selectedRows = [];
  initList();
};

const handleWaveType = (e) => {
  console.log("componentData.waveType", componentData.waveType);
  if (componentData.waveType) {
    componentData.params.package_types = [componentData.waveType];
  } else {
    componentData.params.package_types = [
      "single_item",
      "multi_items",
      "mixed_items",
    ];
  }
  componentData.selectedRows = [];
  initList();
};

const initList = async () => {
  let params = {
    ...componentData.params,
  };

  const { data } = await waveApi.previewWave(params);
  if (data.length) {
    componentData.list = data.map((item) => {
      return {
        ...item,
      };
    });
    componentData.isOpen = true;
  } else {
    componentData.list = [];
    q.notify({
      type: "negative",
      message: trans("没有可以预览的波次"),
    });
  }
};

const handleGenerate = async () => {
  if (componentData.selectedRows.length == 0) {
    q.notify({
      type: "negative",
      message: trans("请勾选包裹"),
    });
    return;
  }
  let bool = true;
  bool = componentData.selectedRows.every((row) => row.picker_user_id);
  console.log("bool", bool);

  if (!bool) {
    q.notify({
      type: "negative",
      message: trans("需要选择拣货员才能生成波次"),
    });
    return;
  }
  let params = {
    items: componentData.selectedRows.map((row) => {
      return { id: row.id, picker_user_id: row.picker_user_id };
    }),
  };
  const { data } = await waveApi.createWave(params);
  emit("handleRefresh");
  componentData.isOpen = false;
};

const getPikerUserList = async () => {
  const { data } = await teamApi.getStaffListNoPage();
  console.log("getPikerUserList", data);
  componentData.pickerOptions = data.map((row) => {
    return {
      label: row.fullname,
      value: row.id,
    };
  });
};

const confirmPickerUser = (userId) => {
  componentData.selectedRows.map((row) => {
    row.picker_user_id = userId;
    return row;
  });
};

defineExpose({
  handleSearch,
});
</script>

<style scoped>
.filter-select {
  width: 200px;
}

.picker-select {
  width: 150px;
}
</style>
