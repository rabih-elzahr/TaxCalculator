// App.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { vi } from "vitest";


// Wrap rendering with ChakraProvider and use the theme
const renderWithChakraProvider = (component: React.ReactNode) => {
    return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

// Mock API function
vi.mock("./api/Tax/Tax", () => ({
    getTaxRateByYear: vi.fn((taxYear) => {
        if (taxYear === "2022") {
            return Promise.resolve({
                tax_brackets: [
                    { min: 0, max: 50197, rate: 0.15 },
                    { min: 50197, max: 100392, rate: 0.205 },
                    { min: 100392, max: 155625, rate: 0.26 },
                    { min: 155625, max: 221708, rate: 0.29 },
                    { min: 221708, rate: 0.33 },
                ],
            });
        }
        return Promise.reject(new Error("Invalid tax year"));
    }),
}));

describe("Tax Calculator App", () => {
    test("renders the app", () => {
        renderWithChakraProvider(<App />);
        expect(screen.getByText(/Tax Calculator/i)).toBeInTheDocument();
    });

    test("displays an error message when inputs are empty", async () => {
        renderWithChakraProvider(<App />);
        fireEvent.click(screen.getByText(/Submit/i));
        expect(await screen.findByText(/Please enter both the annual income and tax year/i)).toBeInTheDocument();
    });

    test("calculates total tax and displays results for a valid input", async () => {
        renderWithChakraProvider(<App />);

        // Set income and tax year
        fireEvent.change(screen.getByPlaceholderText("Annual income"), { target: { value: "100000" } });
        fireEvent.change(screen.getByPlaceholderText("Tax year"), { target: { value: "2022" } });

        fireEvent.click(screen.getByText(/Submit/i));

        await waitFor(() => {
            expect(screen.getByText(/Total Tax: \$\d+(\.\d{2})?/)).toBeInTheDocument();
            expect(screen.getByText(/Effective Rate: \d+(\.\d{2})?%/)).toBeInTheDocument();
            expect(screen.getByText(/Taxes Owed Per Band:/)).toBeInTheDocument();
        });
    });

    test("triggers calculation on Enter key press", async () => {
        renderWithChakraProvider(<App />);

        // Set income and tax year
        fireEvent.change(screen.getByPlaceholderText("Annual income"), { target: { value: "100000" } });
        fireEvent.change(screen.getByPlaceholderText("Tax year"), { target: { value: "2022" } });

        fireEvent.keyDown(screen.getByPlaceholderText("Tax year"), { key: "Enter", code: "Enter" });

        await waitFor(() => {
            expect(screen.getByText(/Total Tax: \$\d+(\.\d{2})?/)).toBeInTheDocument();
            expect(screen.getByText(/Effective Rate: \d+(\.\d{2})?%/)).toBeInTheDocument();
        });
    });
});
