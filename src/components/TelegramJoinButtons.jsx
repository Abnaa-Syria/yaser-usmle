import { useTranslation } from "react-i18next";
import { TELEGRAM_LINKS } from "../config/siteLinks";

function TelegramIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function TelegramButton({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-full bg-[#2AABEE] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,171,238,0.35)] transition hover:bg-[#229ED9] hover:shadow-[0_10px_24px_rgba(42,171,238,0.45)] active:scale-[0.98]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#2AABEE]">
        <TelegramIcon className="h-4 w-4" />
      </span>
      {label}
    </a>
  );
}

/**
 * Telegram channel + community group CTAs.
 * @param {{ className?: string, compact?: boolean }} props
 */
export default function TelegramJoinButtons({ className = "", compact = false }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar") || i18n.dir() === "rtl";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${compact ? "justify-start" : ""} ${className}`}>
      <TelegramButton
        href={TELEGRAM_LINKS.group}
        label={t("publicContact.joinGroup", {
          defaultValue: isRtl ? "انضم لمجموعتنا" : "Join our group",
        })}
      />
      <TelegramButton
        href={TELEGRAM_LINKS.channel}
        label={t("publicContact.joinChannel", {
          defaultValue: isRtl ? "انضم لقناتنا" : "Join our channel",
        })}
      />
    </div>
  );
}
