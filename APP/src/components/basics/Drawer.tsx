import { ReactNode } from "react";

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <>
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-50 shadow-lg overflow-auto transition-all">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
                &times;
              </button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        </>
      )}
    </>
  );
}
