import React from "react";

type ModalProps = {
  children: React.ReactNode
  onClose: () => void;
  isVisible: boolean;
  design?: String;
}
const Modal = ({ children, onClose, isVisible, design }: ModalProps) => {
    if(!isVisible) return null;

    const handleClose = (e: React.MouseEvent<HTMLDivElement>) =>{
        if(e.target === e.currentTarget) onClose();
    }

    return (
        <div 
            className="fixed inset-0 z-50"
            role="presentation"
            onClick={handleClose}>

                <div 
                    role="dialog"
                    aria-modal="true"
                    className={`flex flex-col rounded-b-xl bg-white p-4 shadow-lg ${design}`}
                    onClick={(e) => e.stopPropagation()}>
                        {children}
                </div>  

        </div>
    )
}

export default Modal