<template>
  <div class="packaging-page">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="title"
          >扫描包装&gt;{{ pageData.waveInfo.wave_number }}({{
            getDesc(pageData.waveInfo.wave_type)
          }})</span
        >
      </div>
      <div class="right">
        <q-btn
          color="primary"
          flat
          label="挂起"
          class="mr-12"
          @click="handUp"
        />
        <q-btn color="negative" flat label="结束作业" @click="handEnd" />
      </div>
    </div>

    <!-- 主体卡片 -->
    <div class="main-card">
      <!-- 操作区 -->
      <div class="action-bar">
        <span>选择 {{ pageData.selectedRows.length }}</span>
        <q-btn
          color="primary"
          @click="handleBatchPrint"
          class="ml-16"
          label="打印"
        />
        <q-btn
          color="primary"
          @click="handleBatchCheckMaterials"
          outline
          class="ml-16"
          label="批量选择包材"
        />
      </div>

      <!-- 商品与面单打印信息 -->
      <div class="info-bar">
        <div>
          商品编码：
          <q-btn
            :flat="pageData.codeFilter != 'all'"
            color="primary"
            label="全部"
            @click="changeFilter('all')"
            class="btn-mini"
          />
          <q-btn
            v-for="(item, index) in pageData.skus"
            :key="index"
            :flat="pageData.codeFilter != item"
            color="primary"
            :label="item"
            @click="changeFilter(item)"
            class="btn-mini"
          />
        </div>
      </div>

      <div class="info-bar">
        <div>
          面单打印：
          <q-btn
            :flat="pageData.printFilter != 'all'"
            color="primary"
            @click="changePrintFilter('all')"
            :label="`全部(${pageData.rows.length})`"
            class="btn-mini"
          />
          <q-btn
            :flat="pageData.printFilter != '1'"
            color="primary"
            @click="changePrintFilter('1')"
            :label="`已打印(${printCount})`"
            class="btn-mini"
          />
          <q-btn
            :flat="pageData.printFilter != '0'"
            color="primary"
            @click="changePrintFilter('0')"
            :label="`未打印(${pageData.rows.length - printCount})`"
            class="btn-mini"
          />
        </div>
      </div>

      <!-- 表格 -->
      <q-table
        :rows="list"
        :columns="pageData.columns"
        v-model:selected="pageData.selectedRows"
        row-key="id"
        flat
        bordered
        selection="multiple"
        hide-bottom
        class="pack-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width>
              <q-checkbox v-model="props.selected" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" />
            </q-td>

            <q-td>{{ props.row.package_number }}</q-td>
            <q-td>
              {{ props.row.customer?.name }}
              <span class="customer-code"
                >[{{ props.row.customer?.code }}]</span
              >
            </q-td>
            <q-td>
              <div
                class="product-info"
                v-for="item in props.row.items"
                :key="item.id"
              >
                <img :src="item.sku_image" class="product-img" />
                <div>
                  <div>{{ item.sku }}</div>
                  <div class="product-name">{{ item.product_name }}</div>
                  <div>{{ item.sku_name }}</div>
                </div>
              </div>
            </q-td>
            <q-td>
              <span v-for="item in props.row.items" :key="item.id">
                {{ item.quantity }}
              </span>
            </q-td>
            <q-td>
              <q-select
                dense
                outlined
                label="请选择包材"
                v-model="props.row.packaging_material.id"
                :options="pageData.materialsList"
                emit-value
                map-options
                class="pack-select"
              />
            </q-td>
            <q-td>
              <q-icon
                name="lock"
                :style="{
                  color: props.row.is_print_shipping_label ? 'green' : '#888',
                }"
              />
            </q-td>
            <q-td>
              <q-btn
                flat
                round
                v-if="!props.row.is_print_shipping_label"
                @click="handlePrint(props.row)"
                class="table-icon"
                size="sm"
              >
                <img src="@/assets/images/print.png" />
                <q-tooltip>打印物流面单</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                icon="print_disabled"
                v-if="props.row.is_print_shipping_label"
                @click="handleNotPrint(props.row)"
              >
                <q-tooltip>标记为未打印</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="bookmark"
                v-else
                @click="handleNotPrint(props.row)"
              >
                <q-tooltip>标记为已打印</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <CheckMaterial
      ref="checkMaterialRef"
      @confirm="confirmMateria"
    ></CheckMaterial>
    <HandEnd ref="handEndRef" @confirm="handEndConfirm"> </HandEnd>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import OutApi from "@/api/out.js";
import { useRoute, useRouter } from "vue-router";
import ProductApi from "@/api/product.js";
import Message from "@/utils/message.js";
import { useQuasar } from "quasar";
import CheckMaterial from "./components/CheckMaterial.vue";
import HandEnd from "./components/HandEnd.vue";

const $q = useQuasar();
const route = useRoute();
const checkMaterialRef = ref(null);
const handEndRef = ref(null);

const pageData = reactive({
  wave_number: "",
  rows: [],
  selectedRows: [],
  columns: [
    {
      name: "package_number",
      label: "包裹号/运单号",
      field: "package_number",
      align: "left",
    },
    { name: "customer", label: "客户信息", field: "customer", align: "left" },
    { name: "product", label: "商品信息", field: "product", align: "left" },
    { name: "qty", label: "数量", field: "qty", align: "left" },
    { name: "pack", label: "包材信息 *", field: "pack", align: "left" },
    { name: "print", label: "打印状态", field: "print", align: "left" },
    { name: "actions", label: "操作", field: "actions", align: "left" },
  ],
  materialsList: [],
  codeFilter: "all",
  printFilter: "all",
  skus: [],
  waveInfo: {},
});

const router = useRouter();

watch(
  () => pageData.rows,
  () => {
    let list = pageData.rows;
    let bool = true;
    list.forEach((row) => {
      if (!row.is_print_shipping_label) {
        bool = false;
      }
    });

    if (bool) {
      $q.dialog({
        title: "包装作业已完成, 请结束作业",
        message: "可前往“包裹管理”查看待发货的包裹",
        cancel: true,
        persistent: true,
        ok: {
          label: "结束作业",
          color: "primary",
        },
        cancel: {
          label: "取消",
          color: "grey-7",
        },
      }).onOk(async () => {
        handEndConfirm();
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  pageData.wave_number = route.query.wave_number;
  getWaveInfo();
  getMaterialsList();
});

const printCount = computed(() => {
  let count = 0;
  pageData.rows.forEach((row) => {
    if (row.is_print_shipping_label) {
      count += 1;
    }
  });

  return count;
});

const changeFilter = (sku) => {
  pageData.codeFilter = sku;
};

const changePrintFilter = (str) => {
  pageData.printFilter = str;
};

const getMaterialsList = async () => {
  const { data } = await ProductApi.getMaterialsList();
  pageData.materialsList = data.map((row) => {
    return {
      label: row.name,
      value: row.id,
    };
  });
};

const handleBatchPrint = async () => {
  console.log("pageData.selectedRows", pageData.selectedRows);
  if (pageData.selectedRows.length == 0) {
    return Message.notify("请选择要打印的包裹");
  }
  // let ids = pageData.selectedRows.map(row=>row.id)
  // let {data} = await OutApi.printPackageOrder(ids)
  // window.open(data.data,'_blank')
};

const handleBatchCheckMaterials = async () => {
  console.log("pageData.selectedRows", pageData.selectedRows);
  if (pageData.selectedRows.length == 0) {
    return Message.notify("请选择包裹");
  }
  checkMaterialRef.value.open(pageData.materialsList);
};

const getWaveInfo = async () => {
  const { data } = await OutApi.getOrderInfoByWaveOrder({
    number: pageData.wave_number,
  });
  let skus = [];
  pageData.selectedRows = [];
  pageData.rows = data.packages.map((row) => {
    row.selected = false;
    if (!row.packaging_material) {
      row.packaging_material = {
        id: "",
      };
    }
    row.items.forEach((row) => {
      skus.push(row.sku);
    });
    return row;
  });
  pageData.skus = [...new Set(skus)];
  pageData.waveInfo = data;
};

const getDesc = (type) => {
  if (type == "single_item") {
    return "单品单数";
  } else if (type == "multi_items") {
    return "单品多件";
  } else if (type == "mixed_items") {
    return "多品混包";
  }
};

const handlePrint = async (row) => {
  if (!row.packaging_material.id) {
    return Message.notify("请选择包材");
  }
  let { data } = await OutApi.printPackageOrder(row.id);
  window.open(data.data, "_blank");

  $q.dialog({
    title: "打印结果确认",
    message: "是否打印成功",
    cancel: true,
    persistent: true,
    ok: {
      label: "是",
      color: "primary",
    },
    cancel: {
      label: "否",
      color: "grey-7",
    },
  }).onOk(async () => {
    setPrint(row, true);
  });
};

const setPrint = async (row, is_printed) => {
  if (is_printed && !row.packaging_material.id) {
    return Message.notify("请选择包材");
  }
  // 标记为未打印 将包材设置为空
  let params = {
    packaging_material_id: row.packaging_material.id,
    is_printed,
  };
  await OutApi.packageSetIsPrint(row.id, params);
  getWaveInfo();
};

const list = computed(() => {
  let list = pageData.rows;
  if (pageData.codeFilter != "all") {
    list = list.filter((row) => {
      let sku = row.items[0];
      return sku.sku == pageData.codeFilter;
    });
  }
  if (pageData.printFilter != "all") {
    list = list.filter((row) => {
      if (pageData.printFilter == "1") {
        return row.is_print_shipping_label;
      } else {
        return !row.is_print_shipping_label;
      }
    });
  }
  return list;
});

const confirmMateria = (materialId) => {
  pageData.selectedRows.forEach((row) => {
    row.packaging_material.id = materialId;
  });
};

const handUp = () => {
  $q.dialog({
    title: "确定挂起包装作业？",
    message: "挂起后，波次状态保持为“包装中”",
    cancel: true,
    persistent: true,
    ok: {
      label: "确定",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(async () => {
    await OutApi.handUpWave(pageData.waveInfo.id);
    router.go(-1);
  });
};
const handEnd = () => {
  let notPrintList = pageData.rows.filter((row) => {
    return !row.is_print_shipping_label;
  });
  // 如果还有没标记打印的包裹  需要弹窗提示
  if (notPrintList.length) {
    handEndRef.value.open(notPrintList);
  } else {
    $q.dialog({
      title: "确定结束作业？",
      message: "包装作业已全部完成！可前往“包裹管理”查看待发货的包裹",
      cancel: true,
      persistent: true,
      ok: {
        label: "确定",
        color: "primary",
      },
      cancel: {
        label: "取消",
        color: "grey-7",
      },
    }).onOk(async () => {
      handEndConfirm();
    });
  }
};

const handEndConfirm = async () => {
  await OutApi.packingWaveOver(pageData.waveInfo.id);
  router.go(-1);
};

const handleNotPrint = (row) => {
  $q.dialog({
    title: "提示",
    message: `确认标记为${row.is_print_shipping_label ? "未打印" : "已打印"}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: "是",
      color: "primary",
    },
    cancel: {
      label: "否",
      color: "grey-7",
    },
  }).onOk(async () => {
    setPrint(row, !row.is_print_shipping_label);
  });
};
</script>

<style scoped lang="scss">
.packaging-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 0;
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 40px 0 40px;
    font-size: 16px;
    font-weight: 500;
    background: #fff;
    .title {
      font-size: 18px;
      font-weight: bold;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 16px;
      .mr-12 {
        margin-right: 12px;
      }
    }
  }
  .main-card {
    background: #fff;
    border-radius: 8px;
    margin: 32px 40px 0 40px;
    padding: 24px 24px 40px 24px;
    min-height: 400px;
    .action-bar {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .ml-16 {
        margin-left: 16px;
      }
    }
    .info-bar {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .sku {
        font-weight: 500;
        margin-left: 8px;
      }
      .btn-mini {
        min-width: 40px;
        padding: 0 8px;
        font-size: 13px;
        height: 24px;
      }
      .ml-32 {
        margin-left: 32px;
      }
    }
    .pack-table {
      margin-top: 8px;
      :deep(.q-table__middle) {
        background: #fff;
      }
      :deep(th) {
        background: #f5f6fa;
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }
      :deep(td) {
        font-size: 14px;
        color: #333;
        padding: 8px 12px;
      }
    }
    .product-info {
      display: flex;
      align-items: center;
      .product-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        margin-right: 8px;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .product-name {
        color: #888;
        font-size: 13px;
      }
    }
    .customer-code {
      color: #b0b0b0;
      font-size: 13px;
      margin-left: 4px;
    }
    .pack-select {
      width: 120px;
    }
  }
}
</style>