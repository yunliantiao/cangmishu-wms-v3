//商品接口
import { GET, POST, PUT, PATCH, DEL } from "./config";
export default {
    getSkuList: (data) => GET("skus", data), // 获取SKU列表
    getProductList: (data) => GET("products", data), // 获取商品列表
    getProduct: (id) => GET(`products/${id}`), // 获取商品详情
    updateProduct: (id, data) => PUT(`products/${id}`, data), // 更新商品
    customsTypes: () => GET("customs-types"), // 商品报关属性列表
    printSku: (data) => POST("products/labels/generate", data), // 打印 SKU 标签
    getStocksLocations: (data) => GET("stocks-locations", data), // 获取库存地点列表


    // 标记
    getTagList: (data) => GET("product-tags", data), // 获取标记列表
    addTag: (data) => POST("product-tags", data), // 新增标记
    updateTag: (id, data) => PUT(`product-tags/${id}`, data), // 更新标记
    deleteTag: (id) => DEL(`product-tags/${id}`), // 删除标记



    // 包材
    getMaterialsList: (data) => GET("packaging-materials", data), // 获取包材列表

    createMaterial: (data) => POST("packaging-materials", data), // 新增包材

    updateMaterial: (id, data) => PUT("packaging-materials/" + id, data), // 编辑包材

    delMaterial: (id, data) => DEL("packaging-materials/" + id, data), // 删除包材


}