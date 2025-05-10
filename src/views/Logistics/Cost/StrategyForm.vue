<template>
  <div>
    <!-- 头部区域 -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="text-h6">
        <q-icon name="arrow_back" class="cursor-pointer" @click="router.back()"></q-icon>
        新建偏远地区规则
      </div>
    </div>

    <!-- 基本信息区域 -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="row q-col-gutter-md">
        <!-- 名称 -->
        <div class="col-4">
          <div>
            策略名称
            <span class="text-red">*</span>
          </div>
          <q-input v-model="form.name" dense outlined placeholder="请输入" :rules="[(val) => !!val || '必填']" />
        </div>
        <!-- 计费规则 -->
        <div class="col-4">
          <div>
            计费方式
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.calculation_type"
            :options="[
              { label: '按费率', value: 'rate' },
              { label: '按规则', value: 'rule' },
            ]"
            placeholder="请选择"
            dense
            outlined
            map-options
            emit-value
            clearable
            use-input
            fill-input
            hide-selected
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 物流渠道 -->
        <div class="col-4">
          <div>
            物流渠道
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.logistics_channel_id"
            :options="filterChannelList"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
            @filter="onFilterChannels"
          />
        </div>
        <!-- 货币符号 -->
        <div class="col-4">
          <div>
            货币单位
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.currency"
            :options="[
              { label: 'USD', value: 'USD' },
              { label: 'CNY', value: 'CNY' },
            ]"
            placeholder="请选择"
            dense
            emit-value
            map-options
            outlined
            clearable
            use-input
            fill-input
            hide-selected
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 燃油规则 -->
        <div class="col-4">
          <div>
            燃油规则
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.fuel_surcharge_id"
            :options="filterFuelList"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
            @filter="onFilterFuels"
          />
        </div>
        <!-- 重量/尺寸/体积(单位) -->
        <div class="col-4">
          <div>
            重量/尺寸/体积(单位)
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.unit_combination"
            :options="unitList"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 尺寸进位 -->
        <div class="col-4">
          <div>
            尺寸进位
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.dimension_rounding"
            :options="[
              { label: '向上取整', value: 'round_up' },
              { label: '不进位', value: 'round_none' },
            ]"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 重量进位 -->
        <div class="col-4">
          <div>
            重量进位
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.weight_rounding"
            :options="[
              { label: '向上取整', value: 'round_up' },
              { label: '不进位', value: 'round_none' },
            ]"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 体积重计算公式 -->
        <div class="col-4">
          <div>
            体积重计算公式
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.volume_weight_method"
            :options="[
              { label: '体积重系数', value: 'divide' },
              { label: '不计算', value: 'none' },
            ]"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
          />
        </div>
        <!-- 体积重计算条件 -->
        <div class="col-4">
          <div>
            体积重计算条件
            <span class="text-red">*</span>
          </div>
          <q-select
            v-model="form.rule_settings.volume_weight_condition"
            :options="[
              { label: '全部', value: 'all' },
              { label: '大于1立方英尺', value: 'greater_than_1_cubic_foot' },
            ]"
            menu-anchor="bottom start"
            placeholder="请选择"
            dense
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            outlined
            clearable
            :rules="[(val) => !!val || '必填']"
          />
        </div>
      </div>
      <!-- 备注 -->
      <div>
        <div>备注</div>
        <q-input
          v-model="form.remarks"
          dense
          outlined
          type="textarea"
          placeholder="请输入"
          maxlength="500"
          :rules="[(val) => val.length <= 500 || '请输入500字以内']"
        />
      </div>
    </div>

    <div class="rule-tip rounded-borders q-pa-md q-mb-md">若订单未匹配到以下设置的规则，则无法扣除物流费用</div>

    <!-- 规则详情区域 -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md">
      <div class="q-mb-md">
        <div class="text-subtitle1">规则详情</div>
      </div>

      <!-- <q-table flat :rows="form.rules" :columns="columns" row-key="id" :key="tableKey" hide-bottom>
        <template v-slot:body-cell-country_code="props">
          <q-td>
            <q-select
              v-model="props.row.country_code"
              :options="filteredCountryOptions"
              menu-anchor="bottom start"
              placeholder="请选择"
              dense
              emit-value
              use-input
              fill-input
              hide-selected
              outlined
              clearable
              :disable="isEdit"
              style="width: 150px"
              @filter="onFilterCountryCode"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-city="props">
          <q-td>
            <q-input v-model="props.row.city" dense outlined placeholder="请输入" :disable="isEdit" />
          </q-td>
        </template>
        <template v-slot:body-cell-postcode_start="props">
          <q-td>
            <q-input v-model="props.row.postcode_start" dense outlined placeholder="请输入" :disable="isEdit" />
          </q-td>
        </template>
        <template v-slot:body-cell-postcode_end="props">
          <q-td>
            <q-input v-model="props.row.postcode_end" dense outlined placeholder="请输入" :disable="isEdit" />
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn icon="delete" color="negative" flat dense :disable="isEdit" @click="onRemoveDetail(props.row.id)" />
          </q-td>
        </template>
      </q-table> -->
      <!-- <div>
        <q-btn color="primary" icon="add" flat label="添加行" :disable="isEdit" @click="onAddDetail" />
      </div> -->
    </div>

    <!-- 底部按钮区域 -->
    <div class="bg-white rounded-borders q-pa-md q-mb-md text-right">
      <q-btn label="取消" padding="sm md" color="primary" outline @click="onCancel" />
      <q-btn label="保存" padding="sm md" color="primary" @click="onSubmit" />
    </div>
  </div>
</template>

<script setup>
import logisticsApi from '@/api/logistics';
import { useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute(); // 路由参数
const router = useRouter();
const remoteId = route.query.id; // 编辑时的策略id

const $q = useQuasar();

const form = reactive({
  name: '', // 策略名称
  calculation_type: 'rule', // 计费方式: rate费率||rule规则
  logistics_channel_id: '', // 物流渠道id
  currency: '', // 币种 USD || CNY
  remarks: '', // 备注
  rate_rules: {
    // todo 方式为rate时才有
    operator: '', // 操作符 +-*/
    value: null, // 数字
  },
  // todo rule规则时
  rule_settings: {
    unit_combination: '', // 单位组合: kg/cm/m³
    dimension_rounding: '', // 尺寸进位: round_up向上||round_none不进位
    weight_rounding: '', // 重量进位 同上round
    volume_weight_method: '', // 体积重计算公式: divide体积重系数||none
    volume_weight_condition: '', // 体积重条件: all全部||greater_than_1_cubic_foot 大于1立方英尺
    volume_weight_coefficient: null, // 体积重系数  数字
  },
  // ? 重量段价格,根据分区规则来,数组
  zone_prices: [
    {
      zone_rule_id: '', // 分区规则id
      weight_start: null, // 开始重量
      weight_end: null, // 结束重量
      sale_price: null, // 销售价格
      cost_price: null, // 成本价格
    },
  ],
  // ? 附加费用
  surcharges: [],
  // todo 运费计算:rule时只显示,rate时必填
  rate_rules: {
    operator: '', // 操作符
    value: null, // 数字
  },
});

const channelList = ref([]); // 物流渠道列表
const filterChannelList = ref([]); // 过滤后物流渠道列表
const fuelList = ref([]); // 燃油规则列表
const filterFuelList = ref([]); // 过滤后燃油规则列表
const zonesList = ref([]); // 分区规则列表

const unitList = [
  {
    label: 'kg/cm/m³',
    value: 'kg/cm/m³',
  },
  {
    label: 'lb/cm/m³',
    value: 'lb/cm/m³',
  },
  {
    label: 'lb/in/ft³',
    value: 'lb/in/ft³',
  },
  {
    label: 'oz/cm/m³',
    value: 'oz/cm/m³',
  },
  {
    label: 'oz/in/ft³',
    value: 'oz/in/ft³',
  },
];

const columns = [
  { name: 'country_code', label: '国家/地区', align: 'left', field: 'country_code' },
  { name: 'city', label: '城市', align: 'left', field: 'city' },
  { name: 'postcode_start', label: '开始邮编', align: 'left', field: 'postcode_start' },
  { name: 'postcode_end', label: '结束邮编', align: 'left', field: 'postcode_end' },
  { name: 'actions', label: '操作', align: 'center' },
];

const isEdit = computed(() => {
  return remoteId ? true : false;
});

// 搜索过滤物流渠道
const onFilterChannels = (val, update, abort) => {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      filterChannelList.value = channelList.value;
    } else {
      filterChannelList.value = channelList.value.filter((opt) => opt.label.toLowerCase().includes(needle));
    }
  });
};
// 搜索过滤燃油规则
const onFilterFuels = (val, update, abort) => {
  const needle = val.toLowerCase();
  update(() => {
    if (!needle) {
      filterFuelList.value = fuelList.value;
    } else {
      filterFuelList.value = fuelList.value.filter((opt) => opt.label.toLowerCase().includes(needle));
    }
  });
};
const onCancel = () => {
  router.back();
};

const onSubmit = () => {
  if (remoteId) {
    getEditForm();
  } else {
    getAddForm();
  }
};

// 获取物流渠道
const getChannelList = () => {
  logisticsApi
    .getChannelAllList({
      group_type: 'ungroup',
    })
    .then((res) => {
      const data = res.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      channelList.value = data;
      filterChannelList.value = channelList.value;
    });
};

// 获取燃油规则列表
const getFuelList = () => {
  logisticsApi.getFuelList().then((res) => {
    const data = res.data.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    fuelList.value = data;
    filterFuelList.value = fuelList.value;
  });
};
// 获取分区规则列表
const getZonesList = () => {
  logisticsApi.getZonesList(pageParams).then((res) => {
    zonesList.value = res.data.items;
  });
};

// 获取详情
const getDetailForm = () => {
  logisticsApi.getRemoteInfo(remoteId).then((res) => {
    form.value = res.data;
  });
};
// 提交新增
const getAddForm = () => {
  logisticsApi.addRemote(form.value).then((res) => {
    router.back();
  });
};
// 提交修改
const getEditForm = () => {
  logisticsApi.updateRemote(remoteId, form.value).then((res) => {
    router.back();
  });
};

onMounted(() => {
  if (remoteId) {
    getDetailForm();
  }
  getChannelList();
  getFuelList();
  getZonesList();
});
</script>

<style lang="scss" scoped>
.rule-tip {
  background-color: rgba($color: $primary, $alpha: 0.2);
}
</style>
