<template>
  <div class="photo-record-page">
    <div class="search-box">
      <q-select
        outlined
        dense
        v-model="pageData.customer_ids"
        :options="pageData.customerOptions"
        multiple
        option-label="label"
        option-value="value"
        @update:model-value="getList"
        map-options
        emit-value
        clearable
        label="客户"
        class="filter-item"
      />
      <DatePickerNew
        v-model:start_date="pageData.start_date"
        v-model:end_date="pageData.end_date"
        :show-select="false"
      ></DatePickerNew>
      <KeywordSearch
        v-model:search_type="pageData.search_type"
        v-model:search_value="pageData.keywords"
        :showSearchMode="false"
      ></KeywordSearch>
      <q-btn color="primary" class="filter-btn" @click="getList">查询</q-btn>
    </div>
    <div class="main-table q-mt-md">
      <q-table
        :rows="pageData.rows"
        :columns="pageData.columns"
        row-key="id"
        flat
        hide-bottom
        class="photo-table"
        :loading="pageData.loading"
        :rows-per-page-options="[0]"
        :rows-per-page="0"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <!-- 商品图片 -->
            <q-td>
              <q-img
                :src="props.row.photo_url"
                class="product-img"
                :ratio="1"
                spinner-color="primary"
                style="width: 70px; height: 70px"
                :img-class="'object-fit-contain'"
                :error-src="'/statics/img-not-found.png'"
              >
                <template v-slot:error>
                  <q-icon
                    name="image_not_supported"
                    color="grey-5"
                    size="32px"
                  />
                </template>
              </q-img>
            </q-td>
            <q-td>{{ props.row.package_number }}</q-td>
            <!-- <q-td>{{ props.row.warehouse }}</q-td> -->
            <q-td>{{ props.row.customer?.name }}</q-td>
            <q-td>
              <div>{{ props.row.logistics_providers_code }}</div>
              <div class="text-grey-7">
                {{ props.row.system_order_number }}
              </div>
              <div v-if="props.row.extra_logistics" class="text-grey-7">
                {{ props.row.extra_logistics }}
              </div>
            </q-td>
            <q-td>{{ props.row.order_number }}</q-td>
            <q-td>{{ props.row.photo_time }}</q-td>
            <q-td>{{ props.row.created_at }}</q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <span class="text-grey">暂无数据</span>
          </div>
        </template>
      </q-table>

      <Pagination
        :total-count="pageData.total"
        v-model:page="pageData.page"
        v-model:rows-per-page="pageData.per_page"
        @page-change="getList"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import outApi from "@/api/out";
import customerApi from "@/api/customer";
import Pagination from "@/components/Pagination.vue";
import DatePickerNew from "@/components/DatePickerNew/Index.vue";
import KeywordSearch from "@/components/KeywordSearch/Index.vue";

const pageData = reactive({
  loading: false,
  rows: [],
  total: 0,
  page: 1,
  per_page: 10,
  start_date: "",
  end_date: "",
  search_type: "tracking_number",
  keywords: "",
  columns: [
    {
      name: "photo_url",
      label: "商品",
      field: "photo_url",
      align: "left",
    },
    {
      name: "package_number",
      label: "包裹号",
      field: "package_number",
      align: "left",
    },
    { name: "customer_id", label: "客户", field: "customer_id", align: "left" },
    {
      name: "logistics_providers_code",
      label: "物流方式/运单号",
      field: "logistics_providers_code",
      align: "left",
    },
    {
      name: "system_order_number",
      label: "平台订单号",
      field: "system_order_number",
      align: "left",
    },
    {
      name: "order_number",
      label: "ERP单号",
      field: "order_number",
      align: "left",
    },
    {
      name: "created_at",
      label: "拍照时间",
      field: "created_at",
      align: "left",
    },
  ],
});

onMounted(() => {
  getList();
  getCustomerList();
});

const getCustomerList = async () => {
  const { data } = await customerApi.getCustomerList();
  if (data?.items) {
    pageData.customerOptions = data.items.map((row) => {
      return {
        label: row.name,
        value: row.id,
      };
    });
  }
};

const getList = async () => {
  pageData.loading = true;
  let params = {
    page: pageData.page,
    per_page: pageData.per_page,
    customer_ids: pageData.customer_ids,
    start_date: pageData.start_date || "",
    end_date: pageData.end_date || "",
    search_type: pageData.search_type || "",
    keywords: pageData.keywords || "",
  };
  const { data } = await outApi.photoRecord(params);
  console.log("data", data);

  pageData.rows = data.items;
  pageData.total = data.meta.total;
  pageData.loading = false;
};
</script>

<style scoped lang="scss">
.photo-record-page {
  min-height: 100vh;
  padding: 0 0 24px 0;

  .main-table {
    background: #fff;
    padding: 32px;
    box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
    border-radius: 16px 16px 16px 16px;

    .photo-table {
      margin-top: 0;
      :deep(.q-table th) {
        // background: #f5f6fa;
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }
      :deep(.q-table td) {
        font-size: 14px;
        color: #333;
        padding: 8px 12px;
        background: #fff;
        vertical-align: middle;
      }
    }
    .product-img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border: 1px solid #eee;
      border-radius: 4px;
      background: #fafbfc;
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  background: #fff;
  padding: 32px;
  box-shadow: 0px 1px 10px 1px rgba(102, 102, 102, 0.08);
  border-radius: 16px 16px 16px 16px;
}
</style>
