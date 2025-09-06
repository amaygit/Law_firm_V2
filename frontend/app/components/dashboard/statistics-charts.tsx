import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  const filterValidData = (data: any[]) => {
    return data.filter(item => item && typeof item.value === "number" && item.value > 0);
  };

  const hasValidData = (data: any[]) => {
    return data && data.length > 0 && data.some(item => item && typeof item.value === "number" && item.value > 0);
  };

  const getTotalValue = (data: any[]) => {
    return data.reduce((sum, item) => {
      const value = item && typeof item.value === "number" ? item.value : 0;
      return sum + value;
    }, 0);
  };

  const validCaseStatusData = filterValidData(projectStatusData || []);
  const caseStatusTotal = getTotalValue(projectStatusData || []);

  const validMilestonePriorityData = filterValidData(taskPriorityData || []);
  const milestonePriorityTotal = getTotalValue(taskPriorityData || []);

  const NoDataDisplay = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
      <div className="text-center">
        <ChartPie className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Case Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Case Trends</CardTitle>
            <CardDescription>Daily case status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            {taskTrendsData && taskTrendsData.length > 0 ? (
              <ChartContainer
                className="h-[300px]"
                config={{
                  completed: { color: "#10b981" },
                  inProgress: { color: "#3b82f6" },
                  todo: { color: "#6b7280" },
                }}
              >
                <LineChart data={taskTrendsData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="todo" stroke="#6b7280" strokeWidth={2} dot={{ r: 4 }} />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <NoDataDisplay message="No case trends data available" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Status Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Case Status</CardTitle>
            <CardDescription>Case status breakdown</CardDescription>
          </div>
          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            {hasValidData(projectStatusData) ? (
              <ChartContainer
                className="h-[300px]"
                config={{
                  Completed: { color: "#10b981" },
                  "In Progress": { color: "#3b82f6" },
                  Planning: { color: "#f59e0b" },
                }}
              >
                <PieChart>
                  <Pie
                    data={validCaseStatusData}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, value }) => {
                      const numValue = typeof value === "number" ? value : 0;
                      const percent = caseStatusTotal > 0 ? (numValue / caseStatusTotal) * 100 : 0;
                      return `${name} (${percent.toFixed(0)}%)`;
                    }}
                    labelLine={false}
                  >
                    {validCaseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const value = typeof data.value === "number" ? data.value : 0;
                        const percent = caseStatusTotal > 0 ? (value / caseStatusTotal) * 100 : 0;
                        return (
                          <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {value} ({percent.toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <NoDataDisplay message="No case status data available" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Priority Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Milestone Priority</CardTitle>
            <CardDescription>Milestone priority breakdown</CardDescription>
          </div>
          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            {hasValidData(taskPriorityData) ? (
              <ChartContainer
                className="h-[300px]"
                config={{
                  High: { color: "#ef4444" },
                  Medium: { color: "#f59e0b" },
                  Low: { color: "#6b7280" },
                }}
              >
                <PieChart>
                  <Pie
                    data={validMilestonePriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => {
                      const numValue = typeof value === "number" ? value : 0;
                      const percent = milestonePriorityTotal > 0 ? (numValue / milestonePriorityTotal) * 100 : 0;
                      return `${name} ${percent.toFixed(0)}%`;
                    }}
                    labelLine={false}
                  >
                    {validMilestonePriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const value = typeof data.value === "number" ? data.value : 0;
                        const percent = milestonePriorityTotal > 0 ? (value / milestonePriorityTotal) * 100 : 0;
                        return (
                          <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {value} ({percent.toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <NoDataDisplay message="No milestone priority data available" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workspace Productivity */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Workspace Productivity</CardTitle>
            <CardDescription>Milestone completion by case</CardDescription>
          </div>
          <ChartBarBig className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            {workspaceProductivityData && workspaceProductivityData.length > 0 ? (
              <ChartContainer
                className="h-[300px]"
                config={{
                  completed: { color: "#3b82f6" },
                  total: { color: "#e5e7eb" },
                }}
              >
                <BarChart data={workspaceProductivityData} barGap={0} barSize={20}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Total Milestones" />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed Milestones" />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            ) : (
              <NoDataDisplay message="No workspace productivity data available" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
