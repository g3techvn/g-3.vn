import React, { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onOpenLogin,
  onOpenRegister,
}) => {
  const handleSwitchToRegister = () => {
    onCloseLogin();
    setTimeout(() => {
      onOpenRegister();
    }, 100);
  };

  const handleSwitchToLogin = () => {
    onCloseRegister();
    setTimeout(() => {
      onOpenLogin();
    }, 100);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onRegisterClick={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={onCloseRegister}
        onLoginClick={handleSwitchToLogin}
      />
    </>
  );
};

export default AuthModals; 