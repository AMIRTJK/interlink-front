import React, { useState, useEffect } from 'react';
import { Mail, MailPlus, Archive, Pin, Trash2, HelpCircle, Settings, ArrowDownLeft, ArrowUpRight, ChevronDown, Plus, Folder, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
}
interface FolderItem {
  id: string;
  name: string;
  number: string;
}
const STORAGE_KEY = 'menuNavigation_folders';
const menuItems: MenuItem[] = [{
  id: 'internal',
  label: 'Входящие',
  icon: <div className="relative">
        <Mail className="w-5 h-5 stroke-[1.5]" />
        <ArrowUpRight className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5" />
      </div>,
  hasDropdown: true
}, {
  id: 'external',
  label: 'Исходящие',
  icon: <div className="relative">
        <Mail className="w-5 h-5 stroke-[1.5]" />
        <ArrowDownLeft className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5" />
      </div>,
  hasDropdown: true
}, {
  id: 'draft',
  label: 'Черновик',
  icon: <MailPlus className="w-5 h-5 stroke-[1.5]" />,
  hasDropdown: true
}, {
  id: 'archive',
  label: 'Архив',
  icon: <Archive className="w-5 h-5 stroke-[1.5]" />,
  hasDropdown: true
}, {
  id: 'pinned',
  label: 'Закреплённые',
  icon: <Pin className="w-5 h-5 stroke-[1.5] -rotate-45" />
}, {
  id: 'trash',
  label: 'Корзина',
  icon: <Trash2 className="w-5 h-5 stroke-[1.5]" />
}, {
  id: 'help',
  label: 'Помощь',
  icon: <HelpCircle className="w-5 h-5 stroke-[1.5]" />
}, {
  id: 'settings',
  label: 'Настройки',
  icon: <Settings className="w-5 h-5 stroke-[1.5]" />
}];

// @component: MenuNavigation
export const MenuNavigation = () => {
  const [activeId, setActiveId] = useState<string>('internal');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFolderType, setCurrentFolderType] = useState<string>('');
  const [folderName, setFolderName] = useState('');
  const [folderNumber, setFolderNumber] = useState('');
  const [internalFolders, setInternalFolders] = useState<FolderItem[]>([]);
  const [externalFolders, setExternalFolders] = useState<FolderItem[]>([]);
  const [draftFolders, setDraftFolders] = useState<FolderItem[]>([]);

  // Загрузка папок из localStorage при монтировании компонента
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.internal) setInternalFolders(parsed.internal);
        if (parsed.external) setExternalFolders(parsed.external);
        if (parsed.draft) setDraftFolders(parsed.draft);
      }
    } catch (error) {
      console.error('Error loading folders from localStorage:', error);
    }
  }, []);

  // Автосохранение папок в localStorage при изменении
  useEffect(() => {
    try {
      const dataToSave = {
        internal: internalFolders,
        external: externalFolders,
        draft: draftFolders
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving folders to localStorage:', error);
    }
  }, [internalFolders, externalFolders, draftFolders]);
  const handleItemClick = (itemId: string, hasDropdown?: boolean) => {
    setActiveId(itemId);
    if (hasDropdown) {
      setExpandedId(expandedId === itemId ? null : itemId);
    } else {
      setExpandedId(null);
    }
  };
  const handleAddClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCurrentFolderType(itemId);
    setIsModalOpen(true);
  };
  const handleYearClick = (e: React.MouseEvent, year: string) => {
    e.stopPropagation();
    console.log(`Year folder clicked: ${year}`);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFolderName('');
    setFolderNumber('');
    setCurrentFolderType('');
  };
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !folderNumber.trim()) {
      return;
    }
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      number: folderNumber.trim()
    };
    if (currentFolderType === 'internal') {
      setInternalFolders(prev => [...prev, newFolder]);
    } else if (currentFolderType === 'external') {
      setExternalFolders(prev => [...prev, newFolder]);
    } else if (currentFolderType === 'draft') {
      setDraftFolders(prev => [...prev, newFolder]);
    }
    handleCloseModal();
  };
  const handleFolderClick = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    console.log(`Folder clicked: ${folderId}`);
  };
  const getFoldersForItem = (itemId: string): FolderItem[] => {
    if (itemId === 'internal') return internalFolders;
    if (itemId === 'external') return externalFolders;
    if (itemId === 'draft') return draftFolders;
    return [];
  };
  return <>
      {/* Slide-up Panel with Glassmorphism */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl shadow-indigo-500/20 p-6 min-w-[300px] max-w-[340px] select-none">
        <nav className="flex flex-col space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide">
          {menuItems.map(item => <div key={item.id}>
              <button onClick={() => handleItemClick(item.id, item.hasDropdown)} className={cn("flex items-center gap-3 w-full transition-all duration-200 group text-left outline-none focus:ring-2 focus:ring-indigo-300/50 rounded-2xl px-3 py-2.5", activeId === item.id ? "bg-gradient-to-r from-indigo-400/30 to-purple-400/30 border border-white/50 text-indigo-700 shadow-lg shadow-indigo-200/40" : "text-gray-700 hover:bg-white/50 hover:backdrop-blur-md hover:text-indigo-600 hover:shadow-sm hover:shadow-indigo-200/30")}>
                <div className={cn("flex-shrink-0 transition-colors duration-200 bg-white/60 backdrop-blur-md shadow-sm p-1.5 rounded-xl", activeId === item.id ? "text-indigo-600 shadow-indigo-200/40" : "text-indigo-500")}>
                  {item.icon}
                </div>

                <span className={cn("text-xs font-medium tracking-wide flex-1", activeId === item.id ? "font-semibold" : "")}>
                  {item.label}
                </span>

                {item.hasDropdown && <motion.div animate={{
              rotate: expandedId === item.id ? 180 : 0
            }} transition={{
              duration: 0.3,
              ease: "easeInOut"
            }} className={cn("flex-shrink-0 transition-colors duration-200", activeId === item.id ? "text-indigo-600" : "text-indigo-500")}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>}
              </button>

              {/* Dropdown Content */}
              <AnimatePresence>
                {item.hasDropdown && expandedId === item.id && <motion.div initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: "auto",
              opacity: 1
            }} exit={{
              height: 0,
              opacity: 0
            }} transition={{
              height: {
                duration: 0.3,
                ease: "easeInOut"
              },
              opacity: {
                duration: 0.2,
                ease: "easeInOut"
              }
            }} className="overflow-hidden">
                    <motion.div initial={{
                y: -10
              }} animate={{
                y: 0
              }} exit={{
                y: -10
              }} transition={{
                duration: 0.3,
                ease: "easeOut"
              }} className="mt-2 ml-9 pl-3 border-l-2 border-dotted border-indigo-300/40">
                      {item.id === 'archive' ?
                // Archive year folders
                <div className="space-y-1">
                          {['2025', '2024', '2023'].map(year => <button key={year} onClick={e => handleYearClick(e, year)} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-white/50 hover:backdrop-blur-md hover:shadow-sm hover:shadow-indigo-100/30 transition-all duration-200 group w-full text-left">
                              <Folder className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                              <span className="text-xs font-medium">{year}</span>
                            </button>)}
                        </div> :
                // Folders and Add button for internal/external/draft
                <div className="space-y-1">
                          {getFoldersForItem(item.id).map(folder => <button key={folder.id} onClick={e => handleFolderClick(e, folder.id)} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-white/50 hover:backdrop-blur-md hover:shadow-sm hover:shadow-indigo-100/30 transition-all duration-200 group w-full text-left">
                              <Folder className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                              <span className="text-xs font-medium">
                                {folder.name}
                              </span>
                            </button>)}
                          <button onClick={e => handleAddClick(e, item.id)} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-white/50 hover:backdrop-blur-md hover:shadow-sm hover:shadow-indigo-100/30 transition-all duration-200 group w-full text-left">
                            <Plus className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                            <span className="text-xs font-medium">Добавить</span>
                          </button>
                        </div>}
                    </motion.div>
                  </motion.div>}
              </AnimatePresence>
            </div>)}
        </nav>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && <>
            {/* Backdrop */}
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.2
        }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={handleCloseModal} />

            {/* Modal Content */}
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} transition={{
          duration: 0.3,
          ease: "easeOut"
        }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl shadow-indigo-500/20 z-[101] w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Создать папку
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/60 hover:backdrop-blur-md p-1.5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateFolder} className="space-y-5">
                {/* Folder Name */}
                <div>
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Название папки
                  </label>
                  <input id="folderName" type="text" value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-transparent transition-all shadow-sm shadow-indigo-100/30 text-sm" placeholder="Введите название" required />
                </div>

                {/* Folder Number */}
                <div>
                  <label htmlFor="folderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    № папки
                  </label>
                  <input id="folderNumber" type="text" value={folderNumber} onChange={e => setFolderNumber(e.target.value)} className="w-full px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-transparent transition-all shadow-sm shadow-indigo-100/30 text-sm" placeholder="Введите номер" required />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl text-gray-700 hover:bg-white/80 transition-colors font-medium shadow-sm shadow-indigo-100/30 text-sm">
                    Отмена
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-colors font-medium shadow-lg shadow-indigo-300/40 text-sm">
                    Создать
                  </button>
                </div>
              </form>
            </motion.div>
          </>}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>;
};