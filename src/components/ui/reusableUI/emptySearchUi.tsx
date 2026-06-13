import { WayfinderLogo1 } from "./logo.exports";

type LoadingErrorProps = {
  loading?: boolean;
  error?: string | null;
  message?: string | null;
};

function EmptySearchUi() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 opacity-40 p-10">
      <img
        src={WayfinderLogo1}
        alt="Pup Wayfinder logo"
        width={130}
        height={130}
      />
      <h1 className="text-[#800000] text-center">
        <i>Digitizing your Campus Experience</i>
      </h1>
    </div>
  );
}

function Loading({ loading, message = "Loading..." }: LoadingErrorProps) {
  if (!loading) return null;
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600"
      role="status"
      aria-live="polite"
    >
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
      <span>{message}</span>
    </div>
  );
}

function Error({ error, message }: LoadingErrorProps) {
  if (!error) return null;
  const text = typeof error === "string" ? error : message ?? "Something went wrong.";
  return (
    <div
      className="mx-2 my-2 rounded-lg bg-[#DAA520] px-3 py-2 text-sm font-semibold text-white shadow-md"
      role="alert"
    >
      {text}
    </div>
  );
}

export { EmptySearchUi, Loading, Error };
