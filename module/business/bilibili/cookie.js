import { Config, Networks } from '#components'
import { BiLiBiLiAPI, bilidata as Bilidata, wbi_sign, getCorrespondPath } from '#bilibili'
import { JSDOM } from 'jsdom'

export async function checkuser (BASEURL) {
  if (Config.bilibilick == '') return { QUERY: '&platform=html5', STATUS: '!isLogin' }
  const logininfo = await new Networks({ url: BiLiBiLiAPI.LOGIN_INFO(), headers: { Cookie: Config.bilibilick } }).getData()
  const sign = await wbi_sign(BASEURL)

  const qn = [6, 16, 32, 64, 74, 80, 112, 116, 120, 125, 126, 127]
  let isvip
  logininfo.data.vipStatus === 1 ? (isvip = true) : (isvip = false)
  if (isvip) {
    return { QUERY: `&fnval=16&fourk=1&${sign}`, STATUS: 'isLogin', isvip }
  } else return { QUERY: `&qn=${qn[3]}&fnval=16`, STATUS: 'isLogin', isvip }
}

export async function refresh_token () {
  const csrfMatch = Config.bilibilick.match(/bili_jct=([^;]+)/)
  const csrf = csrfMatch ? csrfMatch[1] : null
  const result = await new Bilidata('检查是否需要刷新').GetData(csrf)

  if (result.data.refresh) return

  const timestamp = result.data.timestamp
  const CorrespondPath = await getCorrespondPath(timestamp)
  const html = await new Bilidata('refresh_csrf').GetData(CorrespondPath)

  /** 提取 refresh_csrf */
  const { document } = new JSDOM(html).window
  const refresh_csrf = document.querySelector('div[id="1-name"]').textContent

  const refreshdata = await new Bilidata('刷新Cookie').GetData({
    csrf,
    refresh_csrf,
    source: 'main_web',
    refresh_token: Config.bilibilirefresh_token
  })
  Config.bilibilirefresh_token = refreshdata.data.refresh_token
}
