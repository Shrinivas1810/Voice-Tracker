import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceInput from './components/VoiceInput';
import TaskList from './components/TaskList';
import { Layout } from 'lucide-react';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskDetected = async (transcript) => {
        setProcessing(true);
        try {
            await axios.post('/api/tasks', { transcript });
            await fetchTasks(); // Refresh list
        } catch (err) {
            console.error('Failed to create task', err);
            alert('Could not create task. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            await axios.put(`/api/tasks/${id}`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update status', err);
            // Revert on failure
            fetchTasks();
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <Layout className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                        Voice Task Tracker
                    </h1>
                    <p className="text-slate-400">
                        Just speak naturally to add your tasks
                    </p>
                </header>

                {/* Voice Input Section */}
                <section className="mb-16">
                    <VoiceInput
                        onTaskDetected={handleTaskDetected}
                        isProcessing={processing}
                    />
                </section>

                {/* Task List Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-200">Your Tasks</h2>
                        <div className="text-sm text-slate-500">
                            {tasks.filter(t => t.status === 'pending').length} pending
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <TaskList tasks={tasks} onToggleStatus={handleToggleStatus} />
                    )}
                </section>

            </div>
        </div>
    );
}

export default App;
