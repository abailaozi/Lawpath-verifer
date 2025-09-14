/**
 * Map Component Tests
 *
 * Simple tests for the Google Maps component.
 * Tests component rendering and props handling.
 */

import { render, screen } from "@testing-library/react";
import Map from "../Map";

// Type definitions for Google Maps components
interface GoogleMapProps {
  children: React.ReactNode;
  center: { lat: number; lng: number };
  zoom: number;
}

interface MarkerProps {
  position: { lat: number; lng: number };
}

interface UseJsApiLoaderReturn {
  isLoaded: boolean;
}

// Mock Google Maps API
jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children, center, zoom }: GoogleMapProps) => (
    <div
      data-testid="google-map"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  Marker: ({ position }: MarkerProps) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      Marker
    </div>
  ),
  useJsApiLoader: (): UseJsApiLoaderReturn => ({ isLoaded: true }),
}));

describe("Map Component", () => {
  it("renders the map with default props", () => {
    render(<Map lat={-37.8136} lng={144.9631} />);

    expect(screen.getByTestId("google-map")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toBeInTheDocument();
  });

  it("renders with custom coordinates", () => {
    const lat = -33.8688;
    const lng = 151.2093;

    render(<Map lat={lat} lng={lng} />);

    const map = screen.getByTestId("google-map");
    const marker = screen.getByTestId("marker");

    expect(map).toHaveAttribute("data-center", JSON.stringify({ lat, lng }));
    expect(marker).toHaveAttribute(
      "data-position",
      JSON.stringify({ lat, lng })
    );
  });

  it("renders with custom zoom level", () => {
    const zoom = 15;

    render(<Map lat={-37.8136} lng={144.9631} zoom={zoom} />);

    const map = screen.getByTestId("google-map");
    expect(map).toHaveAttribute("data-zoom", zoom.toString());
  });

  it("renders with custom dimensions", () => {
    const height = 400;
    const width = "80%";

    render(<Map lat={-37.8136} lng={144.9631} height={height} width={width} />);

    const mapContainer = screen.getByTestId("google-map").parentElement;
    expect(mapContainer).toHaveStyle({
      height: "400px",
      width: "80%",
    });
  });

  it("renders with proper styling", () => {
    render(<Map lat={-37.8136} lng={144.9631} height={500} width="90%" />);

    const mapContainer = screen.getByTestId("google-map").parentElement;
    expect(mapContainer).toHaveStyle({
      height: "500px",
      width: "90%",
      "border-radius": "12px",
      overflow: "hidden",
    });
  });
});
