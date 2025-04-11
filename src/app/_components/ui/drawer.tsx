import * as React from "react";

interface DrawerProps {
  isVisible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Drawer({ isVisible, onToggle, children, title }: DrawerProps) {
  // Close drawer when clicking outside
  const handleOverlayClick = () => {
    if (isVisible) {
      onToggle();
    }
  };

  return (
    <>
      <div
        className={`fixed left-0 right-0 top-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="rounded-b-xl bg-white shadow-lg dark:bg-[#080808]">
          <div className="border-b px-4 py-2 dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">
              {title ?? "Game Settings"}
            </h2>
          </div>
          <div className="max-h-[35vh] overflow-y-auto p-3">{children}</div>
        </div>
      </div>

      {/* Overlay to close when clicking outside */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}
