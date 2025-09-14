/**
 * VerifierForm Component Tests
 *
 * Simple tests for the address verification form component.
 * Tests form rendering, validation, and basic user interactions.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifierForm from "../VerifierForm";

// Mock Apollo Client
jest.mock("@apollo/client", () => ({
  gql: jest.fn((query) => query),
  useLazyQuery: jest.fn(() => [
    jest.fn(), // runValidate function
    {
      data: null,
      loading: false,
      error: null,
      called: false,
    },
  ]),
}));

// Mock Apollo Client React hooks
jest.mock("@apollo/client/react", () => ({
  useLazyQuery: jest.fn(() => [
    jest.fn(), // runValidate function
    {
      data: null,
      loading: false,
      error: null,
      called: false,
    },
  ]),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock Map component
jest.mock("../Map", () => {
  return function MockMap({ lat, lng }: { lat: number; lng: number }) {
    return (
      <div data-testid="map">
        Map at {lat}, {lng}
      </div>
    );
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("VerifierForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("renders the form with all required fields", () => {
    render(<VerifierForm />);

    expect(screen.getByLabelText("Postcode *")).toBeInTheDocument();
    expect(screen.getByLabelText("Suburb *")).toBeInTheDocument();
    expect(screen.getByLabelText("State *")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify Address" })
    ).toBeInTheDocument();
  });

  it("shows Australian states in the dropdown", () => {
    render(<VerifierForm />);

    const stateSelect = screen.getByLabelText("State *");
    expect(stateSelect).toBeInTheDocument();

    // Check for some Australian states
    expect(screen.getByText("VIC")).toBeInTheDocument();
    expect(screen.getByText("NSW")).toBeInTheDocument();
    expect(screen.getByText("QLD")).toBeInTheDocument();
  });

  it("handles form input changes", async () => {
    const user = userEvent.setup();
    render(<VerifierForm />);

    const postcodeInput = screen.getByLabelText("Postcode *");
    const suburbInput = screen.getByLabelText("Suburb *");
    const stateSelect = screen.getByLabelText("State *");

    // Test input changes
    await user.type(postcodeInput, "3000");
    await user.type(suburbInput, "Melbourne");
    await user.selectOptions(stateSelect, "VIC");

    expect(postcodeInput).toHaveValue("3000");
    expect(suburbInput).toHaveValue("Melbourne");
    expect(stateSelect).toHaveValue("VIC");
  });

  it("enables submit button when form is valid", async () => {
    const user = userEvent.setup();
    render(<VerifierForm />);

    const postcodeInput = screen.getByLabelText("Postcode *");
    const suburbInput = screen.getByLabelText("Suburb *");
    const stateSelect = screen.getByLabelText("State *");
    const submitButton = screen.getByRole("button", { name: "Verify Address" });

    await user.type(postcodeInput, "3000");
    await user.type(suburbInput, "Melbourne");
    await user.selectOptions(stateSelect, "VIC");

    expect(submitButton).not.toBeDisabled();
  });

  it("loads saved data from localStorage on mount", () => {
    const savedData = {
      postcode: "3000",
      suburb: "Melbourne",
      state: "VIC",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    render(<VerifierForm />);

    expect(screen.getByDisplayValue("3000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Melbourne")).toBeInTheDocument();
    expect(screen.getByDisplayValue("VIC")).toBeInTheDocument();
  });

  it("saves form data to localStorage when values change", async () => {
    const user = userEvent.setup();
    render(<VerifierForm />);

    const postcodeInput = screen.getByLabelText("Postcode *");
    await user.type(postcodeInput, "3000");

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "verifier-data",
      expect.stringContaining('"postcode":"3000"')
    );
  });

  it("shows logout button", () => {
    render(<VerifierForm />);

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
