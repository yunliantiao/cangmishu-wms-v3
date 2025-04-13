import { POST, GET, $file,DEL } from "./config.js";
export default {
    resetPass: (data) => POST("auth/register", data), // 注册
    login: (data) => POST("auth/login", data), // 登录
    logout: (data) => DEL("auth/logout", data), // 退出
}