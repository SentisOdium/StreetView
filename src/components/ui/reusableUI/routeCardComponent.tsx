import useRouteDirection from "../../hooks/useRouteDirection";
import { EmptySearchUi } from "./emptySearchUi";
import { VrpanoIcon } from "./logo.exports";

import type { NodeRoute } from "../../api/types/types_api";

type RouteCardProps = {
  locA: string;
  locB: string;
  onSelectedRouteNode: (node: NodeRoute) => void;
};

export default function RouteCardComponent({locA, locB, onSelectedRouteNode}: RouteCardProps) {
  const { route } = useRouteDirection({
    src: locA,
    dest: locB,
  });

  return (
    <div className="mt-10 w-full max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-5 flex">

      {route && route.length >= 1 && (
        <div className="flex-1">

          {/* Header */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Route</p>

            <h2 className="text-lg font-semibold text-gray-800">
              {locA} → {locB}
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative border-l border-gray-200 pl-5 space-y-4">

            {route.map((node, index) => (
              <div key={node.id} className="relative">
                <div className="grid grid-cols-3 bg-gray-50 hover:bg-gray-100">

                  {/* Left Content */}
                  <div className="col-span-2">
                    <span className="absolute -left-2.5 top-1.5 w-3 h-3 bg-[#800000] rounded-full"></span>

                    <div className="transition rounded-lg p-3">

                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-800">{node.name}</p>

                        <span className="text-xs text-gray-500">
                          #{index + 1}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        Distance:
                        <span className="font-medium">
                          {" "}{node.dist}m
                        </span>
                        {" "}from the next location
                      </p>

                    </div>
                  </div>

                  {/* Panorama Preview */}
                  <div className="col-span-1 flex items-center justify-center">

                    <div
                      className="relative w-23 h-17.5 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
                      onClick={() => onSelectedRouteNode(node)}
                    >

                      {/* fallback */}
                      <div className="w-full h-full flex items-center justify-center">
                        <EmptySearchUi />
                      </div>

                      {/* icon overlay */}
                      <VrpanoIcon
                        sx={{ color: "#800000" }}
                        className="absolute text-3xl"
                      />

                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}