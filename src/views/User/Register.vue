<template>
  <div>
    <q-form @submit="onSubmit" class="login-form">
      <h2 class="login-title">注册</h2>
      <q-input
        v-model="ruleForm.name"
        filled
        type="text"
        label="用户名"
        class="q-mb-md"
        :rules="[(val) => !!val || '请输入用户名']"
      />
      <q-input
        v-model="ruleForm.email"
        filled
        type="email"
        label="邮箱"
        class="q-mb-md"
        :rules="[(val) => !!val || '请输入邮箱']"
      />
      <q-input
        v-model="ruleForm.password"
        filled
        :type="isPwd ? 'password' : 'text'"
        label="密码"
        class="q-mb-md"
        :rules="[(val) => !!val || '请输入密码']"
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
        label="确认密码"
        class="q-mb-md"
        :rules="[(val) => !!val || '请输入确认密码']"
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
      label="注册"
      type="submit"
      color="primary"
      @click="onSubmit"
      class="full-width login-btn"
      :loading="$store.state.btnLoading"
    />
    <div class="login-options">
      <span>已经有账号？</span>
      <q-btn
        flat
        color="primary"
        label="登录"
        class="register-link"
        @click="cancel"
      />
    </div>

    <Dialog
      v-model="dialogVisible"
      :persistent="true"
      :cancelShow="false"
      width="800px"
      @confirm="confirm"
      title="新建仓库"
    >
      <div class="warehouse-form q-pa-md">
        <q-form @submit="confirm">
          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">
                  仓库名称 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.name"
                    placeholder="请输入"
                    :rules="[(val) => !!val || '请输入仓库名称']"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">
                  仓库编号 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.code"
                    placeholder="请输入"
                    :rules="[(val) => !!val || '请输入仓库编号']"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">
                  仓库类型 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <q-select
                    outlined
                    dense
                    v-model="warehouseForm.type"
                    :options="warehouseTypes"
                    placeholder="请选择"
                    :rules="[(val) => !!val || '请选择仓库类型']"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">
                  国家/地区 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <q-select
                    outlined
                    dense
                    v-model="warehouseForm.country_code"
                    :options="countryOptions"
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">省</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.province"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">市/州</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.city"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">街道</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.street"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">门牌号</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.door_no"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">邮编</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.postcode"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">时区</div>
                <div class="form-input col-sm-8">
                  <q-select
                    outlined
                    dense
                    v-model="warehouseForm.timezone"
                    :options="timezoneOptions"
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12">
              <div class="form-item row items-start q-mb-sm">
                <div class="form-label col-sm-2">地址</div>
                <div class="form-input col-sm-10">
                  <q-input
                    outlined
                    type="textarea"
                    rows="3"
                    v-model="warehouseForm.address"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">联系人</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.contact_user"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">联系电话</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.contact_phone"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">联系邮箱</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.contact_email"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">币种</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.currency"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center q-mb-sm">
                <div class="form-label col-sm-4">portCode</div>
                <div class="form-input col-sm-8">
                  <q-input
                    outlined
                    dense
                    v-model="warehouseForm.portCode"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="form-item row items-start q-mb-sm">
                <div class="form-label col-sm-2">备注</div>
                <div class="form-input col-sm-10">
                  <q-input
                    outlined
                    type="textarea"
                    rows="3"
                    v-model="warehouseForm.remark"
                    placeholder="请输入"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </div>
    </Dialog>
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
const countryOptions = ["中国", "美国", "日本", "韩国", "英国"];
const timezoneOptions = ["UTC+8", "UTC+0", "UTC-5", "UTC-8"];

const cancel = () => {
  emit("update:modelValue", 1);
};
const onSubmit = () => {
  if (ruleForm.value.password !== ruleForm.value.password_confirmation) {
    $q.notify({
      message: "两次密码不一致",
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
        localStorage.setItem("isRegister", true);//注册需要标记
        store.commit("UPDATE_TOKEN", res.data.token);
        store.commit("UPDATE_USER_INFO", res.data.user);
        router.push("/");
      } else {
        $q.notify({
          message: res.message || "注册失败",
          color: "negative",
        });
      }
    })
    .catch((error) => {
      $q.notify({
        message: error?.message || "注册请求失败",
        color: "negative",
      });
    });
};
const confirm = () => {
  warehouseApi.createWarehouse(warehouseForm.value).then((res) => {
    if (res.success) {
      localStorage.setItem("warehouseId", res.data.id);
  dialogVisible.value = false;
    }
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