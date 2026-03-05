// // ============================================================
// //  VidyaMitra — JobTrackerPage.jsx
// //  Phase 9: Track job applications with Kanban + List views
// // ============================================================

// import { useState, useEffect } from "react";
// import DashboardLayout from "../components/DashboardLayout";
// import api from "../services/api";

// // ── Constants ─────────────────────────────────────────────────
// const STATUSES = [
//   { id: "saved",      label: "Saved",      color: "slate",  bg: "bg-slate-500/10",  border: "border-slate-500/30",  text: "text-slate-400",  dot: "bg-slate-400" },
//   { id: "applied",    label: "Applied",    color: "blue",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   dot: "bg-blue-400" },
//   { id: "screening",  label: "Screening",  color: "yellow", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
//   { id: "interview",  label: "Interview",  color: "purple", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
//   { id: "offer",      label: "Offer",      color: "cyan",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   text: "text-cyan-400",   dot: "bg-cyan-400" },
//   { id: "accepted",   label: "Accepted",   color: "green",  bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  dot: "bg-green-400" },
//   { id: "rejected",   label: "Rejected",   color: "red",    bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    dot: "bg-red-400" },
//   { id: "withdrawn",  label: "Withdrawn",  color: "orange", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
// ];

// const PRIORITIES = [
//   { id: "high",   label: "High",   color: "text-red-400",    bg: "bg-red-400/10" },
//   { id: "medium", label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10" },
//   { id: "low",    label: "Low",    color: "text-slate-400",  bg: "bg-slate-400/10" },
// ];

// const JOB_TYPES = ["full-time", "part-time", "internship", "contract", "freelance"];

// const statusInfo = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];
// const priorityInfo = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[1];

// const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
// const daysAgo = (d) => {
//   if (!d) return "";
//   const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
//   return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff}d ago`;
// };

// // ── Reusable Field ────────────────────────────────────────────
// const Field = ({ label, value, onChange, placeholder, type = "text", rows, options, required }) => (
//   <div className="space-y-1">
//     {label && (
//       <label className="block text-xs font-medium text-slate-400">
//         {label}{required && <span className="text-red-400 ml-0.5">*</span>}
//       </label>
//     )}
//     {options ? (
//       <select value={value} onChange={e => onChange(e.target.value)}
//         className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-colors">
//         <option value="">— Select —</option>
//         {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
//       </select>
//     ) : rows ? (
//       <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
//         className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none transition-colors" />
//     ) : (
//       <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
//         className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors" />
//     )}
//   </div>
// );

// // ── Add / Edit Modal ──────────────────────────────────────────
// const ApplicationModal = ({ app, onClose, onSave }) => {
//   const isEdit = !!app?._id;
//   const [form, setForm] = useState({
//     company: "", role: "", location: "", jobType: "", salary: "",
//     jobUrl: "", source: "", status: "saved", priority: "medium",
//     appliedDate: "", deadlineDate: "", nextFollowUp: "",
//     contactName: "", contactEmail: "", notes: "", coverLetter: "",
//     isFavorite: false,
//     ...(app || {}),
//     ...(app && {
//       appliedDate:  app.appliedDate  ? app.appliedDate.slice(0, 10)  : "",
//       deadlineDate: app.deadlineDate ? app.deadlineDate.slice(0, 10) : "",
//       nextFollowUp: app.nextFollowUp ? app.nextFollowUp.slice(0, 10) : "",
//     }),
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError]   = useState("");

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const handleSubmit = async () => {
//     if (!form.company.trim() || !form.role.trim()) {
//       setError("Company and Role are required."); return;
//     }
//     setSaving(true);
//     try {
//       if (isEdit) {
//         const res = await api.put(`/applications/${app._id}`, form);
//         onSave(res.data.application, "edit");
//       } else {
//         const res = await api.post("/applications", form);
//         onSave(res.data.application, "add");
//       }
//       onClose();
//     } catch (e) {
//       setError(e.response?.data?.message || "Save failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//       <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
//           <h2 className="font-display font-bold text-white text-lg">
//             {isEdit ? "Edit Application" : "Add Application"}
//           </h2>
//           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
//         </div>

//         <div className="p-6 space-y-5">
//           {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

//           {/* Row 1 */}
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Company" value={form.company} onChange={v => set("company", v)} placeholder="Google" required />
//             <Field label="Role / Position" value={form.role} onChange={v => set("role", v)} placeholder="Software Engineer" required />
//           </div>

//           {/* Row 2 */}
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Location" value={form.location} onChange={v => set("location", v)} placeholder="Bangalore / Remote" />
//             <Field label="Job Type" value={form.jobType} onChange={v => set("jobType", v)}
//               options={JOB_TYPES.map(j => ({ value: j, label: j.charAt(0).toUpperCase() + j.slice(1) }))} />
//           </div>

//           {/* Row 3 */}
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Status" value={form.status} onChange={v => set("status", v)}
//               options={STATUSES.map(s => ({ value: s.id, label: s.label }))} />
//             <Field label="Priority" value={form.priority} onChange={v => set("priority", v)}
//               options={PRIORITIES.map(p => ({ value: p.id, label: p.label }))} />
//           </div>

//           {/* Row 4 */}
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Salary / Package" value={form.salary} onChange={v => set("salary", v)} placeholder="₹12 LPA / $80k" />
//             <Field label="Source / Platform" value={form.source} onChange={v => set("source", v)} placeholder="LinkedIn, Naukri, Referral..." />
//           </div>

//           {/* Row 5 — dates */}
//           <div className="grid grid-cols-3 gap-4">
//             <Field label="Applied Date" value={form.appliedDate} onChange={v => set("appliedDate", v)} type="date" />
//             <Field label="Deadline" value={form.deadlineDate} onChange={v => set("deadlineDate", v)} type="date" />
//             <Field label="Follow-up Date" value={form.nextFollowUp} onChange={v => set("nextFollowUp", v)} type="date" />
//           </div>

//           {/* Row 6 */}
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Contact Name" value={form.contactName} onChange={v => set("contactName", v)} placeholder="Recruiter / HR Name" />
//             <Field label="Contact Email" value={form.contactEmail} onChange={v => set("contactEmail", v)} placeholder="hr@company.com" type="email" />
//           </div>

//           <Field label="Job URL" value={form.jobUrl} onChange={v => set("jobUrl", v)} placeholder="https://jobs.google.com/..." />
//           <Field label="Notes" value={form.notes} onChange={v => set("notes", v)} placeholder="Any notes about the role or company..." rows={3} />

//           {/* Favorite */}
//           <div className="flex items-center gap-2">
//             <input type="checkbox" id="fav" checked={form.isFavorite} onChange={e => set("isFavorite", e.target.checked)} className="accent-cyan-400" />
//             <label htmlFor="fav" className="text-sm text-slate-400">Mark as Favourite ⭐</label>
//           </div>
//         </div>

//         <div className="flex gap-3 px-6 py-4 border-t border-slate-700/40">
//           <button onClick={onClose} className="flex-1 py-2.5 bg-slate-700/40 border border-slate-600/40 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors">
//             Cancel
//           </button>
//           <button onClick={handleSubmit} disabled={saving}
//             className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
//             {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Application"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Detail Drawer ─────────────────────────────────────────────
// const DetailDrawer = ({ id, onClose, onEdit, onDelete }) => {
//   const [app, setApp]       = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [newStatus, setNewStatus] = useState("");
//   const [statusNote, setStatusNote] = useState("");
//   const [updatingStatus, setUpdatingStatus] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get(`/applications/${id}`);
//         setApp(res.data.application);
//       } catch { /* ignore */ }
//       finally { setLoading(false); }
//     })();
//   }, [id]);

//   const handleStatusUpdate = async () => {
//     if (!newStatus) return;
//     setUpdatingStatus(true);
//     try {
//       const res = await api.patch(`/applications/${id}/status`, { status: newStatus, note: statusNote });
//       setApp(res.data.application);
//       setNewStatus(""); setStatusNote("");
//     } catch { /* ignore */ }
//     finally { setUpdatingStatus(false); }
//   };

//   const si = app ? statusInfo(app.status) : null;

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
//       <div className="w-full max-w-md bg-slate-900 border-l border-slate-700/40 h-full overflow-y-auto shadow-2xl"
//         onClick={e => e.stopPropagation()}>
//         {loading ? (
//           <div className="flex items-center justify-center h-40">
//             <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
//           </div>
//         ) : !app ? (
//           <div className="p-6 text-slate-500">Not found.</div>
//         ) : (
//           <>
//             {/* Header */}
//             <div className="px-6 py-5 border-b border-slate-700/40">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h2 className="font-display font-bold text-white text-lg">{app.role}</h2>
//                   <p className="text-slate-400 text-sm mt-0.5">{app.company}{app.location ? ` · ${app.location}` : ""}</p>
//                 </div>
//                 <button onClick={onClose} className="text-slate-500 hover:text-white text-xl ml-3">✕</button>
//               </div>
//               <div className="flex items-center gap-2 mt-3 flex-wrap">
//                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${si.bg} ${si.border} border ${si.text}`}>
//                   <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />{si.label}
//                 </span>
//                 {app.priority && (
//                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityInfo(app.priority).bg} ${priorityInfo(app.priority).color}`}>
//                     {app.priority} priority
//                   </span>
//                 )}
//                 {app.isFavorite && <span className="text-yellow-400 text-sm">⭐</span>}
//               </div>
//             </div>

//             <div className="p-6 space-y-5">
//               {/* Key info */}
//               <div className="grid grid-cols-2 gap-3 text-sm">
//                 {app.salary    && <div><p className="text-slate-500 text-xs">Salary</p><p className="text-white">{app.salary}</p></div>}
//                 {app.jobType   && <div><p className="text-slate-500 text-xs">Type</p><p className="text-white capitalize">{app.jobType}</p></div>}
//                 {app.source    && <div><p className="text-slate-500 text-xs">Source</p><p className="text-white">{app.source}</p></div>}
//                 {app.appliedDate && <div><p className="text-slate-500 text-xs">Applied</p><p className="text-white">{fmtDate(app.appliedDate)}</p></div>}
//                 {app.deadlineDate && <div><p className="text-slate-500 text-xs">Deadline</p><p className="text-white">{fmtDate(app.deadlineDate)}</p></div>}
//                 {app.nextFollowUp && <div><p className="text-slate-500 text-xs">Follow-up</p><p className="text-white">{fmtDate(app.nextFollowUp)}</p></div>}
//               </div>

//               {/* Contact */}
//               {(app.contactName || app.contactEmail) && (
//                 <div>
//                   <p className="text-xs text-slate-500 mb-1">Contact</p>
//                   <p className="text-sm text-white">{app.contactName}</p>
//                   {app.contactEmail && <p className="text-xs text-cyan-400">{app.contactEmail}</p>}
//                 </div>
//               )}

//               {/* Job URL */}
//               {app.jobUrl && (
//                 <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
//                   className="flex items-center gap-2 text-cyan-400 text-sm hover:underline">
//                   🔗 View Job Posting
//                 </a>
//               )}

//               {/* Notes */}
//               {app.notes && (
//                 <div>
//                   <p className="text-xs text-slate-500 mb-1">Notes</p>
//                   <p className="text-sm text-slate-300 bg-slate-800/40 rounded-lg p-3">{app.notes}</p>
//                 </div>
//               )}

//               {/* Interview rounds */}
//               {app.interviewRounds?.length > 0 && (
//                 <div>
//                   <p className="text-xs text-slate-500 mb-2">Interview Rounds</p>
//                   <div className="space-y-2">
//                     {app.interviewRounds.map((r, i) => (
//                       <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 text-sm">
//                         <div className="flex justify-between">
//                           <span className="font-medium text-white">{r.round}</span>
//                           <span className={`text-xs px-2 py-0.5 rounded-full ${r.outcome === "Passed" ? "bg-green-400/10 text-green-400" : r.outcome === "Rejected" ? "bg-red-400/10 text-red-400" : "bg-yellow-400/10 text-yellow-400"}`}>
//                             {r.outcome}
//                           </span>
//                         </div>
//                         {r.date && <p className="text-slate-500 text-xs mt-0.5">{fmtDate(r.date)} · {r.mode}</p>}
//                         {r.notes && <p className="text-slate-400 text-xs mt-1">{r.notes}</p>}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Quick status update */}
//               <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
//                 <p className="text-xs font-medium text-slate-400">Update Status</p>
//                 <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
//                   className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-colors">
//                   <option value="">— Select new status —</option>
//                   {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
//                 </select>
//                 <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
//                   placeholder="Optional note..."
//                   className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-colors" />
//                 <button onClick={handleStatusUpdate} disabled={!newStatus || updatingStatus}
//                   className="w-full py-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-400/20 disabled:opacity-40 transition-colors">
//                   {updatingStatus ? "Updating…" : "Update Status"}
//                 </button>
//               </div>

//               {/* Timeline */}
//               {app.timeline?.length > 0 && (
//                 <div>
//                   <p className="text-xs text-slate-500 mb-3">Timeline</p>
//                   <div className="relative pl-4 border-l border-slate-700/60 space-y-3">
//                     {[...app.timeline].reverse().map((t, i) => {
//                       const s = statusInfo(t.status);
//                       return (
//                         <div key={i} className="relative">
//                           <div className={`absolute -left-[1.35rem] w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${s.dot}`} />
//                           <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
//                           {t.note && <p className="text-xs text-slate-500">{t.note}</p>}
//                           <p className="text-xs text-slate-600">{fmtDate(t.date)}</p>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="flex gap-3 px-6 py-4 border-t border-slate-700/40">
//               <button onClick={() => onEdit(app)}
//                 className="flex-1 py-2.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-xl text-sm hover:bg-cyan-400/20 transition-colors">
//                 Edit
//               </button>
//               <button onClick={() => onDelete(app._id)}
//                 className="py-2.5 px-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
//                 Delete
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Application Card (list view) ──────────────────────────────
// const AppCard = ({ app, onClick }) => {
//   const si = statusInfo(app.status);
//   const pi = priorityInfo(app.priority);
//   return (
//     <div onClick={() => onClick(app._id)}
//       className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 hover:border-cyan-400/30 cursor-pointer transition-all group">
//       <div className="flex items-start justify-between gap-2">
//         <div className="min-w-0">
//           <p className="font-display font-semibold text-white text-sm truncate">{app.role}</p>
//           <p className="text-slate-400 text-xs mt-0.5 truncate">{app.company}{app.location ? ` · ${app.location}` : ""}</p>
//         </div>
//         <div className="flex items-center gap-1.5 flex-shrink-0">
//           {app.isFavorite && <span className="text-yellow-400 text-xs">⭐</span>}
//           <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${si.bg} ${si.border} border ${si.text}`}>
//             <span className={`w-1 h-1 rounded-full ${si.dot}`} />{si.label}
//           </span>
//         </div>
//       </div>
//       <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
//         {app.jobType && <span className="capitalize">{app.jobType}</span>}
//         {app.salary  && <span>{app.salary}</span>}
//         {app.source  && <span>{app.source}</span>}
//         <span className="ml-auto">{daysAgo(app.createdAt)}</span>
//       </div>
//       <div className="flex items-center gap-2 mt-2">
//         <span className={`text-[10px] px-1.5 py-0.5 rounded ${pi.bg} ${pi.color}`}>{app.priority}</span>
//         {app.appliedDate && <span className="text-[10px] text-slate-600">Applied {fmtDate(app.appliedDate)}</span>}
//         {app.nextFollowUp && new Date(app.nextFollowUp) > Date.now() && (
//           <span className="text-[10px] text-cyan-400 ml-auto">↻ {fmtDate(app.nextFollowUp)}</span>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Kanban Column ─────────────────────────────────────────────
// const KanbanColumn = ({ status, apps, onCardClick }) => {
//   const si = statusInfo(status.id);
//   return (
//     <div className="flex-shrink-0 w-64">
//       <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${si.bg} border ${si.border}`}>
//         <span className={`w-2 h-2 rounded-full ${si.dot}`} />
//         <span className={`text-xs font-semibold ${si.text}`}>{si.label}</span>
//         <span className={`ml-auto text-xs font-mono ${si.text} opacity-60`}>{apps.length}</span>
//       </div>
//       <div className="space-y-2 min-h-24">
//         {apps.map(app => (
//           <div key={app._id} onClick={() => onCardClick(app._id)}
//             className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 cursor-pointer hover:border-cyan-400/30 transition-all">
//             <p className="text-white text-xs font-semibold truncate">{app.role}</p>
//             <p className="text-slate-400 text-[10px] truncate">{app.company}</p>
//             {app.salary && <p className="text-slate-500 text-[10px] mt-1">{app.salary}</p>}
//             <div className="flex items-center gap-1.5 mt-2">
//               <span className={`text-[9px] px-1.5 py-0.5 rounded ${priorityInfo(app.priority).bg} ${priorityInfo(app.priority).color}`}>
//                 {app.priority}
//               </span>
//               <span className="text-[9px] text-slate-600 ml-auto">{daysAgo(app.createdAt)}</span>
//             </div>
//           </div>
//         ))}
//         {apps.length === 0 && (
//           <div className="border border-dashed border-slate-700/40 rounded-lg h-16 flex items-center justify-center">
//             <p className="text-slate-700 text-xs">Empty</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Main Page ─────────────────────────────────────────────────
// export default function JobTrackerPage() {
//   const [apps, setApps]           = useState([]);
//   const [stats, setStats]         = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [viewMode, setViewMode]   = useState("list"); // list | kanban
//   const [showModal, setShowModal] = useState(false);
//   const [editApp, setEditApp]     = useState(null);
//   const [detailId, setDetailId]   = useState(null);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [filterPriority, setFilterPriority] = useState("");
//   const [search, setSearch]       = useState("");

//   const loadApps = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filterStatus)   params.set("status", filterStatus);
//       if (filterPriority) params.set("priority", filterPriority);
//       if (search)         params.set("search", search);
//       const res = await api.get(`/applications?${params}`);
//       setApps(res.data.applications || []);
//       setStats(res.data.stats);
//     } catch { /* ignore */ }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { loadApps(); }, [filterStatus, filterPriority, search]);

//   const handleSave = (saved, type) => {
//     if (type === "add") setApps(a => [saved, ...a]);
//     else setApps(a => a.map(x => x._id === saved._id ? saved : x));
//     setStats(s => s ? ({ ...s, total: type === "add" ? s.total + 1 : s.total }) : s);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this application?")) return;
//     try {
//       await api.delete(`/applications/${id}`);
//       setApps(a => a.filter(x => x._id !== id));
//       setDetailId(null);
//     } catch { alert("Delete failed."); }
//   };

//   const handleEdit = (app) => {
//     setEditApp(app);
//     setDetailId(null);
//     setShowModal(true);
//   };

//   // Kanban grouping
//   const kanbanGroups = STATUSES.reduce((acc, s) => {
//     acc[s.id] = apps.filter(a => a.status === s.id);
//     return acc;
//   }, {});

//   // Stats bar colors
//   const statCards = [
//     { label: "Total",     value: stats?.total || 0,     color: "text-white" },
//     { label: "Applied",   value: stats?.applied || 0,   color: "text-blue-400" },
//     { label: "Interview", value: stats?.interview || 0, color: "text-purple-400" },
//     { label: "Offer",     value: stats?.offer || 0,     color: "text-cyan-400" },
//     { label: "Accepted",  value: stats?.accepted || 0,  color: "text-green-400" },
//     { label: "Rejected",  value: stats?.rejected || 0,  color: "text-red-400" },
//   ];

//   return (
//     <DashboardLayout>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
//           <div>
//             <h1 className="font-display text-2xl font-bold text-white">Application Tracker</h1>
//             <p className="text-slate-500 text-sm mt-1">Track every job application in one place</p>
//           </div>
//           <button onClick={() => { setEditApp(null); setShowModal(true); }}
//             className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
//             + Add Application
//           </button>
//         </div>

//         {/* Stats Row */}
//         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
//           {statCards.map(s => (
//             <div key={s.label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
//               <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
//               <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Response rate */}
//         {stats && (
//           <div className="grid grid-cols-2 gap-3 mb-6">
//             <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
//               <p className="text-xs text-slate-500 mb-2">Response Rate</p>
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
//                   <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
//                     style={{ width: `${stats.responseRate || 0}%` }} />
//                 </div>
//                 <span className="text-cyan-400 font-bold text-sm">{stats.responseRate || 0}%</span>
//               </div>
//             </div>
//             <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
//               <p className="text-xs text-slate-500 mb-2">Offer Rate</p>
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
//                   <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
//                     style={{ width: `${stats.offerRate || 0}%` }} />
//                 </div>
//                 <span className="text-green-400 font-bold text-sm">{stats.offerRate || 0}%</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Filters + view toggle */}
//         <div className="flex flex-wrap items-center gap-3 mb-5">
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search company or role..."
//             className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 w-56 transition-colors" />

//           <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
//             className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-colors">
//             <option value="">All Statuses</option>
//             {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
//           </select>

//           <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
//             className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400/50 transition-colors">
//             <option value="">All Priorities</option>
//             {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
//           </select>

//           <div className="ml-auto flex items-center gap-1 bg-slate-800/60 border border-slate-700/40 rounded-xl p-1">
//             {["list", "kanban"].map(m => (
//               <button key={m} onClick={() => setViewMode(m)}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
//                   ${viewMode === m ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/30" : "text-slate-400 hover:text-slate-200"}`}>
//                 {m === "list" ? "☰ List" : "⊞ Kanban"}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex items-center justify-center h-40">
//             <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
//           </div>
//         ) : apps.length === 0 ? (
//           <div className="text-center py-20 border border-dashed border-slate-700/60 rounded-2xl">
//             <div className="text-5xl mb-4">📋</div>
//             <p className="text-slate-300 font-semibold text-lg">No applications yet</p>
//             <p className="text-slate-500 text-sm mt-1 mb-6">Start tracking your job search journey</p>
//             <button onClick={() => setShowModal(true)}
//               className="px-6 py-2.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-xl text-sm hover:bg-cyan-400/20 transition-colors">
//               + Add First Application
//             </button>
//           </div>
//         ) : viewMode === "list" ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {apps.map(app => (
//               <AppCard key={app._id} app={app} onClick={setDetailId} />
//             ))}
//           </div>
//         ) : (
//           <div className="overflow-x-auto pb-4">
//             <div className="flex gap-4 min-w-max">
//               {STATUSES.map(s => (
//                 <KanbanColumn key={s.id} status={s} apps={kanbanGroups[s.id] || []} onCardClick={setDetailId} />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showModal && (
//         <ApplicationModal
//           app={editApp}
//           onClose={() => { setShowModal(false); setEditApp(null); }}
//           onSave={handleSave}
//         />
//       )}

//       {detailId && (
//         <DetailDrawer
//           id={detailId}
//           onClose={() => setDetailId(null)}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//         />
//       )}
//     </DashboardLayout>
//   );
// }