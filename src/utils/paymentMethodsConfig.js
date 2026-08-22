/**
 * Checkout payment methods config (mirrors backend defaults).
 * Live values come from public site settings / admin PlatformSetting.
 */

export const PAYMENT_METHODS_CONFIG_KEY = "PAYMENT_METHODS_CONFIG";

const IRAQ_STRIPE = "https://buy.stripe.com/8x26oIdgU5DY5kO2QV9Ve0G";
const JORDAN_STRIPE = "https://buy.stripe.com/5kQeVegt67M69B4ajn9Ve0h";
const DEFAULT_QR = "/uploads/payment-methods/iraq-superqi-qr.jpeg";

export const DEFAULT_PAYMENT_METHODS_CONFIG = {
  version: 1,
  countries: [
    {
      id: "SY",
      enabled: true,
      labelAr: "سوريا",
      labelEn: "Syria",
      methods: [
        {
          id: "AL_HARAM_FOUAD",
          type: "manual",
          enabled: true,
          titleAr: "التحويل عبر الهرم أو الفؤاد",
          titleEn: "Al-Haram or Al-Fouad transfer",
          shortAr: "تحويل يدوي",
          shortEn: "Manual transfer",
          instructionsAr:
            "يتم التحويل إلى مندوبنا من خلال الهرم أو الفؤاد. بعد إتمام التحويل، صوّر الإيصال وارفعه على المنصة.",
          instructionsEn:
            "Transfer to our representative via Al-Haram or Al-Fouad. After payment, photograph the receipt and upload it on the platform.",
          details: [
            { labelAr: "اسم المستلم", labelEn: "Recipient name", value: "محمد عبد الرزاق حاج محمد" },
            { labelAr: "المدينة", labelEn: "City", value: "حلب" },
            { labelAr: "رقم الهاتف", labelEn: "Phone", value: "0968606800" },
          ],
          warningsAr: ["الرجاء عدم التحويل من خلال تطبيق شام كاش."],
          warningsEn: ["Please do not transfer via the Sham Cash app."],
          stepsAr: [
            "إتمام التحويل إلى بيانات المندوب الموضحة أعلاه.",
            "تصوير إيصال التحويل بشكل واضح.",
            "رفع الإيصال مع بياناتك وإرسال طلب التفعيل.",
            "مراجعة الطلب من الإدارة، ثم تفعيل الحساب.",
          ],
          stepsEn: [
            "Complete the transfer using the details above.",
            "Photograph a clear receipt.",
            "Upload the receipt with your details and submit activation.",
            "Admin reviews the request and activates your account.",
          ],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
      ],
    },
    {
      id: "IQ",
      enabled: true,
      labelAr: "العراق",
      labelEn: "Iraq",
      methods: [
        {
          id: "SUPERQI",
          type: "manual",
          enabled: true,
          titleAr: "الدفع من خلال SuperQi",
          titleEn: "Pay via SuperQi",
          shortAr: "محفظة SuperQi",
          shortEn: "SuperQi wallet",
          instructionsAr: "ادفع عبر SuperQi ثم ارفع صورة إيصال التحويل على المنصة.",
          instructionsEn: "Pay via SuperQi, then upload your transfer receipt on the platform.",
          details: [{ labelAr: "رقم SuperQi", labelEn: "SuperQi number", value: "07502363977" }],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: DEFAULT_QR,
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
        {
          id: "CARD",
          type: "external",
          enabled: true,
          titleAr: "الدفع بالبطاقة البنكية",
          titleEn: "Bank card payment",
          shortAr: "Mastercard",
          shortEn: "Mastercard",
          instructionsAr:
            "يمكن الدفع مباشرة باستخدام بطاقة Mastercard بشرط أن تدعم البطاقة الدفع بالدولار. بعد الدفع أدخل بياناتك وبريد Stripe وارفع فاتورة الدفع لإرسال طلب التفعيل.",
          instructionsEn:
            "Pay directly with a Mastercard that supports USD. After payment, enter your details and Stripe email, then upload the invoice to submit activation.",
          details: [],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: IRAQ_STRIPE,
          externalButtonLabelAr: "الدفع بالبطاقة البنكية",
          externalButtonLabelEn: "Pay by bank card",
        },
        {
          id: "SARAFA_VODAFONE",
          type: "manual",
          enabled: true,
          titleAr: "الدفع من خلال محلات الصرافة",
          titleEn: "Currency exchange offices",
          shortAr: "تحويل إلى فودافون كاش مصر",
          shortEn: "Transfer to Egypt Vodafone Cash",
          instructionsAr:
            "يمكن التحويل من خلال محلات الصرافة التي توفر التحويل إلى مصر عبر Vodafone Cash. رسوم التحويل يتحملها الطالب، ويجب ألا يتم خصمها من المبلغ المطلوب.",
          instructionsEn:
            "Transfer via exchange offices that send to Egypt Vodafone Cash. Transfer fees are paid by the student and must not be deducted from the required amount.",
          details: [
            { labelAr: "المبلغ المطلوب وصوله", labelEn: "Amount to arrive", value: "10,000 جنيه مصري كاملاً" },
            { labelAr: "رقم Vodafone Cash", labelEn: "Vodafone Cash number", value: "01036775984" },
          ],
          warningsAr: ["رسوم التحويل يتحملها الطالب، ويجب ألا يتم خصمها من المبلغ المطلوب."],
          warningsEn: ["Transfer fees are the student’s responsibility and must not reduce the required amount."],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
      ],
    },
    {
      id: "JO",
      enabled: true,
      labelAr: "الأردن",
      labelEn: "Jordan",
      methods: [
        {
          id: "VODAFONE_CASH",
          type: "manual",
          enabled: true,
          titleAr: "الدفع من خلال Vodafone Cash",
          titleEn: "Pay via Vodafone Cash",
          shortAr: "محلات الصرافة",
          shortEn: "Exchange offices",
          instructionsAr: "تتوفر هذه الطريقة لدى محلات الصرافة. بعد الدفع، ارفع صورة إيصال التحويل على المنصة.",
          instructionsEn:
            "Available at exchange offices. After payment, upload your transfer receipt on the platform.",
          details: [
            { labelAr: "رقم Vodafone Cash", labelEn: "Vodafone Cash number", value: "01036775984" },
            { labelAr: "اسم المستلم", labelEn: "Recipient name", value: "Omama Hasan Zaiton" },
          ],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
        {
          id: "CARD",
          type: "external",
          enabled: true,
          titleAr: "الدفع بالبطاقة البنكية",
          titleEn: "Bank card payment",
          shortAr: "Stripe",
          shortEn: "Stripe",
          instructionsAr:
            "ادفع بالبطاقة البنكية مباشرة من خلال رابط الدفع. بعد الدفع أدخل بياناتك وبريد Stripe وارفع فاتورة الدفع لإرسال طلب التفعيل.",
          instructionsEn:
            "Pay by card via the payment link. After payment, enter your details and Stripe email, then upload the invoice to submit activation.",
          details: [],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: JORDAN_STRIPE,
          externalButtonLabelAr: "الدفع بالبطاقة البنكية",
          externalButtonLabelEn: "Pay by bank card",
        },
      ],
    },
    {
      id: "EG",
      enabled: true,
      labelAr: "مصر",
      labelEn: "Egypt",
      methods: [
        {
          id: "INSTAPAY_1",
          type: "manual",
          enabled: true,
          titleAr: "InstaPay — الرقم الأول",
          titleEn: "InstaPay — number 1",
          shortAr: "تحويل محلي",
          shortEn: "Local transfer",
          instructionsAr: "حوّل عبر InstaPay ثم ارفع صورة إيصال التحويل على المنصة.",
          instructionsEn: "Transfer via InstaPay, then upload your receipt on the platform.",
          details: [{ labelAr: "رقم InstaPay", labelEn: "InstaPay number", value: "01555025446" }],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
        {
          id: "INSTAPAY_2",
          type: "manual",
          enabled: true,
          titleAr: "InstaPay — الرقم الثاني",
          titleEn: "InstaPay — number 2",
          shortAr: "تحويل محلي",
          shortEn: "Local transfer",
          instructionsAr: "حوّل عبر InstaPay ثم ارفع صورة إيصال التحويل على المنصة.",
          instructionsEn: "Transfer via InstaPay, then upload your receipt on the platform.",
          details: [{ labelAr: "رقم InstaPay", labelEn: "InstaPay number", value: "01558435446" }],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
        {
          id: "VODAFONE_CASH",
          type: "manual",
          enabled: true,
          titleAr: "Vodafone Cash",
          titleEn: "Vodafone Cash",
          shortAr: "محفظة موبايل",
          shortEn: "Mobile wallet",
          instructionsAr: "حوّل عبر Vodafone Cash ثم ارفع صورة إيصال التحويل على المنصة.",
          instructionsEn: "Transfer via Vodafone Cash, then upload your receipt on the platform.",
          details: [{ labelAr: "رقم Vodafone Cash", labelEn: "Vodafone Cash number", value: "01036775984" }],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: "",
          externalButtonLabelAr: "",
          externalButtonLabelEn: "",
        },
      ],
    },
    {
      id: "OTHER",
      enabled: true,
      labelAr: "باقي الدول",
      labelEn: "Other countries",
      methods: [
        {
          id: "CARD",
          type: "external",
          enabled: true,
          titleAr: "الدفع بالبطاقة البنكية",
          titleEn: "Bank card payment",
          shortAr: "Stripe",
          shortEn: "Stripe",
          instructionsAr:
            "يتم الدفع بالبطاقة البنكية مباشرة من خلال رابط Stripe. بعد الدفع أدخل بياناتك وبريد Stripe وارفع فاتورة الدفع لإرسال طلب التفعيل.",
          instructionsEn:
            "Pay by bank card via the Stripe link. After payment, enter your details and Stripe email, then upload the invoice to submit activation.",
          details: [],
          warningsAr: [],
          warningsEn: [],
          stepsAr: [],
          stepsEn: [],
          qrImageUrl: "",
          externalUrl: IRAQ_STRIPE,
          externalButtonLabelAr: "الدفع بالبطاقة البنكية",
          externalButtonLabelEn: "Pay by bank card",
        },
      ],
    },
  ],
};

function asString(v, fallback = "") {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function asBool(v, fallback = true) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((item) => asString(item)).filter(Boolean);
}

function normalizeDetail(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    labelAr: asString(raw.labelAr),
    labelEn: asString(raw.labelEn),
    value: asString(raw.value),
  };
}

function normalizeMethod(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = asString(raw.id).trim();
  if (!id) return null;
  return {
    id,
    type: raw.type === "external" ? "external" : "manual",
    enabled: asBool(raw.enabled, true),
    titleAr: asString(raw.titleAr, id),
    titleEn: asString(raw.titleEn, id),
    shortAr: asString(raw.shortAr),
    shortEn: asString(raw.shortEn),
    instructionsAr: asString(raw.instructionsAr),
    instructionsEn: asString(raw.instructionsEn),
    details: Array.isArray(raw.details) ? raw.details.map(normalizeDetail).filter(Boolean) : [],
    warningsAr: asStringArray(raw.warningsAr),
    warningsEn: asStringArray(raw.warningsEn),
    stepsAr: asStringArray(raw.stepsAr),
    stepsEn: asStringArray(raw.stepsEn),
    qrImageUrl: asString(raw.qrImageUrl),
    externalUrl: asString(raw.externalUrl),
    externalButtonLabelAr: asString(raw.externalButtonLabelAr, "الدفع بالبطاقة البنكية"),
    externalButtonLabelEn: asString(raw.externalButtonLabelEn, "Pay by bank card"),
  };
}

function normalizeCountry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = asString(raw.id).trim().toUpperCase();
  if (!id) return null;
  return {
    id,
    enabled: asBool(raw.enabled, true),
    labelAr: asString(raw.labelAr, id),
    labelEn: asString(raw.labelEn, id),
    methods: Array.isArray(raw.methods) ? raw.methods.map(normalizeMethod).filter(Boolean) : [],
  };
}

export function normalizePaymentMethodsConfig(raw) {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_PAYMENT_METHODS_CONFIG);
  }
  const countries = Array.isArray(raw.countries)
    ? raw.countries.map(normalizeCountry).filter(Boolean)
    : [];
  if (!countries.length) {
    return structuredClone(DEFAULT_PAYMENT_METHODS_CONFIG);
  }
  return {
    version: typeof raw.version === "number" ? raw.version : 1,
    countries,
  };
}

export const DEFAULT_PAYMENT_COUNTRY = "EG";

export function getEnabledCountries(config) {
  const normalized = normalizePaymentMethodsConfig(config);
  return normalized.countries.filter((c) => c.enabled !== false);
}

export function getCountryById(config, countryId) {
  const countries = getEnabledCountries(config);
  return countries.find((c) => c.id === countryId) || countries.find((c) => c.id === "OTHER") || countries[0] || null;
}

export function getEnabledMethods(country) {
  return (country?.methods || []).filter((m) => m.enabled !== false);
}

export function getMethodsForCountry(config, countryId) {
  return getEnabledMethods(getCountryById(config, countryId));
}

export function getDefaultMethodForCountry(config, countryId) {
  return getMethodsForCountry(config, countryId)[0] || null;
}

export function findMethod(config, countryId, methodId) {
  return getMethodsForCountry(config, countryId).find((m) => m.id === methodId) || null;
}

export function isExternalMethod(method) {
  return method?.type === "external" && Boolean(method?.externalUrl);
}

/** @deprecated Prefer config-driven helpers above */
export const PAYMENT_COUNTRIES = DEFAULT_PAYMENT_METHODS_CONFIG.countries.map((c) => ({
  id: c.id,
  methods: c.methods.map((m) => m.id),
}));
