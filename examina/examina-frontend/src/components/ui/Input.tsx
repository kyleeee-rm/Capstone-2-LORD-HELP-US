import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`rounded-lg border bg-transparent px-3.5 py-2.5 text-base font-[inherit] outline-none transition-colors placeholder:text-text-muted ${
            error
              ? "border-error focus:border-error"
              : "border-border focus:border-primary"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
