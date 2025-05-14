<template>
  <div>
    <ScanTop
      :title="trans('扫描签收')"
      :placeholder="
        trans('请扫描入库单号/退货单号/运单号/ERP单号/平台订单号/箱唛')
      "
    />
  </div>
</template>

<script setup>
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";
</script>
