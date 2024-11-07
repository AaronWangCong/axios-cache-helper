import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'

const __dirname = fileURLToPath(new URL('..', import.meta.url))

async function main() {
  /** 选择版本号 */
  const versionRes = await prompts([
    {
      type: 'select',
      name: 'version',
      message: '请选择发版类型（默认值：🐛 patch 小版本)',
      choices: [
        { title: '🐛 patch 小版本', value: 'release-patch', selected: true },
        { title: '✨ minor 中版本', value: 'release-minor' },
        { title: '🚀 major 大版本', value: 'release-major' },
      ],
    },
  ])

  if (!versionRes.version)
    return
  /** 修改版本 */
  console.log('👉️ 开始修改版本', versionRes.version)
  execSync(`pnpm run ${versionRes.version}`)
  const rootPkgfile = readFileSync(path.resolve(__dirname, './package.json'))
  const rootPkgJson = JSON.parse(rootPkgfile.toString())
  const newVersion = rootPkgJson.version

  /** 生成制品 */
  execSync('git add -A ')
  // execSync(`git commit -am "🎁 build: compile ${newVersion}"`)
  execSync(`git tag -a v${newVersion} -am "🚀 chore(release): ${newVersion}"`)
  console.log('🤜 committing 已修改')

  /** 发布推送 */
  execSync('pnpm run push')
  execSync('git push --follow-tags')
  console.log('√👏  npm发布成功')
}

main()
