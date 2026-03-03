import type { SearchUiProps } from "../ui/Side_Panel/types/sidePanelProps";
import type { NodeList } from "../api/types/types_api";

function handleEnterKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    search: string,
    filteredList: NodeList[],
    callbacks: Pick<SearchUiProps, 'currentNode' | 'currentNodeName'>,
){
    if (e.key !== 'Enter' || filteredList.length === 0) return;

        const trimmedSearch = search.trim();
        if (!trimmedSearch) return;

        callbacks.currentNode(filteredList[0].id);
        callbacks.currentNodeName(filteredList[0].node_name);
}

function resetSearch(
    setSearch: React.Dispatch<React.SetStateAction<string>>,
    renderLocationPanel: SearchUiProps['renderLocationPanel'],
    callbacks: Pick<SearchUiProps, 'currentNode' | 'currentNodeName'>,
){
    setSearch("");
    renderLocationPanel(false);
    callbacks.currentNode(null);
    callbacks.currentNodeName("");
}

export { 
    handleEnterKey, 
    resetSearch 
}