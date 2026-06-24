"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/validation";
import { formFieldClass, inputClass, labelClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  showRules?: boolean;
  required?: boolean;
}

export function PasswordField({
  id = "password",
  value,
  onChange,
  showRules = true,
  required = true,
}: PasswordFieldProps) {
  return (
    <div className={formFieldClass}>
      <label htmlFor={id} className={labelClass}>Password</label>
      <input
        id={id}
        type="password"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className={inputClass}
        placeholder="Create a strong password"
      />
      {showRules && (
        <ul className="mt-3 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);
            return (
              <li key={rule.id} className={cn("flex items-center gap-2 text-xs font-medium", ok ? "text-green-800" : "text-slate-600")}>
                {ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
