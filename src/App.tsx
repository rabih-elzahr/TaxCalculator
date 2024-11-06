import { useState } from "react";
import { Flex, Text, Input, Stack, Button, Spinner, Box } from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert"
import { getTaxRateByYear } from "./api/Tax/Tax";

function App() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [taxYear, setTaxYear] = useState("");
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [taxesPerBand, setTaxesPerBand] = useState<{ rate: number; amount: number }[]>([]);
  const [effectiveRate, setEffectiveRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculateTotalTax = (income: number, taxBrackets: any[]) => {
    let tax = 0;
    const taxesPerBand = [];

    for (const bracket of taxBrackets) {
      const { min, max, rate } = bracket;

      if (income > min) {
        const taxableIncome = max ? Math.min(income, max) - min : income - min;
        const taxForBand = taxableIncome * rate;
        tax += taxForBand;
        taxesPerBand.push({ rate, amount: taxForBand });
      } else {
        break;
      }
    }

    const effectiveRate = (tax / income) * 100;
    return { totalTax: tax, taxesPerBand, effectiveRate };
  };

  const handleCalculateTax = async () => {
    setError(null);
    setTotalTax(null);
    setTaxesPerBand([]);
    setEffectiveRate(null);

    if (!annualIncome || !taxYear) {
      setError("Please enter both the annual income and tax year.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getTaxRateByYear(taxYear);

      if (!response) throw new Error("Failed to fetch tax data. Please try again.");
      const { totalTax, taxesPerBand, effectiveRate } = calculateTotalTax(parseFloat(annualIncome), response.tax_brackets);
      setTotalTax(totalTax);
      setTaxesPerBand(taxesPerBand);
      setEffectiveRate(effectiveRate);
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
      <Flex flexDir="column" align="center" justify="center" width="320px" onKeyDown={handleKeyDown} height="448px">
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
          <>
            <Text mt={4} fontSize="xl" fontWeight="bold">
              Total Tax: ${totalTax.toFixed(2)}
            </Text>
            <Text mt={2} fontSize="xl" fontWeight="medium">
              Effective Rate: {effectiveRate?.toFixed(2)}%
            </Text>
            <Text mt={4} fontSize="xl" fontWeight="bold">
              Taxes Owed Per Band:
            </Text>

            {taxesPerBand.map((band, index) => (
              <Text key={index} fontSize="xl" fontWeight="medium">
                Rate: {band.rate * 100}% - Tax: ${band.amount.toFixed(2)}
              </Text>
            ))}
          </>
        )}
      </Flex>
    </Flex>
  );
}

export default App;
