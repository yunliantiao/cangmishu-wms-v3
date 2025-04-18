import { createApp } from 'vue'
import './style.css'
import router from './router'
import store from './store'
import App from './App.vue'

// Import Quasar
import { Quasar, Notify, Dialog } from 'quasar'

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
      primary: '#001f4d',
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
