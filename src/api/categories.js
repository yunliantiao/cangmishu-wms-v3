import { POST, GET, PUT, DEL } from "./config.js";

export default {
    getCategories: () => GET("categories"),
    createCategory: (data) => POST("categories", data),
    updateCategory: (id, data) => PUT(`categories/${id}`, data),
    deleteCategory: (id) => DEL(`categories/${id}`),
    getCategoryTree: () => GET("categories/tree"),
}