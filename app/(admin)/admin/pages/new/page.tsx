import PageForm from '../_components/page-form';

export const metadata = {
  title: 'New Page — NewsPulse PRO',
};

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Content
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gray-900">
          New Page
        </h1>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PageForm />
      </div>
    </div>
  );
}
