// import { i18n } from '@/utils/i18n'
import axios from 'axios'
import baseApi from './baseApi.js'
import nprogress from 'nprogress'
import store from '../store'
import { Notify } from "quasar";

nprogress.configure({ showSpinner: false })

export const ax = axios.create({
  baseURL: baseApi,
  timeout: 120000,
  responseType: 'json',
  headers: {
    post: {
      ['Content-Type']: 'application/json;charset=UTF-8',
    },
    put: {
      ['Content-Type']: 'application/json;charset=UTF-8',
    },
    delete: {
      ['Content-Type']: 'application/json;charset=UTF-8',
    },
  }
})


ax.defaults.withCredentials = false
let currentProcessingCount = 0
function interceptorsRequestSuccess(config) {
  store.commit('updateGlobalBtnLoading', true)
  const token =
    localStorage.getItem('updateToken') === null ? '' : localStorage.getItem('updateToken')
  config.headers.Authorization = `Bearer ${token}` || `Bearer ${store.state.token}`

  config.headers['X-Warehouse-Id'] = localStorage.getItem('warehouseId') || ''
  config.headers.Accept = 'application/json'
  return config
}
function interceptorsRequestError(error) {
  store.commit('updateGlobalBtnLoading', true)
  Notify.create({
    message: 'Service Error',
    color: 'negative',
  })
  return Promise.reject(error)
}

function interceptorsResponse(config) {
  --currentProcessingCount
  store.commit('updateGlobalBtnLoading', false)
  if (config.data && !config.data.success) {
    if (config.data.code === 1001) {
      store.commit('DESTROY_TOKEN')
      Notify.create({
        message: '重新登录',
        color: 'negative',
      })
    }
  } else if (
    config.status === 200 &&
    config.data &&
    config.data.success &&
    config.config.method !== "get"
    && !config.config.notShowNotify
  ) {
    Notify.create({
      message: config.data.message,
      color: 'positive',
    })
  } else if (config.config.responseType === 'blob') {
    let str = config.headers['content-disposition']
      .match(/=(.*)$/)[1]
      .split('; ')[0]
      .split('.')[0]
    config.data.filename = str
  }
  if (!config.status) {
    Notify.create({
      message: config.data.message,
      color: 'negative',
    })
  }

  return config.data
}

function interceptorsResponseError(error) {
  const { response } = error
  let msg
  // nprogress.done()
  // currentProcessingCount = 0
  store.commit('updateGlobalBtnLoading', false)
  if (response && response.status === 401) {
    store.commit('DESTROY_TOKEN')
  } else if (response && response.status === 500 && response.code === 10500) {
    msg = response.data.message || 'Service Error'
  } else {
    msg = response.data.message
  }
  if (msg) {
    Notify.create({
      message: msg,
      color: 'negative',
    })
  }
  return Promise.reject(response && response.data)
}
let $file = axios.create({
  baseURL: baseApi,
  headers: {
    'Content-Type': 'application/json'
  },
  transformRequest: [
    function (params) {
      return params
    }
  ]
})
$file.interceptors.request.use(interceptorsRequestSuccess, interceptorsRequestError)
$file.interceptors.response.use(interceptorsResponse, interceptorsResponseError)

ax.interceptors.request.use(interceptorsRequestSuccess, interceptorsRequestError)
ax.interceptors.response.use(interceptorsResponse, interceptorsResponseError)

export function GET(url, params, config) {
  return ax.get(url, { params, ...config })
}

export function POST(url, data, config) {
  return ax.post(url, data, config)
}

export function PUT(url, data, config) {
  return ax.put(url, data, config)
}

export function PATCH(url, data, config) {
  return ax.patch(url, data, config)
}

export function DEL(url, data, config) {
  return ax.delete(url, { data, ...config })
}
export { $file }

