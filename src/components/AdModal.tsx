'use client';

import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AdModalProps {
  storageKey?: string;
  expirationHours?: number;
  children: React.ReactNode;
}

export default function AdModal({
  storageKey = 'ad-modal-shown',
  expirationHours = 24,
  children
}: AdModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfShouldShow = () => {
      const lastShown = localStorage.getItem(storageKey);
      if (!lastShown) {
        setIsOpen(true);
        return;
      }

      const lastShownDate = new Date(lastShown);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff >= expirationHours) {
        setIsOpen(true);
      }
    };

    // Slight delay to ensure page is loaded
    const timer = setTimeout(checkIfShouldShow, 1000);
    return () => clearTimeout(timer);
  }, [storageKey, expirationHours]);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, new Date().toISOString());
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-lg p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 