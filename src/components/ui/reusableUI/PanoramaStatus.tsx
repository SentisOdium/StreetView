type PanoramaStatusProps = {
  message: string;
  variant?: "loading" | "error";
};

export default function PanoramaStatus({
  message,
  variant = "loading",
}: PanoramaStatusProps) {
  return (
    <div
      className="absolute inset-0 z-[5] flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px]"
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="mx-4 max-w-sm rounded-2xl bg-white/95 px-6 py-4 text-center shadow-xl">
        {variant === "loading" && (
          <span className="mx-auto mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
        )}
        <p
          className={
            variant === "error" ? "text-sm text-red-700" : "text-sm text-gray-700"
          }
        >
          {message}
        </p>
      </div>
    </div>
  );
}
