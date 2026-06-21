import React, { useState, useRef, useEffect } from "react";
import Search from "../../../components/ui/reusableUI/search";
import { FaChevronDown } from "react-icons/fa";

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
    <div className="rounded-lg bg-[#DAA520] px-4 py-3 text-sm font-semibold text-white shadow-md">
      {message}
    </div>
  );
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: { value: string | number; label: string }[];
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder, icon, disabled, readOnly }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(selectedOption ? selectedOption.label : "");
    }
  }, [value, selectedOption, isOpen]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery(selectedOption ? selectedOption.label : "");
  };

  return (
    <div
      ref={triggerRef}
      className={`group relative flex items-center w-full pl-10 pr-10 py-1.5 text-sm bg-white border border-slate-200 rounded-xl transition-all font-semibold text-slate-800 shadow-sm ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60" : "hover:border-[#800000]/40 focus-within:border-[#800000] focus-within:ring-4 focus-within:ring-[#800000]/10"} ${readOnly ? "cursor-pointer" : ""}`}
    >
      <span className={`absolute left-3.5 pointer-events-none transition-colors z-10 ${disabled ? "text-slate-300" : "text-[#800000]/75"
        }`}>
        {icon}
      </span>

      <Search
        items={options}
        value={searchQuery}
        onChange={(query) => {
          if (readOnly) return;
          setSearchQuery(query);
          handleOpen();
        }}
        onSelect={(opt) => {
          onChange(opt.value);
          setIsOpen(false);
          setSearchQuery(opt.label);
        }}
        getLabel={(opt) => opt.label}
        getKey={(opt) => opt.value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        noModal={true}
        showOnFocusEmpty={true}
        noRelativeWrapper={true}
        modalDesign="rounded-xl border border-slate-200/80 bg-white p-2 shadow-xl animate-fadeIn max-h-[200px] overflow-y-auto w-full"
        onDropdownVisibilityChange={(visible) => {
          if (!visible && isOpen) {
            handleClose();
          } else if (visible && !isOpen) {
            handleOpen();
          }
        }}
      />

      <span
        onClick={() => {
          if (!disabled) {
            if (isOpen) handleClose();
            else handleOpen();
          }
        }}
        className={`absolute right-3.5 cursor-pointer transition-all duration-200 z-10 ${disabled ? "text-slate-300 pointer-events-none" : "text-[#800000]/60 hover:text-[#800000]"
        } ${isOpen ? "transform rotate-180 text-[#800000]" : ""}`}
      >
        <FaChevronDown className="w-3.5 h-3.5" />
      </span>
    </div>
  );
}
