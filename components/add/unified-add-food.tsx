"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanForm } from "@/components/scan/scan-form";
import { AiEstimateForm } from "@/components/add/ai-estimate-form";
import { ManualEntryForm } from "@/components/add/manual-entry-form";
import { Camera, Sparkles, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function UnifiedAddFood() {
  const [activeTab, setActiveTab] = useState("scan");
  const router = useRouter();
  const { toast } = useToast();

  const handleSaveSuccess = () => {
    toast({
      title: "Entry saved!",
      description: "Your food entry has been added to your intake log.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Add Food</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to add your food entry
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Scan Label</span>
            <span className="sm:hidden">Scan</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Estimate</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-6">
          <ScanForm onSaveSuccess={handleSaveSuccess} />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AiEstimateForm onSaveSuccess={handleSaveSuccess} />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualEntryForm onSaveSuccess={handleSaveSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

