export type SearchUiProps = {
    setCurrentNode: (id: number) => void;
    setCurrentNodeName: (name: string) => void;
}

export type NodeLocationDetailsProps = {
    selectedNodeName: string | null;
}