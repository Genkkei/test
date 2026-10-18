import 'server-only'
import { randomBytes } from 'node:crypto'
import { makePassword } from './auth'
import { buildClientProject } from './export'
import { createRepo, githubUser, lastRun, missingScopes, pushProject, repoExists, rerun, setSecrets, type RunState } from './github'
import { openKey, saveTransfer, sealKey, type Transfer } from './transfer'

/** «Перенести»: репозиторий у заказчика, секреты выкладки, код. Дальше выкладывает его GitHub. */
export async function runTransfer(t: Transfer): Promise<Transfer> {
  if (!t.gh || !t.cf) throw new Error('Заказчик ещё не подключил GitHub и Cloudflare')
  if (t.status !== 'waiting' && t.status !== 'failed') throw new Error('Перенос уже выполнен или идёт')
  const ghToken = await openKey(t.gh.token)
  const cfToken = await openKey(t.cf.token)
  const user = await githubUser(ghToken)
  const lacks = missingScopes(user)
  if (lacks.length) throw new Error(`У ключа GitHub нет прав: ${lacks.join(', ')}. Заказчику нужно создать ключ заново по кнопке.`)
  t.status = 'pushing'
  t.message = 'Собираю проект и создаю репозиторий…'
  await saveTransfer(t)
  try {
    const project = await buildClientProject(t.slug)
    let repo = t.repo
    if (!repo) {
      let name = t.slug
      for (let i = 2; await repoExists(ghToken, user.login, name); i++) name = `${t.slug}-site${i > 2 ? `-${i}` : ''}`
      repo = await createRepo(ghToken, name, `Сайт ${t.name}`)
      t.repo = repo
      await saveTransfer(t)
    }
    const password = makePassword()
    await setSecrets(ghToken, repo.owner, repo.repo, {
      CLOUDFLARE_API_TOKEN: cfToken,
      CLOUDFLARE_ACCOUNT_ID: t.cf.accountId,
      ADMIN_PASSWORD: password,
      ADMIN_SECRET: randomBytes(32).toString('hex'),
    })
    // секреты — до кода: push запускает выкладку, и ей нужны ключи
    await pushProject(ghToken, repo.owner, repo.repo, project.files, `Сайт ${t.name}: перенос из конструктора`)
    t.password = await sealKey(password)
    t.siteUrl = t.cf.subdomain ? `https://${t.slug}.${t.cf.subdomain}.workers.dev` : undefined
    t.status = 'deploying'
    t.message = 'Код в GitHub заказчика. Идёт выкладка в его Cloudflare (3–6 минут).'
  } catch (e) {
    t.status = 'failed'
    t.message = e instanceof Error ? e.message : String(e)
  }
  await saveTransfer(t)
  return t
}

/** Проверить выкладку у заказчика. Когда готово — ключи заказчика удаляются из нашей базы. */
export async function refreshTransfer(t: Transfer): Promise<{ t: Transfer; run: RunState | null }> {
  if (t.status !== 'deploying' || !t.gh || !t.repo) return { t, run: null }
  const run = await lastRun(await openKey(t.gh.token), t.repo.owner, t.repo.repo)
  if (run.status === 'completed') {
    if (run.conclusion === 'success') {
      t.status = 'done'
      t.doneAt = new Date().toISOString()
      t.message = 'Сайт работает в Cloudflare заказчика.'
      if (!t.siteUrl && t.cf) t.siteUrl = `https://${t.slug}.<поддомен>.workers.dev`
      // ключи заказчика нам больше не нужны: они остались только в секретах его репозитория
      delete t.gh
      delete t.cf
    } else {
      t.status = 'failed'
      t.message = `Выкладка у заказчика не прошла (${run.conclusion}). Подробности — по ссылке на запуск; после исправления — «Повторить выкладку».`
    }
    await saveTransfer(t)
  }
  return { t, run }
}

export async function retryDeploy(t: Transfer): Promise<Transfer> {
  if (!t.gh || !t.repo) throw new Error('Нет доступа к репозиторию заказчика')
  await rerun(await openKey(t.gh.token), t.repo.owner, t.repo.repo)
  t.status = 'deploying'
  t.message = 'Выкладка запущена заново.'
  await saveTransfer(t)
  return t
}
