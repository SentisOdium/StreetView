import useRouteDirection from "../../hooks/useRouteDirection";
import { EmptySearchUi, Loading, Error } from "./emptySearchUi";
import { VrpanoIcon } from "./logo.exports";

import type { NodeRoute } from "../../api/types/types_api";

type RouteCardProps = {
  locA: string;
  locB: string;
  onSelectedRouteNode: (node: NodeRoute) => void;
};

export default function RouteCardComponent({
  locA,
  locB,
  onSelectedRouteNode,
}: RouteCardProps) {
  const { route, loading, error } = useRouteDirection({
    src: locA,
    dest: locB,
  });

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
        <Loading loading message="Calculating route..." />
      </div>
    );
  }  if (error) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
        <Error error={error} message="Failed to calculate route." />
      </div>
    );
  }
  if (!route?.length) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        <EmptySearchUi />
        No route found between these locations.
      </div>
    );
  }

  return (
    <div className="mt-10 mx-auto flex w-full max-w-xl rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex-1">
        <div className="mb-4">
          <p className="text-sm text-gray-500">Route</p>
          <h2 className="text-lg font-semibold text-gray-800">
            {locA} → {locB}
          </h2>
        </div>

        <div className="relative space-y-4 border-l border-gray-200 pl-5">
          {route.map((node) => (
            <div key={node.id} className="relative">
              <div className="grid grid-cols-3 bg-gray-50 hover:bg-gray-100">
                <div className="col-span-2">
                  <span className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-[#800000]" />
                  <div className="rounded p-3 transition">
                    <p className="text-lg font-medium text-[#800000]">{node.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium italic">{node.dist}m</span> from
                      previous
                    </p>
                  </div>
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    aria-label={`Open panorama for ${node.name}`}
                    className="relative flex h-17.5 w-23 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-100"
                    onClick={() => onSelectedRouteNode(node)}
                  >
                    <div className="flex h-full w-full items-center justify-center opacity-30">
                      <EmptySearchUi />
                    </div>
                    <VrpanoIcon
                      sx={{ color: "#800000" }}
                      className="absolute text-3xl"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
