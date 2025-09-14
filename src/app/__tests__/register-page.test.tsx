import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../register/page";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders registration form", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const form = container.querySelector("form");

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "TestPassword123!");
    await user.type(confirmPasswordInput, "TestPassword123!");

    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeInTheDocument();
    });
  });

  it("validates password requirements", async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const form = container.querySelector("form");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "weak");
    await user.type(confirmPasswordInput, "weak");

    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters long")
      ).toBeInTheDocument();
    });
  });

  it("validates password confirmation", async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const form = container.querySelector("form");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.type(confirmPasswordInput, "DifferentPassword123!");

    // Use fireEvent.submit to bypass HTML5 validation
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows password strength indicator", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText("Password");

    await user.type(passwordInput, "TestPassword123!");

    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "User created successfully" }),
    });

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.type(confirmPasswordInput, "TestPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "test@example.com",
          password: "TestPassword123!",
        }),
      });
    });
  });

  it("handles registration error", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Username already exists" }),
    });

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "TestPassword123!");
    await user.type(confirmPasswordInput, "TestPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });

  it("clears field errors when user starts typing", async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterPage />);

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
