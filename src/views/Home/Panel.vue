<template>
  <div class="panel-page">
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
                <q-icon
                  name="chevron_right"
                  size="sm"
                  class="q-ml-sm text-grey"
                />
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
                <q-icon
                  name="chevron_right"
                  size="sm"
                  class="q-ml-sm text-grey"
                />
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
                <q-icon
                  name="chevron_right"
                  size="sm"
                  class="q-ml-sm text-grey"
                />
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
                <q-icon
                  name="chevron_right"
                  size="sm"
                  class="q-ml-sm text-grey"
                />
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
            <q-btn
              unelevated
              color="black"
              class="full-width"
              icon="mdi-apple"
              label="iOS"
            />
          </div>
          <div class="col-6">
            <q-btn
              unelevated
              color="green-9"
              class="full-width"
              icon="mdi-android"
              label="Android"
            />
          </div>
        </div>
      </div>

      <!-- 系统公告 -->
      <div class="q-mb-lg">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">系统公告</div>
          <q-btn
            flat
            color="primary"
            label="更多"
            size="sm"
            icon-right="chevron_right"
            dense
          />
        </div>
        <q-item class="bg-white rounded-borders q-mb-sm">
          <q-item-section>
            <q-item-label
              >Temu 平台 美国站点 店铺里面的订单 仅可退件</q-item-label
            >
            <q-item-label caption>2025-03-30 18:57</q-item-label>
          </q-item-section>
        </q-item>
      </div>

      <!-- 帮助中心 -->
      <div class="q-mb-lg">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">帮助中心</div>
          <q-btn
            flat
            color="primary"
            label="更多"
            size="sm"
            icon-right="chevron_right"
            dense
          />
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
          <div>wms@dianxiaomi.com</div>
        </div>
        <div>
          <div class="row items-center q-mb-xs">
            <q-icon name="phone" size="xs" class="q-mr-sm" />
            <span>客服</span>
          </div>
          <div class="text-center">
            <q-img
              src="https://placehold.co/150x150/001F4D/FFFFFF?text=QR+Code"
              width="100px"
              class="q-mb-xs"
            />
            <div class="text-caption">扫码联系客服</div>
          </div>
        </div>
      </div>
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
              <div class="form-item row items-center">
                <div class="form-label col-sm-4 pb-20">
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
              <div class="form-item row items-center">
                <div class="form-label col-sm-4 pb-20">
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
              <div class="form-item row items-center">
                <div class="form-label col-sm-4 pb-20">
                  域名 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <div class="row items-center domain-input-group">
                    <div class="prefix text-grey-7">https://</div>
                    <div class="input-wrapper">
                      <q-input
                        outlined
                        dense
                        v-model="warehouseForm.domain"
                        placeholder="请输入仓库域名"
                        class="domain-input"
                        bg-color="white"
                      />
                    </div>
                    <div class="suffix text-grey-7">.cangmishu.com</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center">
                <div class="form-label col-sm-4">
                  国家/地区 <span class="required">*</span>
                </div>
                <div class="form-input col-sm-8">
                  <q-select
                    outlined
                    dense
                    v-model="warehouseForm.country_code"
                    :options="countryOptions"
                    :option-value="(option) => option.code"
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-start">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-center">
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
              <div class="form-item row items-start">
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

<script>
import { ref } from "vue";
import Dialog from "@/components/Dialog.vue";
import warehouseApi from "@/api/warehouse";
import { Notify } from "quasar";

export default {
  name: "PanelPage",
  components: {
    Dialog,
  },
  setup() {
    const selectedWarehouse = ref("");
    const warehouseOptions = ["全部仓库"];
    const warehouseList = ref([]); //仓库列表
    const dialogVisible = ref(false);
    const isRegister = localStorage.getItem("isRegister"); //如果是注册，则需要建仓库选
    if (isRegister == "true") {
      dialogVisible.value = true;
    }
    // 仓库表单数据
    const warehouseForm = ref({
      name: "",
      type: "1",
      code: "",
      domain: "",
      country_code: "CN",
      city: "",
      street: "",
      province: "",
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

    // const getWarehouseList = () => {
    //   warehouseApi.getWarehouseList().then((res) => {
    //     if (res.success) {
    //       warehouseList.value = res.data;
    //       selectedWarehouse.value = res.data[0];
    //       // localStorage.setItem("warehouseId", res.data[0].id);
    //     }
    //     if (res.data.length == 0) {
    //       dialogVisible.value = true;
    //     }
    //   });
    // };
    // getWarehouseList();
    // 下拉选项
    const warehouseTypes = ["标准仓"];
    const countryOptions = [
      { name: "中国", code: "CN" },
      { name: "美国", code: "US" },
    ];
    const timezoneOptions = ["UTC+8", "UTC+0", "UTC-5", "UTC-8"];

    const confirm = () => {
      if (!warehouseForm.value.name) {
        Notify.create({
          message: "请输入仓库名称",
          color: "negative",
        });
        return;
      } else if (!warehouseForm.value.code) {
        Notify.create({
          message: "请输入仓库编号",
          color: "negative",
        });
        return;
      } else if (!warehouseForm.value.type) {
        Notify.create({
          message: "请选择仓库类型",
          color: "negative",
        });
        return;
      } else if (!warehouseForm.value.domain) {
        Notify.create({
          message: "请输入仓库域名",
          color: "negative",
        });
        return;
      } else if (!warehouseForm.value.country_code) {
        Notify.create({
          message: "请选择国家/地区",
          color: "negative",
        });
        return;
      }

      warehouseApi
        .checkDomain({
          domain: warehouseForm.value.domain,
        })
        .then((res) => {
          if (res.success) {
            warehouseApi.createWarehouse(warehouseForm.value).then((res) => {
              if (res.success) {
                localStorage.setItem("isRegister", false); //建仓库后需要标记
                localStorage.setItem("warehouseId", res.data.id);
                dialogVisible.value = false;
                Notify.create({
                  message: "仓库创建成功",
                  color: "positive",
                });
                window.location.reload();
              }
            });
          }
        });
    };

    return {
      selectedWarehouse,
      warehouseOptions,
      warehouseForm,
      warehouseTypes,
      countryOptions,
      timezoneOptions,
      dialogVisible,
      warehouseList,
      confirm,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-page {
  position: relative;
  padding-right: 340px;
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
  .q-px-md.q-py-lg[style*="position: fixed"] {
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
  
  .prefix, .suffix {
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
          
          &:before, &:after {
            display: none;
          }
        }
      }
    }
  }
}
</style>