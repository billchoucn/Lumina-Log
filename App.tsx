
import { exportLogsAsMarkdown, exportLogsAsCSV } from './utils/storage';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';
import SummaryGenerator from './components/SummaryGenerator';
import SummariesHub from './components/SummariesHub';
import { WorkLog, AISummary, ViewType, SummaryTemplate, UserSettings } from './types';
import { getLogs, saveLogs, getSummaries, saveSummaries, exportAsMarkdown, getTemplates, saveTemplates, getUserSettings, saveUserSettings } from './utils/storage';
import { polishContent, categorizeLog } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [templates, setTemplates] = useState<SummaryTemplate[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  const [activeLog, setActiveLog] = useState<WorkLog | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  
  // State for passing range to generator
  const [initialGeneratorRange, setInitialGeneratorRange] = useState<{start: string, end: string} | undefined>(undefined);

  // Date range for filtered export in Logs view
  const [exportRange, setExportRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    setLogs(getLogs());
    setSummaries(getSummaries());
    setTemplates(getTemplates());
    setUserSettings(getUserSettings());
  }, []);

  const handleSaveLog = async (newLog: WorkLog) => {
    let finalLog = { ...newLog };
    try {
      const category = await categorizeLog(newLog.title, newLog.content);
      finalLog.category = category;
    } catch (e) {
      finalLog.category = newLog.category || "其他事务";
    }

    const updatedLogs = activeLog 
      ? logs.map(l => l.id === finalLog.id ? finalLog : l)
      : [finalLog, ...logs];
    
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    setActiveLog(undefined);
    setCurrentView('logs');
  };

  const handleSummaryGenerated = (summary: AISummary) => {
    const updatedSummaries = [summary, ...summaries];
    setSummaries(updatedSummaries);
    saveSummaries(updatedSummaries);
    setCurrentView('summaries');
  };

  const handleSaveTemplates = (newTemplates: SummaryTemplate[]) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const toggleSelectLog = (id: string) => {
    const newSelection = new Set(selectedLogIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedLogIds(newSelection);
  };

  const handleExportRange = (type: 'word' | 'excel') => {
    if (!exportRange.start || !exportRange.end) {
      alert("请先选择导出的开始和结束日期");
      return;
    }
    const filtered = logs.filter(l => l.date >= exportRange.start && l.date <= exportRange.end);
    if (filtered.length === 0) {
      alert("选定范围内无日志数据");
      return;
    }
    if (type === 'word') exportLogsAsMarkdown(filtered);
    else exportLogsAsCSV(filtered);
  };

  const handleBatchExportWord = () => {
    const selected = logs.filter(l => selectedLogIds.has(l.id));
    if (selected.length > 0) exportLogsAsMarkdown(selected);
  };

  const handleBatchExportExcel = () => {
    const selected = logs.filter(l => selectedLogIds.has(l.id));
    if (selected.length > 0) exportLogsAsCSV(selected);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`确定要删除选中的 ${selectedLogIds.size} 条日志吗？此操作不可撤销。`)) {
      const updatedLogs = logs.filter(l => !selectedLogIds.has(l.id));
      setLogs(updatedLogs);
      saveLogs(updatedLogs);
      setSelectedLogIds(new Set());
    }
  };

  const openLogEditor = (log: WorkLog) => {
    setActiveLog(log.id ? log : undefined);
    setCurrentView('editor');
  };

  const startSummaryGeneration = (start?: string, end?: string) => {
    if (start && end) {
      setInitialGeneratorRange({ start, end });
    } else {
      setInitialGeneratorRange(undefined);
    }
    setCurrentView('summary-generator');
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-[#f8fafc]">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(v) => {
          setCurrentView(v);
          setActiveLog(undefined);
          setSelectedLogIds(new Set());
        }} 
        userSettings={userSettings}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 backdrop-blur-md border-b px-8 flex items-center justify-between sticky top-0 z-20 bg-white/50 border-slate-200">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="搜索日志标题、内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 transition-all bg-slate-100/50 text-slate-900 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => { setActiveLog(undefined); setCurrentView('editor'); }}
               className="px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
             >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                记一条日志
             </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all ${currentView === 'dashboard' ? 'p-6 md:p-10' : 'p-8'}`}>
          {currentView === 'dashboard' && <Dashboard logs={logs} onNavigateToLogs={() => setCurrentView('logs')} onEditLog={openLogEditor} />}

          {currentView === 'logs' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">日志档案库 <span className="text-slate-300 font-normal">({filteredLogs.length})</span></h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">深度检索与全周期日志管理</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">周期导出</span>
                      <input 
                        type="date" 
                        value={exportRange.start} 
                        onChange={e => setExportRange(p => ({...p, start: e.target.value}))} 
                        className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 w-28 text-slate-700" 
                      />
                      <span className="text-slate-300">/</span>
                      <input 
                        type="date" 
                        value={exportRange.end} 
                        onChange={e => setExportRange(p => ({...p, end: e.target.value}))} 
                        className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 w-28 text-slate-700" 
                      />
                    </div>
                    <div className="flex gap-2 pl-2">
                       <button onClick={() => handleExportRange('word')} className="p-2.5 hover:bg-slate-50 rounded-xl text-indigo-600 transition-all border border-transparent hover:border-indigo-100" title="导出 Word">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                       </button>
                       <button onClick={() => handleExportRange('excel')} className="p-2.5 hover:bg-slate-50 rounded-xl text-emerald-600 transition-all border border-transparent hover:border-emerald-100" title="导出 Excel">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                       </button>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredLogs.map(log => (
                    <div key={log.id} 
                      className={`bg-white p-7 rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative ${selectedLogIds.has(log.id) ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`} 
                      onClick={() => openLogEditor(log)}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={(e) => { e.stopPropagation(); toggleSelectLog(log.id); }}
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedLogIds.has(log.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                          >
                             {selectedLogIds.has(log.id) && <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}
                          </div>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded uppercase tracking-widest">{log.date}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest italic">{log.category || '未分类'}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors text-lg tracking-tight leading-tight">{log.title}</h4>
                      <p className="text-slate-500 text-sm line-clamp-4 leading-relaxed mb-6 font-medium">{log.content}</p>
                      {log.tasks.length > 0 && (
                        <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex -space-x-2">
                              {log.tasks.slice(0, 4).map((_, i) => (
                                <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${i % 2 === 0 ? 'bg-indigo-400' : 'bg-slate-300'}`}></div>
                              ))}
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{log.tasks.filter(t => t.completed).length}/{log.tasks.length} 事项完成</span>
                        </div>
                      )}
                    </div>
                 ))}
               </div>
            </div>
          )}

          {currentView === 'summaries' && (
            <SummariesHub 
              summaries={summaries} 
              templates={templates} 
              onSaveTemplates={handleSaveTemplates} 
              onGenerateNew={startSummaryGeneration} 
            />
          )}

          {currentView === 'summary-generator' && (
            <SummaryGenerator 
              logs={logs} 
              onSummaryGenerated={handleSummaryGenerated} 
              onCancel={() => setCurrentView('summaries')} 
              initialStartDate={initialGeneratorRange?.start}
              initialEndDate={initialGeneratorRange?.end}
            />
          )}

          {currentView === 'editor' && <div className="max-w-5xl mx-auto py-8"><Editor log={activeLog} onSave={handleSaveLog} onCancel={() => setCurrentView('logs')} onPolish={polishContent} /></div>}

          {currentView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 py-12 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">系统偏好设置</h2>
              
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-12">
                 {/* Personalization Section */}
                 <section className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">个性化配置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">站点标题 (Site Title)</label>
                          <input 
                            type="text" 
                            value={userSettings.siteTitle}
                            onChange={(e) => handleSaveSettings({ ...userSettings, siteTitle: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 font-bold"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">用户名称 (User Name)</label>
                          <input 
                            type="text" 
                            value={userSettings.userName}
                            onChange={(e) => handleSaveSettings({ ...userSettings, userName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 font-bold"
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">站点 Logo (Site Logo URL)</label>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                {userSettings.siteLogo ? (
                                  <img src={userSettings.siteLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-slate-300 font-black">{userSettings.siteTitle.charAt(0)}</span>
                                )}
                             </div>
                             <input 
                               type="text" 
                               value={userSettings.siteLogo}
                               onChange={(e) => handleSaveSettings({ ...userSettings, siteLogo: e.target.value })}
                               className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 text-xs font-mono"
                               placeholder="站点 Logo URL..."
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">个人头像 (User Avatar URL)</label>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                <img src={userSettings.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                             </div>
                             <input 
                               type="text" 
                               value={userSettings.userAvatar}
                               onChange={(e) => handleSaveSettings({ ...userSettings, userAvatar: e.target.value })}
                               className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 text-xs font-mono"
                               placeholder="用户头像 URL..."
                             />
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">AI 智能引擎架构</h3>
                    <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative overflow-hidden group">
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>
                             </div>
                             <p className="font-black text-indigo-900 uppercase italic">Gemini 3.0 Pro Core</p>
                          </div>
                          <p className="text-sm text-indigo-700 leading-relaxed mb-6 font-medium">
                            由 Google Gemini 3.0 顶级模型驱动。具备极强的内容解析、逻辑归纳与语义重构能力。您的每一份日志都将经过深度语义处理，确保总结的专业性与职场适配度。
                          </p>
                          <div className="flex gap-4">
                             <span className="text-[9px] font-black text-indigo-500 bg-white px-3 py-1 rounded border border-indigo-100 uppercase tracking-widest">ACTIVE_ENGAGEMENT</span>
                             <span className="text-[9px] font-black text-indigo-500 bg-white px-3 py-1 rounded border border-indigo-100 uppercase tracking-widest">M: gemini-3-flash-preview</span>
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">数据管理</h3>
                    <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center">
                             <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">全量数据 JSON 备份</p>
                            <p className="text-[11px] text-slate-500 font-medium">包含系统底层所有日志记录、汇报历史、配置及自定义模板。适用于全系统数据迁移与恢复。</p>
                          </div>
                       </div>
                       <button onClick={() => {
                           const data = { logs, summaries, templates, userSettings };
                           const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = `Lumina_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
                           a.click();
                         }} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] shadow-sm">
                          导出备份
                       </button>
                    </div>
                 </section>
              </div>
            </div>
          )}
        </div>

        {currentView === 'logs' && selectedLogIds.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-10 z-30 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">批量操作</span>
              <span className="text-xl font-black italic">{selectedLogIds.size} <span className="text-indigo-400">记录节点</span></span>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div className="flex items-center gap-6">
              <button onClick={handleBatchExportWord} className="flex items-center gap-2 hover:text-indigo-400 transition-all text-sm font-bold uppercase tracking-tighter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                Word 导出
              </button>
              <button onClick={handleBatchExportExcel} className="flex items-center gap-2 hover:text-emerald-400 transition-all text-sm font-bold uppercase tracking-tighter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                Excel 导出
              </button>
              <button onClick={handleDeleteSelected} className="flex items-center gap-2 hover:text-red-500 transition-all text-sm font-bold uppercase tracking-tighter text-slate-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                彻底清除
              </button>
            </div>
            <button onClick={() => setSelectedLogIds(new Set())} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg></button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
