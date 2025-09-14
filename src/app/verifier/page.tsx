"use client";
import VerifierForm from "@/components/ui/VerifierForm";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function VerifierPage() {
  const { user, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Lawpath Verifier
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Address Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify Australian addresses with our comprehensive database
          </p>

          {/* User Info */}
          {loading ? (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : user ? (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Welcome, {user.username}
            </div>
          ) : error ? (
            <div className="mt-4 text-sm text-red-600">
              Unable to load user information
            </div>
          ) : null}
        </div>

        {/* Main Content */}
        <ApolloProvider client={apolloClient}>
          <VerifierForm />
        </ApolloProvider>
      </div>
    </div>
  );
}
