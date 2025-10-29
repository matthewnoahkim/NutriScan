"use client";

import { FoodEntry, Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { calculateTotals } from "@/lib/recommendations";

interface NutritionChartsProps {
  entries: FoodEntry[];
  goals: Goal | null;
}

export function NutritionCharts({ entries, goals }: NutritionChartsProps) {
  // Calculate daily totals
  const totals = calculateTotals(entries);

  // Macro nutrients data for stacked bar
  const macroData = [
    {
      name: "Macros",
      Protein: totals.protein_g,
      Carbs: totals.carbs_g,
      Fat: totals.fat_g,
    },
  ];

  // Radar chart data for micronutrients
  const microData = [
    {
      nutrient: "Fiber",
      value: goals?.fiber_g
        ? (totals.fiber_g / goals.fiber_g) * 100
        : 0,
      fullMark: 100,
    },
    {
      nutrient: "Sodium",
      value: goals?.sodium_mg
        ? (totals.sodium_mg / goals.sodium_mg) * 100
        : 0,
      fullMark: 100,
    },
    {
      nutrient: "Potassium",
      value: goals?.potassium_mg
        ? (totals.potassium_mg / goals.potassium_mg) * 100
        : 0,
      fullMark: 100,
    },
    {
      nutrient: "Calcium",
      value: goals?.calcium_mg
        ? (totals.calcium_mg / goals.calcium_mg) * 100
        : 0,
      fullMark: 100,
    },
    {
      nutrient: "Iron",
      value: goals?.iron_mg
        ? (totals.iron_mg / goals.iron_mg) * 100
        : 0,
      fullMark: 100,
    },
  ];

  // Weekly trend data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weeklyData = last7Days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.capturedAt);
      return entryDate >= day && entryDate < nextDay;
    });

    const dayTotals = calculateTotals(dayEntries);

    return {
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      calories: dayTotals.calories,
      protein: dayTotals.protein_g,
    };
  });

  return (
    <div className="space-y-6">
      {/* Macronutrient Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Macronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={macroData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Grams", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Protein" fill="#8b5cf6" stackId="a" />
              <Bar dataKey="Carbs" fill="#3b82f6" stackId="a" />
              <Bar dataKey="Fat" fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Micronutrient Radar */}
      {goals && (
        <Card>
          <CardHeader>
            <CardTitle>Micronutrient Goals Progress (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={microData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="nutrient" />
                <PolarRadiusAxis angle={90} domain={[0, 150]} />
                <Radar
                  name="Progress"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Trend */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Calorie & Protein Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Calories"
              />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Protein (g)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

