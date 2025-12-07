import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

const TaskList = ({ tasks, onToggleStatus }) => {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>No tasks yet. Speak to add one!</p>
            </div>
        );
    }

    const getPriorityColor = (p) => {
        switch (p?.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-400/20 bg-red-400/10';
            case 'low': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
            default: return 'text-slate-400 border-slate-400/20 bg-slate-400/10';
        }
    };

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`
            group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
            ${task.status === 'completed'
                            ? 'bg-slate-900 border-slate-800 opacity-60'
                            : 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                        }
          `}
                >
                    <button
                        onClick={() => onToggleStatus(task.id, task.status)}
                        className="flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                        {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <Circle className="w-6 h-6" />
                        )}
                    </button>

                    <div className="flex-grow min-w-0">
                        <h3 className={`font-medium text-lg truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                            {task.dueDate && (
                                <span className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <span className={`px-2 py-1 rounded text-xs font-medium border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'Normal'}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default TaskList;
