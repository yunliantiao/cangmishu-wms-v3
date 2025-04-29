import { GET, POST } from "./config.js";

export default {
    getOutboundOrder: (data) => GET("orders", data), // 获取出库单
    getOutboundOrderPrint: (id, data) => GET(`packages/${id}/print-shipping-label`, data), // 获取出库单打印
    signExpressSheet: (id, data) => POST(`packages/${id}/print-shipping-label`, data), // 包裹标记打印物流面单
    getOutboundOrderPicking: (id) => GET(`orders/${id}/pick-label`), // 获取出库单拣货单
    shipments: (id, data) => POST(`packages/${id}/ship`, data), // 发货
    getShipments: (data) => GET(`orders/simple-prints`, data), // 获取发货单
    getOutboundOrderPickingResult: (id, data) => POST(`orders/${id}/print-pick-label`, data), // 包裹标记打印拣货单
    setPendingShipment: (data) => POST(`packages/batch-print-flags`, data), // 批量设置待发货

    getOrderInfo: (id) => GET(`orders/${id}`), // 获取订单详情
}