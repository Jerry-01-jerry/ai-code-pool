import Link from 'next/link';
import { Icon } from '../../components/Icons';
import SubmitForm from '../../components/SubmitForm';

export const metadata = { title: '提交邀请码' };

export default function SubmitPage() {
  return (
    <section className="mx-auto max-w-xl">
      <Link href="/" className="inline-flex min-h-9 items-center gap-2 text-sm text-muted hover:text-accent"><Icon name="back" />返回邀请码池</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">提交邀请码</h1>
      <p className="mt-3 text-sm leading-6 text-muted">无需登录，提交后立即在首页公开。</p>
      <SubmitForm />
    </section>
  );
}
