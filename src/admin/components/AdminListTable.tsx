
type AdminListTableProps = {
  adminsList: any[];
};

export default function AdminListTable({ adminsList }: AdminListTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">System Administrators</h3>
          <p className="text-xs text-slate-500">Currently active accounts and registration logs.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50/50">
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Surname</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">First Name Initial</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {adminsList.map((admin) => (
              <tr key={admin.admin_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{admin.last_name}</td>
                <td className="py-3 px-4">{admin.first_name_initial}</td>
                <td className="py-3 px-4 font-mono text-xs">{admin.email}</td>
                <td className="py-3 px-4 text-xs text-slate-500">
                  {new Date(admin.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-xs text-slate-500">
                  {admin.last_login
                    ? new Date(admin.last_login).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </td>
              </tr>
            ))}
            {adminsList.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                  No administrators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
