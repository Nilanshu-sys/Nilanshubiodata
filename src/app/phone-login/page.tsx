"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../lib/firebase";

const API = "http://localhost:4000/api/otp";

export default function PhoneLoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sent || seconds <= 0) return;

    const timer = window.setTimeout(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [sent, seconds]);

  async function requestOTP() {
    setError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s()-]/g, "");

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(cleanPhone)) {
      setError("Valid phone number enter karo, jaise +919876543210.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "OTP send nahi hua.");
      }

      setPhone(cleanPhone);
      setSent(true);
      setSeconds(
        typeof data.expiresIn === "number" ? data.expiresIn : 120
      );
      setOtp("");
      setMessage("OTP sent! Apne SMS inbox ko check karo.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "OTP send nahi hua. Backend aur SMS settings check karo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    setError("");
    setMessage("");

    const cleanPhone = phone.trim().replace(/[\s()-]/g, "");
    const cleanOTP = otp.trim();

    if (seconds <= 0) {
      setError("OTP expire ho gaya. Naya OTP request karo.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          otp: cleanOTP,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "OTP verification failed."
        );
      }

      if (typeof data.token !== "string" || !data.token) {
        throw new Error("Backend ne valid Firebase token return nahi kiya.");
      }

      await signInWithCustomToken(auth, data.token);

      setMessage("Phone verified! Dashboard khol rahe hain...");
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function requestNewOTP() {
    setSent(false);
    setOtp("");
    setSeconds(120);
    setError("");
    setMessage("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mb-4 text-5xl">📱</div>

          <h1 className="text-3xl font-bold">Phone Number Login</h1>

          <p className="mt-2 text-sm text-slate-400">
            Login securely with your mobile number
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();

            if (loading) return;

            if (sent) {
              void verifyOTP();
            } else {
              void requestOTP();
            }
          }}
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              minLength={2}
              maxLength={80}
              required
              disabled={sent || loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+919876543210"
              required
              disabled={sent || loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Country code ke saath number enter karo, jaise +91.
            </p>
          </div>

          {sent && (
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium"
              >
                Enter 6-Digit OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                required
                disabled={loading || seconds <= 0}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-blue-500 disabled:opacity-60"
              />

              <p className="mt-2 text-sm text-slate-400" aria-live="polite">
                {seconds > 0
                  ? `OTP expires in ${Math.floor(seconds / 60)}:${String(
                      seconds % 60
                    ).padStart(2, "0")}`
                  : "OTP expired. Request a new OTP."}
              </p>
            </div>
          )}

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="break-words text-sm text-green-400"
            >
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="break-words text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (sent && seconds <= 0)}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : sent
                ? "Verify OTP & Login"
                : "Send OTP"}
          </button>
        </form>

        {sent && (
          <button
            type="button"
            disabled={loading || seconds > 0}
            onClick={requestNewOTP}
            className="mt-4 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-blue-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request a New OTP
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-7 w-full text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Login
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          Secured with Firebase Authentication
        </p>
      </section>
    </main>
  );
}