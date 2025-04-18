import { POST, GET, PUT } from "./config.js";
export default {
  createCustomer: (data) => POST("customers", data), // 创建客户
  getCustomerList: (data) => GET("customers", data), // 获取客户列表
  disableCustomer: (id) => PUT(`customers/${id}/deactivate`), // 禁用客户
  updateCustomer: (id, data) => PUT(`customers/${id}`, data), // 更新客户
  enableCustomer: (id) => PUT(`customers/${id}/activate`), // 启用客户
  getCustomerAll: () => GET(`customers/all`), // 获取所有客户
  getCurrentDomain: () => GET(`warehouses/current-domain`), // 获取当前域名
};