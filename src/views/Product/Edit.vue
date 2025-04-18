<template>
    <div>
    <div class="page-header">
      <div class="page-title">
        <q-btn
          flat
          round
          icon="arrow_back"
          class="q-mr-sm"
          to="/product/product?type=spu"
        />
        <span>编辑商品</span>
      </div>
      <div class="page-actions">
        <q-btn
          outline
          label="取消"
          class="q-mr-sm"
          to="/product/product?type=spu"
        />
        <q-btn
          color="primary"
          label="保存"
          :loading="$store.state.btnLoading"
          @click="saveProduct"
        />
      </div>
    </div>

    <div v-if="$store.state.btnLoading" class="q-pa-md flex justify-center items-center">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else>
      <!-- 基本信息 -->
      <div class="bg-white rounded-borders q-pa-lg q-mb-md">
        <div class="text-subtitle1 text-weight-medium q-mb-lg">基本信息</div>

        <div class="row q-col-gutter-y-md">
          <div class="col-12 info-row">
            <div class="info-label">商品名称</div>
            <div class="info-value">{{ product.name || "" }}</div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">商品分类</div>
            <div class="info-value">
              <div
                ref="categoryDisplay"
                class="category-display"
                @click="toggleCategoryMenu($event)"
              >
                <div class="selected-category">
                  {{ product.category_name || "请选择分类" }}
                </div>
                <q-icon name="arrow_drop_down" />
              </div>

              <div 
                v-if="showCategoryMenu" 
                class="category-menu-container"
                :class="{ 'position-top': menuPosition === 'top' }"
                ref="categoryMenuContainer"
              >
                <div class="row no-wrap category-selector">
                  <!-- 左侧列表 -->
                  <div class="col-3 category-column">
                    <q-item
                      v-for="category in rootCategories"
                      :key="category.value"
                      clickable
                      @click="selectCategory(category)"
                      :class="{
                        'category-active':
                          tempSelectedCategory &&
                          tempSelectedCategory.value == category.value,
                      }"
                      class="category-item"
                    >
                      <div class="row items-center full-width">
                        <div>{{ category.label }}</div>
                        <q-icon
                          v-if="hasChildren(category)"
                          name="chevron_right"
                          class="q-ml-auto"
                          size="sm"
                        />
                      </div>
                    </q-item>
                  </div>

                  <!-- 第二列 -->
                  <div
                    class="col-3 category-column"
                    v-if="firstLevelCategories.length > 0"
                  >
                    <q-item
                      v-for="subCategory in firstLevelCategories"
                      :key="subCategory.value"
                      clickable
                      @click="selectSubCategory(subCategory)"
                      :class="{
                        'category-active':
                          tempActiveSubCategory &&
                          tempActiveSubCategory.value == subCategory.value,
                      }"
                      class="category-item"
                    >
                      <div class="row items-center full-width">
                        <div>{{ subCategory.label }}</div>
                        <q-icon
                          v-if="hasChildren(subCategory)"
                          name="chevron_right"
                          class="q-ml-auto"
                          size="sm"
                        />
                      </div>
                    </q-item>
                  </div>

                  <!-- 第三列 -->
                  <div
                    class="col-3 category-column"
                    v-if="secondLevelCategories.length > 0"
                  >
                    <q-item
                      v-for="thirdCategory in secondLevelCategories"
                      :key="thirdCategory.value"
                      clickable
                      @click="selectThirdCategory(thirdCategory)"
                      :class="{
                        'category-active':
                          tempThirdCategory &&
                          tempThirdCategory.value === thirdCategory.value,
                      }"
                      class="category-item"
                    >
                      <div class="row items-center full-width">
                        <div>{{ thirdCategory.label }}</div>
                        <q-icon
                          v-if="hasChildren(thirdCategory)"
                          name="chevron_right"
                          class="q-ml-auto"
                          size="sm"
                        />
                      </div>
                    </q-item>
                  </div>

                  <!-- 第四列 -->
                  <div
                    class="col-3 category-column"
                    v-if="thirdLevelCategories.length > 0"
                  >
                    <q-item
                      v-for="fourthCategory in thirdLevelCategories"
                      :key="fourthCategory.value"
                      clickable
                      @click="selectFinalCategory(fourthCategory)"
                      class="category-item"
                    >
                      {{ fourthCategory.label }}
                    </q-item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">客户</div>
            <div class="info-value">{{ product.customer?.name || "" }}</div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">收货状态</div>
            <div class="info-value">
              <div class="row q-gutter-x-md">
                <q-radio
                  v-model="product.allow_inbound"
                  val="true"
                  label="允许收货"
                />
                <q-radio
                  v-model="product.allow_inbound"
                  val="false"
                  label="禁止收货"
                />
              </div>
            </div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">销售状态</div>
            <div class="info-value">
              <div class="row q-gutter-x-md">
                <q-radio
                  v-model="product.allow_order"
                  val="true"
                  label="允许销售"
                />
                <q-radio
                  v-model="product.allow_order"
                  val="false"
                  label="禁止销售"
                />
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="row justify-end">
              <div class="product-image-wrapper" v-if="product.image_url">
                <img :src="product.image_url" class="product-image" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 申报信息 -->
      <div class="bg-white rounded-borders q-pa-lg q-mb-md">
        <div class="text-subtitle1 text-weight-medium q-mb-lg">申报信息</div>

        <div class="row q-col-gutter-y-md">
          <div class="col-12 info-row">
            <div class="info-label">申报中文名</div>
            <div class="info-value">{{ product.customs_name_cn || "" }}</div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">申报英文名</div>
            <div class="info-value">{{ product.customs_name_en || "" }}</div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">申报价格</div>
            <div class="info-value">
              {{ product.customs_price || "" }}
              {{ product.customs_currency || "" }}
            </div>
          </div>

          <div class="col-12 info-row">
            <div class="info-label">报关属性</div>
            <div class="info-value">
              {{ getCustomsTypeLabel(product.customs_type) || "" }}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import productApi from "@/api/product";
import categoriesApi from "@/api/categories";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const productId = route.params.id;
const product = ref({
  name: "",
  allow_inbound: true,
  allow_order: true,
  category_id: null,
  customs_name_cn: "",
  customs_name_en: "",
  customs_price: "",
  customs_currency: "",
  customs_type: "",
  specs: [],
});

// 实际尺寸和重量，用于避免直接修改可能不存在的嵌套对象
const actualSize = ref({
  length: "",
  width: "",
  height: "",
});


const actualWeight = ref("");

// 计算属性，检查产品是否有规格信息
const hasSpecs = computed(
  () => product.value.specs && product.value.specs.length > 0
);

// 将扁平分类结构转换为树形结构，供q-cascader使用
const categoryTreeOptions = computed(() => {
  // 创建一个映射表来存储所有分类
  const categoryMap = {};
  categoryOptions.value.forEach((category) => {
    // 复制分类对象并添加children数组
    categoryMap[category.value] = {
      ...category,
      children: [],
    };
  });

  // 构建树形结构
  const treeCategories = [];
  categoryOptions.value.forEach((category) => {
    if (!category.parent_id) {
      // 如果是根分类，直接添加到结果数组
      treeCategories.push(categoryMap[category.value]);
    } else if (categoryMap[category.parent_id]) {
      // 如果有父分类，将当前分类添加到父分类的children数组
      categoryMap[category.parent_id].children.push(
        categoryMap[category.value]
      );
    }
  });

  return treeCategories;
});

const categoryOptions = ref([]);
const selectedCategory = ref(null);
const activeSubCategory = ref(null);

// 获取根分类
const rootCategories = computed(() => {
  return categoryOptions.value.filter((cat) => !cat.parent_id);
});

// 获取子分类
const getSubCategories = (parentCategory) => {
  if (!parentCategory) return [];
  return categoryOptions.value.filter(
    (cat) => cat.parent_id === parentCategory.value
  );
};

// 检查是否有子分类
const hasChildren = (category) => {
  if (!category) return false;
  return categoryOptions.value.some((cat) => cat.parent_id === category.value);
};

// 添加tempSelectedCategoryId和tempSelectedCategoryName变量
const tempCategoryPath = ref([]);
const categoryColumns = ref([]);
const tempSelectedCategoryId = ref(null);
const tempSelectedCategoryName = ref("");
const categoryMenuRef = ref(null);

// 分类选择
const isValidSelection = computed(() => {
  if (!tempCategoryPath.value.length) return false;
  const lastCategory =
    tempCategoryPath.value[tempCategoryPath.value.length - 1];
  return lastCategory && !hasChildren(lastCategory);
});

// 处理分类导航
const navigateCategory = (category, level) => {
  // 截断路径到当前级别
  tempCategoryPath.value = tempCategoryPath.value.slice(0, level);

  // 添加当前分类到路径
  tempCategoryPath.value.push(category);

  // 更新临时选择ID和名称（仅当该分类没有子分类时）
  if (!hasChildren(category)) {
    tempSelectedCategoryId.value = category.value;
    tempSelectedCategoryName.value = category.label;
  } else {
    // 如果有子分类，清除选择
    tempSelectedCategoryId.value = null;
    tempSelectedCategoryName.value = "";
  }

  // 更新分类列
  updateCategoryColumns();
};

// 更新分类列显示
const updateCategoryColumns = () => {
  categoryColumns.value = [];

  // 为每个选中的分类添加一个子分类列
  tempCategoryPath.value.forEach((category) => {
    if (hasChildren(category)) {
      categoryColumns.value.push(getSubCategories(category));
    }
  });
};

// 申报类型选项
const customsTypeOptions = ref([]);
const customsTypes = () => {
  productApi.customsTypes().then((res) => {
    if (res.success) {
      customsTypeOptions.value = res.data;
    }
  });
};

// 获取申报类型标签
const getCustomsTypeLabel = (value) => {
  if (!value) return "";
  const option = customsTypeOptions.value.find((opt) => opt.code == value);
  return option.name || "";
};

const getCategoryTree = async () => {
  try {
    const res = await categoriesApi.getCategoryTree();
    if (res.success) {
      // 处理类别数据以符合嵌套结构
      const formattedCategories = [];

      // 递归函数处理嵌套的分类结构
      const processCategories = (categories, parentId = null) => {
        categories.forEach((cat) => {
          // 添加当前分类
          formattedCategories.push({
            label: cat.name,
            value: cat.id,
            parent_id: cat.parent_id || parentId || null,
          });

          // 递归处理子分类
          if (cat.children && cat.children.length > 0) {
            processCategories(cat.children, cat.id);
          }
        });
      };

      // 开始处理顶级分类
      processCategories(res.data);

      // 设置分类选项
      categoryOptions.value = formattedCategories;

      // 如果产品已有分类ID，预设分类路径和选中状态
      if (product.value.category_id) {
        setSelectedCategoryPath(product.value.category_id);
      }
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
    $q.notify({
      color: "negative",
      message: "加载商品分类失败",
      icon: "error",
    });
  }
};

const showCategoryMenu = ref(false);
const categoryMenuContainer = ref(null);
const categoryDisplay = ref(null);
const menuPosition = ref('bottom'); // 默认向下显示

// 点击外部关闭菜单
const handleOutsideClick = (event) => {
  // 菜单未显示时不处理
  if (!showCategoryMenu.value) return;
  
  // 检查点击是否在菜单外部
  const isClickedOutside = (
    !event.target.closest('.category-display') && 
    !event.target.closest('.category-menu-container')
  );
  
  if (isClickedOutside) {
    showCategoryMenu.value = false;
  }
};

// 检测元素位置并判断菜单显示方向
const checkMenuPosition = () => {
  if (!categoryDisplay.value) return;
  
  const rect = categoryDisplay.value.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - rect.bottom;
  const menuHeight = 350; // 菜单大致高度
  
  // 如果下方空间不足，向上显示
  if (spaceBelow < menuHeight && rect.top > menuHeight) {
    menuPosition.value = 'top';
  } else {
    menuPosition.value = 'bottom';
  }
  
  console.log(`菜单显示方向: ${menuPosition.value}, 下方空间: ${spaceBelow}px, 窗口高度: ${windowHeight}px`);
};

// 组件挂载和卸载时添加/移除事件监听
onMounted(() => {
  getProduct();
  getCategoryTree();
  customsTypes();
  
  // 添加全局点击事件监听
  document.addEventListener('click', handleOutsideClick);
  // 添加窗口大小变化监听
  window.addEventListener('resize', checkMenuPosition);
});

onBeforeUnmount(() => {
  // 移除全局点击事件监听
  document.removeEventListener('click', handleOutsideClick);
  // 移除窗口大小变化监听
  window.removeEventListener('resize', checkMenuPosition);
});

const getProduct = () => {
  productApi.getProduct(productId).then((res) => {
    // 确保字段类型正确
    if (res.data) {
      // 确保allow_inbound和allow_order是字符串类型的"true"或"false"
      if (typeof res.data.allow_inbound === "boolean") {
        res.data.allow_inbound = res.data.allow_inbound ? "true" : "false";
      }
      if (typeof res.data.allow_order === "boolean") {
        res.data.allow_order = res.data.allow_order ? "true" : "false";
      }

      product.value = res.data;
      
      // 如果有分类ID且分类数据已加载，设置选中状态
      if (product.value.category_id && categoryOptions.value.length > 0) {
        setSelectedCategoryPath(product.value.category_id);
      }
    }
  });
};

// 根据分类ID查找分类路径并设置选中状态
const setSelectedCategoryPath = (categoryId) => {
  // 确保分类数据已加载
  if (!categoryOptions.value || categoryOptions.value.length === 0) {
    console.log("分类数据尚未加载，无法设置选中状态");
    return;
  }

  // 查找目标分类
  const targetCategory = categoryOptions.value.find(cat => cat.value === categoryId);
  if (!targetCategory) {
    console.log("未找到对应的分类：", categoryId);
    return;
  }
  
  // 查找分类路径
  const path = findCategoryPath(categoryId);
  if (path.length === 0) return;
  
  // 路径中的分类应该从顶级到底层排序
  const orderedPath = [...path].reverse();
  
  // 根据路径长度设置不同级别的选中状态
  if (orderedPath.length >= 1) {
    const firstLevel = orderedPath[0];
    tempSelectedCategory.value = firstLevel;
    firstLevelCategories.value = getSubCategories(firstLevel);
  }
  
  if (orderedPath.length >= 2) {
    const secondLevel = orderedPath[1];
    tempActiveSubCategory.value = secondLevel;
    secondLevelCategories.value = getSubCategories(secondLevel);
  }
  
  if (orderedPath.length >= 3) {
    const thirdLevel = orderedPath[2];
    tempThirdCategory.value = thirdLevel;
    thirdLevelCategories.value = getSubCategories(thirdLevel);
  }
  
  // 最后设置产品分类ID和名称
  product.value.category_id = targetCategory.value;
  product.value.category_name = targetCategory.label;
  
  // 如果是从编辑进入，自动展开分类选择器展示已选分类
  // showCategoryMenu.value = true;
  
  console.log("成功设置分类选中状态:", orderedPath);
};

// 递归查找分类路径
const findCategoryPath = (categoryId, path = []) => {
  const category = categoryOptions.value.find(cat => cat.value === categoryId);
  if (!category) return [];
  
  const newPath = [category, ...path];
  
  if (!category.parent_id) {
    return newPath;
  }
  
  return findCategoryPath(category.parent_id, newPath);
};

// 保存产品信息
const saveProduct = async () => {
  const res = await productApi.updateProduct(productId, {
    category_id: product.value.category_id,
    allow_inbound: product.value.allow_inbound == "true" ? 1 : 0,
    allow_order: product.value.allow_order == "true" ? 1 : 0,
    customs_type: product.value.customs_type,
    customs_name_cn: product.value.customs_name_cn,
    customs_name_en: product.value.customs_name_en,
    customs_price: product.value.customs_price,
    customs_currency: product.value.customs_currency,
  });
  if (res.success) {
    $q.notify({
      color: "positive",
      message: "商品信息保存成功",
      icon: "check",
    });
    router.push("/product/product?type=spu");
  }
};

// 临时选择变量
const tempSelectedCategory = ref(null);
const tempActiveSubCategory = ref(null);
const tempThirdCategory = ref(null);

// 各层级分类数据
const firstLevelCategories = ref([]);
const secondLevelCategories = ref([]);
const thirdLevelCategories = ref([]);

// 选择第一级分类
const selectCategory = (category) => {
  tempSelectedCategory.value = category;
  tempActiveSubCategory.value = null;
  tempThirdCategory.value = null;

  // 更新二级分类列表
  firstLevelCategories.value = getSubCategories(category);

  // 清空三级和四级分类
  secondLevelCategories.value = [];
  thirdLevelCategories.value = [];

  // 如果没有子分类，直接设置为已选择并关闭菜单
  if (!hasChildren(category)) {
    product.value.category_id = category.value;
    product.value.category_name = category.label;
    showCategoryMenu.value = false;
  }
};

// 选择第二级分类
const selectSubCategory = (category) => {
  tempActiveSubCategory.value = category;
  tempThirdCategory.value = null;

  // 更新三级分类列表
  secondLevelCategories.value = getSubCategories(category);

  // 清空四级分类
  thirdLevelCategories.value = [];

  // 如果没有子分类，直接设置为已选择并关闭菜单
  if (!hasChildren(category)) {
    product.value.category_id = category.value;
    product.value.category_name = category.label;
    showCategoryMenu.value = false;
  }
};

// 选择第三级分类
const selectThirdCategory = (category) => {
  tempThirdCategory.value = category;

  // 更新四级分类列表
  thirdLevelCategories.value = getSubCategories(category);

  // 如果没有子分类，直接设置为已选择并关闭菜单
  if (!hasChildren(category)) {
    product.value.category_id = category.value;
    product.value.category_name = category.label;
    showCategoryMenu.value = false;
  }
};

// 选择第四级分类
const selectFinalCategory = (category) => {
  product.value.category_id = category.value;
  product.value.category_name = category.label;
  showCategoryMenu.value = false;
};

// 生成分类名称路径字符串，用于显示
const getCategoryPathDisplay = computed(() => {
  if (!product.value.category_id) return "";
  
  const path = findCategoryPath(product.value.category_id);
  if (path.length === 0) return product.value.category_name || "";
  
  // 反转路径并提取标签名
  return [...path].reverse().map(cat => cat.label).join(" / ");
});

// 仅当有展示需求时才显示分类菜单
const toggleCategoryMenu = (event) => {
  // 阻止事件冒泡，避免立即触发外部点击事件关闭
  event.stopPropagation();
  
  // 切换显示前检查位置
  if (!showCategoryMenu.value) {
    checkMenuPosition();
  }
  
  showCategoryMenu.value = !showCategoryMenu.value;
};
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;

  .page-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
  }
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-label {
  width: 120px;
  min-width: 120px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

.field-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.field-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

.size-input {
  width: 60px;
  margin-right: 6px;
}

.volume-input {
  width: 100px;
}

.packaging-select {
  max-width: 300px;
}

.product-image-wrapper {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.category-display {
  border: 1px dashed #999;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 300px;
}

.selected-category {
  color: #333;
  font-size: 14px;
}

.category-menu-container {
  position: absolute;
  margin-top: 8px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 650px;
  max-width: 100%;
  z-index: 100;
  
  &.position-top {
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 8px;
  }
}

.category-selector {
  min-height: 300px;
  max-height: 450px;
  background-color: #fff;
}

.category-column {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;
}

.category-column:last-child {
  border-right: none;
}

.category-item {
  min-height: 40px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.category-active {
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  font-weight: 500;
  border-left: 3px solid #1976d2;
}

// 增加选中态高亮
.category-item.category-active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

// 鼠标悬停效果
.category-item:hover:not(.category-active) {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>