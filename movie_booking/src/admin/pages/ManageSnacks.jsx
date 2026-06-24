import React, { useEffect, useState, useCallback } from "react";
import {
  getAllFoodItems, createFoodItem, updateFoodItem,
  deleteFoodItem, uploadImage,
} from "../../config/allApis";
import {
  LuUtensils, LuPlus, LuX, LuTrash2, LuPen,
  LuSearch, LuUpload, LuLeaf, LuDrumstick,
  LuToggleLeft, LuToggleRight,
} from "react-icons/lu";
import { toast } from "react-toastify";

const CATEGORIES = ["Bestsellers", "Popcorn", "Beverages", "Snacks", "Combos"];

const EMPTY = {
  name: "", description: "", price: "", image: "",
  category: "Bestsellers", veg: true, isAvailable: true, sortOrder: 0,
};

export default function ManageSnacks() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState(null);   // null | "add" | "edit"
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("All");

  /* ── fetch ── */
  const fetchItems = useCallback(() => {
    setLoading(true);
    getAllFoodItems()
      .then((r) => setItems(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── derived ── */
  const filtered = items.filter((it) => {
    const matchTab  = activeTab === "All" || it.category === activeTab;
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const countByCategory = (cat) => items.filter((i) => i.category === cat).length;

  /* ── open modal ── */
  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("add"); };
  const openEdit = (it) => {
    setForm({ ...it });
    setEditId(it._id);
    setModal("edit");
  };
  const closeModal = () => setModal(null);

  /* ── image upload to S3 ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadImage(fd);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch {
      toast.error("❌ Image upload failed. Please try again.", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } finally {
      setUploading(false);
    }
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.warning("⚠️ Name, price and category are required.", {
        position: "top-right", autoClose: 4000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price), sortOrder: Number(form.sortOrder) || 0 };
      if (editId) await updateFoodItem(editId, payload);
      else        await createFoodItem(payload);
      fetchItems();
      closeModal();
      toast.success("✅ Item saved successfully!", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error saving item", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteFoodItem(id);
    fetchItems();
  };

  /* ── toggle availability inline ── */
  const toggleAvail = async (it) => {
    await updateFoodItem(it._id, { isAvailable: !it.isAvailable });
    fetchItems();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">

      {/* ── Header ── */}
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-bms-accent/10 border border-bms-accent/20 flex items-center justify-center flex-shrink-0">
              <LuUtensils className="text-bms-accent" size={16} />
            </span>
            Manage Snacks &amp; F&amp;B
          </h1>
          <p className="text-bms-text-dim text-sm mt-1 ml-10.5">
            {items.length} item{items.length !== 1 ? "s" : ""} across all categories
          </p>
        </div>
        <button
          className="btn bg-bms-accent hover:bg-bms-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2 flex-shrink-0"
          onClick={openAdd}
          id="add-snack-btn"
        >
          <LuPlus size={14} />
          Add Item
        </button>
      </div>

      {/* ── Category Tab Pill Row ── */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              activeTab === cat
                ? "bg-bms-accent text-white border-bms-accent shadow-sm"
                : "bg-bms-surface border-bms-border text-bms-text-muted hover:border-bms-accent/40 hover:text-bms-text"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className={`ml-1.5 text-[10px] font-semibold ${activeTab === cat ? "text-white/80" : "text-bms-text-dim"}`}>
                {countByCategory(cat)}
              </span>
            )}
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-bms-surface border border-bms-border rounded-xl px-3 h-9 min-w-[200px] focus-within:ring-2 focus-within:ring-bms-accent/20 focus-within:border-bms-accent transition-all">
          <LuSearch className="text-bms-text-dim flex-shrink-0" size={13} />
          <input
            type="text"
            placeholder="Search items..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-bms-text-dim hover:text-bms-text">
              <LuX size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid of Cards (cineBook style) ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bms-surface border border-dashed border-bms-border rounded-2xl">
          <LuUtensils size={40} className="text-bms-text-dim/30 mb-3" />
          <p className="text-bms-text-dim font-medium">No items found</p>
          <p className="text-bms-text-dim/60 text-xs mt-1">Add your first snack item using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((it) => (
            <div
              key={it._id}
              className={`bg-white border border-[#e2e2e2] rounded-xl p-4 flex gap-4 items-start relative shadow-xs hover:shadow-md transition-all duration-200 ${!it.isAvailable ? "opacity-55 grayscale-[30%]" : ""}`}
            >
              {/* Veg/Non-veg dot */}
              <div
                className="absolute top-3.5 left-3.5 w-4 h-4 border-2 rounded-sm flex items-center justify-center bg-white flex-shrink-0"
                style={{ borderColor: it.veg ? "#2d8a4e" : "#c0392b" }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: it.veg ? "#2d8a4e" : "#c0392b" }} />
              </div>

              {/* Image */}
              <div className="w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 mt-1.5 ml-1">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <LuUtensils size={28} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[13px] text-[#111] leading-snug">{it.name}</p>
                    <p className="text-[11px] text-[#888] mt-0.5 line-clamp-2 leading-relaxed">{it.description}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-bms-border bg-bms-surface text-bms-text-dim uppercase tracking-wide flex-shrink-0">
                    {it.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-extrabold text-[15px] text-[#111]">₹{it.price}</span>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle availability */}
                    <button
                      onClick={() => toggleAvail(it)}
                      title={it.isAvailable ? "Mark unavailable" : "Mark available"}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        it.isAvailable
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {it.isAvailable ? <LuToggleRight size={13} /> : <LuToggleLeft size={13} />}
                      {it.isAvailable ? "Live" : "Off"}
                    </button>
                    <button
                      onClick={() => openEdit(it)}
                      className="w-7 h-7 rounded-lg border border-bms-border text-bms-text-muted hover:text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer flex items-center justify-center"
                      id={`edit-snack-${it._id}`}
                    >
                      <LuPen size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(it._id, it.name)}
                      className="w-7 h-7 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <LuTrash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════ MODAL ══════════════════════════════════ */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex p-0 sm:p-6 sm:py-12"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white border border-[#e2e2e2] rounded-t-3xl sm:rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-[620px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up mt-auto sm:m-auto mx-auto relative">

            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#e9e9e9]">
              <div>
                <h3 className="text-[17px] font-bold text-[#111]">
                  {modal === "add" ? "Add New F&B Item" : "Edit F&B Item"}
                </h3>
                <p className="text-[12px] text-[#888] mt-0.5">
                  Fill in the details and upload an image to AWS S3
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full border border-[#e2e2e2] flex items-center justify-center text-[#888] hover:text-[#333] hover:bg-[#f5f5f5] transition-all cursor-pointer"
              >
                <LuX size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

              {/* Category selector — pill tabs */}
              <div>
                <label className="block text-[11px] font-bold text-[#555] uppercase tracking-widest mb-2">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all cursor-pointer ${
                        form.category === cat
                          ? "bg-[#F84464] text-white border-[#F84464] shadow-sm"
                          : "bg-white text-[#555] border-[#ddd] hover:border-[#F84464]/50 hover:text-[#F84464]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Item Name *</label>
                <input
                  className="border border-[#ddd] rounded-xl px-4 py-2.5 text-[13px] text-[#333] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all placeholder-[#bbb]"
                  placeholder="e.g. Samosa 2N (249 kcal)"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Description / Allergens</label>
                <textarea
                  className="border border-[#ddd] rounded-xl px-4 py-2.5 text-[13px] text-[#333] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all placeholder-[#bbb] resize-none min-h-[72px]"
                  placeholder="e.g. Samosa 2N (249 kcal) | Allergens: Milk, Wheat"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Price + Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    className="border border-[#ddd] rounded-xl px-4 py-2.5 text-[13px] text-[#333] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    className="border border-[#ddd] rounded-xl px-4 py-2.5 text-[13px] text-[#333] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all"
                    placeholder="0 = first"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">
                  Item Image (Upload to AWS S3)
                </label>

                {/* Preview */}
                {form.image && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#e2e2e2] bg-[#f8f8f8]">
                    <img src={form.image} alt="preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow border border-[#ddd] flex items-center justify-center text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <LuX size={11} />
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <input
                  type="file"
                  accept="image/*"
                  id="snack-image-upload"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="snack-image-upload"
                  className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3.5 text-[13px] font-semibold cursor-pointer transition-all ${
                    uploading
                      ? "border-[#F84464]/40 text-[#F84464]/60 bg-red-50"
                      : "border-[#ddd] text-[#888] hover:border-[#F84464]/50 hover:text-[#F84464] hover:bg-red-50/30"
                  }`}
                >
                  <LuUpload size={15} />
                  {uploading ? "Uploading to S3…" : form.image ? "Replace Image" : "Upload Image to S3"}
                </label>

                {/* Or paste URL */}
                <div className="flex items-center gap-2 text-[11px] text-[#aaa]">
                  <div className="flex-1 h-px bg-[#eee]" />
                  <span>or paste image URL</span>
                  <div className="flex-1 h-px bg-[#eee]" />
                </div>
                <input
                  className="border border-[#ddd] rounded-xl px-4 py-2 text-[12px] text-[#333] outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all placeholder-[#bbb]"
                  placeholder="https://…"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>

              {/* Veg toggle + Availability */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Food Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, veg: true }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                        form.veg
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-[#555] border-[#ddd] hover:border-emerald-300"
                      }`}
                    >
                      <LuLeaf size={12} /> Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, veg: false }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                        !form.veg
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-[#555] border-[#ddd] hover:border-red-300"
                      }`}
                    >
                      <LuDrumstick size={12} /> Non-Veg
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Availability</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                    className={`h-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                      form.isAvailable
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {form.isAvailable ? <LuToggleRight size={16} /> : <LuToggleLeft size={16} />}
                    {form.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-[#ddd] text-[#555] hover:bg-[#f5f5f5] text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  id="save-snack-btn"
                  className="px-6 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#e03a58] text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? "Saving…" : modal === "add" ? "Add Item" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
