/** Country groups and allowed manual payment methods for student checkout. */
export const PAYMENT_COUNTRIES = [
  { id: "EG", methods: ["VODAFONE_CASH", "INSTAPAY"] },
  { id: "IQ", methods: ["CARD", "SARAFA", "VODAFONE_CASH", "INSTAPAY"] },
  { id: "SY", methods: ["AL_HARAM", "FAWATEER"] },
  { id: "OTHER", methods: ["CARD"] },
];

export const DEFAULT_PAYMENT_COUNTRY = "EG";

export function getMethodsForCountry(countryId) {
  const country = PAYMENT_COUNTRIES.find((c) => c.id === countryId);
  return country?.methods ?? PAYMENT_COUNTRIES.find((c) => c.id === "OTHER")?.methods ?? ["CARD"];
}

export function getDefaultMethodForCountry(countryId) {
  return getMethodsForCountry(countryId)[0] ?? "CARD";
}
