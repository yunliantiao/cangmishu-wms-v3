<template>
  <div class="flex">
    <div class="date-picker-new">
      <q-select
        outlined
        dense
        v-show="showSearchType"
        v-model="selectInfo.search_type"
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
          v-model="selectInfo.search_value"
          placeholder="请输入"
        />
      </div>
      <q-select
        outlined
        dense
        v-show="showSearchMode"
        v-model="selectInfo.search_mode"
        :options="searchTypeOptions"
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
import { reactive, watch } from "vue";
const selectInfo = defineModel("selectInfo", {
  type: Object,
  required: true,
  default: () => {
    return {
      date_type: "",
      search_value: "",
      search_mode: "",
    };
  },
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
        { label: "运单号", value: "tracking_number" },
        { label: "包裹号", value: "package_number" },
        { label: "订单号", value: "order_number" },
      ];
    },
  },
  searchTypeOptions: {
    type: Array,
    default: () => {
      return [
        { label: "精确搜索", value: "exact" },
        { label: "模糊搜索", value: "fuzzy" },
        { label: "前缀搜索", value: "prefix" },
      ];
    },
  },
});

const changeDate = (e) => {
  componentData.showDate = false;
};

const componentData = reactive({
  showDate: false,
  date_type: "created_at",
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
    width: 132px;
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