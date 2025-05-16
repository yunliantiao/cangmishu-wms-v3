const baseUrl = location.hostname
let baseApi = 'https://api.dsclerk.com/api/wms/'
let baseApiNotAdmin = 'https://api.dsclerk.com/api/wms/'
let basePcd = 'https://api.dsclerk.com'

if (['test-wms.cangmishu.com', 'localhost', '127.0.0.1'].includes(baseUrl)) {
  baseApi = 'https://test-api.cangmishu.com/api/wms/'
  baseApiNotAdmin = 'https://test-api.cangmishu.com/api/wms/'
  basePcd = 'https://test-api.cangmishu.com'
}
export { baseApiNotAdmin, basePcd }
export default baseApi
