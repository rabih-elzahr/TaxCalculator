import { useState } from "react";
import { Flex, Text, Input, Stack, Button, Spinner, Box } from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert"
import { getTaxRateByYear } from "./api/Tax/Tax";

function App() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [taxYear, setTaxYear] = useState("");
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculateTotalTax = (income: number, taxBrackets: any[]) => {
    let tax = 0;

    for (const bracket of taxBrackets) {
      const { min, max, rate } = bracket;

      if (income > min) {
        const taxableIncome = max ? Math.min(income, max) - min : income - min;
        tax += taxableIncome * rate;
      } else {
        break;
      }
    }

    return tax;
  };

  const handleCalculateTax = async () => {
    setError(null);
    setTotalTax(null);

    if (!annualIncome || !taxYear) {
      setError("Please enter both the annual income and tax year.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getTaxRateByYear(taxYear);

      if (!response) throw new Error("Failed to fetch tax data. Please try again.");
      const calculatedTax = calculateTotalTax(parseFloat(annualIncome), response.tax_brackets);
      setTotalTax(calculatedTax);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || "An error occurred while calculating the tax.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCalculateTax();
    }
  };

  return (
    <Flex height="100vh" width="100%" justifyContent="center" alignItems="center">
      <Flex flexDir="column" align="center" justify="center" width="320px" onKeyDown={handleKeyDown}>
        <Box height="80px" width="100%" mb={4}>
          {error ? (
            <Alert status="error" title={error} />
          ) : (
            <Box height="80px" />
          )}
        </Box>
        <Text fontWeight="bold" fontSize="2xl" mb={4}>Tax Calculator</Text>
        <Stack width="100%">
          <Input
            placeholder="Annual income"
            variant="outline"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            type="number"
          />
          <Input
            placeholder="Tax year"
            variant="outline"
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value)}
            type="number"
          />
          <Button
            onClick={handleCalculateTax}
            colorScheme="blue"
            borderRadius="8px"
            margin="2px 1px"
            disabled={isLoading}
          >
            Submit
          </Button>
        </Stack>

        {isLoading && <Spinner marginTop={4} />}

        {totalTax !== null && (
          <Text mt={4} fontSize="xl" fontWeight="bold">
            Total Tax: ${totalTax.toFixed(2)}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}

export default App;
