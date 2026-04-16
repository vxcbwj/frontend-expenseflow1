import { useState } from 'react';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import { Receipt } from '../../services/receiptAPI';
import ConfirmDialog from '../ui/ConfirmDialog';

interface ReceiptGalleryProps {
  receipts: Receipt[];
  onView: (index: number) => void;
  onDelete?: (receiptId: string) => Promise<void>;
  canDelete?: boolean;
  loading?: boolean;
}

export const ReceiptGallery: React.FC<ReceiptGalleryProps> = ({
  receipts,
  onView,
  onDelete,
  canDelete = false,
  loading = false
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);

  const confirmDelete = async () => {
    if (!onDelete || !deleteConfirm) return;
    await onDelete(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // Empty state
  if (receipts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">No receipts uploaded yet</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {receipts.map((receipt, index) => (
        <div
          key={receipt._id}
          className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Image preview */}
          <div
            onClick={() => onView(index)}
            className="aspect-square cursor-pointer hover:opacity-75 transition-opacity"
          >
            {receipt.fileType === 'image' ? (
              <img
                src={receipt.thumbnailUrl || receipt.fileUrl}
                alt={receipt.fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <FileText className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => onView(index)}
              className="p-2 bg-white rounded-full hover:bg-gray-100"
              title="View"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>
            <a
              href={receipt.fileUrl}
              download={receipt.fileName}
              className="p-2 bg-white rounded-full hover:bg-gray-100"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </a>
            {canDelete && onDelete && (
              <button
                onClick={() => setDeleteConfirm({id: receipt._id, name: receipt.fileName})}
                className="p-2 bg-white rounded-full hover:bg-red-100"
                title="Delete"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>

          {/* File info */}
          <div className="p-2 bg-white dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {receipt.fileName}
            </p>
            <p className="text-xs text-gray-500">
              {(receipt.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ))}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Receipt"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};
