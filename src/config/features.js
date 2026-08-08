const envFlag = (name, defaultValue) => {
  const value = import.meta.env[name];
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

export const platformFeatures = {
  wallet: envFlag("VITE_FEATURE_WALLET", false),
  communityEvents: envFlag("VITE_FEATURE_COMMUNITY_EVENTS", false),
  publicInstructorCatalog: envFlag("VITE_FEATURE_PUBLIC_INSTRUCTOR_CATALOG", false),
  instructorSelfService: envFlag("VITE_FEATURE_INSTRUCTOR_SELF_SERVICE", false),
  privateBooking: envFlag("VITE_FEATURE_PRIVATE_BOOKING", false),
  multiInstructor: envFlag("VITE_FEATURE_MULTI_INSTRUCTOR", false),
};

export const isFeatureEnabled = (feature) => Boolean(platformFeatures[feature]);
