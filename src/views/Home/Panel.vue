<template>
  <div class="panel-page">
    <!-- TODO: 改版开始 -->
    <div class="row q-col-gutter-xl q-mb-md">
      <div class="col-12 col-xs-12 col-sm-8 col-md-8">
        <div class="top-bar">
          <div class="item">
            <div class="label">已预报</div>
            <div class="value">1000</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="label">已预报</div>
            <div class="value">1000</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="label">已预报</div>
            <div class="value">1000</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="label">已预报</div>
            <div class="value">1000</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-xs-12 col-sm-4 col-md-4">
        <div class="contact-box bg-white">
          <div class="text-subtitle1 q-mb-md">联系我们</div>
          <div class="line q-mb-md"></div>
          <div class="q-mb-md row items-center">
            <q-icon name="phone" size="xs" class="q-mr-sm" />
            <span>+86 15576601706</span>
          </div>
          <div class="row items-center">
            <q-icon name="email" size="xs" class="q-mr-sm" />
            <span>Hubinjie@Tongxiao.Tech</span>
          </div>
        </div>
      </div>
    </div>

    <div class="total-list row q-col-gutter-lg q-mb-md">
      <div
        class="col-12 col-sm-6 col-md-2"
        v-for="item in totalList"
        :key="item.label"
      >
        <q-card class="common-card b-rd-16">
          <q-card-section class="p-20">
            <div class="text-grey-8 text-subtitle2 q-mb-md">
              {{ item.label }}
            </div>
            <div class="text-primary text-h5">{{ item.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 单量图表+公告列表+下载pda -->
    <div class="chart-box row q-col-gutter-xl q-mb-md">
      <div class="col-12 col-xs-12 col-sm-8 col-md-8">
        <q-card class="common-card b-rd-16 p-20">
          <q-card-section class="p-0 m-b-16">
            <div class="row items-center justify-between">
              <div>
                <span class="text-h6 font-bold">单量统计</span>
                <span class="text-grey-7">(单)</span>
              </div>

              <!-- <q-btn-toggle
                  v-model="timeRange"
                  color="brown"
                  text-color="white"
                  toggle-color="orange"
                  toggle-text-color="black"
                  :options="[
                    { label: '今日', value: 'today' },
                    { label: '本周', value: 'week' },
                    { label: '本月', value: 'month' },
                    { label: '全年', value: 'year' },
                  ]"
                  spread
                  no-caps
                  unelevated
                /> -->
              <div class="time-range-group">
                <div class="time-range-list">
                  <div
                    v-for="(item, index) in timeOptions"
                    :key="index"
                    :class="[
                      'time-range-item',
                      { active: timeRange === item.value },
                    ]"
                    @click="timeRange = item.value"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="p-0 m-b-20">
            <div class="row type-btn q-col-gutter-sm">
              <div>
                <div class="item item-1 col-12 col-sm-4 col-md-3">
                  <div class="label">一件代发</div>
                  <div class="value">1360</div>
                </div>
              </div>
              <div>
                <div class="item item-2 col-12 col-sm-4 col-md-3">
                  <div class="label">标准入库</div>
                  <div class="value">704</div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="p-0">
            <div id="order-chart" style="width: 100%; height: 320px"></div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-xs-12 col-sm-4 col-md-4">
        <q-card class="common-card b-rd-16 notice-box" v-show="false">
          <q-card-section class="p-20">
            <div class="flex-between-center">
              <div class="text-subtitle1 font-bold">系统公告</div>
              <q-btn
                flat
                color="primary"
                size="sm"
                icon="chevron_right"
                dense
              />
            </div>
            <q-scroll-area class="notice-list">
              <div
                v-for="item in noticeList"
                :key="item.label"
                class="notice-item"
              >
                <div class="title text-overflow-1">{{ item.label }}</div>
                <div class="time">{{ item.time }}</div>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>

        <q-card class="common-card b-rd-16 p-20 down-box">
          <q-card-section class="p-0 m-b-20">
            <div class="text-subtitle1 font-bold">下载PDA</div>
          </q-card-section>
          <q-card-section class="down-list p-0">
            <div class="item">
              <q-icon
                name="img:/src/assets/images/home/apple.png"
                size="24px"
                class="q-mr-sm"
              />
              <div class="text-subtitle2">App Store</div>
            </div>
            <div class="item">
              <q-icon
                name="img:/src/assets/images/home/android.png"
                size="24px"
                class="q-mr-sm"
              />
              <div class="text-subtitle2">Android</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 库存图表+问题 -->
    <div class="row q-col-gutter-xl q-mb-md">
      <div class="col-12 col-xs-12 col-sm-8 col-md-8">
        <q-card class="capacity-box common-card b-rd-16 p-20">
          <q-card-section class="p-0 q-mb-md">
            <div class="flex-between-center">
              <span class="text-h6 font-bold">库容</span>
              <q-select
                v-model="selectedOption"
                :options="[{ label: 'SKU数量', value: 'sku' }]"
                outlined
                flat
                dense
                emit-value
                map-options
              />
            </div>
          </q-card-section>

          <q-card-section class="p-0">
            <div class="row">
              <div class="col-12 col-xs-12 col-sm-4 col-md-4">
                <div class="statistic-label q-mb-md">在库总数(个)</div>
                <div class="text-h5 font-bold q-mb-md">123</div>

                <div class="capacity-item capacity-item-1">商品库存</div>
                <div class="capacity-item capacity-item-2">B2B库存</div>
                <div class="capacity-item capacity-item-3">FBA退货库存</div>
              </div>
              <div class="col-12 col-xs-12 col-sm-8 col-md-8">
                <div
                  id="capacity-chart"
                  style="width: 100%; height: 200px"
                ></div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-xs-12 col-sm-5 col-md-5" v-show="false">
        <q-card class="help-box common-card b-rd-16 p-20">
          <q-card-section class="p-0">
            <div class="flex-between-center q-mb-md">
              <div class="text-subtitle1 font-bold">帮助中心</div>
              <q-btn
                flat
                color="primary"
                size="sm"
                icon="chevron_right"
                dense
              />
            </div>
            <q-scroll-area class="help-list">
              <div
                v-for="item in noticeList"
                :key="item.label"
                class="help-item"
              >
                <div>{{ item.label }}</div>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- TODO: 改版结束 -->

    <!-- 仓库表单组件 -->
    <WarehouseForm
      v-model="dialogVisible"
      :cancelShow="false"
      @created="handleWarehouseCreated"
    />
  </div>
</template>

<script>
import Dialog from "@/components/Dialog.vue";
import WarehouseForm from "@/components/WarehouseForm.vue";
import * as echarts from "echarts";
import { Notify } from "quasar";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

export default {
  name: "PanelPage",
  components: {
    Dialog,
    WarehouseForm,
  },
  setup() {
    const dialogVisible = ref(false);
    const isRegister = localStorage.getItem("isRegister"); //如果是注册，则需要建仓库选
    if (isRegister == "true") {
      dialogVisible.value = true;
    }
    const handleWarehouseCreated = (data) => {
      localStorage.setItem("isRegister", false); //建仓库后需要标记
      localStorage.setItem("warehouseId", data.id);
      dialogVisible.value = false;
      Notify.create({
        message: "仓库创建成功",
        color: "positive",
      });
      window.location.reload();
    };

    const totalList = computed(() => {
      return [
        {
          label: "待生成/待打单",
          value: 0,
        },
        {
          label: "待发货",
          value: 0,
        },
        {
          label: "获取运单号",
          value: 0,
        },
        {
          label: "待移货",
          value: 0,
        },
        {
          label: "待拣货",
          value: 0,
        },
        {
          label: "待包装",
          value: 0,
        },
      ];
    });
    const timeRange = ref("week");

    // 图表数据-订单量
    const chartData = ref({
      grid: {
        left: 10,
        right: 10,
        bottom: 10,
        top: 10,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let result = params[0].axisValue + "<br/>";
          params.forEach((item) => {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });
          return result;
        },
      },
      xAxis: {
        type: "category",
        data: [
          "2022-07-01",
          "2022-07-02",
          "2022-07-03",
          "2022-07-04",
          "2022-07-05",
          "2022-07-06",
          "2022-07-07",
        ],
        axisTick: {
          alignWithLabel: true,
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      yAxis: {
        type: "value",
        axisTick: {
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      series: [
        {
          name: "一件代发",
          type: "line",
          smooth: true,
          data: [260, 150, 270, 230, 380, 330, 400],
          areaStyle: {
            opacity: 0.7, // 增加不透明度以更好显示渐变
            color: {
              // 线性渐变配置
              type: "linear",
              x: 0,
              y: 0, // 起点
              x2: 0,
              y2: 1, // 终点 (垂直向下)
              colorStops: [
                { offset: 0, color: "#0E6CFA" }, // 曲线颜色
                { offset: 1, color: "rgba(255,255,255,0)" }, // 完全透明
              ],
              global: false, // 不全局渐变
            },
          },
          lineStyle: {
            width: 2,
            color: "#0E6CFA",
          },
        },
        {
          name: "标准入库",
          type: "line",
          smooth: true,
          data: [70, 20, 30, 60, 150, 110, 160],
          areaStyle: {
            opacity: 0.7,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#5745C5" },
                { offset: 1, color: "rgba(255,255,255,0)" },
              ],
              global: false,
            },
          },
          lineStyle: {
            width: 2,
            color: "#5745C5",
          },
        },
      ],
    });
    const chartRef = ref(null);
    let chartInstance = null;
    const initChart = () => {
      chartRef.value = document.getElementById("order-chart");
      if (!chartRef.value) return;
      chartInstance = echarts.init(chartRef.value);
      chartInstance.setOption(chartData.value);
    };

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
      if (chartInstance2) {
        chartInstance2.resize();
      }
    };

    // 图表数据-库存
    const selectedOption = ref("sku");

    const chartRef2 = ref(null);
    let chartInstance2 = null;
    const chartData2 = ref({
      color: ["#5745C5", "#69C096", "#409EFF"], // 在这里定义颜色数组
      series: [
        {
          name: "库存分类",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "30",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 800, name: "商品库存" },
            { value: 100, name: "B2B库存" },
            { value: 229, name: "FBA退货库存" },
          ],
        },
      ],
    });
    const initChart2 = () => {
      chartRef2.value = document.getElementById("capacity-chart");
      if (!chartRef2.value) return;
      chartInstance2 = echarts.init(chartRef2.value);
      chartInstance2.setOption(chartData2.value);
    };

    // 公告列表
    const noticeList = ref([
      {
        label: "如何设置仓库/货区/货位",
        desc: "如何设置仓库/货区/货位",
        time: "2022-07-01 12:00:00",
      },
      {
        label: "如何设置仓租策略",
        desc: "如何设置仓租策略",
        time: "2022-07-01 12:00:00",
      },
      {
        label: "如何在操作中再及操作库策略",
        desc: "如何在操作中再及操作库策略",
        time: "2022-07-01 12:00:00",
      },
      {
        label: "如何设置计费模板",
        desc: "如何设置计费模板",
        time: "2022-07-01 12:00:00",
      },
      {
        label: "如何创建客户",
        desc: "如何创建客户",
        time: "2022-07-01 12:00:00",
      },
      {
        label: "其他问题",
        desc: "其他问题",
        time: "2022-07-01 12:00:00",
      },
    ]);
    // 时间选项
    const timeOptions = [
      { label: "昨天", value: "yesterday" },
      { label: "今天", value: "today" },
      { label: "星期", value: "week" },
      { label: "月", value: "month" },
      { label: "年", value: "year" },
    ];
    onMounted(() => {
      nextTick(() => {
        initChart();
        initChart2();
        window.addEventListener("resize", handleResize);
      });
    });
    onUnmounted(() => {
      if (chartInstance) {
        window.removeEventListener("resize", handleResize);
        chartInstance.dispose();
        chartInstance = null;
      }
    });
    return {
      dialogVisible,
      totalList,
      timeRange,
      noticeList,
      timeOptions,
      selectedOption,
      handleWarehouseCreated,
      confirm,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-page {
  position: relative;
  // padding-right: 340px;

  // 公共卡片,去掉默认阴影
  .common-card {
    box-shadow: none;
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  }
  // 1 顶部渐变色数据栏
  .top-bar {
    background-image: linear-gradient(to right, #ef76d3, #8840ff);
    padding: 50px 60px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 16px;
    > .item {
      .label {
        font-size: 14px;
        line-height: 18px;
        margin-bottom: 20px;
      }
      .value {
        font-size: 24px;
        line-height: 30px;
        font-weight: bold;
      }
    }
    .line {
      width: 1px;
      height: 68px;
      background-color: #fff;
    }
  }
  // 2 联系我们
  .contact-box {
    padding: 20px;
    border-radius: 16px;
    .line {
      height: 1px;
      width: 100%;
      background-color: #e6e6e6;
    }
  }
  // 3 条数列表
  .total-list {
  }
  // 4 图表
  .chart-box {
    .type-btn {
      .item {
        padding: 15px 20px;
        border: 1px solid #e6e6e6;
        border-radius: 9px;
        position: relative;
        min-width: 150px;
        height: 80px;
        box-sizing: border-box;
        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 10px;
          height: 100%;
          border-radius: 9px 0 0 9px;
        }
        .label {
          font-size: 14px;
          line-height: 18px;
          color: #666;
          margin-bottom: 10px;
        }
        .value {
          font-size: 20px;
          line-height: 24px;
          color: #333;
          font-weight: bold;
        }
      }
      .item-1 {
        &::before {
          background: #0e6cfa;
        }
      }
      .item-2 {
        &::before {
          background: #5745c5;
        }
      }
    }
    .time-range-group {
      .time-range-list {
        display: flex;
        border-radius: 4px;
        overflow: hidden;

        .time-range-item {
          padding: 6px 16px;
          font-size: 14px;
          color: #606266;
          cursor: pointer;
          background: #fff;
          border: 1px solid #dcdfe6;
          margin-left: -1px; // 边框重叠效果
          position: relative; // 用于选中时边框层级

          &:first-child {
            margin-left: 0;
            border-radius: 4px 0 0 4px;
          }
          &:last-child {
            border-radius: 0 4px 4px 0;
          }

          &:hover {
            color: var(--q-primary);
            z-index: 1;
          }

          &.active {
            color: var(--q-primary);
            border-color: var(--q-primary);
            z-index: 2; // 确保选中项的边框在最上层
          }
        }
      }
    }
  }

  // 5 公告
  .notice-box {
    height: 250px;
    box-sizing: border-box;
    margin-bottom: 50px;
    .notice-list {
      overflow-y: auto;
      height: 180px;
      .notice-item {
        padding: 10px 0;
        border-bottom: 1px solid #e6e6e6;
        .title {
          cursor: pointer;
          font-size: 14px;
          color: #1f1f1f;
          line-height: 18px;
          margin-bottom: 6px;
          &:hover {
            color: $primary;
          }
        }
        .time {
          color: #666666;
          font-size: 12px;
        }
      }
    }
  }
  // 6下载
  .down-box {
    height: 200px;
    box-sizing: border-box;
    .down-list {
      .item {
        height: 50px;
        box-sizing: border-box;
        padding: 12px 0;
        border: 1px solid #e6e6e6;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.3s;
        &:not(:last-child) {
          margin-bottom: 20px;
        }
        &:hover {
          cursor: pointer;
          color: $primary;
          border-color: $primary;
          background-color: rgba($color: $primary, $alpha: 0.1);
        }
      }
    }
  }
  // 6 库存
  .capacity-box {
    height: 290px;
    box-sizing: border-box;
    .capacity-item {
      text-indent: 20px;
      &:not(:last-child) {
        margin-bottom: 20px;
      }
      &::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
      }
      &-1 {
        &::before {
          background: #5745c5;
        }
      }
      &-2 {
        &::before {
          background: #69c096;
        }
      }
      &-3 {
        &::before {
          background: #409eff;
        }
      }
    }
  }
  // 7 帮助中心
  .help-box {
    height: 290px;
    box-sizing: border-box;
    .help-list {
      height: 200px;
      .help-item {
        &:not(:last-child) {
          margin-bottom: 16px;
        }
        cursor: pointer;
        font-size: 14px;
        color: #1f1f1f;
        line-height: 18px;
        &:hover {
          color: $primary;
        }
      }
    }
  }
}
</style>
