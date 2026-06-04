type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm opacity-60">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  accent?: string;
};

export function StatCard({ label, value, accent = "#800000" }: StatCardProps) {
  return (
    <div className="admin-card rounded-xl border p-5 shadow-sm">
      <p className="text-sm opacity-60">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-[#800000] text-white hover:bg-[#600000]",
    secondary: "admin-card border hover:opacity-80",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "opacity-70 hover:opacity-100",
  };
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="admin-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#800000]/30"
      {...props}
    />
  );
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="admin-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#800000]/30"
      {...props}
    />
  );
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="admin-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#800000]/30"
      rows={4}
      {...props}
    />
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {message}
    </div>
  );
}
