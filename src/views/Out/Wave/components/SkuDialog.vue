<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 700px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ trans("选择SKU") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="keyword"
          :placeholder="trans('查询SKU')"
          outlined
          dense
          class="filter-item"
          style="width: 200px"
        >
          <template v-slot:append>
            <q-icon name="search" class="cursor-pointer" @click="getList" />
          </template>
        </q-input>

        <q-table
          :rows="skuData"
          :columns="columns"
          row-key="tags_sku_qty"
          hide-bottom
          flat
          :hide-pagination="true"
          selection="multiple"
          v-model:selected="selected"
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width align="center">
                <q-checkbox v-model="props.selected" size="sm" />
              </q-td>
              <q-td key="tags_sku_qty" :props="props">
                {{ props.row.tags_sku_qty }}
              </q-td>
              <q-td key="quantity" :props="props" class="text-right">
                {{ props.row.quantity }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary">
        <q-btn flat :label="trans('取消')" v-close-popup />
        <q-btn color="primary" :label="trans('确认')" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import waveApi from "@/api/wave.js";
import trans from "@/i18n";

const show = ref(false);
const keyword = ref("");
const selected = ref([]);
const skuData = ref([]);
const loading = ref(false);

const emit = defineEmits(["skuConfirm"]);

const columns = [
  { name: "tags_sku_qty", label: "SKU", field: "tags_sku_qty" },
  {
    name: "quantity",
    label: trans("订单数"),
    field: "quantity",
    align: "right",
    sortable: true,
  },
];

onMounted(() => {
  getList();
});

// const pagination = ref({
//   page: 1,
//   rowsPerPage: 50,
// });

// const totalCount = ref(0);
// const maxPage = computed(() =>
//   Math.ceil(totalCount.value / pagination.value.rowsPerPage)
// );

const onConfirm = () => {
  // console.log("selection", selected.value);
  // 处理确认逻辑
  show.value = false;
  emit("skuConfirm", [...selected.value]);
};

const getList = async () => {
  loading.value = true;
  const { data } = await waveApi.getSkuNumList({
    keywords: keyword.value,
  });
  skuData.value = data.data.map((row) => {
    return row;
  });
  loading.value = false;
  // totalCount.value = data.meta.total;
};

// 暴露方法给父组件
defineExpose({
  show,
});
</script>
