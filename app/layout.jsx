import Link from 'next/link';
import { Icon } from '../components/Icons';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://ai-code-pool.netlify.app'),
  title: { default: 'AI 码池 | 免费 Muse 邀请码与 Cue 邀请码共享', template: '%s · AI 码池' },
  description: '免费公开分享 Muse 和 Cue 邀请码。Muse 新用户 48 小时内兑换，双方各得 10 亿 Muse 词元；Cue 免费内测邀请码，先到先得。匿名提交，即发即公开，用完即下架。',
  keywords: ['Muse 邀请码', 'Muse invite code', 'Cue 邀请码', 'Cue invite code', 'Manus Cue 邀请码', 'AI 邀请码', '免费邀请码'],
  alternates: { canonical: 'https://ai-code-pool.netlify.app' },
  verification: { google: 'nRqXudsFPkaNJPqWD7YQTBtOEaBPVAvAl2M1WwtbyRw' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://ai-code-pool.netlify.app',
    siteName: 'AI 码池',
    title: 'AI 码池 | 免费 Muse 邀请码与 Cue 邀请码共享',
    description: '免费公开分享 Muse 和 Cue 邀请码。Muse 新用户 48 小时内兑换，双方各得 10 亿 Muse 词元；Cue 免费内测邀请码，先到先得。',
  },
  twitter: {
    card: 'summary',
    title: 'AI 码池 | 免费 Muse 邀请码与 Cue 邀请码共享',
    description: '免费公开分享 Muse 和 Cue 邀请码。Muse 新用户 48 小时内兑换，双方各得 10 亿 Muse 词元；Cue 免费内测邀请码，先到先得。',
  },
};

export default function Layout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line">
          <div className="site-shell flex min-h-[4.5rem] items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 text-base font-bold" aria-label="AI 码池首页">
              <span className="grid size-8 place-items-center rounded-md border border-line text-accent">
                <Icon name="logo" className="size-4" />
              </span>
              AI 码池
            </Link>
            <nav aria-label="主导航" className="flex items-center gap-7">
              <Link href="/" className="hidden text-sm font-medium text-muted transition-colors hover:text-ink sm:block">邀请码池</Link>
              <Link href="/submit" className="button-secondary"><Icon name="plus" />提交邀请码</Link>
            </nav>
          </div>
        </header>
        <main className="site-shell flex-1 pb-16 sm:pb-24">{children}</main>
        <footer className="border-t border-line">
          <div className="site-shell flex flex-wrap justify-between gap-x-6 gap-y-2 py-6 text-sm text-muted">
            <span>AI 码池 · Muse / Cue 邀请码共享</span>
            <a href="https://www.toolpilot.ai" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ink hover:underline">Powered by ToolPilot.ai</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
