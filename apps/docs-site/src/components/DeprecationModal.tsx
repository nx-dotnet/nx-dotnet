import React, { useEffect, useMemo, useState } from 'react';
import styles from './DeprecationModal.module.css';

const STORAGE_KEY = 'nx-dotnet-deprecation-dismissed';

export function DeprecationModal() {
  const [isVisible, setIsVisible] = useState(false);

  const isSearchCrawler = useMemo(
    () =>
      /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
    [],
  );

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Check if user has already dismissed the modal
    const dismissed =
      window.localStorage.getItem(STORAGE_KEY) || isSearchCrawler;
    if (!dismissed) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  const handleMigrate = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
      window.open(
        'https://nx.dev/docs/technologies/dotnet/guides/migrate-from-nx-dotnet-core',
        '_blank',
      );
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={styles.overlay} onClick={handleDismiss} />
      <div className={styles.modal} role="dialog" aria-labelledby="modal-title">
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.header}>
          <span className={styles.warningIcon}>⚠️</span>
          <h2 id="modal-title" className={styles.title}>
            @nx-dotnet/core is Deprecated
          </h2>
        </div>

        <div className={styles.content}>
          <p className={styles.intro}>
            <strong>
              The official @nx/dotnet plugin is now available in Nx 22+
            </strong>
          </p>

          <ul className={styles.benefits}>
            <li>
              <strong>Officially supported</strong> by the Nx team
            </li>
            <li>
              <strong>More reliable</strong> with custom MSBuild analyzer
            </li>
            <li>
              <strong>Always compatible</strong> with the latest Nx releases
            </li>
          </ul>

          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={handleMigrate}>
              View Migration Guide
            </button>
            <button className={styles.secondaryButton} onClick={handleDismiss}>
              Dismiss
            </button>
          </div>

          <p className={styles.footer}>
            Migration is straightforward and takes less than 10 minutes.
          </p>
        </div>
      </div>
    </>
  );
}
