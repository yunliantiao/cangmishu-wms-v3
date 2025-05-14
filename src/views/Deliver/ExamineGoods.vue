<template>
  <div class="examine-goods-page">
    <!-- 顶部筛选栏 -->
    <div class="search-bar">
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
    </div>
    <div class="tip-bar row items-center q-mt-xs q-ml-sm q-mt-md">
      <q-icon name="info" color="grey-5" size="18px" class="q-mr-xs" />
      <span class="text-grey-6" style="font-size: 13px">{{
        trans("请先切换成EN输入法")
      }}</span>
    </div>

    <!-- 表格 -->
    <div class="main-table">
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
import { reactive } from "vue";
import outApi from "@/api/out";
import Message from "@/utils/message";
import trans from "@/i18n";

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
  } catch (error) {
    Message.notify(trans("获取订单信息失败"));
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
    Message.notify(trans("商品编码不正确"));
    return;
  }

  let bool = row.items.every((item) => item.checked_qty === item.quantity);
  if (bool) {
    row.status = 2;
    await outApi.examineGoods(row.id);
  }
};
</script>

<style scoped lang="scss">
.examine-goods-page {
  .filter-bar {
    background: #ffffff;
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;
    padding: 32px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .filter-select,
  .filter-input {
    min-width: 180px;
  }
  .tip-bar {
    min-height: 32px;
  }
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
  }
}
</style>