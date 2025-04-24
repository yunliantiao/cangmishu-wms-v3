import { POST, GET, PUT, DEL,$file } from "./config.js";
export default {
    addShelfSpec: (data) => POST("warehouses/shelf-specs", data), // 添加货架规格
    getShelfSpecList: () => GET("warehouses/shelf-specs"), // 获取货架规格列表
    updateShelfSpec: (id, data) => PUT(`warehouses/shelf-specs/${id}`, data), // 更新货架规格
    deleteShelfSpec: (id) => DEL(`warehouses/shelf-specs/${id}`), // 删除货架规格
    addGoodsArea: (data) => POST("warehouses/areas", data), // 添加货区
    getGoodsAreaList: (data) => GET("warehouses/areas", data), // 获取货区列表
    updateGoodsArea: (id, data) => PUT(`warehouses/areas/${id}`, data), // 更新货区
    deleteGoodsArea: (id) => DEL(`warehouses/areas/${id}`), // 删除货区
    addShelfLocation: (data) => POST("warehouses/locations", data), // 添加货位
    getShelfLocationList: (data) => GET("warehouses/locations", data), // 获取货位列表
    updateShelfLocation: (id, data) => PUT(`warehouses/locations/${id}`, data), // 更新货位
    deleteShelfLocation: (id) => DEL(`warehouses/locations/${id}`), // 删除货位
    batchCreateShelfLocation: (data) => POST("warehouses/locations/batch", data), // 批量创建货位
    importTemplates: (data) => $file.post("warehouses/locations/import", data, { responseType: 'blob' }), // 导入货位
    downloadTemplate: (data) => GET("templates", data,{ responseType: 'blob' }), // 下载模版
    getPrintLabelTemplateList: (data) => GET("warehouses/locations/labels/templates", data), // 打印标签模板
    productsLabels: (data) => POST("warehouses/locations/labels/generate", data), // 打印标签
    exportLocations: (data) => POST("warehouses/locations/export", data), // 导出货架位
    getStocksLocations:(data)=> GET("stocks-locations", data), //货位库存列表
}