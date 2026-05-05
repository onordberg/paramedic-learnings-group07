type BaseProps = {
  label: string;
  name: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string[];
};

type InputProps = BaseProps & { as?: "input" };
type TextareaProps = BaseProps & { as: "textarea"; rows: number; resize?: boolean };

type FormFieldProps = InputProps | TextareaProps;

export function FormField({
  label,
  name,
  hint,
  placeholder,
  value,
  onChange,
  error,
  ...rest
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <label htmlFor={name} className="win-label">
        {label}
        {hint && (
          <span style={{ color: "#808080", marginLeft: "4px" }}>{hint}</span>
        )}
      </label>
      {rest.as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={rest.rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="win-input"
          style={{ resize: rest.resize === false ? "none" : undefined }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="win-input"
        />
      )}
      {/* Show only the first error — Zod can return multiple per field, one at a time is less noisy */}
      {error && (
        <p style={{ color: "#ff0000", fontSize: "11px", marginTop: "2px" }}>
          {error[0]}
        </p>
      )}
    </div>
  );
}
