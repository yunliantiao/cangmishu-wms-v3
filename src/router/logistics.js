const Container = () => import(`../views/Layout/Container.vue`);
const OfflineIndex = () => import(`../views/Logistics/Offline/Index.vue`); // 线下物流
const ProviderChannel = () => import(`../views/Logistics/Offline/ProviderChannel.vue`); // 物流商渠道管理(物流商详情页)
const RuleIndex = () => import(`../views/Logistics/Rule/Index.vue`); // 物流规则
const RemoteForm = () => import(`../views/Logistics/Rule/RemoteForm.vue`); // 偏远地区表单
const ZonesForm = () => import(`../views/Logistics/Rule/ZonesForm.vue`); // 分区规则表单
const CostIndex = () => import(`../views/Logistics/Cost/Index.vue`); // 物流计费
const StrategyForm = () => import(`../views/Logistics/Cost/StrategyForm.vue`); // 物流计费策略表单
import trans from "@/i18n";

export default [
  {
    path: 'logistics',
    component: Container,
    redirect: '/logistics/offline',
    icon: 'print',
    meta: {
      name: trans('物流管理'),
      icon: '',
    },
    children: [
      {
        path: 'offline',
        name: 'offline',
        component: OfflineIndex,
        id: 1001,
        meta: {
          level: 2,
          group: trans('物流管理'),
          name: trans('线下物流'),
          icon: 'store',
        },
      },
      {
        path: 'offline/channel',
        name: 'offline/channel',
        component: ProviderChannel,
        id: 1002,
        meta: {
          level: 3,
          group: trans('物流管理'),
          name: trans('物流商渠道管理'),
          icon: 'store',
        },
      },
      {
        path: 'rule',
        name: 'rule',
        component: RuleIndex,
        id: 1003,
        meta: {
          level: 2,
          group: trans('物流管理'),
          name: trans('物流规则'),
          icon: 'store',
        },
      },
      {
        path: 'rule/remote',
        name: 'rule/remote',
        component: RemoteForm,
        id: 1004,
        meta: {
          level: 3,
          group: trans('物流管理'),
          name: trans('偏远地区规则'),
          icon: 'store',
        },
      },
      {
        path: 'rule/zones',
        name: 'rule/zones',
        component: ZonesForm,
        id: 1005,
        meta: {
          level: 3,
          group: trans('物流管理'),
          name: trans('分区规则'),
          icon: 'store',
        },
      },
      {
        path: 'cost',
        name: 'cost',
        component: CostIndex,
        id: 1006,
        meta: {
          level: 2,
          group: trans('物流管理'),
          name: trans('物流计费'),
          icon: 'store',
        },
      },
      {
        path: 'cost/strategy',
        name: 'cost/strategy',
        component: StrategyForm,
        id: 1006,
        meta: {
          level: 3,
          group: trans('物流管理'),
          name: trans('物流计费策略'),
          icon: 'store',
        },
      },
    ],
  },
];
