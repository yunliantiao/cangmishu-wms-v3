import { GET } from "./config.js";
export default {
    getInventoryList: (data) => GET("stocks", data),
    getStockStatement: (data) => GET("stocks/logs", data),//库存流水
}