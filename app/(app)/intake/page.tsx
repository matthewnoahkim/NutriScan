import { getEntries } from "@/app/actions/entries";
import { IntakeTable } from "@/components/intake/intake-table";

export default async function IntakePage() {
  const entries = await getEntries();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Food Intake Log</h1>
        <p className="text-sm text-muted-foreground">
          View, edit, and export your complete nutrition history
        </p>
      </div>

      <IntakeTable initialEntries={entries} />
    </div>
  );
}

