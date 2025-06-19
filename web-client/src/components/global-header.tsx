import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { APP_NAME } from "../common/constants";

export const GlobalHeader = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="fixed top-0 left-0 right-0  bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50">
      <div className="mx-auto h-16 px-4 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/images/logo.png"
            alt={`${APP_NAME} Logo`}
            className="h-8 w-auto"
          />
        </a>

        <DropdownMenu onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t("Language")}</span>
              {open ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[1100] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-md"
          >
            <DropdownMenuItem
              onClick={() => handleLanguageChange("en")}
              disabled={i18n.language === "en"}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 disabled:opacity-50"
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLanguageChange("kr")}
              disabled={i18n.language === "kr"}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 disabled:opacity-50"
            >
              한국어
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
