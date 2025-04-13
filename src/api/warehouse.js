import { GET, POST, PUT, PATCH, DEL } from "./config";

export default {
    // 仓库
    createWarehouse: (data) => POST("warehouses", data), // 创建仓库
    getWarehouseList: (data) => GET("warehouses", data), // 获取仓库列表
    updateWarehouse: (id, data) => PUT(`warehouses/${id}`, data), // 更新仓库
    toggleInbound: (id) => PUT(`warehouses/${id}/toggle-inbound`), // 暂停收货
    toggleOrder: (id) => PUT(`warehouses/${id}/toggle-order`), // 暂停接单
    checkDomain: (data) => GET(`warehouses/check-domain`, data), // 验证域名是否可用
}