import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../login/page";

// Mock Next.js router
const mockPush = jest.fn();
const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockGet.mockReturnValue(null);
  });

  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows success message from URL params", () => {
    mockGet.mockReturnValue("Registration successful! Please sign in.");

    render(<LoginPage />);

    expect(
      screen.getByText("Registration successful! Please sign in.")
    ).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const form = container.querySelector("form");

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "TestPassword123!");

    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    const { container } = render(<LoginPage />);

    const form = container.querySelector("form");

    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.click(submitButton);

    // Test that the API call was made with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "test@example.com",
          password: "TestPassword123!",
        }),
      });
    });

    // Test that the form submission was successful (no error messages)
    await waitFor(() => {
      expect(
        screen.queryByText(/error|invalid|failed/i)
      ).not.toBeInTheDocument();
    });
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "WrongPassword123!");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("handles network error", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  it("clears field errors when user starts typing", async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const form = container.querySelector("form");

    // Trigger validation error
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    // Start typing to clear error
    await user.type(emailInput, "test@example.com");

    await waitFor(() => {
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });
  });
});
