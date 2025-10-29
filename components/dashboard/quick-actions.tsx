import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Lightbulb, Table } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <Link href="/add">
            <Button className="w-full" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Food
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Link href="/intake">
            <Button className="w-full" size="lg" variant="secondary">
              <Table className="mr-2 h-5 w-5" />
              View Intake
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Link href="/recommendations">
            <Button className="w-full" size="lg" variant="outline">
              <Lightbulb className="mr-2 h-5 w-5" />
              Get Recommendations
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

