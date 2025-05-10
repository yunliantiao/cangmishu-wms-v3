import { GET, POST } from "./config.js";

export default {
  getStaffList: (data) => GET("users", data),

  // 获取成员列表不带分页
  getStaffListNoPage: (data) => GET("users/all", data),
}
