import { Notify } from 'quasar'
export const loadonDemand = path => {
  return () => import(`../views/${path}.vue`)
}

export const copyText = (text) => {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  Notify.create({
    message: '复制成功',
    color: 'positive',
    icon: 'check',
    position: 'top',
  });
}

/**
 * 获取今天的年月日，格式为YYYY-MM-DD
 * @returns {string} 今天的日期，格式为YYYY-MM-DD
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 获取前三十天的年月日，格式为YYYY-MM-DD
 * @returns {string} 前三十天的日期，格式为YYYY-MM-DD
 */
export const getThirtyDaysAgoDate = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const year = thirtyDaysAgo.getFullYear();
  const month = String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0');
  const day = String(thirtyDaysAgo.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

