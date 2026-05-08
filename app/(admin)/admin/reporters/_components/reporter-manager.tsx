'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addReporterAction, deleteReporterAction } from './actions';

const DEPARTMENTS = ['News', 'Sports', 'Business', 'Tech', 'Politics', 'Entertainment', 'World', 'Lifestyle', 'Opinion'];
const DESIGNATIONS = ['Junior Reporter', 'Reporter', 'Senior Reporter', 'Editor', 'Senior Editor', 'Bureau Chief', 'Columnist', 'Contributor'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ACCESS_CATEGORIES = ['Politics', 'Business', 'Tech', 'Sports', 'World', 'Lifestyle', 'Entertainment', 'Opinion', 'All'];

interface Reporter {
  id: string;
  display_name: string;
  username: string | null;
  email: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  rows: Reporter[];
}

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  author: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const INITIAL_FORM = {
  fullName: '', username: '', nickname: '', mobile: '', email: '', password: '',
  department: '', designation: '', accessCategory: '',
  gender: '', bloodGroup: '', birthDate: '',
  addressLine1: '', addressLine2: '', city: '', state: '', country: '', zipCode: '',
  verificationDocId: '', verificationType: '',
  about: '', profilePhotoUrl: '',
  facebook: '', twitter: '', instagram: '', linkedin: '',
};

export function ReporterManager({ rows }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deptFilter, setDeptFilter] = useState('');
  const [desigFilter, setDesigFilter] = useState('');
  const [search, setSearch] = useState('');
  const [categoryAccess, setCategoryAccess] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter((r) =>
        r.display_name.toLowerCase().includes(t) ||
        r.email.toLowerCase().includes(t)
      );
    }
    return list;
  }, [rows, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setCategoryAccess({});
    setShowAdd(true);
  };

  const openEdit = (r: Reporter) => {
    setEditingId(r.id);
    setForm({
      fullName: r.display_name, username: r.username ?? '', nickname: '',
      mobile: '', email: r.email, password: '',
      department: '', designation: '', accessCategory: '',
      gender: '', bloodGroup: '', birthDate: '',
      addressLine1: '', addressLine2: '', city: '', state: '', country: '', zipCode: '',
      verificationDocId: '', verificationType: '',
      about: r.bio ?? '', profilePhotoUrl: r.avatar_url ?? '',
      facebook: '', twitter: '', instagram: '', linkedin: r.website_url ?? '',
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Full Name and Email are required.');
      return;
    }
    startTransition(async () => {
      const result = await addReporterAction({
        displayName: form.fullName,
        email: form.email,
        bio: form.about,
        twitter: form.twitter,
        facebook: form.facebook,
        linkedin: form.linkedin,
        active: true,
      });
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }
      toast.success(result.message ?? 'Reporter saved.');
      setShowAdd(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this reporter? This cannot be undone.')) return;
    startTransition(async () => {
      const result = await deleteReporterAction(id);
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }
      toast.success(result.message ?? 'Reporter deleted.');
      router.refresh();
    });
  };

  const toggleCategory = (cat: string) => {
    setCategoryAccess((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const update = <K extends keyof typeof form>(key: K, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Staff</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Reporter Management
          </h1>
          <p className="mt-1 text-sm text-(--fg-muted)">Manage reporters, journalists, and contributors.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)"
        >
          <Plus className="h-4 w-4" />
          Add Reporter
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-muted)" />
          <input
            type="text" placeholder="Search reporters..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) py-2 pl-10 pr-3 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none"
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={desigFilter} onChange={(e) => setDesigFilter(e.target.value)}
          className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
          <option value="">All Designations</option>
          {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-(--border-subtle)">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Name</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Email</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Role</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Joined</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-(--fg-muted)">No reporters found.</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-crimson) text-xs font-bold text-white">
                        {(r.display_name?.charAt(0) ?? '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-(--fg-default)">{r.display_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-medium', ROLE_BADGES[r.role] ?? ROLE_BADGES.author)}>
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(r)}
                        className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted) hover:text-(--fg-default) transition-colors"
                        aria-label={`Edit ${r.display_name}`} title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDelete(r.id)} disabled={isPending}
                        className="rounded-md p-1.5 text-(--fg-muted) hover:bg-red-50 hover:text-(--signal-red) transition-colors disabled:opacity-50"
                        aria-label={`Delete ${r.display_name}`} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8">
          <div className="w-full max-w-2xl rounded-xl bg-(--bg-base) p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg-default)">{editingId ? 'Edit Reporter' : 'Add Reporter'}</h2>
              <button onClick={() => setShowAdd(false)}
                className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted)">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Username</label>
                  <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Nickname</label>
                  <input type="text" value={form.nickname} onChange={(e) => update('nickname', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Mobile Number</label>
                  <input type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Password</label>
                  <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Department</label>
                  <select value={form.department} onChange={(e) => update('department', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Designation</label>
                  <select value={form.designation} onChange={(e) => update('designation', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Access Category</label>
                  <select value={form.accessCategory} onChange={(e) => update('accessCategory', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {ACCESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Gender</label>
                  <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Blood Group</label>
                  <select value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Birth Date</label>
                  <input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Profile Photo URL</label>
                  <input type="url" value={form.profilePhotoUrl} onChange={(e) => update('profilePhotoUrl', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Address Line 1</label>
                  <input type="text" value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Address Line 2</label>
                  <input type="text" value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">City</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">State</label>
                  <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Country</label>
                  <input type="text" value={form.country} onChange={(e) => update('country', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Zip Code</label>
                  <input type="text" value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Verification Document ID</label>
                  <input type="text" value={form.verificationDocId} onChange={(e) => update('verificationDocId', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Verification Type</label>
                  <select value={form.verificationType} onChange={(e) => update('verificationType', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                    <option value="national_id">National ID</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">About Reporter</label>
                <textarea value={form.about} onChange={(e) => update('about', e.target.value)} rows={3}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-(--fg-default)">Social Media Links</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="url" value={form.facebook} onChange={(e) => update('facebook', e.target.value)}
                    placeholder="Facebook URL"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                  <input type="url" value={form.twitter} onChange={(e) => update('twitter', e.target.value)}
                    placeholder="Twitter / X URL"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                  <input type="url" value={form.instagram} onChange={(e) => update('instagram', e.target.value)}
                    placeholder="Instagram URL"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                  <input type="url" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-(--fg-default)">Category Access</p>
                <div className="flex flex-wrap gap-3">
                  {ACCESS_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-(--fg-default)">
                      <input type="checkbox" checked={categoryAccess[cat] ?? false} onChange={() => toggleCategory(cat)}
                        className="rounded border-(--border-subtle)" />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark) disabled:opacity-60">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? 'Update Reporter' : 'Create Reporter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
