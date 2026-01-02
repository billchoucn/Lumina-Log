
import React, { useState, useMemo } from 'react';
import { AISummary, SummaryTemplate } from '../types';
import TemplateManager from './TemplateManager';
import { exportAsMarkdown } from '../utils/storage';

interface SummariesHubProps {
  summaries: AISummary[];
  templates: SummaryTemplate[];
  onSaveTemplates: (newTemplates: SummaryTemplate[]) => void;
  onGenerateNew: (startDate?: string, endDate?: string) => void;
}

const SummariesHub: React.FC<SummariesHubProps> = ({ summaries, templates, onSaveTemplates, onGenerateNew }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'templates'>('history');
  const [activeSummary, setActiveSummary] = useState<AISummary | undefined>(summaries[0]);
  
  // Date range for filtering history or initiating new summary
  const [quickRange, setQuickRange] = useState({
    start: '',
    end: ''
  });

  const filteredSummaries = useMemo(() => {
    if (!quickRange.start && !quickRange.end) return summaries;
    return summaries.filter(sum => {
      const isAfterStart = !quickRange.start || sum.startDate >= quickRange.start;
      const isBeforeEnd = !quickRange.end || sum.endDate <= quickRange.end;
      return isAfterStart && isBeforeEnd;
    });
  }, [summaries, quickRange]);

  const handleQuickGenerate = () => {
    if (!quickRange.start || !quickRange.end) {
      alert("请选择完整的开始和结束日期以生成总结");
      return;
    }
    onGenerateNew(quickRange.start, quickRange.end);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 gap-6">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            汇报历史库 ({filteredSummaries.length})
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            汇报模板管理 ({templates.length})
          </button>
        </div>
        
        {/* Quick Range Setting Integration */}
        {activeTab === 'history' && (
          <div className="pb-3 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">时间段选择</span>
               <input 
                 type="date" 
                 value={quickRange.start} 
                 onChange={e => setQuickRange(p => ({...p, start: e.target.value}))} 
                 className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 w-28 text-slate-600" 
               />
               <span className="text-slate-300">/</span>
               <input 
                 type="date" 
                 value={quickRange.end} 
                 onChange={e => setQuickRange(p => ({...p, end: e.target.value}))} 
                 className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 w-28 text-slate-600" 
               />
            </div>
            <button 
              onClick={handleQuickGenerate}
              className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all text-sm whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>
              基于此日期总结
            </button>
          </div>
        )}
      </div>

      {activeTab === 'history' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-3">
            {filteredSummaries.map(sum => (
              <button 
                key={sum.id}
                onClick={() => setActiveSummary(sum)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeSummary?.id === sum.id 
                  ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 text-white' 
                  : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${activeSummary?.id === sum.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {sum.rangeType} REPORT
                  </p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${activeSummary?.id === sum.id ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400'}`}>AI</span>
                </div>
                <p className="font-bold text-sm truncate">{sum.startDate} - {sum.endDate}</p>
              </button>
            ))}
            {filteredSummaries.length === 0 && (
               <div className="p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {quickRange.start || quickRange.end ? '该时间段内暂无历史总结' : '暂无汇报历史'}
                  </p>
                  <button 
                    onClick={() => onGenerateNew()}
                    className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    即刻生成第一份总结
                  </button>
               </div>
            )}
          </div>

          <div className="lg:col-span-3">
             {activeSummary ? (
               <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-10 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-2xl font-black text-slate-800 tracking-tight">工作成果总结报告</h3>
                           <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase tracking-widest border border-indigo-100">{activeSummary.rangeType}</span>
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{activeSummary.startDate} <span className="text-slate-200 mx-1">/</span> {activeSummary.endDate}</p>
                     </div>
                     <div className="flex gap-3">
                        <button 
                          onClick={() => exportAsMarkdown(activeSummary.rawMarkdown, `WorkSummary_${activeSummary.startDate}`)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                          导出 MD 文档
                        </button>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <section>
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 border-l-4 border-indigo-600 pl-3">I. 核心进展概述</h4>
                        <p className="text-slate-700 leading-relaxed text-lg font-medium">{activeSummary.coreContent}</p>
                     </section>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 border-l-4 border-slate-200 pl-3">II. 关键工作成果</h4>
                           <ul className="space-y-4">
                              {activeSummary.outcomes.map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-700 text-sm leading-relaxed items-start group">
                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>
                                   <span className="group-hover:text-slate-900 transition-colors">{item}</span>
                                </li>
                              ))}
                           </ul>
                        </section>
                        <section>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 border-l-4 border-slate-200 pl-3">III. 下阶段行动计划</h4>
                           <ul className="space-y-4">
                              {activeSummary.pendingItems.map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-700 text-sm leading-relaxed items-start group">
                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>
                                   <span className="group-hover:text-slate-900 transition-colors">{item}</span>
                                </li>
                              ))}
                           </ul>
                        </section>
                     </div>

                     <section className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-6">IV. 风险点与解决策略</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">遇到的挑战 / Blockers</p>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed">{activeSummary.blockers || '无显著阻塞事项，工作流推进顺畅。'}</p>
                           </div>
                           <div className="md:border-l md:border-slate-200 md:pl-10">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">解决思路 / Solutions</p>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed">{activeSummary.solutions || '将继续保持现有高效协作模式。'}</p>
                           </div>
                        </div>
                     </section>

                     <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                        {activeSummary.keywords.map((kw, i) => (
                          <span key={i} className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full border border-slate-200/50 uppercase tracking-widest">#{kw}</span>
                        ))}
                     </div>
                  </div>
               </div>
             ) : (
               <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 p-10 text-center animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-20 h-20 mb-8 opacity-5" strokeWidth="1">
                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.27a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.162.871a2 2 0 00-.731 2.303l.566 1.132a2 2 0 001.789 1.106h14.504a2 2 0 001.789-1.106l.566-1.132a2 2 0 00-.731-2.303l-1.162-.871z" />
                    <path d="M12 11V3M12 3L9 6M12 3L15 6" />
                  </svg>
                  <p className="text-lg font-black text-slate-300 uppercase tracking-[0.2em]">Select Analysis Report</p>
                  <p className="text-xs mt-3 font-medium opacity-60">请从左侧选择总结，或在上方选择日期范围以发起新的 AI 智能分析</p>
               </div>
             )}
          </div>
        </div>
      ) : (
        <TemplateManager templates={templates} onSave={onSaveTemplates} />
      )}
    </div>
  );
};

export default SummariesHub;
