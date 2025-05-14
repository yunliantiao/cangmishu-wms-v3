import store from '@/store'
import EnTransform from '@/i18n/en.json'
import ZhTransform from '@/i18n/zh.json'
const t = (key, value) => {
  let obj = {
    zh_CN: ZhTransform,
    en: EnTransform
  }
  const transformStr = obj[store.state.language][key] || key
  if (!value) {
    return transformStr
  } else {
    let message = transformStr.replace(/{\s+/g, '{')
    message = message.replace(/\s+}/g, '}')
    const token = parser(message)
    token.forEach(item => {
      const reg = new RegExp(`{${item}}`, 'g')
      message = message.replace(reg, value[item])
    })
    return message
  }
  return key
}

const parser = (message) => {
  const token = []
  let position = 0
  while (position < message.length) {
    let char = message[position++]
    if (char === '{') {
      let sub = ''
      char = message[position++]
      while (char !== undefined && char !== '}') {
        sub += char
        char = message[position++]
      }
      token.push(sub)
    }
  }
  return token
}

export default t