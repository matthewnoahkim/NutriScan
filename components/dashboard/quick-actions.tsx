import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Lightbulb, Table } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link href="/add">
        <Button className="w-full h-auto py-4" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Entry
        </Button>
      </Link>
      <Link href="/intake">
        <Button className="w-full h-auto py-4" size="lg" variant="secondary">
          <Table className="mr-2 h-5 w-5" />
          View Log
        </Button>
      </Link>
      <Link href="/recommendations">
        <Button className="w-full h-auto py-4" size="lg" variant="outline">
          <Lightbulb className="mr-2 h-5 w-5" />
          Explore Meals
        </Button>
      </Link>
    </div>
  );
}

