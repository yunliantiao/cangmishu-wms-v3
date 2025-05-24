<template>
  <span class="hover-copy-box">
    <span :class="props.class" :style="props.style">{{ text }}</span>
    <span class="hover-copy-btn" @click="$copy(text)">
      {{ trans("复制") }}
    </span>
  </span>
</template>

<script setup >
import trans from "@/i18n";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    default: "",
  },
  style: {
    type: String,
    default: "",
  },
});
</script>


<style scoped lang="scss">
.hover-copy-box {
  position: relative;
  &:hover {
    .hover-copy-btn {
      visibility: visible;
      opacity: 1;
    }
  }
  .hover-copy-btn {
    transition: all ease 0.5s;
    opacity: 0;
    visibility: hidden;
    padding: 2px 6px;
    font-size: 13px;
    cursor: pointer;
    position: absolute;
    top: -24px;
    right: 0px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0px 5px 20px 0px rgba(0, 0, 0, 0.2);
    color: #1f1f1f;
    white-space: nowrap;
    z-index: 1000;
    &:hover {
      color: #5745c5;
    }
  }
}
</style>

