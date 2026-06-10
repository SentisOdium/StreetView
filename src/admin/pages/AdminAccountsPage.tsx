import React, { useState } from "react";
import PageHeader, { AdminButton, AdminInput, ErrorBanner } from "../components/shared/AdminUI";
import { adminApi } from "../api/adminApi";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold opacity-80">{label}</label>
      {children}
    </div>
  );
}

export default function AdminAccountsPage() {
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await adminApi.createAdmin({
        firstName,
        middleInitial,
        lastName,
        email,
        password,
      });

      setSuccess("Admin account created successfully!");
      setFirstName("");
      setMiddleInitial("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Admin Accounts"
        subtitle="Create new administrator accounts to grant access to the dashboard."
      />

      <div className="max-w-2xl">
        <div className="admin-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Add New Administrator</h2>
          
          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name">
                <AdminInput
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Middle Initial (Optional)">
                <AdminInput
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  maxLength={10}
                />
              </FormField>
            </div>
            
            <FormField label="Surname (Last Name)">
              <AdminInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Email Address">
              <AdminInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Password">
                <AdminInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </FormField>
              <FormField label="Confirm Password">
                <AdminInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </FormField>
            </div>

            <div className="flex justify-end pt-4">
              <AdminButton type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Admin Account"}
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
