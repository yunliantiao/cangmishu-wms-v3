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