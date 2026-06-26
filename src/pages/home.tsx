import { useReducer, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useAutoCompleteFetch from "../components/hooks/useAutocomplete";
import useWindowDimensions from "../components/hooks/useWindowDimensions";
import HomeDesktopView from "./HomeDesktopView";
import HomeMobileView from "./HomeMobileView";
import { reducer, initialState } from "../components/utils/reducer";
import { useTaskTesting } from "../hooks/useTaskTesting";

export default function HomePage() {
    const { list, fullList, loading, error } = useAutoCompleteFetch();
    const location = useLocation();
    const { checkAction } = useTaskTesting();

    const [state, dispatch] = useReducer(reducer, initialState);
    const { stack, activeNodeId } = state;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileHeight, setMobileHeight] = useState<'hidden' | 'mid' | 'expanded'>('mid');
    const [viewMode, setViewMode] = useState<'streetview' | 'map'>('map');

    const windowDimensions = useWindowDimensions(150);

    const wrappedDispatch = useCallback((action: any) => {
        if (action.type === "SELECT_NODE") {
            const currentPanelType = stack.at(-1)?.type;
            let actionType = "marker_click";
            if (currentPanelType === "search") {
                actionType = "search";
            } else if (currentPanelType === "directions") {
                actionType = "directions";
            }
            if (!checkAction(actionType, action.payload.name)) {
                return;
            }
        } else if (action.type === "SHOW_DIRECTIONS") {
            if (!checkAction("directions")) {
                return;
            }
        } else if (action.type === "UPDATE_DIRECTIONS_STATE") {
            const target = action.payload.locationB || action.payload.locationA || "";
            if (target && !checkAction("directions", target)) {
                return;
            }
        }
        dispatch(action);
    }, [dispatch, checkAction, stack]);

    useEffect(() => {
        if (activeNodeId != null) {
            setViewMode('streetview');
        } else {
            setViewMode('map');
        }
    }, [activeNodeId]);

    const isTransitional = useCallback((nodeId: number | null) => {
        if (nodeId == null || !fullList) return false;
        const node = fullList.find((n) => n.id === nodeId);
        return node?.type === "transitional";
    }, [fullList]);

    const handleNavigate = useCallback((destinationId: number) => {
        const resolvedNode = fullList?.find((n) => n.id === destinationId);
        if (!resolvedNode) return;

        if (!checkAction("navigation", resolvedNode.node_name)) {
            return;
        }

        if (stack.at(-1)?.type === "directions") {
            wrappedDispatch({
                type: "SET_ACTIVE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                },
            });
        } else {
            wrappedDispatch({
                type: "NAVIGATE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                    type: resolvedNode.type,
                },
            });
        }
    }, [fullList, stack, checkAction, wrappedDispatch]);

    const handleSelectedRouteNode = useCallback((node: any) => {
        if (!checkAction("directions", node.name)) {
            return;
        }
        wrappedDispatch({
            type: "SET_ACTIVE_NODE",
            payload: {
                id: node.id,
                name: node.name,
            },
        });
    }, [wrappedDispatch, checkAction]);

    const handleUpdateDirections = useCallback((data: any) => {
        const target = data.locationB || data.locationA || "";
        if (target && !checkAction("directions", target)) {
            return;
        }
        wrappedDispatch({
            type: "UPDATE_DIRECTIONS_STATE",
            payload: data,
        });
    }, [wrappedDispatch, checkAction]);

    useEffect(() => {
        if (location.state?.targetNode) {
            const targetNode = location.state.targetNode;
            wrappedDispatch({
                type: "SELECT_NODE",
                payload: {
                    id: targetNode.id,
                    name: targetNode.node_name,
                    type: targetNode.type,
                },
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state, wrappedDispatch]);

    useEffect(() => {
        if (fullList && fullList.length > 0) {
            const queryParams = new URLSearchParams(window.location.search);
            const nodeIdParam = queryParams.get("nodeId");
            if (nodeIdParam) {
                const node = fullList.find((item) => String(item.id) === nodeIdParam);
                if (node) {
                    wrappedDispatch({
                        type: "SELECT_NODE",
                        payload: {
                            id: node.id,
                            name: node.node_name,
                            type: node.type,
                        },
                    });
                }
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, [fullList, wrappedDispatch]);

    const currentPanel = stack.at(-1);

    useEffect(() => {
        setIsCollapsed(false);
        setMobileHeight('mid');
    }, [currentPanel?.type]);

    if (!currentPanel) return null;

    const viewProps = {
        state,
        dispatch: wrappedDispatch,
        list: list || [],
        fullList: fullList || [],
        loading,
        error,
        isCollapsed,
        setIsCollapsed,
        mobileHeight,
        setMobileHeight,
        viewMode,
        setViewMode,
        handleNavigate,
        isTransitional,
        handleSelectedRouteNode,
        handleUpdateDirections,
        windowDimensions,
    };

    const isMobile = windowDimensions.width < 768;

    return isMobile ? <HomeMobileView {...viewProps} /> : <HomeDesktopView {...viewProps} />;
}
