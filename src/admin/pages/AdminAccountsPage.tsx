import { useState, useEffect } from "react";
import PageHeader from "../components/shared/AdminUI";
import { adminApi } from "../api/adminApi";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import AdminCreationForm from "../components/AdminCreationForm";
import AdminListTable from "../components/AdminListTable";

export default function AdminAccountsPage() {
  const [adminsList, setAdminsList] = useState<any[]>([]);

  const fetchAdmins = async () => {
    try {
      const data = await adminApi.getAdmins();
      setAdminsList(data || []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="min-h-screen space-y-6 p-6 md:p-8 animate-fadeIn">
      <PageHeader
        title="Admin Accounts"
        subtitle="Manage authorization and grant control access levels to dashboard operations."
      />

      {/* Administrators List Table */}
      <AdminListTable adminsList={adminsList} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Info & Privileges Dashboard Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            {/* Decorative Top Accent Glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#800000] via-[#c0392b] to-[#800000]" />

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldIcon fontSize="medium" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Security Policies</h3>
                <p className="text-xs text-slate-500">Wayfinder Admin Guidelines</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Administrator accounts possess elevated system permissions to read and update structural navigation layouts, hotspots metadata, routing endpoints, and database models.
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                { title: "Dashboard Access", desc: "View real-time telemetry, node density, error reports, and locations count." },
                { title: "Navigation Graph Editing", desc: "Create, move, connect, or delete panorama graph nodes & rooms mapping." },
                { title: "Audit Log Tracking", desc: "Every action is stored and mapped to the specific administrator profile." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-850 group-hover:text-[#800000] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <SecurityIcon className="text-slate-400" fontSize="small" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Warning</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure the designated email address is active. All administrative credentials should be stored securely. Multi-factor policies are globally enforced.
            </p>
          </div>
        </div>

        {/* Redesigned Account Creation Form Column */}
        <div className="lg:col-span-7">
          <AdminCreationForm onSuccess={fetchAdmins} />
        </div>
      </div>
    </div>
  );
}
