import CodePool from '../components/CodePool';
import { listActiveCodes } from '../lib/store';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const codes = await listActiveCodes();
  const now = Date.now();

  return (
    <>
      <section className="enter home-intro">
        <div>
          <p className="eyebrow"><span className="accent-rule" aria-hidden="true" />Muse / Cue 邀请码共享</p>
          <h1 className="home-title">AI 码池</h1>
        </div>
        <p className="max-w-[25rem] text-base leading-relaxed text-muted sm:text-lg sm:leading-relaxed">
          搜索、复制和分享 Muse / Cue 邀请码。纯福利，免费；有码的一起发，别人用了你也得奖励。
        </p>
      </section>
      {searchParams.submitted === '1' && (
        <p role="status" className="notice mt-5">邀请码已提交，现已公开。</p>
      )}
      <CodePool codes={codes} now={now} />
    </>
  );
}
