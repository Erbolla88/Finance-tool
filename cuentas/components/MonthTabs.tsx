import React from 'react';

interface MonthTabsProps {
  tabs: Date[];
  selectedTab: Date;
  onSelectTab: (date: Date) => void;
}

const MonthTabs: React.FC<MonthTabsProps> = ({ tabs, selectedTab, onSelectTab }) => {
  const getMonthName = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="mb-6">
      <div className="flex space-x-2 border-b border-gray-700 overflow-x-auto pb-2">
        {tabs.map((tabDate) => {
          const isSelected = tabDate.getMonth() === selectedTab.getMonth() && tabDate.getFullYear() === selectedTab.getFullYear();
          return (
            <button
              key={tabDate.toISOString()}
              onClick={() => onSelectTab(tabDate)}
              className={`capitalize text-sm font-medium px-4 py-3 border-b-2 transition-colors duration-200 whitespace-nowrap ${
                isSelected
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {getMonthName(tabDate)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthTabs;
