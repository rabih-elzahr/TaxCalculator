import { fetchData } from "../api";

// Fetch tax rates from the /tax-calculator endpoint
export const getTaxRates = async () => {
  try {
    const meData = await fetchData("/tax-calculator");
    return meData;
  } catch (error) {
    console.error("Failed to fetch tax rates:", error);
    throw error;
  }
};

// Fetch tax rates by year from the /tax-calculator/tax-year/{taxId} endpoint
export const getTaxRateByYear = async (taxYear: string) => {
    try {
      const meData = await fetchData(`/tax-calculator/tax-year/${taxYear}`);
      return meData;
    } catch (error) {
      console.error("Failed to fetch tax rates by year:", error);
      throw error;
    }
  };