import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Easy to Use',
    imageUrl: 'img/undraw_coding.svg',
    description: (
      <>
        nx-dotnet was designed from the ground up to allow developers to develop
        how they want to. Easily stick with Visual Studio or other IDE's, or
        switch to a more lightweight environment such as VS Code.
      </>
    ),
  },
  {
    title: 'Computational Caching and Dependency Graph Tools for .NET',
    imageUrl: 'img/undraw_adventure_map.svg',
    description: (
      <>
        All of the power of nx, brought to the .NET workflow. Easily build,
        test, and publish only what was changed in CI.
      </>
    ),
  },
  {
    title: 'Powered by Nx + .NET SDK',
    imageUrl: 'img/undraw_code_thinking.svg',
    description: (
      <>
        Built using the .NET SDK + CLI, nx-dotnet is easy to update and should
        never break due to a new release of .NET. Using a preview version? No
        worry, since nx-dotnet uses your installed CLI you can choose exactly
        what to run.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
