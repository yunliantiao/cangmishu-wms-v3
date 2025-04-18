import { GET } from "./config.js";
export default {
    getInventoryList: (data) => GET("stocks", data),
    getStockStatement: (data) => GET("stocks/logs", data),//库存流水
    getStockDetail: (id,data) => GET(`stocks/${id}/in-transit-inbound-orders`, data),//获取在途入库单
    getPendingInboundOrders: (id,data) => GET(`stocks/${id}/pending-inbound-orders`, data),//获取待收货列表
    getPendingShelfOrders: (id,data) => GET(`stocks/${id}/pending-shelf-inbound-orders`, data),//获取待上架列表
    getLockedStockOrders: (id,data) => GET(`stocks/${id}/locked-outbound-orders`, data),//获取锁定库存列表
}