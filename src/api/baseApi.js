const baseUrl = location.hostname
let baseApi = 'https://test-api.cangmishu.com/api/wms/'
let baseApiNotAdmin = 'https://test-api.cangmishu.com/api/wms/'
let basePcd = 'https://test-api.cangmishu.com'
// if (baseUrl == '127.0.0.1' || baseUrl == 'localhost') {
//     baseApi = 'https://test-api.cangmishu.com/api/wms/'
//     baseApiNotAdmin = 'https://test-api.cangmishu.com/api/wms/'
//     basePcd = 'https://test-api.cangmishu.com'
// } 
export { baseApiNotAdmin, basePcd }
export default baseApi
