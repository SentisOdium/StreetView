import { useState } from "react";
export default function useShowModal() {
    const [showModal, setShowModal] = useState(false);
    
    return { showModal, setShowModal };
}