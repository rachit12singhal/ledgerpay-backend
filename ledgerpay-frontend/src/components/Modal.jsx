import { useEffect } from 'react';

function Modal({ title, onClose, children, disabled = false }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !disabled) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, disabled]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !disabled) {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            role="presentation"
            onClick={handleOverlayClick}
        >
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="modal__header">
                    <h2 id="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal__close"
                        onClick={onClose}
                        disabled={disabled}
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default Modal;
