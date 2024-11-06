import { useState } from "react";
import {
  Flex, Text, Input, Stack, Button, Spinner, Box, Fieldset, Link, Image
} from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert"
import { getTaxRateByYear } from "./api/Tax/Tax";
import { ColorModeButton } from "@/components/ui/color-mode"
import { toaster } from "@/components/ui/toaster"
import { Field } from "@/components/ui/field"
import { LuCalculator } from "react-icons/lu";

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
      toaster.create({
        title: error.message || "An error occurred while calculating the tax.",
        type: "error"
      })
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCalculateTax();
    }
  };

  return (
    <>
      <Flex width="100%" justifyContent="space-between" padding="6px 12px">

        <Flex alignItems="center">
          <Text fontWeight="bold" fontSize="2xl" marginRight="6px"><LuCalculator /></Text>
          <Text fontWeight="bold" fontSize="xl">Income Tax Calculator</Text>
        </Flex>

        <ColorModeButton />
      </Flex>
      <Flex height="100vh" width="100%" justifyContent="center" alignItems="center" padding="2rem">
        <Fieldset.Root size="lg" maxW="md" onKeyDown={handleKeyDown}>
          <Stack>
            <Fieldset.Legend>Income Tax Calculator</Fieldset.Legend>
            <Fieldset.HelperText>
              Income Tax Calculator is a simple app for quick tax calculations based on tax brackets and rates in Canada. For more information on tax brackets and rates visit <Link href="https://www.canada.ca/en/financial-consumer-agency/services/financial-toolkit/taxes/taxes-2/5.html">Canada Tax Brakets and Rates</Link> website.</Fieldset.HelperText>
          </Stack>
          <Image src="/canada-flag.webp" alt="Canadian flag representing tax calculations in Canada" />

          <Fieldset.Content>

            <Box height="40px" width="100%" marginBottom="1.5rem" data-state="open" _open={{
              animation: "fade-in 3s ease-out",
            }}>
              {error ? (
                <Alert status="error" title={error} role="alert" aria-live="assertive" />
              ) : (
                <Box height="40px" />
              )}
            </Box>
            <Field label="Annual Income ($CAD)">
              <Input
                id="annual-income"
                placeholder="Example 25000"
                variant="outline"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                type="number"
                aria-describedby="annual-income-helper"
              />
            </Field>

            <Field label="Tax year">
              <Input
                id="tax-year"
                placeholder="Example 2022"
                variant="outline"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                type="number"
                aria-describedby="tax-year-helper"
              />
            </Field>
          </Fieldset.Content>
          <Button
            onClick={handleCalculateTax}
            colorScheme="blue"
            borderRadius="8px"
            margin="12px 1px"
            disabled={isLoading}
            aria-label="Submit annual income and tax year to calculate total tax"
          >
            Submit
          </Button>

          <Flex justifyContent="center">
            <Box role="status" aria-live="polite">
              {isLoading && (
                <Flex alignItems="end">
                  <Spinner marginTop={4} />
                  <Text marginLeft="12px">Calculating...</Text>
                </Flex>)}
            </Box>

            {totalTax !== null && (
              <Flex flexDir="column" data-state="open" _open={{
                animation: "fade-in 400ms ease-out",
              }}>
                <Text mt={4} fontSize="m" fontWeight="bold">
                  Total Tax: ${totalTax.toFixed(2)}
                </Text>
                <Text mt={2} fontSize="m" fontWeight="medium">
                  Effective Rate: {effectiveRate?.toFixed(2)}%
                </Text>
                <Text mt={4} fontSize="m" fontWeight="bold">
                  Taxes Owed Per Band:
                </Text>

                {taxesPerBand.map((band, index) => (
                  <Text key={index} fontSize="m" fontWeight="medium">
                    Rate: {band.rate * 100}% - Tax: ${band.amount.toFixed(2)}
                  </Text>
                ))}
              </Flex>
            )}
          </Flex>
        </Fieldset.Root>
      </Flex>
    </>
  );
}

export default App;
