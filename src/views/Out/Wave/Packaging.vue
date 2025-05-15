<template>
  <div class="packaging-page">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="title">
          {{ trans("扫描包装") }}
        </span>
        <span class="wave-number">
          {{ pageData.waveInfo.wave_number }}
          ({{ getDesc(pageData.waveInfo.wave_type) }})
        </span>
      </div>
      <div class="right">
        <q-btn
          color="primary"
          :label="trans('挂起')"
          outline
          class="rt-btn"
          @click="handUp"
        />
        <q-btn
          color="primary"
          class="rt-btn"
          :label="trans('结束作业')"
          @click="handEnd"
        />
      </div>
    </div>

    <div class="action-bar">
      <span>{{ trans("选择") }} {{ pageData.selectedRows.length }}</span>
      <q-btn
        color="primary"
        @click="handleBatchPrint"
        :label="trans('打印')"
        class="btn print"
      />
      <q-btn
        color="primary"
        class="btn"
        flat
        @click="handleBatchCheckMaterials"
        outline
        :label="trans('批量选择包材')"
      />
    </div>

    <!-- 主体卡片 -->
    <div class="main-card">
      <!-- 操作区 -->

      <!-- 商品与面单打印信息 -->
      <div class="info-bar">
        <div>
          商品编码：
          <q-btn
            flat
            :color="pageData.codeFilter == 'all' ? 'primary' : '#1f1f1f'"
            :label="trans('全部')"
            :style="
              pageData.codeFilter == 'all'
                ? 'background: #DAD4FF !important; color: #5745C5 !important;'
                : ''
            "
            @click="changeFilter('all')"
            class="btn-mini"
          />
          <q-btn
            flat
            v-for="(item, index) in pageData.skus"
            :key="index"
            :style="
              pageData.codeFilter == item
                ? 'background: #DAD4FF !important; color: #5745C5 !important;'
                : ''
            "
            :label="item"
            @click="changeFilter(item)"
            class="btn-mini"
          />
        </div>
      </div>
      <div class="info-bar">
        <div>
          {{ trans("面单打印") }}：
          <q-btn
            flat
            :color="pageData.printFilter == 'all' ? 'primary' : '#1f1f1f'"
            :style="
              pageData.printFilter == 'all'
                ? 'background: #DAD4FF !important; color: #5745C5 !important;'
                : ''
            "
            @click="changePrintFilter('all')"
            :label="trans('全部({count})', { count: pageData.rows.length })"
            class="btn-mini"
          />
          <q-btn
            flat
            :color="pageData.printFilter == '1' ? 'primary' : '#1f1f1f'"
            @click="changePrintFilter('1')"
            :label="trans('已打印({count})', { count: printCount })"
            :style="
              pageData.printFilter == '1'
                ? 'background: #DAD4FF !important; color: #5745C5 !important;'
                : ''
            "
            class="btn-mini"
          />
          <q-btn
            flat
            :color="pageData.printFilter == '0' ? 'primary' : '#1f1f1f'"
            @click="changePrintFilter('0')"
            :style="
              pageData.printFilter == '0'
                ? 'background: #DAD4FF !important; color: #5745C5 !important;'
                : ''
            "
            :label="
              trans('未打印({count})', {
                count: pageData.rows.length - printCount,
              })
            "
            class="btn-mini"
          />
        </div>
      </div>
    </div>
    <div class="main-card">
      <!-- 表格 -->
      <q-table
        :rows="list"
        :columns="pageData.columns"
        v-model:selected="pageData.selectedRows"
        row-key="id"
        flat
        selection="multiple"
        hide-bottom
        class="pack-table"
        :loading="pageData.loading"
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
            <q-td auto-width align="center">
              <q-checkbox v-model="props.selected" size="sm" />
            </q-td>

            <q-td align="center">{{ props.row.package_number }}</q-td>
            <q-td align="center">
              {{ props.row.customer?.name }}
              <span class="customer-code"
                >[{{ props.row.customer?.code }}]</span
              >
            </q-td>
            <q-td width="300">
              <div
                class="product-info"
                v-for="item in props.row.items"
                :key="item.id"
              >
                <img :src="item.sku_image" class="product-img" />
                <div class="goods-info">
                  <div class="sku">{{ item.sku }}</div>
                  <div class="product-name">{{ item.product_name }}</div>
                  <div class="other">
                    {{ item.sku_name }} x {{ item.quantity }}
                  </div>
                </div>
              </div>
            </q-td>
            <q-td align="center">
              <span v-for="item in props.row.items" :key="item.id">
                {{ item.quantity }}
              </span>
            </q-td>
            <q-td align="center">
              <q-select
                dense
                outlined
                :label="trans('请选择包材')"
                v-model="props.row.packaging_material.id"
                :options="pageData.materialsList"
                emit-value
                map-options
                class="pack-select"
              />
            </q-td>
            <q-td align="center">
              <q-td>
                <span class="table-icon">
                  <img
                    src="@/assets/images/print.png"
                    v-if="!props.row.is_print_shipping_label"
                  />
                  <img src="@/assets/images/print-success.png" v-else />
                </span>
              </q-td>
              <!-- <q-icon
                name="lock"
                :style="{
                  color: props.row.is_print_shipping_label ? 'green' : '#888',
                }"
              /> -->
            </q-td>
            <q-td align="center">
              <q-btn
                flat
                round
                v-if="!props.row.is_print_shipping_label"
                @click="handlePrint(props.row)"
                class="table-icon"
                size="sm"
              >
                <img src="@/assets/images/print.png" />
                <q-tooltip>{{ trans("打印物流面单") }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                class="table-icon"
                v-if="props.row.is_print_shipping_label"
                @click="handleNotPrint(props.row)"
              >
                <img src="@/assets/images/set-not-print.png" />
                <q-tooltip>{{ trans("标记为未打印") }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                class="table-icon"
                v-else
                @click="handleNotPrint(props.row)"
              >
                <img src="@/assets/images/set-print.png" />
                <q-tooltip>{{ trans("标记为已打印") }}</q-tooltip>
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
import trans from "@/i18n";

const $q = useQuasar();
const route = useRoute();
const checkMaterialRef = ref(null);
const handEndRef = ref(null);

const pageData = reactive({
  wave_number: "",
  rows: [],
  loading: false,
  selectedRows: [],
  columns: [
    {
      name: "package_number",
      label: trans("包裹号/运单号"),
      field: "package_number",
      align: "center",
    },
    {
      name: "customer",
      label: trans("客户信息"),
      field: "customer",
      align: "center",
    },
    {
      name: "product",
      label: trans("商品信息"),
      field: "product",
      align: "center",
    },
    { name: "qty", label: trans("数量"), field: "qty", align: "center" },
    {
      name: "pack",
      label: trans("包材信息 *"),
      field: "pack",
      align: "center",
    },
    {
      name: "print",
      label: trans("打印状态"),
      field: "print",
      align: "center",
    },
    {
      name: "actions",
      label: trans("操作"),
      field: "actions",
      align: "center",
    },
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
        title: trans("包装作业已完成, 请结束作业"),
        message: trans("可前往“包裹管理”查看待发货的包裹"),
        cancel: true,
        persistent: true,
        ok: {
          label: trans("结束作业"),
          color: "primary",
        },
        cancel: {
          label: trans("取消"),
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
    return Message.notify(trans("请选择要打印的包裹"));
  }
  // let ids = pageData.selectedRows.map(row=>row.id)
  // let {data} = await OutApi.printPackageOrder(ids)
  // window.open(data.data,'_blank')
};

const handleBatchCheckMaterials = async () => {
  console.log("pageData.selectedRows", pageData.selectedRows);
  if (pageData.selectedRows.length == 0) {
    return Message.notify(trans("请选择包裹"));
  }
  checkMaterialRef.value.open(pageData.materialsList);
};

const getWaveInfo = async () => {
  pageData.loading = true;
  try {
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
  } catch (error) {
    console.error("获取波次信息失败", error);
  } finally {
    pageData.loading = false;
  }
};

const getDesc = (type) => {
  if (type == "single_item") {
    return trans("单品单数");
  } else if (type == "multi_items") {
    return trans("单品多件");
  } else if (type == "mixed_items") {
    return trans("多品混包");
  }
};

const handlePrint = async (row) => {
  if (!row.packaging_material.id) {
    return Message.notify(trans("请选择包材"));
  }
  let { data } = await OutApi.printPackageOrder(row.id);
  window.open(data.data, "_blank");

  $q.dialog({
    title: trans("打印结果确认"),
    message: trans("是否打印成功"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("是"),
      color: "primary",
    },
    cancel: {
      label: trans("否"),
      color: "grey-7",
    },
  }).onOk(async () => {
    setPrint(row, true);
  });
};

const setPrint = async (row, is_printed) => {
  if (is_printed && !row.packaging_material.id) {
    return Message.notify(trans("请选择包材"));
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
    title: trans("确定挂起包装作业？"),
    message: trans("挂起后，波次状态保持为“包装中”"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("确定"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
      title: trans("确定结束作业？"),
      message: trans("包装作业已全部完成！可前往“包裹管理”查看待发货的包裹"),
      cancel: true,
      persistent: true,
      ok: {
        label: trans("确定"),
        color: "primary",
      },
      cancel: {
        label: trans("取消"),
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
    title: trans("提示"),
    message: trans("确认标记为{status}?", {
      status: row.is_print_shipping_label ? trans("未打印") : trans("已打印"),
    }),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("是"),
      color: "primary",
    },
    cancel: {
      label: trans("否"),
      color: "grey-7",
    },
  }).onOk(async () => {
    setPrint(row, !row.is_print_shipping_label);
  });
};
</script>

<style scoped lang="scss">
.packaging-page {
  min-height: 100vh;
  width: 100vw;
  background: #f4f5f8;
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    padding: 0 calc((100% - 1400px) / 2);
    font-size: 16px;
    font-weight: 500;
    background-color: #fff;
    .left {
      display: flex;
      align-items: center;
      gap: 10px;
      .title {
        font-weight: 600;
        font-size: 24px;
        color: #1f1f1f;
        line-height: 30px;
      }
      .wave-number {
        font-weight: bold;
        font-size: 16px;
        color: #5745c5;
      }
    }
    .right {
      display: flex;
      align-items: center;
      gap: 20px;
      .rt-btn {
        padding: 0 20px;
        height: 42px;
        border-radius: 9px 9px 9px 9px;
      }
    }
  }

  .action-bar {
    display: flex;
    align-items: center;

    width: 1400px;
    margin: 20px auto;
    gap: 20px;
    .btn {
      height: 32px;
      border-radius: 9px 9px 9px 9px;
    }
    .print {
      padding: 0 32px;
    }
  }

  .main-card {
    width: 1400px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    margin: 20px auto;
    padding: 20px;

    .info-bar {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0px;
      }
      .sku {
        font-weight: 500;
        margin-left: 8px;
      }
      .btn-mini {
        min-width: 40px;
        padding: 0 20px;
        font-weight: 400;
        font-size: 14px;
        height: 32px;
        border-radius: 9px 9px 9px 9px;
      }
      .ml-32 {
        margin-left: 32px;
      }
    }
    .pack-table {
      margin-top: 8px;

      :deep(th) {
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
      gap: 10px;
      margin-bottom: 10px;
      .product-img {
        width: 70px;
        height: 70px;
        object-fit: contain;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .goods-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        .sku {
          font-weight: 500;
          font-size: 14px;
          color: #5745c5;
          line-height: 16px;
        }
        .product-name {
          font-weight: 400;
          font-size: 14px;
          color: #1f1f1f;
          line-height: 16px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          width: 200px;
        }
        .other {
          font-weight: 500;
          font-size: 12px;
          color: #666666;
          line-height: 14px;
        }
      }
    }
    .customer-code {
      color: #b0b0b0;
      font-size: 13px;
      margin-left: 4px;
    }
    .pack-select {
      width: 200px;
    }
  }
}
</style>