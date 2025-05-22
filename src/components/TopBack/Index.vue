<template>
  <div>
    <div class="back-btn">
      <span @click="handleBack">
        <img src="@/assets/images/back.png" class="back-icon" alt="" />
        <span class="back-title">
          {{ title }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import trans from "@/i18n";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const router = useRouter();
const handleBack = () => {
  router.back();
};
</script>


<style scoped lang="scss">
.back-btn {
  span {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .back-icon {
    width: 30px;
    height: 30px;
  }
  .back-title {
    font-weight: 600;
    font-size: 22px;
    color: #1f1f1f;
  }
}
</style>
