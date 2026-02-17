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
            className="fixed inset-0 z-20 "
            id="wrapper"
            onClick={handleClose}>

                <div 
                    className={`bg-white  border rounded-b-xl  p-4 shadow-lg flex flex-col ${design}`}
                    onClick={(e) => e.stopPropagation()}>
                        {children}
                </div>  

        </div>
    )
}

export default Modal