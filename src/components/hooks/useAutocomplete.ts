import { useLocation } from "../../context/LocationContext";

export default function useAutoCompleteFetch() {
    const { nodeList, nodeListLoading, nodeListError, fetchNodeList } = useLocation();

    return { list: nodeList, loading: nodeListLoading, error: nodeListError, fetchData: fetchNodeList };
}