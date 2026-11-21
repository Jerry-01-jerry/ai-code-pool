import CodePool from '../components/CodePool';
import { listActiveCodes } from '../lib/store';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const codes = await listActiveCodes();
  const now = Date.now();

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-2xl bg-[#19362a] px-6 py-10 text-white sm:px-12 sm:py-14">
        <div aria-hidden="true" className="pool-pattern pointer-events-none absolute inset-y-0 right-0 -z-10 w-2/3" />
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">AI 码池</h1>
        <p className="mt-4 max-w-xs text-sm leading-7 text-[#d6e8db] sm:max-w-none sm:text-base">搜索、复制和分享 Muse / Cue 邀请码。纯福利，免费；有码的一起发，别人用了你也得奖励。</p>
      </section>
      {searchParams.submitted === '1' && (
        <p role="status" className="mt-5 rounded-lg border border-line bg-white px-4 py-3 text-sm text-accent">邀请码已提交，现已公开。</p>
      )}
      <CodePool codes={codes} now={now} />
    </>
  );
}
