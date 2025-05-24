<template>
  <div class="examine-goods-page">
    <div class="scan-top">
      <div class="scan-title">
        {{ trans("扫描验货") }}
      </div>
      <div class="center-box">
        <div class="input-box">
          <div class="scan-input">
            <q-select
              outlined
              :label="trans('物流组')"
              v-model="pageData.group"
              :options="pageData.groupOptions"
              class="scan-filter-item"
            />
            <q-input
              class="input-box"
              v-model="pageData.packageNo"
              ref="inputRef"
              :loading="$store.state.btnLoading"
              borderless
              :placeholder="trans('请扫描运单号/包裹号')"
              @keyup.enter="search"
            />
          </div>

          <div class="scan-input">
            <q-input
              class="input-box"
              :disable="pageData.rows.length === 0"
              v-model="pageData.sku"
              ref="inputRef"
              :loading="$store.state.btnLoading"
              borderless
              :placeholder="trans('请扫描商品标签')"
              @keyup.enter="examine"
            />
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
      </div>
    </div>

    <!-- 顶部筛选栏 -->
    <!-- <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-select
            outlined
            dense
            :label="trans('物流组')"
            v-model="pageData.group"
            :options="pageData.groupOptions"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="pageData.packageNo"
            :label="trans('请扫描运单号/包裹号')"
            @keyup.enter="search"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-input
            outlined
            dense
            v-model="pageData.sku"
            :disable="pageData.rows.length === 0"
            :label="trans('请扫描商品标签')"
            @keyup.enter="examine"
            class="filter-item"
          />
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            class="filter-btn"
            :label="trans('重置')"
            outline
            @click="resetFilter"
          />
        </div>
      </div>
    </div> -->

    <!-- 表格 -->
    <div class="scan-main-table">
      <!-- <div class="table-header row items-center q-px-md q-py-sm">
        <q-space />
        <q-btn flat round icon="settings" />
      </div> -->
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        class="examine-table"
        hide-pagination
        :loading="pageData.loading"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td> {{ props.row.group || trans("暂无") }}</q-td>
            <q-td>{{ props.row.package_number }}</q-td>
            <q-td>
              <div
                v-for="item in props.row.items"
                :key="item.sku"
                class="product-info-row"
              >
                <img :src="item.sku_image" class="product-img" />
                <div>
                  <div>{{ item.sku }}</div>
                  <div class="text-grey-7" style="font-size: 12px">
                    {{ item.product_name }}
                    {{ item.sku_name }}
                  </div>
                </div>
              </div>
            </q-td>
            <q-td>
              <div
                v-for="item in props.row.items"
                :key="item.sku"
                class="product-info-row"
              >
                <span
                  :class="{
                    'text-positive': item.checked_qty === item.quantity,
                  }"
                >
                  {{ item.checked_qty }}/{{ item.quantity }}
                </span>
              </div>
            </q-td>
            <q-td>
              <div class="flex">
                <q-badge v-if="props.row.status === 0" color="grey-5" outline>
                  {{ trans("待验货") }}
                </q-badge>
                <q-badge v-if="props.row.status === 1" color="orange" outline>
                  {{ trans("验货中") }}
                </q-badge>
                <q-badge v-if="props.row.status === 2" color="positive" outline>
                  {{ trans("已验货") }}
                </q-badge>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ trans("暂无数据") }}</span>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import outApi from "@/api/out";
import Message from "@/utils/message";
import trans from "@/i18n";
import { playBeep } from "@/utils/voice.js";

onMounted(() => {
  let language = localStorage.getItem("language");
  console.log("language", language);
});

const pageData = reactive({
  group: "",
  loading: false,
  groupOptions: [trans("所有物流组"), trans("物流组 A"), trans("物流组 B")],
  packageNo: "",
  sku: "",
  columns: [
    { name: "group", label: trans("物流组"), field: "group", align: "left" },
    {
      name: "package_number",
      label: trans("运单号/包裹号"),
      field: "package_number",
      align: "left",
    },
    {
      name: "product",
      label: trans("商品信息"),
      field: "product",
      align: "left",
    },
    {
      name: "checked",
      label: trans("已扫/应扫"),
      field: "checked",
      align: "left",
    },
    {
      name: "status",
      label: trans("验货状态"),
      field: "status",
      align: "left",
    },
  ],
  rows: [],
});

const resetFilter = () => {
  pageData.group = "";
  pageData.packageNo = "";
  pageData.sku = "";
  pageData.rows = [];
};

const search = async () => {
  if (!pageData.packageNo) {
    Message.notify(trans("请输入运单号/包裹号"));
    return;
  }
  pageData.sku = "";
  pageData.rows = [];
  pageData.loading = true;
  try {
    const { data } = await outApi.getOrderInfoByNumber({
      number: pageData.packageNo,
    });
    pageData.loading = false;
    pageData.rows = data.packages.map((row) => {
      if (row.is_exception) {
        row.status = 2;
      } else {
        row.status = 0;
      }
      row.items = row.items.map((item) => {
        if (row.is_exception) {
          item.checked_qty = item.quantity;
        } else {
          item.checked_qty = 0;
        }
        return item;
      });
      return row;
    });
    playBeep(true);
  } catch (error) {
    playBeep(false);
  } finally {
    pageData.loading = false;
  }
};

const examine = async () => {
  if (!pageData.sku) {
    Message.notify(trans("请输入商品编码"));
    return;
  }

  let code = pageData.sku;
  let row = pageData.rows.find((row) => {
    let sku = row.items.find(
      (item) => item.sku == code && item.checked_qty < item.quantity
    );
    if (sku) {
      sku.checked_qty++;
      row.status = 1;
      return true;
    }
    return false;
  });
  if (!row) {
    playBeep(false);

    Message.notify(trans("商品编码不正确"));
    return;
  }
  let bool = row.items.every((item) => item.checked_qty === item.quantity);
  if (bool) {
    row.status = 2;
    await outApi.examineGoods(row.id);
    playBeep(true);
    return;
  }
};
</script>

<style scoped lang="scss">
.examine-goods-page {
  min-height: 100vh;
  background-color: #f4f5f8;
  .main-table {
    .table-header {
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #1976d2;
      .link {
        cursor: pointer;
        color: #1976d2;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .examine-table {
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
        background: #f7fbff;
      }
    }
  }
}

.product-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  .product-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    margin-right: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #fafbfc;
  }
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
    img {
      width: 26px;
      height: 26px;
    }
    .input-box {
      flex: 1;
      font-size: 16px;
      color: #1f1f1f;
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

.scan-filter-item {
  width: 200px;
  :deep(.q-field__control) {
    background: #e8e4ff !important;
    border-radius: 9px 9px 9px 9px !important;
    min-height: 50px !important;
    height: 50px !important;
    &:before {
      border: none !important;
    }
  }
}
</style>
