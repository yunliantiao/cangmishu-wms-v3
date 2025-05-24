import { POST, GET } from "./config.js";
export default {
    getWarehouseWarrant: (data) => GET("inbound", data), // 入库单
    getSign: (data) => POST("inbound/sign", data), // 签收
    inboundDdSign: (id) => POST(`inbound/${id}/sign`), // 签收
    getReceive: (data) => GET("inbound/receive", data), // 收货
    confirmReceive: (id, data) => POST(`inbound/${id}/receive`, data), // 确认收货
    scanShelfNumber: (data) => GET("inbound/shelf", data), // 扫描单号获得上架详细
    confirmShelfSkus: (id, data) => POST(`inbound/${id}/shelf-skus`, data), // 上架按 SKU
    confirmShelfBoxes: (id, data) => POST(`inbound/${id}/shelf-boxes`, data), // 上架按箱
    updateNewProducts: (id, data) => POST(`inbound/${id}/update-new-products`, data), // 更新入库新品
    getBoxes: (id) => GET(`inbound/${id}/boxes`), // 获取箱子信息
    getSku: (id) => GET(`inbound/${id}/skus`), // 获取SKU信息
    getWarehouseWarrantDetail: (id) => GET(`inbound/${id}`),  // 获取入库单详情
    inboundBoxLabel: (id, data) => POST(`inbound/${id}/boxes/label`, data, { responseType: "blob" }), // 打印箱唛
    inboundPrintBox: (id) => GET(`inbound/${id}/boxes/label`),   // 打印入库单按箱打印
    inboundPrintSku: (id) => GET(`inbound/${id}/skus/label`),   // 打印入库单按箱打印
    inboundPrintShelf: (id) => GET(`inbound/${id}/shelf/label`), // 打印上架单


    // 强制完结
    inboundFaceClose: (id) => POST(`inbound/${id}/force-complete`),

    // 入库单统计
    getInboundStatistics: (data) => GET(`inbound/count`, data),
}