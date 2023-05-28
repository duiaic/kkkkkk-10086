import fs from 'node:fs'
const _path = process.cwd()

const files = fs.readdirSync('./plugins/kkkkkk-10086/apps').filter(file => file.endsWith('.js'))
const configFile = `${_path}/plugins/kkkkkk-10086/config/config.json`
const configExampleFile = `${_path}/plugins/kkkkkk-10086/config/config.example.json`
fs.access(configFile, fs.constants.F_OK, (err) => {
    if (err) {
        fs.copyFile(configExampleFile, configFile, (err) => {
            if (err) throw err
            logger.info(logger.green('检测到kkkkkk-10086配置文件不存在，已自动创建 config.json created success'));
        })
    }
})


let ret = []

logger.info('------------------------------------')
logger.info(logger.green('kkkkkk-10086加载成功'))
logger.info('------------------------------------')



files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
