import { GET, POST } from "./config.js";

export default {
  getStaffList: (data) => GET("users", data),
}
