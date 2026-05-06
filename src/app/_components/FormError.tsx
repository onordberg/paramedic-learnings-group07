export function FormError({ message }: { message: string }) {
  return (
    <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
      <p style={{ color: "#800000", fontSize: "11px", margin: 0 }}>⚠ {message}</p>
    </div>
  );
}
