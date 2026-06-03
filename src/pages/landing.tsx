import { EmptySearchUi } from "../components/ui/reusableUI/emptySearchUi";

export default function LandingPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 via-white to-[#800000]/5">
      <div className="pointer-events-none max-w-md px-6 text-center">
        <EmptySearchUi />
        <p className="mt-4 text-sm text-gray-600">
          Search for a location in the side panel to begin your virtual campus tour.
        </p>
      </div>
    </div>
  );
}
