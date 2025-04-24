import { GET,POST,DEL,PUT } from "./config.js";
export default {
    getInventoryList: (data) => GET("stocks", data),
    getStockStatement: (data) => GET("stocks/logs", data),//库存流水
    getStockDetail: (id,data) => GET(`stocks/${id}/in-transit-inbound-orders`, data),//获取在途入库单
    getPendingInboundOrders: (id,data) => GET(`stocks/${id}/pending-inbound-orders`, data),//获取待收货列表
    getPendingShelfOrders: (id,data) => GET(`stocks/${id}/pending-shelf-inbound-orders`, data),//获取待上架列表
    getLockedStockOrders: (id,data) => GET(`stocks/${id}/locked-outbound-orders`, data),//获取锁定库存列表
    getSkuLocations: (data) => GET(`stocks/group-locations`, data), //查看 SKU 库存货位列表
    createMoveOrder: (data) => POST(`stock-transfer-orders`, data), //创建移货单
    getMoveOrderList: (data) => GET(`stock-transfer-orders`, data), //获取移货单列表
    getMoveOrderDetail: (id) => GET(`stock-transfer-orders/${id}`), //获取移货单详情 
    confirmMove: (id,data) => POST(`stock-transfer-orders/${id}/submit`, data), //确认移货单
    forcedCompletion: (id) => POST(`stock-transfer-orders/${id}/force-complete`), //强制完成移货单
    deleteMove: (id) => DEL(`stock-transfer-orders/${id}`), //作废移货单
    createAdjustOrder: (data) => POST(`stock-adjustment-orders`, data), //创建调整单
    getAdjustOrderList: (data) => GET(`stock-adjustment-orders`, data), //获取调整单列表
    createCountOrder: (data) => POST(`stock-countings`, data), //创建盘点单
    saveCountOrder: (id,data) => POST(`stock-countings/${id}/save-result`, data), //保存盘点单
    getCountOrderList: (data) => GET(`stock-countings`, data), //获取盘点单列表
    submitCountOrder: (id,data) => POST(`stock-countings/${id}/submit`,data), //提交盘点单
    getCountOrderDetail: (id) => GET(`stock-countings/${id}`), //获取盘点单详情
    updateCountOrder:(id,date)=> PUT(`stock-countings/${id}`,date),//修改盘点单
    startCount: (id) => POST(`stock-countings/${id}/start`),  //开始盘点
    deleteCount: (id) => DEL(`stock-countings/${id}`), //删除盘点单
    exportCountOrder: (id) => GET(`stock-countings/${id}/export`), //导出盘点单
    printCountOrder: (id) => GET(`stock-countings/${id}/print-label`), //打印盘点单
}