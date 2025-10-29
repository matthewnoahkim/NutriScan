import { getEntries } from "@/app/actions/entries";
import { IntakeTable } from "@/components/intake/intake-table";

export default async function IntakePage() {
  const entries = await getEntries();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Intake Table</h1>
        <p className="text-muted-foreground">
          View and edit your food entries with inline editing
        </p>
      </div>

      <IntakeTable initialEntries={entries} />
    </div>
  );
}

