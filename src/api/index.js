import { POST, GET, $file, DEL } from "./config.js";
export default {
    resetPass: (data) => POST("auth/register", data), // 注册
    login: (data) => POST("auth/login", data), // 登录
    logout: (data) => DEL("auth/logout", data), // 退出
    getCountries: () => GET("countries"), // 国家/地区列表
    getTimezones: () => GET("warehouses/timezones"), // 时区列表

    // ds跳转wms 拿到临时token后 调获取登录信息
    quickLogin: (data) => POST('auth/auto-login', data),


    //上传文件
    uploadFile: (data) => $file.post('uploads', data),

    // 获取货币列表
    getCurrencies: () => GET("currencies"),
}