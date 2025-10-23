import React from 'react';
import { DeprecationBanner } from '../components/DeprecationBanner';
import { DeprecationModal } from '../components/DeprecationModal';

// Root component wraps the entire application
// This is where we add global components like the banner and modal
export default function Root({ children }) {
  return (
    <>
      <DeprecationBanner />
      <DeprecationModal />
      {children}
    </>
  );
}
