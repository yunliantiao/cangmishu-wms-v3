/**
 * @author hdh
 * @description 获取文件
 * @param {Number} limit 文件大小限制，默认为2MB
 * @returns {Promise}
 */
function getFile({
  limit,
  fileType,
  isActive
}) {
  !limit && (limit = 2)
  return new Promise((resolve, reject) => {
    limit = 1024
    let
      fileEle = document.createElement('input'),
      event = new MouseEvent('click')
    fileEle.type = "file"
    // 是否选择文件夹  true选择
    fileEle.webkitdirectory = isActive
    fileEle.accept = fileType || ""
    fileEle.style.display = 'none'
    fileEle.addEventListener('change', () => {
      const files = fileEle.files[0]
      const raw = files
      if (isActive) {
        resolve(fileEle.files)
      } else {
        files.size / (1024 ** 2) > limit
          ? reject(`文件不能超过${limit}MB!`)
          : resolve(raw)
      }
      document.body.removeChild(fileEle)
    })
    fileEle.dispatchEvent(event)
    document.body.appendChild(fileEle)
  })
}

export default getFile