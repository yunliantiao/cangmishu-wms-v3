<template>
  <q-header elevated class="bg-primary text-white q-py-xs" height-hint="58">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        @click="toggleDrawer"
        aria-label="Menu"
        icon="menu"
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
                    <q-btn flat label="退出" color="grey-8" @click="logout" />
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
import { fabYoutube } from "@quasar/extras/fontawesome-v6";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { useQuasar, Dialog } from "quasar";
import { useRouter } from "vue-router";
import warehouseApi from "@/api/warehouse";
import api from "@/api";

export default {
  name: "HeaderComponent",

  setup() {
    const store = useStore();
    const $q = useQuasar();
    const router = useRouter();

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
            getCountries();
          } else {
            if (warehouseList.value.length) {
              currentWarehouse.value = warehouseList.value[0].id;
              localStorage.setItem("warehouseId", warehouseList.value[0].id);
               getCountries();
            }
          }
        }
      });
    };
    const getCountries = () => {
      api.getCountries().then((res) => {
        if (res.success) {
          store.commit("SET_COUNTRIES", res.data);
        }
      });
    };
    getWarehouseList();
    const logout = () => {
      Dialog.create({
        title: "退出确认",
        message: "确定要退出登录吗？",
        cancel: true,
        persistent: true,
        ok: {
          label: "退出",
          color: "primary",
        },
        cancel: {
          label: "取消",
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
    };
  },
};
</script>

<style lang="scss" scoped>
/* 如有需要可添加样式 */
</style>