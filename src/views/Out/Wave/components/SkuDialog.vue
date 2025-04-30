<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 700px">
      <q-card-section class="row items-center">
        <div class="text-h6">选择SKU</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="keyword"
          placeholder="查询SKU"
          outlined
          dense
          class="q-mb-md"
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
          :hide-pagination="true"
          selection="multiple"
          v-model:selected="selected"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
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

      <!-- <q-card-section class="row items-center justify-between q-pa-md">
        <div>Total {{ totalCount }}</div>
        <div class="row items-center">
          <q-pagination
            v-model="pagination.page"
            :max="maxPage"
            direction-links
          />
        </div>
      </q-card-section> -->

      <q-card-actions align="right" class="bg-white text-primary">
        <q-btn flat label="取消" v-close-popup />
        <q-btn color="primary" label="确认" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import waveApi from "@/api/wave.js";

const show = ref(false);
const keyword = ref("");
const selected = ref([]);
const skuData = ref([]);

const emit = defineEmits(["skuConfirm"]);

const columns = [
  { name: "tags_sku_qty", label: "SKU", field: "tags_sku_qty" },
  {
    name: "quantity",
    label: "订单数",
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

const totalCount = ref(0);
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
  const { data } = await waveApi.getSkuNumList({
    keywords: keyword.value,
  });
  skuData.value = data.data.map((row) => {
    return row;
  });
  // totalCount.value = data.meta.total;
};

// 暴露方法给父组件
defineExpose({
  show,
});
</script>
