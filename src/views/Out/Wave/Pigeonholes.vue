<template>
  <div class="sort-detail-page">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="wave-no">{{ pageData.waveInfo.wave_number }}</span>
        <span class="wave-type">（多品混包）</span>
      </div>
      <div class="right">
        <span class="progress"
          >处理进度:{{ pageData.successCount }}/{{
            pageData.packages.length
          }}</span
        >
        <q-btn
          color="negative"
          flat
          class="end-btn"
          label="结束作业"
          @click="handleEnd"
        />
        <q-btn
          color="primary"
          outline
          icon="history"
          @click="showLogs"
          label="分拣记录"
        />
      </div>
    </div>

    <!-- 主体卡片 -->
    <div class="main-card">
      <!-- 商品标签输入 -->
      <div class="input-row">
        <q-input
          outlined
          class="tag-input"
          v-model="pageData.keyword"
          label="请扫描商品标签"
          @keyup.enter="search"
        />
      </div>
      <div class="input-tip">
        <q-icon name="info" size="16px" color="grey-7" />
        <span>请先切换或[EN]输入法</span>
      </div>

      <!-- 分拣信息 -->
      <div class="sort-info-title">分拣信息</div>
      <div class="sort-info-row">
        <div class="product-img-placeholder">
          {{ pageData.showIndex }}
        </div>
        <div class="sort-boxes">
          <div
            :class="{
              'sort-box': true,
              success: item.status == 2 && item.material_id,
            }"
            v-for="(item, index) in pageData.packages"
            :key="item.id"
          >
            {{ index + 1 }}
            <div class="operation-btn" v-if="item.status > 0">
              <q-btn-dropdown color="primary" icon="print">
                <q-list>
                  <q-item
                    clickable
                    v-if="item.status == 1"
                    v-close-popup
                    @click="showCheckMaterial(item)"
                  >
                    <q-item-section>
                      <q-item-label>打印</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-if="item.status == 1"
                    v-close-popup
                    @click="handleIsPrint(item)"
                  >
                    <q-item-section>
                      <q-item-label>标记为已打印</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    v-else
                    @click="handleNotPrint(item)"
                  >
                    <q-item-section>
                      <q-item-label>标记为未打印</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <!-- <q-btn
                v-if="item.status == 1"
                color="primary"
                label="打印"
                @click="handlePrint(item)"
              />
              <q-select
                dense
                v-if="item.status == 2"
                outlined
                label="包材"
                v-model="item.material_id"
                :options="pageData.materialsList"
                emit-value
                map-options
                class="pack-select"
              /> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <Logs ref="logsRef"></Logs>
    <NotPacking ref="notPackingRef" @confirm="handleEndWave"></NotPacking>
    <CheckMaterial
      :confirm-text="'打印'"
      ref="checkMaterialRef"
      @confirm="handleCheckMaterial"
    ></CheckMaterial>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OutApi from "@/api/out";
import ProductApi from "@/api/product";
import Message from "@/utils/message";
import Logs from "./components/Logs.vue";
import { useQuasar } from "quasar";
import NotPacking from "./components/NotPacking.vue";
import CheckMaterial from "./components/CheckMaterial.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const logsRef = ref(null);
const notPackingRef = ref(null);
const checkMaterialRef = ref(null);
const pageData = reactive({
  keyword: "",
  waveInfo: {},
  number: "",
  packages: [],
  successCount: 0,
  logs: [],
  materialsList: [],
  showIndex: "",
  currentPackage: null,
});

watch(
  () => pageData.packages,
  () => {
    // 用做页面顶部完成数和未完成数
    let count = 0;

    // 当回车后 修改了包裹的已入框数量后 进入到监听的回调 在这里处理包裹的状态 待入框 ->选包材 待打印->完成打印
    // status 0:待入框
    // 1:入框完成(待打印)
    // 2:打印完成

    pageData.packages.forEach((item) => {
      let itemSuccess = true;
      item.boxes.forEach((box) => {
        if (box.inFrame != box.quantity) {
          itemSuccess = false;
        }
      });
      if (item.status == 0 && itemSuccess) {
        item.status = 1;
        showCheckMaterial(item);
      }

      if (item.status == 2 && item.material_id) {
        count++;
      }
    });

    pageData.successCount = count;
    // 如果所有的都已经处理完成了   弹窗提示已经完成包装，是否结束作业
    if (pageData.successCount == pageData.packages.length) {
      successWave();
    }
  },
  { deep: true }
);

onMounted(() => {
  let number = route.query.number;
  pageData.number = number;
  getWaveInfo();
  getMaterialsList();
});

const successWave = () => {
  $q.dialog({
    title: "提示",
    message: "所有的都已经处理完成了",
    ok: {
      label: "结束作业",
      color: "primary",
    },
    cancel: {
      label: "取消",
      color: "grey-7",
    },
  }).onOk(async () => {
    handleEndWave();
  });
};

const showCheckMaterial = (item) => {
  pageData.currentPackage = item;
  checkMaterialRef.value.open(pageData.materialsList);
};

// 当入框完成之后 弹窗选择包材的回调
const handleCheckMaterial = (materialId) => {
  pageData.currentPackage.material_id = materialId;
  handlePrint(pageData.currentPackage);
};

// 标记为未打印
const handleNotPrint = (item) => {
  item.status = 1;
};

// 标记为已打印
const handleIsPrint = (item) => {
  item.status = 2;
};

const handleEndWave = async () => {
  let items = [];
  pageData.packages.forEach((item) => {
    if (item.status == 2) {
      items.push({
        package_id: item.package_id,
        packaging_material_id: item.material_id,
      });
    }
  });
  let params = {
    items,
  };
  await OutApi.completePicking(pageData.waveInfo.id, params);
  router.go(-1);
};

const getWaveInfo = async () => {
  const { data } = await OutApi.scanSortOut({ number: pageData.number });
  pageData.waveInfo = data;
  pageData.packages = data.boxes.map((item, index) => {
    return {
      status: 0,
      package_number: item.package_number,
      package_id: item.package_id,
      // 用来在弹窗里面显示分拣框 别的没什么作用
      index,
      material_id: "",
      boxes: item.items.map((rpw) => {
        return {
          ...rpw,
          inFrame: 0,
          // index用来标记是第几个框
          index,
        };
      }),
    };
  });
};

const search = async () => {
  if (!pageData.keyword.length) {
    return Message.notify("请输入商品标签");
  }
  let boxes = [];
  pageData.packages.forEach((item) => {
    item.boxes.forEach((box) => {
      boxes.push(box);
    });
  });
  let box = boxes.find(
    (item) =>
      item.product_spec_sku == pageData.keyword && item.inFrame < item.quantity
  );
  if (!box) {
    Message.notify("该商品标签不存在");
    return;
  }
  box.inFrame++;
  let index = box.index + 1;
  pageData.logs.push({
    index: index,
    code: pageData.keyword,
    qty: 1,
  });
  pageData.showIndex = index;
};

const showLogs = () => {
  logsRef.value.open(pageData.logs);
};

const getMaterialsList = async () => {
  const { data } = await ProductApi.getMaterialsList();
  pageData.materialsList = data.map((row) => {
    return {
      label: row.name,
      value: row.id,
    };
  });
};

const handlePrint = async (item) => {
  let { data } = await OutApi.printPackageOrder(item.package_id);
  window.open(data.data, "_blank");
  $q.dialog({
    title: "打印结果确认",
    message: "是否打印成功",
    cancel: true,
    persistent: true,
    ok: {
      label: "是",
      color: "primary",
    },
    cancel: {
      label: "否",
      color: "grey-7",
    },
  }).onOk(async () => {
    item.status = 2;
  });
};

// 需要先弹出未打印的包裹
const handleEnd = () => {
  let list = [];
  pageData.packages.forEach((item) => {
    if (item.status == 0 || item.status == 1) {
      list.push(item);
    }
  });
  if (list.length) {
    notPackingRef.value.open(list);
  } else {
    successWave();
  }
};
</script>

<style scoped lang="scss">
.sort-detail-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 0;
  position: relative;

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px 0 40px;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
    background: #fff;

    .left {
      .wave-no {
        font-size: 20px;
        font-weight: bold;
        margin-right: 8px;
      }
      .wave-type {
        color: #888;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 24px;

      .user-info {
        color: #888;
      }
      .progress {
        color: #1976d2;
      }
      .end-btn {
        margin-left: 12px;
      }
    }
  }

  .side-record {
    position: absolute;
    top: 32px;
    right: 40px;
    z-index: 2;
  }

  .main-card {
    background: #fff;
    border-radius: 8px;
    margin: 32px 40px 0 40px;
    padding: 32px 32px 40px 32px;
    min-height: 400px;
    position: relative;

    .input-row {
      margin-bottom: 8px;
      display: flex;
      gap: 12px;

      .tag-input {
        width: 100%;
      }
    }

    .input-tip {
      color: #888;
      font-size: 13px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-info-title {
      font-weight: bold;
      margin-bottom: 16px;
      margin-top: 16px;
    }

    .sort-info-row {
      display: flex;
      align-items: flex-start;
      gap: 32px;

      .product-img-placeholder {
        width: 180px;
        height: 180px;
        background: #0076ff;
        border-radius: 4px;
        flex-shrink: 0;

        font-size: 40px;
        color: white;
        justify-content: center;
        align-items: center;
        display: flex;
      }

      .sort-boxes {
        display: flex;
        flex-wrap: wrap;
        gap: 0;

        .sort-box {
          width: 180px;
          height: 80px;
          border: 1px solid #dbe2ea;
          display: flex;
          align-items: center;
          padding: 0 20px;
          font-size: 20px;
          font-weight: 500;
          position: relative;
          .operation-btn {
            position: absolute;
            right: 10px;
            top: 10px;
            .pack-select {
              width: 100px;
            }
          }
        }
      }
    }
  }
}

.success {
  background: #0076ff;
  color: white;
}
</style>