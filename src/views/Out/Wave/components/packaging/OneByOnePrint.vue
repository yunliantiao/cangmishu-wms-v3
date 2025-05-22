<template>
  <div>
    <div class="scan-top">
      <div class="center-box">
        <div class="input-box">
          <div class="scan-input">
            <span class="scan-filter-item">
              {{ trans("商品标签/包材编号") }}
            </span>

            <q-input
              class="input-box"
              v-model="componentData.orderNo"
              ref="inputRef"
              :loading="loading"
              borderless
              @keyup.enter="orderNoEnter"
              :placeholder="trans('请扫描商品标签/包材编号')"
            />
          </div>
        </div>
        <div class="btn-box">
          <q-btn
            color="primary"
            flat
            style="width: 106px; height: 60px"
            :label="trans('确定')"
            outline
            @click="orderNoEnter"
          />
        </div>
      </div>
      <div class="scan-desc">
        <img src="@/assets/images/warning.png" alt="" />
        {{ trans("请先切换成[EN]输入法") }}
        <br />
      </div>
      <div class="scan-desc">
        {{ trans("可扫描条码快速选择包材") }}
      </div>
    </div>

    <div class="scan-main-table">
      <q-table
        :rows="componentData.pendingList"
        :columns="pendingColumns"
        row-key="id"
        flat
        hide-pagination
        :loading="loading"
        class="scan-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("请扫描商品编码") }} </span>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="package_number" :props="props">
              {{ props.row.package_number }}
            </q-td>
            <q-td key="packaging_material" :props="props">
              <div class="box">
                <q-select
                  v-model="props.row.packaging_material.id"
                  :options="materialsList"
                  :label="trans('包材')"
                  outlined
                  dense
                  emit-value
                  @update:model-value="handlePrint(props.row)"
                  map-options
                  :rules="[(val) => !!val || trans('请选择包材')]"
                  class="pack-select"
                />
              </div>
            </q-td>
            <q-td key="product" :props="props">
              <div
                class="box"
                v-for="(item, index) in props.row.items"
                :key="index"
              >
                {{ item.sku }}
              </div>
            </q-td>
            <q-td key="qty" :props="props">
              <div
                class="box"
                v-for="(item, index) in props.row.items"
                :key="index"
              >
                {{ item.quantity }}
              </div>
            </q-td>

            <q-td key="inFrame" :props="props" align="center">
              <div
                class="box"
                v-for="(item, index) in props.row.items"
                :key="index"
              >
                <q-input
                  dense
                  style="width: 100px"
                  outlined
                  type="number"
                  class="inFrame-input"
                  v-model="item.inFrame"
                ></q-input>
              </div>
            </q-td>

            <q-td key="action" :props="props">
              <q-btn
                flat
                round
                class="table-icon"
                v-if="getItemsCount(props.row)"
                @click="handlePrint(props.row)"
              >
                <img src="@/assets/images/set-not-print.png" />
                <q-tooltip>{{ trans("打印") }}</q-tooltip>
              </q-btn>

              <q-btn
                @click="handleErrorRow(props.row)"
                flat
                round
                size="sm"
                class="table-icon"
              >
                <img src="@/assets/images/error.png" />
                <q-tooltip>{{ trans("标记异常") }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div class="scan-main-table">
      <!-- 面单打印记录 -->
      <div class="scan-table-title">
        {{ trans("面单打印记录") }}
      </div>
      <q-table
        :rows="componentData.successList"
        :columns="successColumns"
        row-key="id"
        flat
        hide-pagination
        :loading="loading"
        class="scan-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("没有打印记录") }} </span>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="package_number" :props="props">
              {{ props.row.package_number }}
            </q-td>

            <q-td key="customer" :props="props">
              {{ props.row.customer.name }}
            </q-td>

            <q-td key="packaging_material" :props="props">
              {{ props.row.packaging_material?.name || "--" }}
            </q-td>
            <q-td key="product" :props="props">
              <div
                class="box"
                v-for="(item, index) in props.row.items"
                :key="index"
              >
                {{ item.sku }}
              </div>
            </q-td>
            <q-td key="qty" :props="props">
              <div
                class="box"
                v-for="(item, index) in props.row.items"
                :key="index"
              >
                {{ item.quantity }}
              </div>
            </q-td>

            <q-td key="is_print_shipping_label" :props="props">
              {{
                props.row.is_print_shipping_label
                  ? trans("已打印")
                  : trans("未打印")
              }}
            </q-td>

            <q-td key="action" :props="props">
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
                @click="handlePrint(props.row)"
              >
                <img src="@/assets/images/set-not-print.png" />
                <q-tooltip>{{ trans("打印") }}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import trans from "@/i18n";
import Message from "@/utils/message";
import { playVoice, playBeep } from "@/utils/voice";
import OutApi from "@/api/out.js";
import { useQuasar } from "quasar";

const $q = useQuasar();
const successPackage = defineModel("successPackage", {
  type: Number,
  required: true,
  default: 0,
});

const componentData = reactive({
  step: 1,
  orderNo: "",
  pendingList: [],
  successList: [],
  packageList: [],
});

const pendingColumns = [
  {
    name: "package_number",
    label: trans("包裹号/运单号"),
    field: "package_number",
    align: "center",
  },

  {
    name: "packaging_material",
    label: trans("包材信息"),
    field: "packaging_material",
    align: "center",
  },

  {
    name: "product",
    label: trans("商品信息"),
    field: "product",
    align: "center",
  },

  {
    name: "qty",
    label: trans("数量"),
    field: "qty",
    align: "center",
  },

  {
    name: "inFrame",
    label: trans("核对数量"),
    field: "inFrame",
    align: "center",
  },

  {
    name: "action",
    label: trans("操作"),
    field: "action",
    align: "center",
  },
];

const successColumns = [
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
    name: "packaging_material",
    label: trans("包材信息"),
    field: "packaging_material",
    align: "center",
  },

  {
    name: "product",
    label: trans("商品信息"),
    field: "product",
    align: "center",
  },

  {
    name: "qty",
    label: trans("数量"),
    field: "qty",
    align: "center",
  },

  {
    name: "is_print_shipping_label",
    label: trans("打印状态"),
    field: "is_print_shipping_label",
    align: "center",
  },

  {
    name: "action",
    label: trans("操作"),
    field: "action",
    align: "center",
  },
];

const props = defineProps({
  materialsList: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  waveInfo: {
    type: Object,
    default: () => {},
  },
});

watch(
  () => props.waveInfo,
  (newVal) => {
    componentData.packageList = newVal.packages;

    let successList = componentData.packageList.filter((item) => {
      return item.is_print_shipping_label;
    });
    successPackage.value = successList.length;
    componentData.successList = successList;
  }
);

const orderNoEnter = () => {
  if (componentData.pendingList.length > 0) {
    let material = props.materialsList.find(
      (item) => item.code == componentData.orderNo
    );
    if (material) {
      playBeep(true);
      componentData.pendingList.forEach((item) => {
        item.packaging_material.id = material.value;
        item.packaging_material.name = material.label;
      });
      return;
    }

    // 先查当前输入的编码 是否能匹配上当前包裹的编码  或者商品sku
    let bool = componentData.pendingList.find((item) =>
      item.items.some((row) => row.sku == componentData.orderNo)
    );
    if (!bool) {
      Message.notify(trans("当前包裹没有找到对应的商品"));
      playBeep(false);
      return;
    } else {
      componentData.pendingList.forEach((item) => {
        item.items.forEach((row) => {
          row.inFrame += 1;
        });
      });
      playBeep(true);
      let packageIsSuccess = componentData.pendingList.every((item) => {
        return item.items.every((row) => row.inFrame == row.quantity);
      });

      if (packageIsSuccess) {
        handlePrint(componentData.pendingList[0]);
      }
    }
  } else {
    // 先找出还没进入已打印列表的包裹
    let successListPackageNumber = componentData.successList.map(
      (item) => item.package_number
    );
    //未完成的包裹
    let residueList = componentData.packageList.filter((item) => {
      return !successListPackageNumber.includes(item.package_number);
    });

    let residueItem = residueList.find((item) =>
      item.items.some((row) => row.sku == componentData.orderNo)
    );

    if (!residueItem) {
      Message.notify(trans("没有找到对应的包裹"));
      playBeep(false);
      return;
    } else {
      if (!residueItem.packaging_material?.id) {
        residueItem.packaging_material = { id: "", name: "" };
      }
      residueItem.items.forEach((item) => {
        item.inFrame = 0;
      });
      componentData.pendingList = [residueItem];

      // 递归调用  这个时候会处理进行中的包裹
      orderNoEnter();
    }
    console.log(residueItem);
  }
};

const getItemsCount = (row) => {
  return row.items.some((item) => item.inFrame == item.quantity);
};

const handlePrint = async (row) => {
  if (!row.packaging_material.id) {
    playVoice(trans("请选择包材"));
    return Message.notify(trans("请选择包材"));
  }
  let material = props.materialsList.find(
    (item) => item.value == row.packaging_material.id
  );

  row.packaging_material.name = material.label;
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
    componentData.successList.push(row);
    componentData.pendingList = [];
  });
};

const handleErrorRow = (row) => {
  console.log(row);
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
  row.is_print_shipping_label = is_printed;

  let count = 0;
  componentData.successList.forEach((item) => {
    if (item.is_print_shipping_label) {
      count += 1;
    }
  });
  successPackage.value = count;
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



<style lang="scss" scoped>
.keywords-input {
  flex: 1;
  :deep(.q-field__control) {
    border-radius: 0;
    border-right: none !important;
  }
}

.search-mode-select {
  width: 120px;
  :deep(.q-field__control) {
    border-radius: 0 4px 4px 0 !important;
  }
  :deep(.q-field__control:before) {
    border-left: 0;
  }
}

.box {
  padding: 5px 0;
  display: flex;
  justify-content: center;
}

.scan-top {
  height: 148px;
  background: #f2f0ff;
  border-radius: 0px 0px 0px 0px;
  padding: 0 calc((100vw - 1400px) / 2);
  display: flex;
  flex-direction: column;
  justify-content: center;

  .scan-input {
    padding: 7px;
    height: 64px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    border: 2px solid #5745c5;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    overflow: hidden;
    padding-left: 10px;
    img {
      width: 26px;
      height: 26px;
    }
    .input-box {
      flex: 1;
      font-size: 16px;
      color: #1f1f1f;
    }
    .unit-box {
      position: absolute;
      right: 0px;
      width: 50px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #1f1f1f;
      background: #f0f0f0;
      font-weight: bold;
    }
  }
  .scan-desc {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 12px;
    color: #666666;
    line-height: 22px;

    img {
      width: 12px;
      height: 12px;
    }
  }
}

.center-box {
  display: flex;
  align-items: center;
  width: 1400px;
  margin: 0 auto;
  gap: 20px;
  .input-box {
    display: flex;
    gap: 20px;
    .scan-input {
      &:nth-child(1) {
        width: 600px;
      }
    }
  }

  .btn-box {
    width: 110px;
    height: 64px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    border: 2px solid #5745c5;
    overflow: hidden;
    :deep(.q-btn__content) {
      font-weight: 600 !important;
      font-size: 18px !important;
      color: #5745c5 !important;
    }
  }
}

.scan-filter-item {
  background: #e8e4ff;
  border-radius: 9px 9px 9px 9px;
  min-height: 50px;
  padding: 0 10px;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}

.scan-table-title {
  padding-top: 10px;
  font-size: 18px;
  font-weight: 600;
}

.pack-select {
  width: 200px;
}
</style>
