# AI 码池

公开分享 Muse 和 Cue 邀请码。Next.js App Router + React + Tailwind CSS + Server Actions，数据存 Supabase。

## 数据模型

Supabase `codes` 表字段：`tool, code, reward, valid_days, submitted_at, expires_at, status, report_count`（另有 `id` 主键与 `created_at`）。

接口行为：

- 列表只返回 `status = 'active'` 且未过期（`expires_at > now()`）的记录；
- `report_count >= 3` 自动隐藏；
- `mark_used_up` 点一次立即把 `status` 置为 `used_up`，列表不再返回。

## 首次部署（Supabase）

1. 在 Supabase 新建项目 `ai-code-pool`。
2. 打开 SQL Editor，执行 [`supabase/schema.sql`](supabase/schema.sql)（建表、索引、举报自增 RPC、开启 RLS）。
3. 迁移本地旧数据（可选）：

   ```sh
   node scripts/migrate.mjs
   ```

   或在空库执行 [`supabase/seed.sql`](supabase/seed.sql) 预置两条种子数据。

4. 复制 Supabase 控制台 → Project Settings → API 里的 **Project URL** 和 **service_role key**，填入 `.env.local`：

   ```sh
   SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

   这两个变量只在服务端使用，`service_role` 绕过 RLS，用于无登录的公开码池读写；不会暴露到浏览器。`.env.local` 已被 `.gitignore` 忽略。

## 本地启动

需要 Node.js 24 或更新版本。

```sh
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。生产模式用 `npm run build` 构建，再 `npm start`。

## Netlify 部署

推 GitHub 后在 Netlify 新建站点（自动识别 Next.js）。在 Netlify 的环境变量里配置同名变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

不要提交 `.env.local`。构建命令 `npm run build`，发布目录 `.next`（Netlify 的 Next.js 运行时通常自动处理）。
