/**
 * VerifierForm Component
 *
 * A comprehensive address verification form that integrates with the Australia Post API
 * through GraphQL. Features real-time validation, interactive Google Maps display,
 * and persistent form data storage.
 *
 * @component
 * @requires Client-side rendering for localStorage and user interactions
 */

"use client";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Map from "./Map";

/**
 * GraphQL query for address validation
 *
 * Queries the backend API to validate Australian addresses using postcode,
 * suburb, and state information. Returns validation results with coordinates.
 */
const VALIDATE = gql`
  query Validate($postcode: String!, $suburb: String!, $state: String!) {
    validate(postcode: $postcode, suburb: $suburb, state: $state) {
      success
      message
      latitude
      longitude
    }
  }
`;

/**
 * TypeScript type definitions for address verification
 */
type ValidationResult = {
  success: boolean; // Whether validation was successful
  message: string; // Human-readable validation message
  latitude?: number | null; // Geographic latitude if valid
  longitude?: number | null; // Geographic longitude if valid
};

type ValidateQuery = { validate: ValidationResult };
type ValidateVars = { postcode: string; suburb: string; state: string };

// Australian state and territory abbreviations
const STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT", "NT"];

// Local storage key for persisting form data
const STORAGE_KEY = "verifier-data";
function VerifierForm() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setPostcode(data.postcode);
        setSuburb(data.suburb);
        setState(data.state);
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ postcode, suburb, state })
    );
  }, [postcode, suburb, state]);
  const postcodeValid = useMemo(
    () => /^\d{3,4}$/.test(postcode.trim()),
    [postcode]
  );
  const suburbValid = useMemo(() => suburb.trim().length >= 2, [suburb]);
  const formValid = postcodeValid && suburbValid;

  const [runValidate, { data, loading, error, called }] = useLazyQuery<
    ValidateQuery,
    ValidateVars
  >(VALIDATE, { fetchPolicy: "no-cache" });
  useEffect(() => {
    if (!error) return;

    if (error.message.includes("UNAUTHENTICATED")) {
      router.replace("/login?next=/verifier");
    }
  }, [error, router]);
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!formValid || loading) return;
    runValidate({
      variables: {
        postcode: postcode.trim(),
        suburb: suburb.trim(),
        state,
      },
    });
  }
  const result = data?.validate;
  const showResult = called && !loading && !!result;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if(data.clearStorage) {
        localStorage.removeItem('verifier-data');
      }
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      {/* Header with Logout Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Address Verification
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter address details to verify against Australian postal database
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Postcode Field */}
        <div>
          <label
            htmlFor="postcode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Postcode *
          </label>
          <input
            id="postcode"
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter postcode (e.g., 3000)"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              touched && !postcodeValid ? "border-red-300" : "border-gray-300"
            }`}
          />
          {touched && !postcodeValid && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid postcode (3-4 digits)
            </p>
          )}
        </div>

        {/* Suburb Field */}
        <div>
          <label
            htmlFor="suburb"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Suburb *
          </label>
          <input
            id="suburb"
            type="text"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="Enter suburb name"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              touched && !suburbValid ? "border-red-300" : "border-gray-300"
            }`}
          />
          {touched && !suburbValid && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a suburb name (at least 2 characters)
            </p>
          )}
        </div>

        {/* State Field */}
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            State *
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select a state</option>
            {STATES.map((stateOption) => (
              <option key={stateOption} value={stateOption}>
                {stateOption}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formValid || loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </div>
          ) : (
            "Verify Address"
          )}
        </button>
      </form>

      {/* Results Section */}
      {showResult && (
        <div className="mt-8 p-6 rounded-xl border border-gray-200 bg-gray-50">
          {result?.success ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Address Verified Successfully!
                </h3>
              </div>
              <p className="text-green-700 font-medium">{result.message}</p>

              {/* Map Component */}
              {result.latitude && result.longitude && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Location on Map:
                  </h4>
                  <Map
                    lat={result.latitude}
                    lng={result.longitude}
                    height={300}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Verification Failed
                </h3>
                <p className="text-red-700 font-medium">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 font-medium">Error: {error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifierForm;
