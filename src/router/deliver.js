
export default [
  {
    path: "deliver",
    component: () => import("@/views/Layout/Container.vue"),
    redirect: "/deliver/examine/goods",
    icon: "print",
    meta: {
      name: "发货管理",
      icon: "",
    },
    children: [
      {
        path: "examine/goods",
        id: 1901,
        name: "examineGoods",
        component: () => import("@/views/Deliver/ExamineGoods.vue"),
        meta: {
          level: 2,
          group: "发货管理",
          name: "扫描验货",
        },
      },
      {
        path: "scan/shipment",
        id: 1902,
        name: "ScanShipment",
        component: () => import("@/views/Deliver/ScanShipment.vue"),
        meta: {
          level: 2,
          group: "发货管理",
          name: "扫描发货",
        },
      },
      {
        path: "signing/record",
        id: 1903,
        name: "SigningRecord",
        component: () => import("@/views/Deliver/SigningRecord.vue"),
        meta: {
          level: 2,
          group: "发货管理",
          name: "签单记录",
        },
      },
      {
        path: "photo/record",
        id: 1904,
        name: "PhotoRecord",
        component: () => import("@/views/Deliver/PhotoRecord.vue"),
        meta: {
          level: 2,
          group: "发货管理",
          name: "拍照记录",
        },
      },
    ],
  },
];
