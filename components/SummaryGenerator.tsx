
import React, { useState, useEffect } from 'react';
import { WorkLog, AISummary, SummaryTemplate } from '../types';
import { generateSummary } from '../services/geminiService';
import { getTemplates } from '../utils/storage';

interface SummaryGeneratorProps {
  logs: WorkLog[];
  onSummaryGenerated: (summary: AISummary) => void;
  onCancel: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ 
  logs, 
  onSummaryGenerated, 
  onCancel,
  initialStartDate = '',
  initialEndDate = ''
}) => {
  const [rangeType, setRangeType] = useState<AISummary['rangeType']>('weekly');
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<SummaryTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    const loadedTemplates = getTemplates();
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0) {
      setSelectedTemplateId(loadedTemplates[0].id);
    }
  }, []);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert("请先选择完整的日期范围");
      return;
    }

    const filteredLogs = logs.filter(log => log.date >= startDate && log.date <= endDate);
    
    if (filteredLogs.length === 0) {
      alert("选定范围内没有任何工作日志记录，无法生成总结");
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);

    setIsGenerating(true);
    try {
      const result = await generateSummary(filteredLogs, startDate, endDate, template?.structure);
      const summary: AISummary = {
        id: Date.now().toString(),
        rangeType,
        startDate,
        endDate,
        coreContent: result.coreContent,
        outcomes: result.outcomes,
        pendingItems: result.pendingItems,
        blockers: result.blockers,
        solutions: result.solutions,
        keywords: result.keywords,
        rawMarkdown: result.fullMarkdown,
        templateId: selectedTemplateId,
        createdAt: Date.now()
      };
      onSummaryGenerated(summary);
    } catch (e) {
      console.error(e);
      alert("生成总结过程中出现错误，请检查 API 配置或网络状况");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 text-white rounded-[2rem] mb-6 shadow-xl shadow-indigo-200">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
               <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
             </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">AI 智能总结引擎</h2>
          <p className="text-slate-400 mt-2 font-medium">深度解析日志内容，构建逻辑严密的职场汇报</p>
        </div>

        {!isGenerating ? (
          <div className="relative z-10 space-y-10">
            {/* Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">汇报周期类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setRangeType(type)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        rangeType === type 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {type === 'daily' && '日报'}
                      {type === 'weekly' && '周报'}
                      {type === 'monthly' && '月报'}
                      {type === 'quarterly' && '季报'}
                      {type === 'yearly' && '年报'}
                      {type === 'custom' && '自定义'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">深度分析时间跨度</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
                  />
                  <span className="text-slate-300 font-black">/</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">逻辑输出模板</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                      selectedTemplateId === t.id 
                      ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50/50' 
                      : 'border-slate-100 bg-white hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-800 text-sm italic">{t.name}</h4>
                      {selectedTemplateId === t.id && (
                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={onCancel}
                className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                取消
              </button>
              <button 
                onClick={handleGenerate}
                className="flex-[2] py-4 bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                开始生成总结
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center py-16 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="relative inline-flex mb-4">
               <div className="w-24 h-24 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin shadow-inner"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-indigo-600 animate-pulse">AI</span>
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">AI 正在深度重构工作逻辑...</h3>
              <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                引擎正在提取核心关键词、归并任务产出并润色专业措辞。这通常需要 3-8 秒。
              </p>
            </div>
            <div className="max-w-xs mx-auto bg-slate-100 rounded-full h-1 overflow-hidden">
               <div className="bg-indigo-600 h-full animate-[loading_2s_infinite]" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default SummaryGenerator;
