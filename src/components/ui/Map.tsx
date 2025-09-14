/**
 * Interactive Google Maps Component
 *
 * Displays an interactive Google Map with a marker at the specified coordinates.
 * Features responsive design, customizable dimensions, and optimized loading.
 *
 * @component
 * @requires Google Maps API key in environment variables
 * @requires Client-side rendering for Google Maps integration
 */

"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";

/**
 * Props interface for Map component
 */
type Props = {
  lat: number; // Latitude coordinate
  lng: number; // Longitude coordinate
  zoom?: number; // Map zoom level (default: 14)
  height?: number | string; // Map container height (default: 320px)
  width?: number | string; // Map container width (default: 100%)
};

/**
 * Interactive Google Maps component with marker
 *
 * Renders a Google Map centered on the provided coordinates with a marker.
 * Includes loading state, responsive design, and customizable appearance.
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} Google Maps component or loading indicator
 */
export default function Map({
  lat,
  lng,
  zoom = 14,
  height = 320,
  width = "100%",
}: Props) {
  // Memoize center coordinates to prevent unnecessary re-renders
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  // Load Google Maps API with environment key
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  // Show loading indicator while Google Maps API loads
  if (!isLoaded)
    return <div className="text-sm text-gray-500">Loading map…</div>;

  return (
    <div style={{ height, width, overflow: "hidden", borderRadius: 12 }}>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: true, // Hide default UI elements for cleaner look
          zoomControl: true, // Keep zoom controls for user interaction
        }}
      >
        {/* Place marker at the specified coordinates */}
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
