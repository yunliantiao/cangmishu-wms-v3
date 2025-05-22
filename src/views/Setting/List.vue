<template>
  <div class="setting-list-page">
    <div class="breadcrumb">
      <!-- <q-icon
        name="arrow_back"
        size="20px"
        class="cursor-pointer q-mr-sm"
        @click="$router.back()"
      /> -->
      <span class="text-h6">{{ trans("设置") }}</span>
    </div>

    <div class="setting-cards">
      <router-link
        v-for="item in settingList"
        :to="item.path"
        class="setting-card"
        :key="item.path"
      >
        <div class="card-icon">
          <img :src="getImg(item)" alt="" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.meta.name }}</div>
          <!-- <div class="card-desc">
            {{ item.meta.desc }}
          </div> -->
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import trans from "@/i18n";
import routerMap from "@/router/setting";

const router = useRouter();

const settingList = ref([]);

const iconCache = reactive({});

onMounted(() => {
  let list = routerMap[0].children
    .filter((item) => item.path != "list")
    .filter((item) => item.meta.level == 2);
  console.log("list", list);
  settingList.value = list;
  preloadIcons();
});

// 预加载所有图标
const preloadIcons = () => {
  settingList.value.forEach((route) => {
    if (route.meta.icon) {
      // 加载默认图标
      import(`../../assets/images/setting/${route.meta.icon}.png`)
        .then((module) => {
          const cacheKey = `${route.meta.icon}`;
          iconCache[cacheKey] = module.default;
        })
        .catch((error) =>
          console.error(`无法加载图标: ${route.meta.icon}`, error)
        );
    }
  });

  console.log("iconCache", iconCache);
};

const getImg = (route) => {
  console.log("route", route);

  if (!route.meta.icon) return "";

  return iconCache[route.meta.icon] || "";

  // const isActive = isRouteActive(route);
  // const hasMulti = hasMultipleChildren(route);

  // // 多子菜单时使用普通图标
  // if (hasMulti) {
  //   const cacheKey = route.icon;
  //   return iconCache[cacheKey] || "";
  // } else {
  //   // 单子菜单时根据激活状态选择图标
  //   const cacheKey = isActive ? `${route.icon}-select` : route.icon;
  //   return iconCache[cacheKey] || "";
  // }
};
</script>

<style lang="scss" scoped>
.setting-list-page {
  min-height: 100vh;
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: #333;
}

.setting-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.setting-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: calc(33.333% - 14px);
  min-width: 300px;
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #f0f5ff;
    color: #5745c5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
    img {
      width: 50px;
      height: 50px;
    }
  }

  .card-content {
    flex: 1;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;

      height: 50px;
      line-height: 50px;
    }

    .card-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }
}

@media (max-width: 1024px) {
  .setting-card {
    width: calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .setting-card {
    width: 100%;
  }
}
</style>