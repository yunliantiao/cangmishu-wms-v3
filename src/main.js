import { createApp } from 'vue'
import App from './App.vue'
import './assets/global.scss'
import router from './router'
import store from './store'
import './style.css'
import Message from './utils/message'
import trans from '@/i18n';

// Import Quasar
import { Dialog, Notify, Quasar } from 'quasar'

// Import Quasar CSS
import 'quasar/dist/quasar.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App)
store.dispatch('initApp')
store.dispatch('initLoginAfterInfo')

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  }, // import Quasar plugins and add here
  config: {
    // optional quasar config
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    },
    brand: {
      primary: '#5745C5',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037',
      green: '#00b42a',
      gray: '#dcdfe6'
    }
  }
}).use(router).use(store)

app.mount('#app')

app.config.globalProperties.$copy = async (text) => {
  await navigator.clipboard.writeText(text)
  Message.successMessage(trans('复制成功'))
}
app.config.globalProperties.trans = trans
