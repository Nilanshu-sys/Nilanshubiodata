"use client";

import { useEffect, useState } from "react";

type Consent = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  savedAt: number;
};

const COOKIE_NAME = "nilanshu_cookie_consent";
const SIX_MONTHS = 60 * 60 * 24 * 180;

function saveConsent(consent: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`;
}

function readConsent(): Consent | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const value = JSON.parse(
      decodeURIComponent(cookie.substring(COOKIE_NAME.length + 1))
    );

    if (
      typeof value.analytics !== "boolean" ||
      typeof value.advertising !== "boolean" ||
      Date.now() - value.savedAt > SIX_MONTHS * 1000
    ) {
      return null;
    }

    return value as Consent;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    const existing = readConsent();

    if (existing) {
      setAnalytics(existing.analytics);
      setAdvertising(existing.advertising);
    } else {
      setVisible(true);
    }
  }, []);

  function finishConsent(analyticsChoice: boolean, adsChoice: boolean) {
    const consent: Consent = {
      necessary: true,
      analytics: analyticsChoice,
      advertising: adsChoice,
      savedAt: Date.now(),
    };

    saveConsent(consent);
    setAnalytics(analyticsChoice);
    setAdvertising(adsChoice);
    setVisible(false);
    setSettings(false);

    window.dispatchEvent(
      new CustomEvent("cookie-consent-updated", { detail: consent })
    );
  }

  // Load Google AdSense only after advertising consent.
  useEffect(() => {
    if (!advertising) return;

    if (document.getElementById("google-adsense-script")) return;

    const script = document.createElement("script");
    script.id = "google-adsense-script";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5367732405267748";

    document.head.appendChild(script);
  }, [advertising]);

  return (
    <>
      {!visible && (
        <button
          className="cookie-settings-button"
          onClick={() => {
            setAnalytics(readConsent()?.analytics ?? false);
            setAdvertising(readConsent()?.advertising ?? false);
            setSettings(true);
            setVisible(true);
          }}
          aria-label="Open cookie settings"
        >
          🍪 Cookie Settings
        </button>
      )}

      {visible && (
        <div className="cookie-overlay">
          <section
            className="cookie-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
          >
            <div className="cookie-icon">🍪</div>

            <h2 id="cookie-title">Your Privacy Matters!</h2>

            <p>
              Welcome to Nilanshu Biodata! We use cookies to improve your
              browsing experience, remember your preferences and support
              website advertising.
            </p>

            <div className="cookie-category">
              <div>
                <strong>Essential Cookies</strong>
                <small>Required for basic website functionality.</small>
              </div>
              <span className="cookie-always">Always Active</span>
            </div>

            {settings && (
              <>
                <label className="cookie-category">
                  <div>
                    <strong>Analytics Cookies</strong>
                    <small>Help us understand website usage.</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                </label>

                <label className="cookie-category">
                  <div>
                    <strong>Advertising Cookies</strong>
                    <small>Support relevant ads and advertising services.</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={advertising}
                    onChange={(e) => setAdvertising(e.target.checked)}
                  />
                </label>
              </>
            )}

            <div className="cookie-actions">
              <button
                className="cookie-accept"
                onClick={() => finishConsent(true, true)}
              >
                Accept All
              </button>

              <button
                className="cookie-reject"
                onClick={() => finishConsent(false, false)}
              >
                Reject Optional
              </button>

              {!settings ? (
                <button
                  className="cookie-customize"
                  onClick={() => setSettings(true)}
                >
                  Customize
                </button>
              ) : (
                <button
                  className="cookie-customize"
                  onClick={() => finishConsent(analytics, advertising)}
                >
                  Save Preferences
                </button>
              )}
            </div>

            <p className="cookie-footer">
              Read our{" "}
              <a href="/privacy" target="_blank">
                Privacy Policy
              </a>{" "}
              for more information.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
