import Link from 'next/link';
import { Icon } from '../components/Icons';
import './globals.css';

export const metadata = {
  title: { default: 'AI 码池', template: '%s · AI 码池' },
  description: '公开分享 Muse 和 Cue 邀请码。',
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
          <div className="border-t border-line py-5 text-xs text-muted">AI 码池 · Muse / Cue 邀请码共享</div>
        </footer>
      </body>
    </html>
  );
}
