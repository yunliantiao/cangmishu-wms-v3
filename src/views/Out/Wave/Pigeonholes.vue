<template>
  <div class="sort-detail-page">
    <!-- 全局加载效果 -->
    <q-dialog v-model="pageData.loading" persistent>
      <q-card class="bg-transparent shadow-0 no-border">
        <q-card-section class="flex flex-center">
          <q-spinner color="primary" size="50px" :thickness="5" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 保留原来的内部loading -->
    <q-inner-loading
      :showing="pageData.loading"
      label-class="text-primary"
      label-style="font-size: 1.1em"
    >
      <q-spinner-dots size="40px" color="primary" />
    </q-inner-loading>
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="wave-no">{{ pageData.waveInfo.wave_number }}</span>
        <span class="wave-type">{{ trans("多品混包") }}</span>
      </div>
      <div class="right">
        <span class="progress"
          >{{ trans("处理进度") }}:{{ pageData.successCount }}/{{
            pageData.packages.length
          }}</span
        >
        <q-btn
          color="primary"
          outline
          class="end-btn"
          :label="trans('结束作业')"
          @click="handleEnd"
        />
        <q-btn
          color="primary"
          class="end-btn"
          @click="showLogs"
          :label="trans('分拣记录')"
        />
      </div>
    </div>

    <ScanTop
      :placeholder="trans('请扫描商品标签')"
      v-model:scanValue="pageData.keyword"
      @confirm="search"
    />

    <!-- 主体卡片 -->
    <div class="main-card">
      <!-- 分拣信息 -->
      <div class="sort-info-title">{{ trans("分拣信息") }}</div>
      <div class="sort-info-row">
        <div class="product-img-placeholder">
          {{ pageData.showIndex }}
        </div>
        <div class="sort-boxes">
          <div
            :class="{
              'sort-box': true,
              success: item.status == 2,
            }"
            v-for="(item, index) in pageData.packages"
            :key="item.id"
          >
            <span>
              {{ index + 1 }}
            </span>
            <div class="operation-btn" v-if="item.status > 0">
              <q-btn-dropdown
                style="padding: 0; margin: 0"
                flat
                color="primary"
                icon="print"
                size="sm"
              >
                <q-list>
                  <q-item
                    clickable
                    v-if="item.status == 1"
                    v-close-popup
                    @click="showCheckMaterial(item)"
                  >
                    <q-item-section>
                      <q-item-label>{{ trans("打印") }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-if="item.status == 1"
                    v-close-popup
                    @click="handleIsPrint(item, index)"
                  >
                    <q-item-section>
                      <q-item-label>{{ trans("标记为已打印") }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    v-else
                    @click="handleNotPrint(item)"
                  >
                    <q-item-section>
                      <q-item-label>{{ trans("标记为未打印") }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
            <div class="package-no" v-if="item.status > 0">
              {{ item.package_number }}
            </div>

            <div class="process" v-if="getInPackage(item) > 0">
              {{ getInPackage(item) }} / <span>{{ getTotal(item) }}</span>
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
import { reactive, onMounted, watch, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import OutApi from "@/api/out";
import ProductApi from "@/api/product";
import Message from "@/utils/message";
import Logs from "./components/Logs.vue";
import { useQuasar } from "quasar";
import NotPacking from "./components/NotPacking.vue";
import CheckMaterial from "./components/CheckMaterial.vue";
import trans from "@/i18n";
import ScanTop from "@/components/ScanTop/Index.vue";
import { playVoice } from "@/utils/voice";
import { QSpinnerBars } from "quasar";

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
  loading: false,
});

watch(
  () => pageData.packages,
  () => {
    // 用做页面顶部完成数和未完成数
    watchPackages();
  },
  { deep: true }
);

const watchPackages = () => {
  let count = 0;

  // 当回车后 修改了包裹的已入框数量后 进入到监听的回调 在这里处理包裹的状态 待入框 ->选包材 待打印->完成打印
  // status 0:待入框
  // 1:入框完成(待打印)
  // 2:打印完成
  console.log("pageData.packages", pageData.packages);

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

    if (item.status == 2) {
      count++;
    }
  });

  pageData.successCount = count;
  console.log("pageData.successCount", pageData.successCount);

  // 如果所有的都已经处理完成了   弹窗提示已经完成包装，是否结束作业
  if (pageData.successCount == pageData.packages.length) {
    successWave();
  }
};

onMounted(() => {
  let number = route.query.number;
  pageData.number = number;
  getWaveInfo();
  getMaterialsList();
});

const successWave = () => {
  $q.dialog({
    title: trans("提示"),
    message: trans("所有的都已经处理完成了"),
    ok: {
      label: trans("结束作业"),
      color: "primary",
    },
    cancel: {
      label: trans("取消"),
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
  item.boxes.forEach((box) => {
    box.inFrame = box.quantity;
  });
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
  pageData.loading = true;
  try {
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
    setTimeout(() => {
      pageData.loading = false;
    }, 500);
  } catch (error) {
    setTimeout(() => {
      pageData.loading = false;
    }, 500);
  }
};

const search = async () => {
  if (!pageData.keyword.length) {
    return Message.notify(trans("请输入商品标签"));
  }
  pageData.loading = true;
  setTimeout(() => {
    let boxes = [];
    pageData.packages.forEach((item) => {
      item.boxes.forEach((box) => {
        boxes.push(box);
      });
    });
    let box = boxes.find(
      (item) =>
        item.product_spec_sku == pageData.keyword &&
        item.inFrame < item.quantity
    );
    if (!box) {
      Message.errorMessage(trans("该商品标签不存在"));
      // 语音提示标签不存在
      playVoice(trans("扫描异常"));
      pageData.loading = false;
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
    // 提示 第index个箱子
    playVoice(index + trans("号"));
    pageData.loading = false;
  }, 500);
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
    title: trans("打印结果确认"),
    message: trans("是否打印成功"),
    cancel: true,
    persistent: true,
    ok: {
      label: trans("是"),
      color: "primary",
    },
    cancel: {
      label: trans("否"),
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

// 获取已经扫描的商品数量
const getInPackage = (item) => {
  return item.boxes.reduce((total, box) => total + box.inFrame, 0);
};

// 获取总的商品数量
const getTotal = (item) => {
  return item.boxes.reduce((total, box) => total + box.quantity, 0);
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
    padding: 0 calc((100vw - 1400px) / 2);

    height: 80px;
    background: #fff;

    .left {
      .wave-no {
        font-weight: 600;
        font-size: 20px;
        color: #1f1f1f;
      }
      .wave-type {
        font-weight: 500;
        font-size: 16px;
        color: #666666;
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
        font-weight: 600;
        font-size: 16px;
        color: #1f1f1f;
      }
      .end-btn {
        width: 130px;
        height: 44px;
        border-radius: 9px 9px 9px 9px;
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
    position: relative;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
    min-height: 400px;
    width: 1400px;
    margin: 0 auto;
    padding: 20px;
    margin-top: 20px;
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
      font-weight: 600;
      font-size: 20px;
      color: #1f1f1f;
      margin-bottom: 20px;
    }

    .sort-info-row {
      display: flex;
      align-items: flex-start;
      gap: 20px;

      .product-img-placeholder {
        width: 180px;
        height: 180px;
        background: #5745c5;
        border-radius: 16px 16px 16px 16px;
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
          height: 50px;
          border: 1px solid #e0e0e0;
          display: flex;
          font-weight: 600;
          font-size: 12px;
          color: #000000;
          line-height: 14px;
          position: relative;
          span {
            padding-top: 9px;
            padding-left: 10px;
          }

          .package-no {
            font-weight: 500;
            font-size: 12px;
            color: #5745c5;
            position: absolute;
            left: 10px;
            bottom: 4px;
          }
          .operation-btn {
            position: absolute;
            right: 0px;
            .pack-select {
              width: 100px;
            }
            :deep(.q-btn-dropdown__arrow) {
              margin-left: 0 !important;
            }
          }
        }
      }
    }
  }
}

.success {
  background: #f2f0ff;
  color: white;
}

.process {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 12px;
  color: #888;
  span {
    color: #5745c5;
    padding: 0 !important;
  }
}
</style>