<template>
  <div>
    <q-form @submit="onSubmit" class="login-form">
      <h2 class="login-title">{{ trans("注册") }}</h2>
      <q-input
        v-model="ruleForm.name"
        filled
        type="text"
        :label="trans('用户名')"
        class="q-mb-md"
        :rules="[(val) => !!val || trans('请输入用户名')]"
      />
      <q-input
        v-model="ruleForm.email"
        filled
        type="email"
        :label="trans('邮箱')"
        class="q-mb-md"
        :rules="[(val) => !!val || trans('请输入邮箱')]"
      />
      <q-input
        v-model="ruleForm.password"
        filled
        :type="isPwd ? 'password' : 'text'"
        :label="trans('密码')"
        class="q-mb-md"
        :rules="[(val) => !!val || trans('请输入密码')]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <q-input
        v-model="ruleForm.password_confirmation"
        filled
        :type="isPwd ? 'password' : 'text'"
        :label="trans('确认密码')"
        class="q-mb-md"
        :rules="[(val) => !!val || trans('请输入确认密码')]"
      >
        <template v-slot:append>
          <q-icon
            :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isConfirmPwd = !isConfirmPwd"
          />
        </template>
      </q-input>

      <!-- <div class="captcha-container q-mb-md">
        <q-input
          v-model="ruleForm.captcha"
          filled
          label="请输入图形验证码"
          :rules="[(val) => !!val || '请输入验证码']"
        />
        <div class="captcha-image">
          <img
            src="https://placehold.co/110x40/001F4D/FFFFFF?text=CAPTCHA"
            alt="验证码"
            @click="refreshCaptcha"
          />
        </div>
      </div> -->
    </q-form>
    <q-btn
      :label="trans('注册')"
      type="submit"
      color="primary"
      @click="onSubmit"
      class="full-width login-btn"
      :loading="$store.state.btnLoading"
    />
    <div class="login-options">
      <span>{{ trans("已经有账号？") }}</span>
      <q-btn
        flat
        color="primary"
        :label="trans('登录')"
        class="register-link"
        @click="cancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import Dialog from "@/components/Dialog.vue";
import api from "@/api/index";
import warehouseApi from "@/api/warehouse";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import trans from "@/i18n";
const $q = useQuasar();
const emit = defineEmits(["update:modelValue"]);
const router = useRouter();
const ruleForm = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});
const dialogVisible = ref(false);
const isPwd = ref(true);
const isConfirmPwd = ref(true);
const loading = ref(false);
const store = useStore();

// 仓库表单数据
const warehouseForm = ref({
  name: "",
  type: "标准仓",
  code: "",
  country_code: "CN",
  city: "",
  street: "",
  door_no: "",
  postcode: "",
  address: "",
  contact_user: "",
  contact_phone: "",
  contact_email: "",
  timezone: "",
  currency: "",
  remark: "",
});

// 下拉选项
const warehouseTypes = ["标准仓", "保税仓", "海外仓"];
const timezoneOptions = ["UTC+8", "UTC+0", "UTC-5", "UTC-8"];

const cancel = () => {
  emit("update:modelValue", 1);
};
const onSubmit = () => {
  if (ruleForm.value.password !== ruleForm.value.password_confirmation) {
    $q.notify({
      message: trans("两次密码不一致"),
      color: "negative",
    });
    return;
  }
  api
    .resetPass({
      ...ruleForm.value,
    })
    .then((res) => {
      if (res.success) {
        localStorage.setItem("isRegister", true); //注册需要标记
        store.commit("UPDATE_TOKEN", res.data.token);
        store.commit("UPDATE_USER_INFO", res.data.user);
        router.push("/");
      } else {
        $q.notify({
          message: res.message || trans("注册失败"),
          color: "negative",
        });
      }
    })
    .catch((error) => {
      $q.notify({
        message: error?.message || trans("注册请求失败"),
        color: "negative",
      });
    });
};
</script>

<style scoped lang="scss">
.form-container {
  width: 100%;
  max-width: 380px;
  padding: 0 10px;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: #333;
}
.login-btn {
  height: 42px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 16px;
  background-color: #0f1f3d !important;
}
.login-options {
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;

  span {
    color: #666;
  }

  .register-link,
  .forgot-pwd-link {
    font-weight: 500;
    color: #2979ff !important;
    min-height: 32px !important;

    :deep(.q-btn__content) {
      padding: 0 4px;
    }
  }
}

// 仓库表单样式
.warehouse-form {
  font-size: 14px;

  .form-label {
    color: #606266;
    text-align: right;
    padding-right: 12px;
    font-size: 14px;

    .required {
      color: #f44336;
      margin-left: 2px;
    }

    @media (max-width: 575px) {
      text-align: left;
      padding-bottom: 8px;
    }
  }

  .form-input {
    :deep(.q-field__control) {
      height: 36px;
    }

    :deep(.q-field__marginal) {
      height: 36px;
    }
  }

  // 文本域高度调整
  :deep(.q-textarea) .q-field__control {
    height: auto;
  }

  // 移动端适配
  @media (max-width: 575px) {
    .form-item {
      flex-direction: column;
      align-items: flex-start !important;

      .form-label,
      .form-input {
        width: 100%;
      }
    }
  }
}
</style>