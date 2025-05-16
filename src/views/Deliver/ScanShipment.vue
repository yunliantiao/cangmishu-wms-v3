<template>
  <div class="scan-shipment-page">
    <!-- 顶部筛选栏 -->
    <!-- <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <q-input
          outlined
          dense
          v-model="pageData.orderNo"
          :label="trans('请扫描输入运单号或平台订单号')"
          class="filter-item"
          style="width: 320px"
        />

        <div class="col-auto">
          <q-btn
            color="primary"
            class="filter-btn"
            :label="trans('确定')"
            @click="handleSearch"
          />
        </div>
      </div>
    </div> -->

    <div class="scan-top">
      <div class="scan-title">
        {{ trans("扫描发货") }}
      </div>
      <div class="center-box">
        <div class="input-box">
          <div class="scan-input">
            <q-input
              class="input-box"
              v-model="pageData.orderNo"
              ref="inputRef"
              :loading="$store.state.btnLoading"
              borderless
              @keyup.enter="orderNoEnter"
              @update:model-value="handleNo"
              :placeholder="trans('请扫描输入运单号或平台订单号')"
            />
          </div>

          <div class="scan-input">
            <q-input
              class="input-box"
              v-model="pageData.actual_weight"
              @keyup.enter="handleSearch"
              ref="weightRef"
              type="number"
              min="0"
              :loading="$store.state.btnLoading"
              borderless
              :placeholder="trans('请输入重量')"
            />
            <div class="unit-box">G</div>
          </div>
        </div>
        <div class="btn-box">
          <q-btn
            color="primary"
            flat
            style="width: 106px; height: 60px"
            :label="trans('重置')"
            outline
            @click="resetFilter"
          />
        </div>
      </div>
      <div class="scan-desc">
        <img src="@/assets/images/warning.png" alt="" />
        {{ trans("请先切换成[EN]输入法") }}
        <br />
      </div>
      <div class="scan-desc">
        {{ trans("称重须知：请注意电子平台单位和页面选中的称重单位保持一致") }}
      </div>
    </div>

    <!-- 表格 -->
    <div class="scan-main-table">
      <div class="table-header row items-center">
        <span class="table-title">{{ trans("扫描记录") }}</span>
        <q-space />
        <q-btn
          color="primary"
          flat
          @click="handlePrint"
          :disable="pageData.rows.length === 0"
          >{{ trans("打印签单") }}</q-btn
        >
      </div>
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        hide-pagination
        class="scan-table"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("暂无数据") }} </span>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="tracking_number" :props="props">
              {{ props.row.tracking_number }}
            </q-td>
            <q-td key="logistics" :props="props">
              {{ props.row.logistics_channels_name || "--" }}
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

            <q-td key="estimated_weight" :props="props">
              {{ props.row.estimated_weight }}
            </q-td>

            <q-td key="actual_weight" :props="props">
              {{ props.row.actual_weight }}
            </q-td>
            <q-td key="diff_weight" :props="props">
              {{ props.row.actual_weight - props.row.estimated_weight }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import outApi from "@/api/out";
import trans from "@/i18n";
import Message from "@/utils/message";

const weightRef = ref(null);

const pageData = reactive({
  orderNo: "",
  actual_weight: "",
  weightUnit: "g",
  weightUnitOptions: [
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
  ],
  voice: true,
  rows: [],
  columns: [
    {
      name: "tracking_number",
      label: trans("运单号"),
      field: "tracking_number",
      align: "left",
    },
    {
      name: "logistics",
      label: trans("物流方式"),
      field: "logistics",
      align: "left",
    },
    {
      name: "product",
      label: trans("商品信息"),
      field: "product",
      align: "left",
    },
    { name: "qty", label: trans("数量"), field: "qty", align: "center" },
    {
      name: "estimated_weight",
      label: trans("预设重量(g)"),
      field: "estimated_weight",
      align: "center",
    },
    {
      name: "actual_weight",
      label: trans("实际重量(g)"),
      field: "real_weight",
      align: "actual_weight",
    },
    {
      name: "diff_weight",
      label: trans("称重差异(g)"),
      field: "diff_weight",
      align: "center",
    },
  ],
});

const handleSearch = async () => {
  // 扫描/称重逻辑

  if (!pageData.orderNo) {
    return Message.notify(trans("请输入订单号"));
  }
  if (!pageData.actual_weight) {
    return Message.notify(trans("请输入重量"));
  }

  let params = {
    number: pageData.orderNo,
  };
  const orderInfo = await outApi.getOrderInfoByNumber(params);
  console.log("orderInfo", orderInfo);

  const { data } = await outApi.scanShipment(orderInfo.data.id, {
    actual_weight: pageData.actual_weight,
  });
  console.log("data", data);
  // pageData.rows = [data];
};

const resetFilter = () => {
  pageData.orderNo = "";
  pageData.actual_weight = "";
  pageData.rows = [];
};

const orderNoEnter = () => {
  weightRef.value.focus();
};

const handleNo = async () => {
  pageData.actual_weight = "";
};

const handlePrint = async () => {
  // 打印签单逻辑
  let ids = pageData.rows.map((item) => item.id);
  console.log("ids", ids);
  const { data } = await outApi.printShipment({
    package_ids: ids,
  });
  window.open(data.data, "_blank");
};
</script>

<style scoped lang="scss">
.scan-shipment-page {
  background: #f4f5f8;
  min-height: 100vh;
  .table-header {
    padding-top: 10px;
    .table-title {
      font-weight: bold;
      font-size: 16px;
      color: #1f1f1f;
    }
  }

  .filter-bar {
    background: #ffffff;
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;
    padding: 32px;
    gap: 20px;
  }
  .filter-select,
  .filter-input {
    min-width: 120px;
  }
  .tip-bar {
    min-height: 32px;
  }
  .main-table {
    .table-header {
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #1976d2;
      .text-h6 {
        font-size: 16px;
        font-weight: 500;
      }
    }
    .scan-table {
      margin-top: 0;
      :deep(.q-table th) {
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }
      :deep(.q-table td) {
        font-size: 14px;
        color: #333;
        padding: 8px 12px;
        background: #fff;
      }
    }
  }
}
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
}

.scan-top {
  height: 198px;
  background: #f2f0ff;
  border-radius: 0px 0px 0px 0px;
  padding: 0 calc((100vw - 1400px) / 2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  .scan-title {
    font-weight: 600;
    font-size: 24px;
    color: #1f1f1f;
    line-height: 30px;
    margin-bottom: 20px;
  }
  .scan-input {
    margin-bottom: 10px;
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
    line-height: 14px;
    gap: 7px;
    img {
      width: 12px;
      height: 12px;
    }
  }
}

.center-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>