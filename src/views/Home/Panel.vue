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
      <div class="col-12 col-sm-6 col-md-2" v-for="item in totalList" :key="item.label">
        <q-card class="common-card b-rd-16">
          <q-card-section class="p-20">
            <div class="text-grey-8 text-subtitle2 q-mb-md">{{ item.label }}</div>
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
                    :class="['time-range-item', { active: timeRange === item.value }]"
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
        <q-card class="common-card b-rd-16 notice-box">
          <q-card-section class="p-20">
            <div class="flex-between-center">
              <div class="text-subtitle1 font-bold">帮助中心</div>
              <q-btn flat color="primary" size="sm" icon="chevron_right" dense />
            </div>
            <q-scroll-area class="notice-list">
              <div v-for="item in noticeList" :key="item.label" class="notice-item">
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
              <q-icon name="img:/src/assets/images/home/apple.png" size="24px" class="q-mr-sm" />
              <div class="text-subtitle2">App Store</div>
            </div>
            <div class="item">
              <q-icon name="img:/src/assets/images/home/android.png" size="24px" class="q-mr-sm" />
              <div class="text-subtitle2">Android</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 库存图表+问题 -->
    <div class="row q-col-gutter-xl q-mb-md">
      <div class="col-12 col-xs-12 col-sm-7 col-md-7">
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
                <div id="capacity-chart" style="width: 100%; height: 200px"></div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-xs-12 col-sm-5 col-md-5">
        <q-card class="help-box common-card b-rd-16 p-20">
          <q-card-section class="p-0">
            <div class="flex-between-center q-mb-md">
              <div class="text-subtitle1 font-bold">帮助中心</div>
              <q-btn flat color="primary" size="sm" icon="chevron_right" dense />
            </div>
            <q-scroll-area class="help-list">
              <div v-for="item in noticeList" :key="item.label" class="help-item">
                <div>{{ item.label }}</div>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- TODO: 改版结束 -->

    <!-- 仓库选择器 -->
    <!-- <div class="warehouse-selector q-mb-md">
      <q-select
        v-model="selectedWarehouse"
        :options="warehouseList"
        :option-label="(option) => option.name"
        :option-value="(option) => option.id"
        label="全部仓库"
        dense
        outlined
        class="warehouse-select"
        bg-color="white"
      />
    </div> -->

    <!-- 统计卡片 -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card class="stats-card bg-primary text-white">
          <q-card-section class="stats-content">
            <div class="row full-width justify-between items-center">
              <!-- 库存统计 -->
              <div class="inventory-stats">
                <div class="stat-label">库存量</div>
                <div class="stat-value">0</div>
              </div>

              <!-- 入库统计 -->
              <div class="card-divider"></div>
              <div class="inbound-stats">
                <div class="stat-label">待入库</div>
                <div class="stat-value">3</div>
                <div class="stat-label">入库中</div>
                <div class="stat-value">5</div>
              </div>

              <!-- 标准进退入库 -->
              <div class="card-divider"></div>
              <div class="outbound-stats">
                <div class="stat-label">标准退进入库</div>
                <div class="stat-icon"><q-icon name="chevron_right" /></div>
                <div class="stat-label">待入库</div>
                <div class="stat-value">1</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 业务模块卡片 -->
    <div class="q-mb-lg">
      <div class="module-title q-mb-sm">
        <q-icon name="home" size="sm" class="q-mr-sm" />
        <span>一代代发出库</span>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <!-- 待数量 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">待数量</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 异常 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">异常</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 获取运单号 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">获取运单号</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 待生成/待打单 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">待生成/待打单</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 待拣货 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">待拣货</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 拣货差异 Card -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">拣货差异</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- FBA退货模块 -->
    <div class="q-mb-lg">
      <div class="module-title q-mb-sm">
        <q-icon name="inventory_2" size="sm" class="q-mr-sm" />
        <span>FBA退货</span>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <!-- FBA退货出库 -->
        <div class="col-12 col-sm-6 col-md-6">
          <q-card class="module-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">
                FBA退货出库
                <q-icon name="chevron_right" size="sm" class="q-ml-sm text-grey" />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待处理</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待出库</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">异常</div>
                  <div class="text-primary text-h5">0</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- FBA退货换标 -->
        <div class="col-12 col-sm-6 col-md-6">
          <q-card class="module-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">
                FBA退货换标
                <q-icon name="chevron_right" size="sm" class="q-ml-sm text-grey" />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待处理</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待拣选</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待换标</div>
                  <div class="text-primary text-h5">0</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- FBA退货入库 -->
    <div class="q-mb-lg">
      <div class="module-title q-mb-sm">
        <q-icon name="inventory" size="sm" class="q-mr-sm" />
        <span>FBA退货入库</span>
        <q-icon name="chevron_right" size="sm" class="q-ml-sm text-grey" />
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">待入库</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">入库中</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">待上架</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">上架中</div>
              <div class="text-primary text-h5">0</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- B2B模块 -->
    <div class="q-mb-lg">
      <div class="module-title q-mb-sm">
        <q-icon name="business" size="sm" class="q-mr-sm" />
        <span>B2B出入库</span>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-6">
          <q-card class="module-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">
                B2B入库
                <q-icon name="chevron_right" size="sm" class="q-ml-sm text-grey" />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">运输中</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">待入库</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-4">
                  <div class="text-grey-8 text-subtitle2">入库中</div>
                  <div class="text-primary text-h5">2</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-6">
          <q-card class="module-card">
            <q-card-section>
              <div class="text-h6 q-mb-sm">
                B2B出库
                <q-icon name="chevron_right" size="sm" class="q-ml-sm text-grey" />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-3">
                  <div class="text-grey-8 text-subtitle2">待处理</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-3">
                  <div class="text-grey-8 text-subtitle2">待出库</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-3">
                  <div class="text-grey-8 text-subtitle2">异常</div>
                  <div class="text-primary text-h5">0</div>
                </div>
                <div class="col-3">
                  <div class="text-grey-8 text-subtitle2">紧急</div>
                  <div class="text-accent text-h5">0</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 财务模块 -->
    <div class="q-mb-lg">
      <div class="module-title q-mb-sm">
        <q-icon name="payments" size="sm" class="q-mr-sm" />
        <span>财务</span>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">月结待确认</div>
              <div class="text-primary text-h5">1</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">手动扣费审核</div>
              <div class="text-primary text-h5">1</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">信用额度待审核</div>
              <div class="text-primary text-h5">2</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="module-card">
            <q-card-section class="text-center">
              <div class="text-grey-8 text-subtitle2">余额不足</div>
              <div class="text-negative text-h5">2</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 右侧下载区和公告区 -->
    <div
      v-if="false"
      class="q-px-md q-py-lg"
      style="
        position: fixed;
        right: 0;
        top: 50px;
        width: 320px;
        height: calc(100vh - 50px);
        background-color: #f8f8f8;
        overflow-y: auto;
      "
    >
      <!-- 下载区域 -->
      <div class="q-mb-lg">
        <div class="text-h6 q-mb-md">下载PDA</div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn unelevated color="black" class="full-width" icon="mdi-apple" label="iOS" />
          </div>
          <div class="col-6">
            <q-btn unelevated color="green-9" class="full-width" icon="mdi-android" label="Android" />
          </div>
        </div>
      </div>

      <!-- 系统公告 -->
      <div class="q-mb-lg">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">系统公告</div>
          <q-btn flat color="primary" label="更多" size="sm" icon-right="chevron_right" dense />
        </div>
        <q-item class="bg-white rounded-borders q-mb-sm">
          <q-item-section>
            <q-item-label>Temu 平台 美国站点 店铺里面的订单 仅可退件</q-item-label>
            <q-item-label caption>2025-03-30 18:57</q-item-label>
          </q-item-section>
        </q-item>
      </div>

      <!-- 帮助中心 -->
      <div class="q-mb-lg">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">帮助中心</div>
          <q-btn flat color="primary" label="更多" size="sm" icon-right="chevron_right" dense />
        </div>
        <q-list bordered class="rounded-borders bg-white">
          <q-item clickable v-ripple>
            <q-item-section>如何设置仓库/货区/货位</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>如何设置仓租策略</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>如何在操作中再及操作库策略</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>如何设置计费模板</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>如何创建客户</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 联系我们 -->
      <div>
        <div class="text-h6 q-mb-md">联系我们</div>
        <div class="q-mb-md">
          <div class="row items-center q-mb-xs">
            <q-icon name="email" size="xs" class="q-mr-sm" />
            <span>邮箱</span>
          </div>
          <!-- <div>wms@dianxiaomi.com</div> -->
        </div>
        <div>
          <div class="row items-center q-mb-xs">
            <q-icon name="phone" size="xs" class="q-mr-sm" />
            <span>客服</span>
          </div>
          <div class="text-center">
            <q-img src="https://placehold.co/150x150/001F4D/FFFFFF?text=QR+Code" width="100px" class="q-mb-xs" />
            <div class="text-caption">扫码联系客服</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 仓库表单组件 -->
    <WarehouseForm v-model="dialogVisible" :cancelShow="false" @created="handleWarehouseCreated" />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog.vue';
import WarehouseForm from '@/components/WarehouseForm.vue';
import * as echarts from 'echarts';
import { Notify } from 'quasar';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

export default {
  name: 'PanelPage',
  components: {
    Dialog,
    WarehouseForm,
  },
  setup() {
    const dialogVisible = ref(false);
    const isRegister = localStorage.getItem('isRegister'); //如果是注册，则需要建仓库选
    if (isRegister == 'true') {
      dialogVisible.value = true;
    }
    const handleWarehouseCreated = (data) => {
      localStorage.setItem('isRegister', false); //建仓库后需要标记
      localStorage.setItem('warehouseId', data.id);
      dialogVisible.value = false;
      Notify.create({
        message: '仓库创建成功',
        color: 'positive',
      });
      window.location.reload();
    };

    const totalList = computed(() => {
      return [
        {
          label: '待生成/待打单',
          value: 0,
        },
        {
          label: '待发货',
          value: 0,
        },
        {
          label: '获取运单号',
          value: 0,
        },
        {
          label: '待移货',
          value: 0,
        },
        {
          label: '待拣货',
          value: 0,
        },
        {
          label: '待包装',
          value: 0,
        },
      ];
    });
    const timeRange = ref('week');

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
        trigger: 'axis',
        formatter: function (params) {
          let result = params[0].axisValue + '<br/>';
          params.forEach((item) => {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });
          return result;
        },
      },
      xAxis: {
        type: 'category',
        data: ['2022-07-01', '2022-07-02', '2022-07-03', '2022-07-04', '2022-07-05', '2022-07-06', '2022-07-07'],
        axisTick: {
          alignWithLabel: true,
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      yAxis: {
        type: 'value',
        axisTick: {
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      series: [
        {
          name: '一件代发',
          type: 'line',
          smooth: true,
          data: [260, 150, 270, 230, 380, 330, 400],
          areaStyle: {
            opacity: 0.7, // 增加不透明度以更好显示渐变
            color: {
              // 线性渐变配置
              type: 'linear',
              x: 0,
              y: 0, // 起点
              x2: 0,
              y2: 1, // 终点 (垂直向下)
              colorStops: [
                { offset: 0, color: '#0E6CFA' }, // 曲线颜色
                { offset: 1, color: 'rgba(255,255,255,0)' }, // 完全透明
              ],
              global: false, // 不全局渐变
            },
          },
          lineStyle: {
            width: 2,
            color: '#0E6CFA',
          },
        },
        {
          name: '标准入库',
          type: 'line',
          smooth: true,
          data: [70, 20, 30, 60, 150, 110, 160],
          areaStyle: {
            opacity: 0.7,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#5745C5' },
                { offset: 1, color: 'rgba(255,255,255,0)' },
              ],
              global: false,
            },
          },
          lineStyle: {
            width: 2,
            color: '#5745C5',
          },
        },
      ],
    });
    const chartRef = ref(null);
    let chartInstance = null;
    const initChart = () => {
      chartRef.value = document.getElementById('order-chart');
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
    const selectedOption = ref('sku');

    const chartRef2 = ref(null);
    let chartInstance2 = null;
    const chartData2 = ref({
      color: ['#5745C5', '#69C096', '#409EFF'], // 在这里定义颜色数组
      series: [
        {
          name: '库存分类',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 800, name: '商品库存' },
            { value: 100, name: 'B2B库存' },
            { value: 229, name: 'FBA退货库存' },
          ],
        },
      ],
    });
    const initChart2 = () => {
      chartRef2.value = document.getElementById('capacity-chart');
      if (!chartRef2.value) return;
      chartInstance2 = echarts.init(chartRef2.value);
      chartInstance2.setOption(chartData2.value);
    };

    // 公告列表
    const noticeList = ref([
      {
        label: '如何设置仓库/货区/货位',
        desc: '如何设置仓库/货区/货位',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何设置仓租策略',
        desc: '如何设置仓租策略',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何在操作中再及操作库策略',
        desc: '如何在操作中再及操作库策略',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何设置计费模板',
        desc: '如何设置计费模板',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何创建客户',
        desc: '如何创建客户',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '其他问题',
        desc: '其他问题',
        time: '2022-07-01 12:00:00',
      },
    ]);
    // 时间选项
    const timeOptions = [
      { label: '昨天', value: 'yesterday' },
      { label: '今天', value: 'today' },
      { label: '星期', value: 'week' },
      { label: '月', value: 'month' },
      { label: '年', value: 'year' },
    ];
    onMounted(() => {
      nextTick(() => {
        initChart();
        initChart2();
        window.addEventListener('resize', handleResize);
      });
    });
    onUnmounted(() => {
      if (chartInstance) {
        window.removeEventListener('resize', handleResize);
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
          content: '';
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
        content: '';
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

.warehouse-selector {
  .warehouse-select {
    width: 200px;
  }
}

.stats-card {
  .stats-content {
    padding: 16px 24px;
  }

  .card-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 16px;
  }

  .stat-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .stat-icon {
    margin: 0 8px;
  }
}

.module-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.module-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .text-h5 {
    font-weight: 600;
  }
}

// 仓库表单样式
.warehouse-form {
  font-size: 14px;
  .pb-20 {
    padding-bottom: 20px;
  }
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

// 响应式样式
@media (max-width: 1200px) {
  .panel-page {
    padding-right: 0;
  }
}

// 移动端适配
@media (max-width: 767px) {
  .panel-page {
    padding-right: 0;
  }

  .q-pa-md {
    padding: 8px !important;
  }

  .warehouse-selector {
    .warehouse-select {
      width: 100%;
    }
  }

  .stats-card {
    .stats-content {
      padding: 12px;
    }

    .row.full-width {
      flex-direction: column;
    }

    .card-divider {
      width: 100%;
      height: 1px;
      margin: 12px 0;
    }

    .stat-value {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .inventory-stats,
    .inbound-stats,
    .outbound-stats {
      width: 100%;
      margin-bottom: 12px;
    }
  }

  .module-title {
    font-size: 15px;
  }

  .module-card {
    margin-bottom: 8px;

    .text-h5 {
      font-size: 18px !important;
    }

    .text-h6 {
      font-size: 15px !important;
    }

    .text-subtitle2 {
      font-size: 12px !important;
    }

    .q-card-section {
      padding: 12px !important;
    }
  }

  // 隐藏固定的右侧边栏
  .q-px-md.q-py-lg[style*='position: fixed'] {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    margin-top: 20px;
  }
}

// 针对更小的屏幕
@media (max-width: 480px) {
  .q-pa-md {
    padding: 4px !important;
  }

  .q-col-gutter-md {
    margin: -4px 0 0 -4px;

    > * {
      padding: 4px 0 0 4px;
    }
  }

  .module-card {
    .q-card-section {
      padding: 8px !important;
    }
  }
}

.domain-input-group {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  height: 36px;
  padding: 0;
  transition: all 0.3s ease;

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus-within {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 2px rgba(var(--q-primary), 0.1);
  }

  .prefix,
  .suffix {
    padding: 0 8px;
    font-size: 13px;
    color: #606266;
    background: #f2f3f5;
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none;
  }

  .prefix {
    border-right: 1px solid #e5e7eb;
    border-radius: 4px 0 0 4px;
  }

  .suffix {
    border-left: 1px solid #e5e7eb;
    border-radius: 0 4px 4px 0;
  }

  .input-wrapper {
    flex: 1;

    :deep(.domain-input) {
      height: 34px;

      .q-field__control {
        height: 34px;
        min-height: 34px;
        padding: 0 8px;
        background: transparent;
        box-shadow: none !important;
      }

      .q-field__native {
        padding: 0;
      }

      input {
        font-size: 13px;
        color: #2c3e50;
      }

      &.q-field--outlined {
        .q-field__control {
          border: none;

          &:before,
          &:after {
            display: none;
          }
        }
      }
    }
  }
}
</style>
