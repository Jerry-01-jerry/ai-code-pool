import Link from 'next/link';
import SubmitForm from '../../components/SubmitForm';

export const metadata = { title: '提交邀请码' };

export default function SubmitPage() {
  return (
    <section className="enter grid gap-8 pt-9 sm:gap-12 sm:pt-16 lg:grid-cols-[1fr_1.45fr] lg:gap-16 lg:pt-24">
      <div>
        <Link href="/" className="eyebrow min-h-9 w-fit transition-colors hover:text-ink"><span className="accent-rule" aria-hidden="true" />返回邀请码池</Link>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl">提交邀请码</h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:mt-5">无需登录，提交后立即在首页公开。</p>
      </div>
      <SubmitForm />
    </section>
  );
}
