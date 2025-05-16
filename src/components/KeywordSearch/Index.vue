<template>
  <div class="flex">
    <div class="date-picker-new">
      <q-select
        outlined
        dense
        v-show="showSearchType"
        v-model="search_type"
        :options="searchTypeList"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-select"
      />
      <div class="play-date-picker">
        <q-input
          outlined
          dense
          class="input-box"
          v-model="search_value"
          :placeholder="trans('请输入')"
        />
      </div>
      <q-select
        outlined
        dense
        v-show="showSearchMode"
        v-model="search_mode"
        :options="searchModeList"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-select br-none"
      />
    </div>
  </div>
</template>

<script setup>
import trans from "@/i18n";

const search_type = defineModel("search_type", {
  type: String,
  default: "",
});

const search_value = defineModel("search_value", {
  type: String,
  default: "",
});

const search_mode = defineModel("search_mode", {
  type: String,
  default: "",
});

const props = defineProps({
  showSearchType: {
    type: Boolean,
    default: true,
  },
  showSearchMode: {
    type: Boolean,
    default: true,
  },
  searchTypeList: {
    type: Array,
    default: () => {
      return [
        { label: trans("运单号"), value: "tracking_number" },
        { label: trans("包裹号"), value: "package_number" },
        { label: trans("订单号"), value: "order_number" },
      ];
    },
  },
  searchModeList: {
    type: Array,
    default: () => {
      return [
        { label: trans("精确搜索"), value: "exact" },
        { label: trans("模糊搜索"), value: "fuzzy" },
        { label: trans("前缀搜索"), value: "prefix" },
      ];
    },
  },
});
</script>

<style scoped lang="scss">
.date-picker-new {
  border-radius: 4px;
  height: 40px;
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.24);
  background: #ffffff;
  .filter-select {
    border-right: 1px solid rgba(0, 0, 0, 0.24);
    min-width: 132px;
    :deep(.q-field__control:before) {
      border: none;
    }
  }
  .br-none {
    border-right: none;
    border-left: 1px solid rgba(0, 0, 0, 0.24);
  }
  .play-date-picker {
    .input-box {
      :deep(.q-field__control:before) {
        border: none;
      }
    }
  }
}
</style>