import { useState } from "react";

export default function useLoadingError(){
    const [error, setError] =  useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    return {error, setError, loading, setLoading}
}