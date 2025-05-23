import { DEL, GET, POST, PUT } from './config.js';

export default {
  // 物流商
  getProviderList: (data) => GET('logistics/providers', data), // 获取物流商列表
  getSystemProviders: (data) => GET('logistics/system-providers', data), // 获取系统内置物流商
  addProvider: (data) => POST('logistics/providers', data), // 添加物流商
  editProvider: (id, data) => PUT('logistics/providers/' + id, data), // 修改物流商
  delProvider: (id) => DEL('logistics/providers/' + id), // 删除物流商
  getProviderInfo: (providerId) => GET(`logistics/providers/${providerId}`), // 物流商详情
  // 详情页面-物流渠道
  getProviderChannels: (providerId, data) => GET(`logistics/providers/${providerId}/channels`, data), // 获取物流商渠道
  updateChannelStatus: (providerId, data) => PUT(`logistics/providers/${providerId}/channels/batch-toggle`, data), // 修改物流渠道状态
  updateChannelInfo: (providerId, channelId, data) =>
    PUT(`logistics/providers/${providerId}/channels/${channelId}`, data), // 修改物流渠道信息

  // 物流渠道管理
  getChannelList: (data) => GET('logistics/providers/channels', data), // todo 获取物流商渠道全部列表 (带分页)
  getChannelAllList: (data) => GET('logistics/providers/all-channels', data), // todo 获取物流商渠道全部列表 (无分页,带过滤)
  moveChannelGroup: (providerId, channelId, data) =>
    POST(`logistics/providers/${providerId}/channels/${channelId}/move-to-group`, data), // 移入物流组
  removeChannelGroup: (providerId, channelId) =>
    DEL(`logistics/providers/${providerId}/channels/${channelId}/remove-to-group`), // 把渠道删除物流组

  // 客户物流渠道管理

  // TODO 物流规则
  // 燃油规则
  getFuelList: (data) => GET(`fuel-surcharges`, data), // 燃油列表
  addFuel: (data) => POST(`fuel-surcharges`, data), // 添加燃油
  updateFuel: (id, data) => PUT(`fuel-surcharges/${id}`, data), // 修改燃油
  delFuel: (id) => DEL(`fuel-surcharges/${id}`), // 删除燃油
  getFuelInfo: (id) => GET(`fuel-surcharges/${id}`), // 燃油详情

  // 偏远地区
  getRemoteList: (data) => GET(`remote-areas`, data), // 偏远地区列表
  addRemote: (data) => POST(`remote-areas`, data), // 添加偏远地区
  updateRemote: (id, data) => PUT(`remote-areas/${id}`, data), // 修改偏远地区
  delRemote: (id) => DEL(`remote-areas/${id}`), // 删除偏远地区
  getRemoteInfo: (id) => GET(`remote-areas/${id}`), // 偏远地区详情

  // 分区规则
  getZonesList: (data) => GET(`shipping-zones`, data), // 分区列表
  addZones: (data) => POST(`shipping-zones`, data), // 添加分区
  updateZones: (id, data) => PUT(`shipping-zones/${id}`, data), // 修改分区
  delZones: (id) => DEL(`shipping-zones/${id}`), // 删除分区
  getZonesInfo: (id) => GET(`shipping-zones/${id}`), // 分区详情

  // 物流组
  getGroupList: (data) => GET(`logistics/groups`, data), // 物流组列表
  addGroup: (data) => POST(`logistics/groups`, data), // 添加物流组
  updateGroup: (id, data) => PUT(`logistics/groups/${id}`, data), // 修改物流组
  delGroup: (id) => DEL(`logistics/groups/${id}`), // 删除物流组
  getGroupInfo: (id) => GET(`logistics/groups/${id}`), // 物流组详情

  // todo 物流计费
  // 物流计费策略
  getStrategyList: (data) => GET(`shipping-fee-strategies`, data), // 策略列表
  addStrategy: (data) => POST(`shipping-fee-strategies`, data), // 添加策略
  updateStrategy: (id, data) => PUT(`shipping-fee-strategies/${id}`, data), // 修改策略
  delStrategy: (id) => DEL(`shipping-fee-strategies/${id}`), // 删除策略
  getStrategyInfo: (id) => GET(`shipping-fee-strategies/${id}`), // 策略详情

  // 特殊计费
  // getSpecialList: (data) => GET(`logistics/special-rules`, data), // 特殊计费列表
  // addSpecial: (data) => POST(`logistics/special-rules`, data), // 添加特殊计费
  // updateSpecial: (id, data) => PUT(`logistics/special-rules/${id}`, data), // 修改特殊计费
  // delSpecial: (id) => DEL(`logistics/special-rules/${id}`), // 删除特殊计费
  // getSpecialInfo: (id) => GET(`logistics/special-rules/${id}`), // 特殊计费详情

  getAllLogistics: (data) => GET(`logistics/providers/all-channels`, data), // 获取所有物流
};
