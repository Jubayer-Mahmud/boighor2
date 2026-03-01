'use client';

import DashboardLayout from '@/admin/components/DashboardLayout';
import adminService from '@/admin/services/adminService';
import { ChevronDown, ChevronRight, Edit2, FolderOpen, FolderPlus, Plus, Trash2, X, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

export default function CategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Expanded state per parent id
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Add main category
  const [showAddMain, setShowAddMain] = useState(false);
  const [newMainName, setNewMainName] = useState('');
  const [addMainLoading, setAddMainLoading] = useState(false);

  // Add sub-category: tracks which parent is getting a new sub-cat
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [addSubLoading, setAddSubLoading] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete loading id
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getCategories();
      setFlat((data.categories || []).sort((a: Category, b: Category) => a.name.localeCompare(b.name)));
      setTree((data.tree || []).sort((a: Category, b: Category) => a.name.localeCompare(b.name)));
      // Auto-expand all parents
      const initExpanded: Record<string, boolean> = {};
      (data.tree || []).forEach((p: Category) => { initExpanded[p._id] = true; });
      setExpanded(initExpanded);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Add main category ──────────────────────────────────────────
  const handleAddMain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMainName.trim()) return;
    try {
      setAddMainLoading(true);
      await adminService.createCategory(newMainName.trim(), null);
      setNewMainName('');
      setShowAddMain(false);
      await fetchCategories();
    } catch (err: any) {
      alert('Failed to add category: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddMainLoading(false);
    }
  };

  // ── Add sub-category ───────────────────────────────────────────
  const handleAddSub = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    try {
      setAddSubLoading(true);
      await adminService.createCategory(newSubName.trim(), parentId);
      setNewSubName('');
      setAddingSubFor(null);
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
      await fetchCategories();
    } catch (err: any) {
      alert('Failed to add sub-category: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddSubLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────
  const startEdit = (cat: Category) => { setEditingId(cat._id); setEditName(cat.name); };

  const handleEdit = async (cat: Category) => {
    if (!editName.trim()) return;
    try {
      setEditLoading(true);
      await adminService.updateCategory(cat._id, editName.trim(), cat.parentId);
      setEditingId(null);
      await fetchCategories();
    } catch (err: any) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (cat: Category) => {
    const childCount = (tree.find((p) => p._id === cat._id)?.children || []).length;
    const warn = cat.parentId
      ? `Delete sub-category "${cat.name}"?`
      : `Delete category "${cat.name}"${childCount > 0 ? ` and its ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'}` : ''}? Products in this category will be unassigned.`;
    if (!confirm(warn)) return;
    try {
      setDeleteLoading(cat._id);
      await adminService.deleteCategory(cat._id);
      await fetchCategories();
    } catch (err: any) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(null);
    }
  };

  // ── Row renderer ───────────────────────────────────────────────
  const renderRow = (cat: Category, isChild = false) => (
    <div
      key={cat._id}
      className={`border-b border-gray-100 last:border-0 ${isChild ? 'bg-blue-50/30' : 'bg-white'}`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 ${isChild ? 'pl-12' : ''}`}>
        {/* Expand / indent icon */}
        {!isChild && (cat.children || []).length > 0 ? (
          <button
            onClick={() => setExpanded((p) => ({ ...p, [cat._id]: !p[cat._id] }))}
            className="text-gray-400 hover:text-gray-700"
          >
            {expanded[cat._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : isChild ? (
          <span className="w-4 text-gray-300">└</span>
        ) : (
          <span className="w-4" />
        )}

        {/* Icon */}
        <span className={`shrink-0 ${isChild ? 'text-blue-400' : 'text-orange-500'}`}>
          {isChild ? <FolderOpen size={16} /> : <FolderOpen size={18} />}
        </span>

        {/* Name / edit input */}
        {editingId === cat._id ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(cat); if (e.key === 'Escape') setEditingId(null); }}
            className="flex-1 px-3 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
          />
        ) : (
          <div className="flex-1 min-w-0">
            <span className={`font-medium ${isChild ? 'text-gray-700 text-sm' : 'text-gray-900'}`}>{cat.name}</span>
            <span className="ml-2 text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{cat.slug}</span>
            {!isChild && (cat.children || []).length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {(cat.children || []).length} sub
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {editingId === cat._id ? (
            <>
              <button onClick={() => handleEdit(cat)} disabled={editLoading} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg" title="Save">
                <Check size={14} />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg" title="Cancel">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              {!isChild && (
                <button
                  onClick={() => { setAddingSubFor(cat._id); setNewSubName(''); setExpanded((p) => ({ ...p, [cat._id]: true })); }}
                  className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs flex items-center gap-1"
                  title="Add sub-category"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Sub</span>
                </button>
              )}
              <button onClick={() => startEdit(cat)} className="p-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg" title="Edit">
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                disabled={deleteLoading === cat._id}
                className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg disabled:opacity-50"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline add-sub form */}
      {!isChild && addingSubFor === cat._id && (
        <form onSubmit={(e) => handleAddSub(e, cat._id)} className="flex items-center gap-2 pl-12 pr-4 pb-3">
          <span className="text-gray-300 text-sm">└</span>
          <input
            type="text"
            placeholder="Sub-category name…"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            disabled={addSubLoading}
            className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
          />
          <button type="submit" disabled={addSubLoading || !newSubName.trim()} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg">
            {addSubLoading ? '…' : 'Add'}
          </button>
          <button type="button" onClick={() => setAddingSubFor(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg">
            Cancel
          </button>
        </form>
      )}

      {/* Children */}
      {!isChild && expanded[cat._id] && (cat.children || []).map((child) => renderRow(child, true))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">
              Manage main categories and sub-categories. Sub-categories appear as dropdowns in the navigation.
            </p>
          </div>
          <button
            onClick={() => { setShowAddMain(true); setNewMainName(''); }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 shrink-0"
          >
            <FolderPlus size={18} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Add main category form */}
        {showAddMain && (
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
            <h2 className="text-base font-semibold text-gray-800 mb-3">New Main Category</h2>
            <form onSubmit={handleAddMain} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Admission, HSC, Class 9-10"
                value={newMainName}
                onChange={(e) => setNewMainName(e.target.value)}
                disabled={addMainLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100 text-sm"
                autoFocus
              />
              <button type="submit" disabled={addMainLoading || !newMainName.trim()} className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg">
                {addMainLoading ? 'Adding…' : 'Add'}
              </button>
              <button type="button" onClick={() => setShowAddMain(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg">
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
        )}

        {/* Category tree */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 border-b px-4 py-2.5 flex gap-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex-1">Category / Sub-category</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div className="p-10 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
              <p className="mt-3 text-gray-500 text-sm">Loading…</p>
            </div>
          ) : tree.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No categories yet</p>
              <p className="text-sm mt-1">Click "Add Category" to get started</p>
            </div>
          ) : (
            <div>{tree.map((cat) => renderRow(cat, false))}</div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {flat.filter((c) => !c.parentId).length} main categor{flat.filter((c) => !c.parentId).length === 1 ? 'y' : 'ies'} ·{' '}
          {flat.filter((c) => c.parentId).length} sub-categor{flat.filter((c) => c.parentId).length === 1 ? 'y' : 'ies'} · Changes reflect on the frontend immediately.
        </p>
      </div>
    </DashboardLayout>
  );
}
