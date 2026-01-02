
import React, { useState, useMemo } from 'react';
import { WorkLog } from '../types';
import { calculateDashboardStats } from '../utils/analytics';

interface DashboardProps {
  logs: WorkLog[];
  onNavigateToLogs: () => void;
  onEditLog: (log: WorkLog) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, onNavigateToLogs, onEditLog }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => 
    calculateDashboardStats(logs, dateRange.start, dateRange.end), 
    [logs, dateRange]
  );

  const recentLogs = useMemo(() => 
    [...logs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5), 
    [logs]
  );

  const categoryThemes: Record<string, { text: string; bg: string; border: string }> = {
    "研发技术": { text: "text-blue-700", bg: "bg-blue-500", border: "border-blue-100" },
    "会议沟通": { text: "text-purple-700", bg: "bg-purple-500", border: "border-purple-100" },
    "项目管理": { text: "text-emerald-700", bg: "bg-emerald-500", border: "border-emerald-100" },
    "行政事务": { text: "text-slate-700", bg: "bg-slate-400", border: "border-slate-100" },
    "客户支持": { text: "text-amber-700", bg: "bg-amber-500", border: "border-amber-100" },
    "学习成长": { text: "text-rose-700", bg: "bg-rose-500", border: "border-rose-100" },
    "市场营销": { text: "text-cyan-700", bg: "bg-cyan-500", border: "border-cyan-100" },
    "其他事务": { text: "text-slate-600", bg: "bg-slate-300", border: "border-slate-100" },
    "未分类": { text: "text-slate-500", bg: "bg-slate-200", border: "border-slate-50" }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 professional-grid min-h-full">
      {/* Header & Global Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">工作效能洞察</h2>
          <p className="text-slate-500 mt-1 font-medium">数据驱动的职场表现与工作流分布分析</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">统计周期</span>
             <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="text-sm font-semibold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer"
             />
             <span className="text-slate-300">/</span>
             <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="text-sm font-semibold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer"
             />
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '记录总量', value: stats.totalLogs, unit: '篇', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-indigo-600' },
          { label: '任务闭环率', value: stats.completionRate, unit: '%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-500' },
          { label: '高频产出日', value: stats.mostProductiveDay, unit: '', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-amber-500' },
          { label: '活跃天数', value: stats.activeDays, unit: '天', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-purple-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-100/10 transition-all group group relative overflow-hidden">
            <div className={`w-12 h-12 ${kpi.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={kpi.icon} />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{kpi.value}</span>
                <span className="text-xs font-bold text-slate-500 italic ml-1">{kpi.unit}</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
                <path d={kpi.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800">职能维度分布</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">AI 自动分类统计各模块投入比重</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">智能引擎分析中</span>
            </div>
          </div>

          <div className="flex-1 space-y-7">
            {stats.categoryDistribution.length > 0 ? stats.categoryDistribution.map((item, idx) => {
              const theme = categoryThemes[item.category] || categoryThemes["其他事务"];
              return (
                <div key={idx} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${theme.bg} shadow-sm`}></div>
                      <span className={`text-sm font-bold ${theme.text}`}>{item.category}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-800 tracking-tight">{item.percentage}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.count} 条记录</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100/50">
                    <div 
                      className={`${theme.bg} h-full rounded-full transition-all duration-1000 opacity-80 group-hover:opacity-100 group-hover:scale-y-110`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 mb-4 opacity-20" strokeWidth="1">
                  <path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 12h6M9 16h6M9 8h6" />
                </svg>
                <p>暂无分类数据，请先保存包含工作内容的日志</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">近期动态</h3>
            <button onClick={onNavigateToLogs} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-all">查看全部</button>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-1">
            {recentLogs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => onEditLog(log)}
                className="group p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                      {log.date.split('-').slice(1).join('.')}
                   </span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {log.category || '未分类'}
                   </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">{log.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed opacity-80">{log.content}</p>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic opacity-50">
                <p className="text-xs">等待数据流接入...</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => onEditLog({ id: '', title: '', content: '', date: new Date().toISOString().split('T')[0], tasks: [], tags: [], category: '', createdAt: 0, updatedAt: 0 })}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            撰写今日日志
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-2">效能引擎总结</h3>
               <p className="text-indigo-100/70 text-sm max-w-sm mb-12 leading-relaxed">基于当前记录周期，您的工作饱和度与完成效率处于平衡状态。建议在 <span className="text-white font-black underline underline-offset-4">{stats.mostProductiveDay}</span> 安排重难点攻关。</p>
               <div className="flex items-end gap-10">
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">任务达成率</span>
                        <span className="text-3xl font-black">{stats.completionRate}%</span>
                     </div>
                     <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${stats.completionRate}%` }}></div>
                     </div>
                  </div>
                  <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                     <span className="text-sm font-black text-indigo-50">极佳</span>
                  </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
         </div>

         <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-800 shrink-0 border border-slate-100 shadow-inner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12" strokeWidth="1.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0l8.126-4.962A2 2 0 0122 11.722v6.28a2 2 0 01-1.874 1.998l-8.126-4.962zm0 0l-8.126-4.962A2 2 0 002 11.722v6.28a2 2 0 001.874 1.998L12 15m0-3V9m0 0l8.126-4.962A2 2 0 0122 5.722v6.28a2 2 0 01-1.874 1.998l-8.126-4.962zm0 0L3.874 16.038A2 2 0 012 14.04V7.722a2 2 0 011.874-1.998L12 9" />
                  </svg>
               </div>
               <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">核心洞察建议</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                     系统识别到您的工作重心主要在 <span className="text-slate-900 font-bold italic">“{stats.categoryDistribution[0]?.category || '核心业务'}”</span> 维度。建议优化 <span className="text-slate-900 font-bold italic">“{stats.categoryDistribution[stats.categoryDistribution.length-1]?.category || '其他'}”</span> 类琐事，提高单位时间高价值产出。
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
