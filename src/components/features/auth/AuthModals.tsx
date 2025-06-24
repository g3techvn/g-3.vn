'use client';

import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthModalsProps {
  isLoginOpen?: boolean;
  isRegisterOpen?: boolean;
  onCloseLogin?: () => void;
  onCloseRegister?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export default function AuthModals({
  isLoginOpen: externalIsLoginOpen,
  isRegisterOpen: externalIsRegisterOpen,
  onCloseLogin: externalOnCloseLogin,
  onCloseRegister: externalOnCloseRegister,
  onOpenLogin: externalOnOpenLogin,
  onOpenRegister: externalOnOpenRegister
}: AuthModalsProps = {}) {
  const [internalIsLoginOpen, setInternalIsLoginOpen] = useState(false);
  const [internalIsRegisterOpen, setInternalIsRegisterOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isLoginOpen = typeof externalIsLoginOpen !== 'undefined' ? externalIsLoginOpen : internalIsLoginOpen;
  const isRegisterOpen = typeof externalIsRegisterOpen !== 'undefined' ? externalIsRegisterOpen : internalIsRegisterOpen;

  const onCloseLogin = () => {
    if (externalOnCloseLogin) {
      externalOnCloseLogin();
    } else {
      setInternalIsLoginOpen(false);
    }
  };

  const onCloseRegister = () => {
    if (externalOnCloseRegister) {
      externalOnCloseRegister();
    } else {
      setInternalIsRegisterOpen(false);
    }
  };

  const onOpenLogin = () => {
    if (externalOnOpenLogin) {
      externalOnOpenLogin();
    } else {
      setInternalIsLoginOpen(true);
      setInternalIsRegisterOpen(false);
    }
  };

  const onOpenRegister = () => {
    if (externalOnOpenRegister) {
      externalOnOpenRegister();
    } else {
      setInternalIsRegisterOpen(true);
      setInternalIsLoginOpen(false);
    }
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onOpenRegister={onOpenRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={onCloseRegister}
        onOpenLogin={onOpenLogin}
      />
    </>
  );
} 