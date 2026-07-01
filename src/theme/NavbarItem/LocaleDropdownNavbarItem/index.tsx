/**
 * Swizzled LocaleDropdownNavbarItem
 *
 * Fixes two bugs in the upstream implementation:
 * 1. Local dev: selecting EN produces /en/en (double-prefix) because
 *    pathnameSuffix already contains the locale segment when currentLocale
 *    is the default and the pathname hasn't been stripped of the locale prefix.
 * 2. Production: switching to zh-Hans produces https://sukima-ml/artwork-004
 *    (wrong domain) because isSameDomain check fails and fullyQualified:true
 *    picks up a malformed URL.
 *
 * Fix: always use pathname:// relative URLs and manually strip any existing
 * locale prefix from the current path before prepending the target locale's
 * baseUrl.
 */

import React, {type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {translate} from '@docusaurus/Translate';
import {mergeSearchStrings, useHistorySelector} from '@docusaurus/theme-common';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import IconLanguage from '@theme/Icon/Language';
import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';
import type {Props} from '@theme/NavbarItem/LocaleDropdownNavbarItem';

// Imported for the CSS module that styles the language icon
import styles from './styles.module.css';

/**
 * Given the current pathname and the i18n context, returns the "bare" path
 * that has no locale prefix — so we can safely prepend any target locale's
 * baseUrl without creating double-prefixes like /en/en/foo.
 */
function useBarePath(): string {
  const {
    siteConfig: {baseUrl, trailingSlash},
    i18n: {currentLocale, defaultLocale, locales, localeConfigs},
  } = useDocusaurusContext();
  const {pathname} = useLocation();

  // Strip trailing slash / add it consistently with siteConfig.trailingSlash
  // We keep it simple: just work with the raw pathname.

  // The current locale's baseUrl (e.g. "/" for zh-Hans, "/en/" for en)
  const currentLocaleBaseUrl: string =
    (localeConfigs[currentLocale] as {baseUrl?: string})?.baseUrl ??
    (currentLocale === defaultLocale ? baseUrl : `${baseUrl}${currentLocale}/`);

  // Strip the current locale's baseUrl prefix from the pathname to get the
  // bare content path (e.g. "/en/sukima-ml" → "sukima-ml" when on /en/).
  let barePath = pathname;
  if (
    currentLocaleBaseUrl !== '/' &&
    pathname.startsWith(currentLocaleBaseUrl)
  ) {
    barePath = pathname.slice(currentLocaleBaseUrl.length);
  } else if (currentLocaleBaseUrl === '/' && pathname.startsWith('/')) {
    // Default locale: pathname is already the bare path (no locale prefix)
    barePath = pathname.slice(1); // strip leading "/"
  }

  return barePath;
}

export default function LocaleDropdownNavbarItem({
  mobile,
  dropdownItemsBefore,
  dropdownItemsAfter,
  queryString,
  ...props
}: Props): ReactNode {
  const {
    i18n: {currentLocale, locales, localeConfigs},
  } = useDocusaurusContext();
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);
  const barePath = useBarePath();

  const localeItems = locales.map((locale): LinkLikeNavbarItemProps => {
    const localeConfig = localeConfigs[locale] as {
      baseUrl?: string;
      label?: string;
      htmlLang?: string;
    };

    // Always build a relative pathname:// URL to avoid any domain-related bugs.
    // localeConfig.baseUrl is e.g. "/" for zh-Hans, "/en/" for en.
    const targetBaseUrl: string = localeConfig.baseUrl ?? '/';

    // Reconstruct the full path for the target locale
    const targetPath =
      targetBaseUrl === '/'
        ? `/${barePath}`
        : `${targetBaseUrl}${barePath}`;

    const finalSearch = mergeSearchStrings([search, queryString], 'append');
    const to = `pathname://${targetPath}${finalSearch}${hash}`;

    return {
      label: localeConfig.label ?? locale,
      lang: localeConfig.htmlLang ?? locale,
      to,
      target: '_self',
      autoAddBaseUrl: false,
      className:
        locale === currentLocale
          ? mobile
            ? 'menu__link--active'
            : 'dropdown__link--active'
          : '',
    };
  });

  const items = [...dropdownItemsBefore, ...localeItems, ...dropdownItemsAfter];

  const dropdownLabel = mobile
    ? translate({
        message: 'Languages',
        id: 'theme.navbar.mobileLanguageDropdown.label',
        description: 'The label for the mobile language switcher dropdown',
      })
    : (localeConfigs[currentLocale] as {label?: string})?.label ?? currentLocale;

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={
        <>
          <IconLanguage className={styles.iconLanguage} />
          {dropdownLabel}
        </>
      }
      items={items}
    />
  );
}
