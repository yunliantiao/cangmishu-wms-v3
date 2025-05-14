<template>
  <q-input
    v-model="inputValue"
    outlined
    dense
    readonly
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    class="date-picker"
    :disable="disable"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="inputValue"
            :mask="mask"
            :locale="locale"
            :options="options ? options : undefined"
            :color="color"
            :first-day-of-week="firstDayOfWeek"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import trans from "@/i18n";
const props = defineProps({
  modelValue: {
    type: [String, Date, null],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: trans("请选择日期"),
  },
  mask: {
    type: String,
    default: "YYYY-MM-DD",
  },
  rules: {
    type: Array,
    default: () => [],
  },
  disable: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Function,
    default: null,
  },
  color: {
    type: String,
    default: "primary",
  },
  firstDayOfWeek: {
    type: Number,
    default: 1, // 1 代表周一开始
  },
  // 使用中文语言配置
  useChineseLocale: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// 内部值，用于双向绑定
const inputValue = ref(props.modelValue || "");

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal || "";
  }
);

// 监听内部值变化，向外发送更新
watch(inputValue, (newVal) => {
  emit("update:modelValue", newVal);
});

// 语言包配置
const locale = computed(() => {
  if (!props.useChineseLocale) {
    return undefined; // 使用默认语言配置
  }

  try {
    return {
      days: [
        trans("星期日"),
        trans("星期一"),
        trans("星期二"),
        trans("星期三"),
        trans("星期四"),
        trans("星期五"),
        trans("星期六"),
      ],
      daysShort: [
        trans("日"),
        trans("一"),
        trans("二"),
        trans("三"),
        trans("四"),
        trans("五"),
        trans("六"),
      ],
      months: [
        trans("一月"),
        trans("二月"),
        trans("三月"),
        trans("四月"),
        trans("五月"),
        trans("六月"),
        trans("七月"),
        trans("八月"),
        trans("九月"),
        trans("十月"),
        trans("十一月"),
        trans("十二月"),
      ],
      monthsShort: [
        trans("1月"),
        trans("2月"),
        trans("3月"),
        trans("4月"),
        trans("5月"),
        trans("6月"),
        trans("7月"),
        trans("8月"),
        trans("9月"),
        trans("10月"),
        trans("11月"),
        trans("12月"),
      ],
    };
  } catch (error) {
    console.error("Error in DatePicker locale", error);
    return undefined;
  }
});
</script>

<style lang="scss" scoped>
.date-picker {
  width: 100%;
}
</style>
