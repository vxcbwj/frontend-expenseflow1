import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Receipt } from '../../services/receiptAPI';

interface ReceiptModalProps {
  receipts: Receipt[];
  initialIndex: number;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipts,
  initialIndex,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentReceipt = receipts[currentIndex];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, receipts.length, onClose]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : receipts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < receipts.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-6xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10">
          <div>
            <h3 className="font-medium">{currentReceipt.fileName}</h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} of {receipts.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentReceipt.fileUrl}
              download={currentReceipt.fileName}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-full flex items-center justify-center pt-16">
          {currentReceipt.fileType === 'image' ? (
            <img
              src={currentReceipt.fileUrl}
              alt={currentReceipt.fileName}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <iframe
              src={currentReceipt.fileUrl}
              className="w-full h-full bg-white rounded-lg"
              title={currentReceipt.fileName}
            />
          )}
        </div>

        {/* Navigation (if multiple receipts) */}
        {receipts.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
