import 'server-only'
import { sealedBox } from './seal'
import type { ProjectFile } from './export'

/*
 * GitHub получателя: репозиторий, секреты для выкладки и код одним коммитом.
 * Токен — OAuth или classic с правами repo + workflow (без workflow GitHub не примет .github/workflows).
 */

const API = 'https://api.github.com'

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function gh<T = unknown>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'atlas-transfer', ...(init.body ? { 'content-type': 'application/json' } : {}), ...(init.headers || {}) },
  })
  if (res.status === 204) return undefined as T
  const data = (await res.json().catch(() => null)) as (T & { message?: string }) | null
  if (!res.ok) throw new GitHubError(data?.message || `GitHub ответил ${res.status}`, res.status)
  return data as T
}

export type GitHubUser = { login: string; name: string | null; scopes: string[] }

/** Кто владелец токена и хватает ли прав. */
export async function githubUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${API}/user`, { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'atlas-transfer' } })
  if (!res.ok) throw new GitHubError(res.status === 401 ? 'GitHub не принял ключ: он неверный или истёк.' : `GitHub ответил ${res.status}`, res.status)
  const u = (await res.json()) as { login: string; name: string | null }
  // у classic и OAuth-токенов права приходят заголовком; у fine-grained его нет — проверим при создании репозитория
  const scopes = (res.headers.get('x-oauth-scopes') || '').split(',').map((s) => s.trim()).filter(Boolean)
  return { login: u.login, name: u.name, scopes }
}

export function missingScopes(u: GitHubUser): string[] {
  if (!u.scopes.length) return []
  return ['repo', 'workflow'].filter((s) => !u.scopes.includes(s))
}

export async function createRepo(token: string, name: string, description: string): Promise<{ owner: string; repo: string; url: string }> {
  const r = await gh<{ name: string; owner: { login: string }; html_url: string }>(token, '/user/repos', {
    method: 'POST',
    body: JSON.stringify({ name, description, private: true, auto_init: true }),
  })
  return { owner: r.owner.login, repo: r.name, url: r.html_url }
}

export async function repoExists(token: string, owner: string, repo: string): Promise<boolean> {
  try {
    await gh(token, `/repos/${owner}/${repo}`)
    return true
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return false
    throw e
  }
}

/** Секреты Actions: шифруются ключом репозитория (crypto_box_seal) — значения видит только GitHub. */
export async function setSecrets(token: string, owner: string, repo: string, secrets: Record<string, string>): Promise<void> {
  const key = await gh<{ key: string; key_id: string }>(token, `/repos/${owner}/${repo}/actions/secrets/public-key`)
  for (const [name, value] of Object.entries(secrets)) {
    await gh(token, `/repos/${owner}/${repo}/actions/secrets/${name}`, { method: 'PUT', body: JSON.stringify({ encrypted_value: sealedBox(value, key.key), key_id: key.key_id }) })
  }
}

/** Весь проект — одним коммитом поверх ветки main: текст — прямо в дереве, двоичные файлы — отдельными blob. */
export async function pushProject(token: string, owner: string, repo: string, files: Record<string, ProjectFile>, message: string): Promise<string> {
  const base = `/repos/${owner}/${repo}`
  let head: string | null = null
  for (let i = 0; i < 5 && !head; i++) {
    try {
      head = (await gh<{ object: { sha: string } }>(token, `${base}/git/ref/heads/main`)).object.sha
    } catch (e) {
      // сразу после создания репозитория ветка появляется не мгновенно
      if (i === 4) throw e
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
  const tree: { path: string; mode: '100644'; type: 'blob'; content?: string; sha?: string }[] = []
  for (const [path, v] of Object.entries(files)) {
    if (typeof v === 'string') tree.push({ path, mode: '100644', type: 'blob', content: v })
    else {
      const blob = await gh<{ sha: string }>(token, `${base}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: v.b64, encoding: 'base64' }) })
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha })
    }
  }
  const t = await gh<{ sha: string }>(token, `${base}/git/trees`, { method: 'POST', body: JSON.stringify({ tree }) })
  const c = await gh<{ sha: string }>(token, `${base}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: head ? [head] : [] }) })
  await gh(token, `${base}/git/refs/heads/main`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha, force: true }) })
  return c.sha
}

export type RunState = { status: 'none' | 'queued' | 'in_progress' | 'completed'; conclusion: string | null; url: string | null; step: string | null }

/** Последний запуск выкладки и шаг, на котором он сейчас. */
export async function lastRun(token: string, owner: string, repo: string): Promise<RunState> {
  const runs = await gh<{ workflow_runs: { id: number; status: RunState['status']; conclusion: string | null; html_url: string }[] }>(token, `/repos/${owner}/${repo}/actions/runs?per_page=1`)
  const r = runs.workflow_runs[0]
  if (!r) return { status: 'none', conclusion: null, url: null, step: null }
  let step: string | null = null
  try {
    const jobs = await gh<{ jobs: { steps?: { name: string; status: string }[] }[] }>(token, `/repos/${owner}/${repo}/actions/runs/${r.id}/jobs`)
    step = jobs.jobs[0]?.steps?.find((s) => s.status === 'in_progress')?.name ?? null
  } catch {}
  return { status: r.status, conclusion: r.conclusion, url: r.html_url, step }
}

/** Запустить выкладку ещё раз (кнопка «Повторить»). */
export async function rerun(token: string, owner: string, repo: string): Promise<void> {
  await gh(token, `/repos/${owner}/${repo}/actions/workflows/deploy.yml/dispatches`, { method: 'POST', body: JSON.stringify({ ref: 'main' }) })
}

/** Вход через GitHub (OAuth-приложение владельца конструктора). Без GITHUB_CLIENT_ID — только вставка ключа. */
export async function oauthConfigured(): Promise<boolean> {
  const i = await (await import('./settings')).integrations()
  return !!(i.githubClientId && i.githubClientSecret)
}

export async function exchangeCode(code: string): Promise<string> {
  const i = await (await import('./settings')).integrations()
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: i.githubClientId, client_secret: i.githubClientSecret, code }),
  })
  const data = (await res.json().catch(() => null)) as { access_token?: string; error_description?: string } | null
  if (!data?.access_token) throw new Error(data?.error_description || 'GitHub не выдал доступ')
  return data.access_token
}
