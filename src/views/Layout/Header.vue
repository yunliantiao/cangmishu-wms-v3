<template>
  <q-header elevated class="bg-white text-black q-py-xs" height-hint="58">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        @click="toggleDrawer"
        aria-label="Menu"
        :icon="leftDrawerOpen ? 'menu_open' : 'read_more'"
      />

      <q-btn-dropdown
        flat
        no-caps
        dropdown-icon="none"
        class="user-menu"
        auto-close
        :menu-anchor="'bottom left'"
        :menu-self="'top left'"
      >
        <template v-slot:label>
          <div class="row items-center no-wrap">
            <q-toolbar-title shrink class="text-weight-bold">
              {{
                warehouseList.find((item) => item.id == currentWarehouse)?.name
              }}
              -wms
            </q-toolbar-title>
          </div>
        </template>

        <q-list style="min-width: 220px">
          <q-item
            clickable
            v-close-popup
            v-for="item in warehouseList"
            @click="changeWarehouse(item)"
            :key="item.id"
          >
            <q-item-section avatar>
              <q-icon name="group" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </q-list>
      </q-btn-dropdown>

      <q-space />

      <q-btn-toggle
        v-model="language"
        class="m-r-20"
        no-caps
        rounded
        toggle-color="primary"
        @update:model-value="changeLanguage"
        color="white"
        text-color="primary"
        :options="[
          { label: '中文简体', value: 'zh_CN' },
          { label: 'ENGLISH', value: 'en' },
        ]"
      />
      <div class="q-gutter-sm row items-center no-wrap">
        <!-- <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-tooltip>Account</q-tooltip>
        </q-btn> -->
        <q-btn
          color="primary"
          :label="
            '(' + $store.state.userInfo.name + ')' + $store.state.userInfo.email
          "
        >
          <q-menu style="width: 100px">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-btn
                      flat
                      :label="trans('退出')"
                      color="grey-8"
                      @click="logout"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script>
import api from "@/api";
import warehouseApi from "@/api/warehouse";
import { fabYoutube } from "@quasar/extras/fontawesome-v6";
import { Dialog, useQuasar } from "quasar";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import trans from "@/i18n";

export default {
  name: "HeaderComponent",

  setup() {
    const store = useStore();
    const $q = useQuasar();
    const router = useRouter();
    let localLanguage = window.localStorage.getItem("language") || "zh_CN";

    const language = ref(localLanguage);
    store.commit("changeLanguage", language.value);

    const changeLanguage = (value) => {
      window.localStorage.setItem("language", value);
      store.commit("changeLanguage", value);
    };

    // 从Vuex获取侧边栏状态
    const leftDrawerOpen = computed(() => store.state.leftDrawerOpen);

    const toggleDrawer = () => {
      store.dispatch("toggleLeftDrawer");
    };
    const changeWarehouse = (item) => {
      localStorage.setItem("warehouseId", item.id);
      router.push("/");
      window.location.reload();
    };
    const warehouseList = ref([]); //仓库列表
    const currentWarehouse = ref(null); //当前仓库
    const getWarehouseList = () => {
      warehouseApi.getWarehouseList().then((res) => {
        if (res.success) {
          warehouseList.value = res.data;
          if (localStorage.getItem("warehouseId")) {
            currentWarehouse.value = localStorage.getItem("warehouseId");
          } else {
            if (warehouseList.value.length) {
              currentWarehouse.value = warehouseList.value[0].id;
              localStorage.setItem("warehouseId", warehouseList.value[0].id);
            }
          }
        }
      });
    };
    getWarehouseList();
    const logout = () => {
      Dialog.create({
        title: trans("退出确认"),
        message: trans("确定要退出登录吗？"),
        cancel: true,
        persistent: true,
        ok: {
          label: trans("退出"),
          color: "primary",
        },
        cancel: {
          label: trans("取消"),
          color: "grey-8",
        },
      })
        .onOk(() => {
          api.logout().then((res) => {
            if (res.success) {
              store.dispatch("logout");
            }
          });
        })
        .onCancel(() => {
          // 用户取消退出操作
        });
    };

    return {
      fabYoutube,
      toggleDrawer,
      changeWarehouse,
      warehouseList,
      currentWarehouse,
      leftDrawerOpen,
      logout,
      language,
      changeLanguage,
    };
  },
};
</script>

<style lang="scss" scoped>
/* 如有需要可添加样式 */
</style>
