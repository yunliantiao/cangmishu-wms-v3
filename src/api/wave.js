import { GET, POST, DEL } from "./config.js";

export default {
  getWaveList: (data) => GET("waves", data), // 获取出库单

  previewWaveAndCount: (data) => POST("waves/count-preview", data, { notShowNotify: true }),

  // 创建波次 获取sku*数量
  getSkuNumList: (data) => GET("waves/skus-qty", data),

  // 预览波次列表
  previewWave: (data) => POST("waves/preview", data, { notShowNotify: true }),

  // 创建波次
  createWave: (data) => POST("waves", data),

  // 批量分配拣货员
  batchAssignPickers: (data) => POST("waves/batch-assign-pickers", data),

  // 打印单个波次
  printWave: (id) => GET(`waves/${id}/print-label`),

  // 将波次设置为已打印
  waveUpdateIsPrint: (id) => POST(`waves/${id}/set-print-pick`),

  // 取消波次打印
  waveCancelIsPrint: (id) => POST(`waves/${id}/cancel-print-pick`),

  // 作废批次
  abandonWave: (data) => DEL('waves/batch-cancel', data),

  // 导出
  exportWave: (data) => POST('waves/export', data),

  // 波次详情
  waveInfo: (id, params) => GET(`waves/${id}`, params),

  // 批量打印拣货单
  batchPrintPicking: (data) => POST('waves/print-labels', data),

  // 批量设置为已打印
  batchSetIsPrint: (data) => POST('waves/set-print-pick', data),

  // 获取波次日志
  waveLogs: (id) => GET(`waves/${id}/logs`),

  // 标记异常
  removePackage: (id, params) => DEL(`waves/${id}/remove-exception-packages`, params),
}
