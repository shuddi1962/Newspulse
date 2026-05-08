'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ExternalLink, FileText, FolderOpen } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  location: string;
  items: MenuItem[];
}

const LOCATIONS = ['Header Menu', 'Footer Menu', 'Sidebar Menu', 'Mobile Menu'];

export function MenuManager() {
  const [menus, setMenus] = useState<Menu[]>([
    { id: '1', name: 'Main Navigation', location: 'Header Menu', items: [
      { id: 'm1', label: 'News', url: '/news', children: [] },
      { id: 'm2', label: 'Video', url: '/video', children: [] },
      { id: 'm3', label: 'More', url: '#', children: [
        { id: 'm3a', label: 'Directory', url: '/directory', children: [] },
        { id: 'm3b', label: 'Jobs', url: '/jobs', children: [] },
      ]},
    ]},
    { id: '2', name: 'Footer Links', location: 'Footer Menu', items: [
      { id: 'f1', label: 'About', url: '/about', children: [] },
      { id: 'f2', label: 'Privacy', url: '/privacy', children: [] },
    ]},
  ]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(menus[0] ?? null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('Header Menu');
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');

  const addMenu = () => {
    if (!newName.trim()) return;
    const menu: Menu = { id: String(Date.now()), name: newName, location: newLocation, items: [] };
    setMenus([...menus, menu]);
    setSelectedMenu(menu);
    setShowNew(false);
    setNewName('');
  };

  const deleteMenu = (id: string) => {
    setMenus(menus.filter((m) => m.id !== id));
    if (selectedMenu?.id === id) setSelectedMenu(null);
  };

  const addItemToMenu = () => {
    if (!selectedMenu || !itemLabel.trim() || !itemUrl.trim()) return;
    const item: MenuItem = { id: String(Date.now()), label: itemLabel, url: itemUrl, children: [] };
    setMenus(menus.map((m) => m.id === selectedMenu.id ? { ...m, items: [...m.items, item] } : m));
    setSelectedMenu({ ...selectedMenu, items: [...selectedMenu.items, item] });
    setShowAddItem(false);
    setItemLabel('');
    setItemUrl('');
  };

  const removeItem = (menuId: string, itemId: string) => {
    const removeRecursive = (items: MenuItem[]): MenuItem[] =>
      items.filter((i) => i.id !== itemId).map((i) => ({ ...i, children: removeRecursive(i.children) }));
    setMenus(menus.map((m) => m.id === menuId ? { ...m, items: removeRecursive(m.items) } : m));
    if (selectedMenu?.id === menuId) {
      setSelectedMenu({ ...selectedMenu, items: removeRecursive(selectedMenu.items) });
    }
  };

  const availableItems = [
    { icon: FileText, label: 'Pages', items: [
      { label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Contact', url: '/contact' },
    ]},
    { icon: FolderOpen, label: 'Categories', items: [
      { label: 'News', url: '/news' }, { label: 'Technology', url: '/technology' },
      { label: 'Sports', url: '/sports' }, { label: 'Business', url: '/business' },
    ]},
  ];

  const renderMenuItems = (items: MenuItem[], depth = 0): React.ReactNode => (
    <ul className={`space-y-1 ${depth > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''}`}>
      {items.map((item) => (
        <li key={item.id}>
          <div className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-400" />
            <span className="flex-1 text-gray-900">{item.label}</span>
            <span className="hidden text-xs text-gray-400 group-hover:inline">{item.url}</span>
            <button onClick={() => removeItem(selectedMenu!.id, item.id)} className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {item.children.length > 0 && renderMenuItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Appearance</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Menu Manager</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" /> Create New Menu
        </button>
      </div>

      {showNew && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">New Menu</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Menu name" className="field-input" />
            <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="field-input">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={addMenu} className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Create</button>
              <button onClick={() => setShowNew(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <h2 className="font-display text-lg font-semibold">Menus</h2>
          {menus.map((menu) => (
            <div key={menu.id} className={`cursor-pointer rounded-lg border p-4 transition-colors ${selectedMenu?.id === menu.id ? 'border-(--color-ink-black) bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setSelectedMenu(menu)}>
              <p className="font-medium text-gray-900">{menu.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">{menu.location} · {menu.items.length} items</p>
              <button onClick={(e) => { e.stopPropagation(); deleteMenu(menu.id); }} className="mt-2 text-xs text-red-500 hover:underline">Delete</button>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {selectedMenu ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Menu Structure: {selectedMenu.name}</h2>
                <div className="flex items-center gap-2">
                  <select value={selectedMenu.location} onChange={(e) => setMenus(menus.map((m) => m.id === selectedMenu.id ? { ...m, location: e.target.value } : m))} className="field-input w-auto text-sm">
                    {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => setShowAddItem(true)} className="rounded-lg bg-(--color-ink-black) px-3 py-2 text-sm text-white hover:bg-(--color-ink-dark)">
                    <Plus className="mr-1 inline h-4 w-4" /> Add Item
                  </button>
                </div>
              </div>

              {showAddItem && (
                <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4">
                  <h3 className="mb-3 font-medium">Add Menu Item</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input value={itemLabel} onChange={(e) => setItemLabel(e.target.value)} placeholder="Navigation label" className="field-input" />
                    <input value={itemUrl} onChange={(e) => setItemUrl(e.target.value)} placeholder="URL or path" className="field-input" />
                    <div className="flex gap-2">
                      <button onClick={addItemToMenu} className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Add</button>
                      <button onClick={() => setShowAddItem(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4">
                {selectedMenu.items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No menu items. Add items from the left panel.</p>
                ) : renderMenuItems(selectedMenu.items)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {availableItems.map((group) => (
                  <div key={group.label} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                      <group.icon className="h-4 w-4" /> {group.label}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button key={item.url} onClick={() => { setItemLabel(item.label); setItemUrl(item.url); setShowAddItem(true); }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                          <ExternalLink className="h-3 w-3 text-gray-400" /> {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">Select or create a menu to start editing</div>
          )}
        </div>
      </div>
    </div>
  );
}
