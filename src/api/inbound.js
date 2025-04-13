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
}