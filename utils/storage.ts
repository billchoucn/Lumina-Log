
import { WorkLog, AISummary, SummaryTemplate, UserSettings } from "../types";

const LOGS_KEY = "lumina_logs";
const SUMMARIES_KEY = "lumina_summaries";
const TEMPLATES_KEY = "lumina_templates";
const SETTINGS_KEY = "lumina_user_settings";

export const getLogs = (): WorkLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs: WorkLog[]) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getSummaries = (): AISummary[] => {
  const data = localStorage.getItem(SUMMARIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSummaries = (summaries: AISummary[]) => {
  localStorage.setItem(SUMMARIES_KEY, JSON.stringify(summaries));
};

const DEFAULT_TEMPLATES: SummaryTemplate[] = [
  {
    id: 'default-pro',
    name: '标准职场汇报',
    description: '适用于日常及周度正式汇报，逻辑严密，涵盖成果与待办。',
    structure: '总结需提炼核心工作内容、完成事项、工作成果、待办事项、工作进度、遇到的问题与解决思路。内容需专业、精炼。',
    isDefault: true
  },
  {
    id: 'creative-growth',
    name: '个人成长与复盘',
    description: '侧重于心得体会、能力提升及经验总结。',
    structure: '总结除工作产出外，需重点复盘学到的新技能、思维方式的转变、以及对未来发展的思考。',
    isDefault: true
  }
];

export const getTemplates = (): SummaryTemplate[] => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  if (!data) {
    saveTemplates(DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  }
  return JSON.parse(data);
};

export const saveTemplates = (templates: SummaryTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

const DEFAULT_SETTINGS: UserSettings = {
  siteTitle: "个人日志",
  siteLogo: "", // Empty means use letter fallback
  userName: "billchou",
  userAvatar: "https://picsum.photos/32/32"
};

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveUserSettings = (settings: UserSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  triggerDownload(blob, `${filename}.md`);
};

export const exportLogsAsMarkdown = (logs: WorkLog[]) => {
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let content = "# 工作日志汇编 (Word 样式)\n\n";
  
  sortedLogs.forEach(log => {
    content += `## ${log.date} | ${log.title}\n\n`;
    content += `${log.content}\n\n`;
    if (log.tasks.length > 0) {
      content += "### 事项清单\n";
      log.tasks.forEach(t => {
        content += `- [${t.completed ? 'x' : ' '}] ${t.text}\n`;
      });
      content += "\n";
    }
    content += "---\n\n";
  });

  const blob = new Blob([content], { type: 'text/markdown' });
  triggerDownload(blob, `Work_Logs_Doc_${new Date().toISOString().split('T')[0]}.md`);
};

export const exportLogsAsCSV = (logs: WorkLog[]) => {
  const headers = ["日期", "标题", "内容", "事项清单", "完成情况"];
  const rows = logs.map(log => [
    log.date,
    log.title,
    log.content.replace(/\n/g, " "),
    log.tasks.map(t => t.text).join("; "),
    `${log.tasks.filter(t => t.completed).length}/${log.tasks.length}`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `Work_Logs_Calendar_Style_${new Date().toISOString().split('T')[0]}.csv`);
};
