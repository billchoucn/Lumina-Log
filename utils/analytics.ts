
import { WorkLog } from "../types";

export interface DashboardStats {
  totalLogs: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeDays: number;
  mostProductiveDay: string;
  dailyActivity: { date: string; count: number; taskCount: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  keywordCloud: { text: string; value: number }[];
}

export const calculateDashboardStats = (logs: WorkLog[], startDate: string, endDate: string): DashboardStats => {
  const filtered = logs.filter(log => log.date >= startDate && log.date <= endDate);
  
  const totalTasks = filtered.reduce((acc, log) => acc + log.tasks.length, 0);
  const completedTasks = filtered.reduce((acc, log) => acc + log.tasks.filter(t => t.completed).length, 0);
  
  // Daily activity distribution
  const activityMap = new Map<string, { count: number; taskCount: number }>();
  filtered.forEach(log => {
    const entry = activityMap.get(log.date) || { count: 0, taskCount: 0 };
    entry.count += 1;
    entry.taskCount += log.tasks.length;
    activityMap.set(log.date, entry);
  });

  const dailyActivity = Array.from(activityMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Category distribution
  const categoryMap = new Map<string, number>();
  filtered.forEach(log => {
    const cat = log.category || "未分类";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  const totalLogs = filtered.length;
  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Most productive day calculation
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayStats = new Array(7).fill(0);
  filtered.forEach(log => {
    const day = new Date(log.date).getDay();
    dayStats[day] += 1;
  });
  const maxDayIndex = dayStats.indexOf(Math.max(...dayStats));

  return {
    totalLogs,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    activeDays: activityMap.size,
    mostProductiveDay: totalLogs > 0 ? dayNames[maxDayIndex] : '-',
    dailyActivity,
    categoryDistribution,
    keywordCloud: []
  };
};
