import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLogs, getClients, getTasks } from '@/lib/store';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { format, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

const Analytics = () => {
  const logs = getLogs();
  const clients = getClients();
  const tasks = getTasks();

  // Client work distribution (by mentions in logs)
  const clientDistribution = clients.map(client => {
    const mentionCount = logs.filter(log =>
      log.content.toLowerCase().includes(`@${client.name.toLowerCase()}`)
    ).length;
    return {
      name: client.name,
      value: mentionCount,
      color: client.color,
    };
  }).filter(item => item.value > 0);

  // Tasks completed over time (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const tasksOverTime = last7Days.map(day => {
    const dayLogs = logs.filter(log => isSameDay(new Date(log.date), day));
    const totalTasks = dayLogs.reduce((sum, log) => sum + log.tasks.length, 0);
    const completedTasks = dayLogs.reduce(
      (sum, log) => sum + log.tasks.filter(t => t.completed).length,
      0
    );

    return {
      date: format(day, 'EEE'),
      fullDate: format(day, 'MMM d'),
      total: totalTasks,
      completed: completedTasks,
    };
  });

  // Activity summary
  const totalLogs = logs.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeClients = clients.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your productivity and client work</p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Navigation />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Logs</CardDescription>
              <CardTitle className="text-3xl">{totalLogs}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Days of work tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{totalTasks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {completedTasks} completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Clients</CardDescription>
              <CardTitle className="text-3xl">{activeClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Clients being tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-3xl">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client distribution pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Client Work Distribution</CardTitle>
              <CardDescription>Logs by client mentions</CardDescription>
            </CardHeader>
            <CardContent>
              {clientDistribution.length > 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No client data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks over time bar chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks This Week</CardTitle>
              <CardDescription>Daily task activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Tasks" />
                    <Bar dataKey="completed" fill="hsl(var(--chart-2))" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity trend line chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity Trend</CardTitle>
              <CardDescription>Task completion over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tasksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Total Tasks"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
