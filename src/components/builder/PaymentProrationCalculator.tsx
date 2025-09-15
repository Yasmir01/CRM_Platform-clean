import React from "react";

interface PaymentProrationCalculatorProps {
  title?: string;
  submitLabel?: string;
  showHelpText?: boolean;
}

export default function PaymentProrationCalculator({ title = "Prorated Rent Calculator", submitLabel = "Calculate", showHelpText = true }: PaymentProrationCalculatorProps) {
  return (
    <div className="proration-calculator">
      <h3>{title}</h3>
      {showHelpText && <p className="text-muted">Enter lease dates and rent to calculate prorated amount.</p>}
      <form onSubmit={(e) => { e.preventDefault(); alert('Calculation not implemented in builder stub'); }} className="proration-form">
        <input placeholder="Move in date" className="input" />
        <input placeholder="Monthly rent" className="input" />
        <button className="btn-primary" type="submit">{submitLabel}</button>
      </form>
    </div>
  );
}
