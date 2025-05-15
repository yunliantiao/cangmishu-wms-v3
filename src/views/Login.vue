<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧显示信息区域 -->
      <div class="login-info-section">
        <img
          v-if="language == 'zh_CN'"
          src="@/assets/images/login/title.png"
          class="title-logo"
          alt=""
        />
        <img
          v-else
          src="@/assets/images/login/title-en.png"
          class="title-logo"
          alt=""
        />
        <div class="page-title-desc">
          {{ trans("一款简单高效的云仓管理系统") }}
        </div>
        <div class="page-title-desc-2">
          {{
            trans(
              "服务于履约服务商，专用于仓库管理、库存管理、代发货管理、如Dropshipping服务商"
            )
          }}
        </div>
        <img src="@/assets/images/login/login-bg.png" class="login-bg" alt="" />
        <!-- <div class="logo-container">
          <span class="logo-text">{{ trans("仓秘书WMS") }}</span>
        </div>
        <div class="info-content">
          <h1 class="info-title">{{ trans("电商仓储管理系统！") }}</h1>
          <ul class="feature-list">
            <li>{{ trans("对接大量物流，解锁全球！") }}</li>
            <li>{{ trans("一对一指导，帮助您快速上手！") }}</li>
          </ul>
        </div> -->
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="login-form-section">
        <div class="form-container">
          <q-form @submit="onSubmit" v-show="loginType == 1" class="login-form">
            <div class="login-title">{{ trans("登录") }}</div>
            <q-input
              v-model="ruleForm.email"
              type="email"
              outlined
              :placeholder="trans('邮箱')"
              class="q-mb-md"
              :rules="[(val) => !!val || trans('请输入邮箱')]"
            />
            <q-input
              v-model="ruleForm.password"
              :type="isPwd ? 'password' : 'text'"
              :placeholder="trans('密码')"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || trans('请输入密码')]"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  v-if="ruleForm.password"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <!-- 
            <div class="captcha-container q-mb-md">
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

            <q-btn
              :label="trans('登录')"
              type="submit"
              color="primary"
              class="full-width login-btn"
              :loading="$store.state.btnLoading"
            />

            <div class="login-options">
              <span>{{ trans("还没有账号？") }}</span>
              <q-btn
                flat
                color="primary"
                :label="trans('免费注册')"
                class="register-link"
                @click="loginType = 2"
              />
              <!-- <q-space /> -->
              <!-- <q-btn
                flat
                color="primary"
                label="找回密码"
                class="forgot-pwd-link"
                @click="goToResetPassword"
              /> -->
            </div>
          </q-form>
          <div v-show="loginType == 2" style="margin: auto">
            <Register v-model="loginType" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import Register from "./User/Register.vue";
import api from "@/api/index";
import trans from "@/i18n";
export default {
  name: "LoginPage",
  components: {
    Register,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const isPwd = ref(true);
    const loading = ref(false);
    const $q = useQuasar();
    const loginType = ref(1); //==

    const language = ref("");
    language.value = localStorage.getItem("language");

    const ruleForm = ref({
      email: "",
      password: "",
    });

    const onSubmit = async () => {
      api.login(ruleForm.value).then((res) => {
        if (res.success) {
          let warehouseId = res.data?.user?.default_warehouse?.id;
          if (warehouseId) {
            localStorage.setItem("warehouseId", warehouseId);
          }
          store.commit("UPDATE_TOKEN", res.data.token);
          store.commit("UPDATE_USER_INFO", res.data.user);
          router.push("/");
        }
      });
    };

    const refreshCaptcha = () => {
      // 这里添加刷新验证码的逻辑
      console.log("刷新验证码");
      $q.notify({
        type: "info",
        message: trans("验证码已刷新"),
        position: "top",
        timeout: 1000,
      });
    };

    const goToResetPassword = () => {
      // router.push("/reset-password");
    };

    return {
      isPwd,
      loading,
      ruleForm,
      loginType,
      language,
      onSubmit,
      refreshCaptcha,
      goToResetPassword,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}

.login-info-section {
  width: 50%;
  flex: 0 0 50%;
  background: linear-gradient(225deg, #de4b9c 0%, #2f22ac 100%);
  border-radius: 0px 0px 0px 0px;
  color: white;
  padding: 40px;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  .title-logo {
    width: 169px;
  }
  .login-bg {
    position: absolute;
    top: 30%;
    left: 10%;
    width: 80%;
  }

  /* 移除之前的背景图和渐变效果，使其与参考图片一致 */
  &::before,
  &::after {
    display: none;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-bottom: 60px;
  padding-left: 10px;

  .logo-text {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding-left: 10px;
}

.info-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 40px;
  line-height: 1.3;
}

.feature-list {
  list-style-type: none;
  padding: 0;

  li {
    padding: 10px 0 10px 24px;
    position: relative;
    font-size: 15px;
    margin-bottom: 12px;

    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: white;
      font-size: 16px;
    }
  }
}

.login-form-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: white;
  box-sizing: border-box;
}

.form-container {
  width: 60%;

  padding: 0 10px;
}

.login-title {
  font-weight: bold;
  font-size: 2.25rem;
  color: #1f1f1f;
  margin-bottom: 5rem;
}

.q-form {
  .q-mb-md {
    margin-bottom: 12px !important;
  }
}

.q-input {
  :deep(.q-field__control) {
    // height: 50px;
    border-radius: 4px;
    background-color: white;
  }

  :deep(.q-field__native) {
    padding-top: 14px;
    font-size: 15px;
  }
}

.captcha-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px !important;

  .q-input {
    flex: 1;
  }

  .captcha-image {
    width: 110px;
    height: 42px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      background-color: #0f1f3d;
    }
  }
}

.login-btn {
  height: 60px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 9px 9px 9px 9px;
  margin-top: 16px;
  font-weight: bold;
  font-size: 24px;
  color: #ffffff;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  font-size: 1rem;

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

// 响应式适配
@media (max-width: 767px) {
  .login-container {
    min-height: 100vh;
  }
  .login-wrapper {
    flex-direction: column;
  }

  .login-title {
    margin-bottom: 1rem;
  }

  .form-container {
    width: 80%;
    padding: 0 10px;
  }

  .login-info-section,
  .login-form-section {
    width: 100%;
    flex: none;
  }

  .login-info-section {
    height: 40%;
    padding: 20px;
  }

  .login-form-section {
    height: 80%;
    padding: 20px;
  }

  .logo-container {
    margin-bottom: 20px;
  }

  .info-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .feature-list li {
    font-size: 14px;
    margin-bottom: 6px;
  }
}

.q-field__control {
  &:before {
    background: transparent !important;
  }
}

.page-title-desc {
  font-weight: bold;
  font-size: 40px;
  color: #ffffff;
  text-align: left;
  width: 100%;
  margin-top: 4rem;
}
.page-title-desc-2 {
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
  text-align: left;
  width: 100%;
  margin-bottom: 30px;
  margin-top: 20px;
}
</style>
