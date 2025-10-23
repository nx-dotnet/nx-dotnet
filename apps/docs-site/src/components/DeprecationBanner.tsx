import React from 'react';
import styles from './DeprecationBanner.module.css';

export function DeprecationBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>⚠️</span>
        <span className={styles.text}>
          <strong>@nx-dotnet/core is deprecated.</strong>{' '}
          <a
            href="https://nx.dev/docs/technologies/dotnet/guides/migrate-from-nx-dotnet-core"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Migrate to @nx/dotnet →
          </a>
        </span>
      </div>
    </div>
  );
}
