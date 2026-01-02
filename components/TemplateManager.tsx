
import React, { useState } from 'react';
import { SummaryTemplate } from '../types';

interface TemplateManagerProps {
  templates: SummaryTemplate[];
  onSave: (templates: SummaryTemplate[]) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, onSave }) => {
  const [editingTemplate, setEditingTemplate] = useState<Partial<SummaryTemplate> | null>(null);

  const handleSave = () => {
    if (!editingTemplate?.name || !editingTemplate?.structure) return;
    
    let updatedTemplates;
    if (editingTemplate.id) {
      updatedTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate as SummaryTemplate : t);
    } else {
      updatedTemplates = [...templates, { ...editingTemplate, id: Date.now().toString(), isDefault: false } as SummaryTemplate];
    }
    
    onSave(updatedTemplates);
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm('确定删除该模板吗？')) {
      onSave(templates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">总结模板管理</h2>
          <p className="text-slate-500 mt-1">定制 AI 生成总结时的结构、语气与侧重点</p>
        </div>
        <button 
          onClick={() => setEditingTemplate({ name: '', description: '', structure: '' })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          创建新模板
        </button>
      </div>

      {editingTemplate ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">模板名称</label>
              <input 
                type="text"
                value={editingTemplate.name}
                onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                placeholder="例如：市场部周报模板"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">模板描述</label>
              <input 
                type="text"
                value={editingTemplate.description}
                onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                placeholder="简短说明模板用途"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">结构与指令 (核心)</label>
            <textarea 
              value={editingTemplate.structure}
              onChange={e => setEditingTemplate({...editingTemplate, structure: e.target.value})}
              rows={8}
              placeholder="在这里告诉 AI 如何组织总结。例如：总结需包含三大部分：1. 核心进展 2. 指标数据 3. 下周计划。语气需严谨..."
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setEditingTemplate(null)} className="px-6 py-2 text-slate-500 font-bold">取消</button>
            <button onClick={handleSave} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">保存模板</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${template.isDefault ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                {!template.isDefault && (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTemplate(template)} className="text-slate-300 hover:text-indigo-600 transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
                    </button>
                    <button onClick={() => deleteTemplate(template.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
                    </button>
                  </div>
                )}
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{template.name}</h4>
              <p className="text-sm text-slate-500 flex-1">{template.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <span className={`text-[10px] font-black uppercase tracking-widest ${template.isDefault ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {template.isDefault ? '系统预置' : '自定义'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
