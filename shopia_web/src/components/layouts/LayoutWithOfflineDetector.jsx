import React from 'react';
import OfflineDetector from '../ui/OfflineDetector';

export default function LayoutWithOfflineDetector({ children }) {
  return (
    <>
      <OfflineDetector />
      {children}
    </>
  );
}