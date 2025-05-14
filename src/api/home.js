import { GET } from './config.js';
export default {
  getHomeReport: (data) => GET('reports/home-report', data), // 首页统计数据
  getHomeChart: (data) => GET('reports/home-chart', data), // 首页图表数据
};
