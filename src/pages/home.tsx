import { useReducer, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAutoCompleteFetch from "../components/hooks/useAutocomplete";
import useWindowDimensions from "../components/hooks/useWindowDimensions";
import HomeDesktopView from "./HomeDesktopView";
import HomeMobileView from "./HomeMobileView";
import { reducer, initialState } from "../components/utils/reducer";

export default function HomePage() {
    const { list, fullList, loading, error } = useAutoCompleteFetch();
    const location = useLocation();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, initialState);
    const { stack, activeNodeId } = state;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileHeight, setMobileHeight] = useState<'hidden' | 'mid' | 'expanded'>('mid');
    const [viewMode, setViewMode] = useState<'streetview' | 'map'>('map');

    const windowDimensions = useWindowDimensions(150);



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

        if (stack.at(-1)?.type === "directions") {
            dispatch({
                type: "SET_ACTIVE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                },
            });
        } else {
            dispatch({
                type: "NAVIGATE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                    type: resolvedNode.type,
                },
            });
        }
    }, [fullList, stack, dispatch]);

    const handleSelectedRouteNode = useCallback((node: any) => {
        dispatch({
            type: "SET_ACTIVE_NODE",
            payload: {
                id: node.id,
                name: node.name,
            },
        });
    }, [dispatch]);

    const handleUpdateDirections = useCallback((data: any) => {
        dispatch({
            type: "UPDATE_DIRECTIONS_STATE",
            payload: data,
        });
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.targetNode) {
            const targetNode = location.state.targetNode;
            dispatch({
                type: "SELECT_NODE",
                payload: {
                    id: targetNode.id,
                    name: targetNode.node_name,
                    type: targetNode.type,
                },
            });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, dispatch, navigate]);

    useEffect(() => {
        if (fullList && fullList.length > 0) {
            const queryParams = new URLSearchParams(window.location.search);
            const nodeIdParam = queryParams.get("nodeId");
            if (nodeIdParam) {
                const node = fullList.find((item) => String(item.id) === nodeIdParam);
                if (node) {
                    dispatch({
                        type: "SELECT_NODE",
                        payload: {
                            id: node.id,
                            name: node.node_name,
                            type: node.type,
                        },
                    });
                }
                navigate(location.pathname, { replace: true });
            }
        }
    }, [fullList, location.pathname, dispatch, navigate]);

    const currentPanel = stack.at(-1);

    useEffect(() => {
        setIsCollapsed(false);
        setMobileHeight('mid');
    }, [currentPanel?.type]);

    if (!currentPanel) return null;

    const viewProps = {
        state,
        dispatch,
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
