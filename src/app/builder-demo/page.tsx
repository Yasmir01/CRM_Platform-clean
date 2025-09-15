import React from "react";
import LeadPipelineBoard from "@/components/builder/LeadPipelineBoard";
import LeadDetailCard from "@/components/builder/LeadDetailCard";
import PaymentHistoryTable from "@/components/builder/PaymentHistoryTable";
import PaymentProrationCalculator from "@/components/builder/PaymentProrationCalculator";

export default function BuilderDemoPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Builder Components Demo</h1>

      <section>
        <LeadPipelineBoard />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LeadDetailCard />
        </div>
        <div>
          <PaymentHistoryTable />
        </div>
      </section>

      <section>
        <PaymentProrationCalculator />
      </section>
    </div>
  );
}
