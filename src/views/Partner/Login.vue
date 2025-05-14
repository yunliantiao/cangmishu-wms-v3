<template>
  <div class="partner-login-container">
    <div class="login-box">
      <!-- 加载中状态 -->
      <div v-if="pageData.loading" class="loading-state">
        <q-spinner color="primary" size="3em" />
        <div class="loading-text q-mt-md">
          {{ trans("正在登录中，请稍候...") }}
        </div>
      </div>

      <!-- 登录成功状态 -->
      <div v-else-if="pageData.loginSuccess" class="success-state">
        <q-icon name="check_circle" color="positive" size="3em" />
        <div class="success-text q-mt-md">{{ trans("登录成功！") }}</div>
        <div class="countdown-text">
          {{
            trans("{countdown}秒后自动跳转到首页", {
              countdown: pageData.countdown,
            })
          }}
        </div>
      </div>

      <!-- 登录失败状态 -->
      <div v-else class="error-state">
        <q-icon name="error" color="negative" size="3em" />
        <div class="error-text q-mt-md">登录失败！</div>
        <div class="error-hint q-mt-sm">请返回DSFullfill重试</div>
        <!-- <q-btn color="primary" class="q-mt-lg" label="返回" @click="goBack" /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import indexApi from "@/api/index";
import { useStore } from "vuex";
import trans from "@/i18n";

const route = useRoute();
const router = useRouter();
const store = useStore();

const $q = useQuasar();

const pageData = reactive({
  loading: true,
  loginSuccess: false,
  countdown: 3,
  token: "",
});

// 处理登录
const handleLogin = async () => {
  try {
    // 获取URL中的临时token
    const tempToken = route.query.token;

    if (!tempToken) {
      throw new Error(trans("未找到临时登录令牌"));
    }

    pageData.token = tempToken;

    // 调用登录API
    const res = await indexApi.quickLogin({ token: tempToken });
    store.commit("UPDATE_TOKEN", res.data.token);
    store.commit("UPDATE_USER_INFO", res.data.user);
    router.push("/");
    // 更新状态
    pageData.loading = false;
    pageData.loginSuccess = true;
  } catch (error) {
    console.error("登录错误:", error);
    pageData.loading = false;
    pageData.loginSuccess = false;

    // 显示错误通知
    // $q.notify({
    //   type: "negative",
    //   message: "登录失败: " + (error.message || "未知错误"),
    //   position: "top",
    //   timeout: 3000,
    // });
  }
};

// 倒计时函数
const startCountdown = () => {
  const timer = setInterval(() => {
    pageData.countdown--;

    if (pageData.countdown <= 0) {
      clearInterval(timer);
      router.push("/");
    }
  }, 1000);
};

// 返回函数
const goBack = () => {
  // 可以替换为实际的DSFullfill URL
  window.location.href = "https://dsfullfill.com";
};

onMounted(() => {
  // 页面加载时自动处理登录
  handleLogin();
});
</script>

<style scoped>
.partner-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 400px;
  text-align: center;
}

.loading-state,
.success-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text,
.success-text,
.error-text {
  font-size: 18px;
  font-weight: 500;
  margin-top: 16px;
}

.countdown-text,
.error-hint {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}
</style>
