export type SearchUiProps = {
    setCurrentNode: (id: number) => void;
    setCurrentNodeName: (name: string) => void;
    setCurrentNodeUrl: (url: string) => void;
}

export type NodeLocationDetailsProps = {
    selectedNodeName: string | null;
}

