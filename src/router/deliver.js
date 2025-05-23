
import trans from "@/i18n";

export default [
  {
    path: "deliver",
    component: () => import("@/views/Layout/Container.vue"),
    redirect: "/deliver/examine/goods",
    icon: "send",
    meta: {
      name: trans("发货管理"),
      icon: "",
    },
    children: [
      {
        path: "examine",
        id: 1901,
        name: "examine",
        // component: () => import("@/views/Deliver/ExamineGoods.vue"),
        redirect: "/examine/goods",
        meta: {
          level: 2,
          group: trans("发货管理"),
          name: trans("扫描验货"),
        },
      },
      {
        path: "scan/shipment1",
        id: 1902,
        name: "ScanShipment1",
        redirect: "/scan/shipment",
        // component: () => import("@/views/Deliver/ScanShipment.vue"),
        meta: {
          level: 2,
          group: trans("发货管理"),
          name: trans("扫描发货"),
        },
      },
      {
        path: "signing/record",
        id: 1903,
        name: "SigningRecord",
        component: () => import("@/views/Deliver/SigningRecord.vue"),
        meta: {
          level: 2,
          group: trans("发货管理"),
          name: trans("签单记录"),
        },
      },
      {
        path: "photo/record",
        id: 1904,
        name: "PhotoRecord",
        component: () => import("@/views/Deliver/PhotoRecord.vue"),
        meta: {
          level: 2,
          group: trans("发货管理"),
          name: trans("拍照记录"),
        },
      },
    ],
  },
];
