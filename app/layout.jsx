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
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold" aria-label="AI 码池首页">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-[#ccedb9]"><Icon name="logo" className="h-5 w-5" /></span>
              AI 码池
            </Link>
            <nav aria-label="主导航" className="flex items-center gap-4 sm:gap-7">
              <Link href="/" className="hidden text-sm font-medium text-muted hover:text-ink sm:block">邀请码池</Link>
              <Link href="/submit" className="button-primary"><Icon name="plus" />提交邀请码</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8 sm:py-12">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 sm:px-8">
          <div className="border-t border-line py-5 text-xs text-muted">AI 码池 · Muse / Cue 邀请码共享 · <a href="https://www.toolpilot.ai" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Powered by ToolPilot.ai</a></div>
        </footer>
      </body>
    </html>
  );
}
