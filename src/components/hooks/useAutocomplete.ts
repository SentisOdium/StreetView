import { useLocation } from "../../context/LocationContext";

export default function useAutoCompleteFetch() {
    const { nodeList, mainNodeList, nodeListLoading, nodeListError, fetchNodeList } = useLocation();

    return { list: mainNodeList, fullList: nodeList, loading: nodeListLoading, error: nodeListError, fetchData: fetchNodeList };
}