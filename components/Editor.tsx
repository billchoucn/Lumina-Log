
import React, { useState, useEffect } from 'react';
import { WorkLog, TaskItem } from '../types';

interface EditorProps {
  log?: WorkLog;
  onSave: (log: WorkLog) => void;
  onCancel: () => void;
  onPolish: (content: string) => Promise<string>;
}

const Editor: React.FC<EditorProps> = ({ log, onSave, onCancel, onPolish }) => {
  const [title, setTitle] = useState(log?.title || '');
  const [content, setContent] = useState(log?.content || '');
  const [date, setDate] = useState(log?.date || new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<TaskItem[]>(log?.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handlePolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await onPolish(content);
      setContent(polished);
    } catch (e) {
      alert("AI润色失败，请稍后再试");
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      id: log?.id || Date.now().toString(),
      title,
      content,
      date,
      tasks,
      tags: [],
      createdAt: log?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{log ? '编辑日志' : '撰写新日志'}</h2>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            保存日志
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 ml-1">标题</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入今日核心工作标题..."
              className="w-full text-xl font-medium px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-500 ml-1">详细内容</label>
              <button 
                onClick={handlePolish}
                disabled={isPolishing}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`}>
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                </svg>
                {isPolishing ? '润色中...' : 'AI 智能润色'}
              </button>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录今日完成的事情、心得、遇到的问题..."
              rows={12}
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 ml-1">日期</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-500 ml-1">事项清单</label>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 group">
                  <input 
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {task.text}
                  </span>
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="添加待办事项..."
                className="flex-1 px-4 py-2 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
              />
              <button 
                onClick={handleAddTask}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-600">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
