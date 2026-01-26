import { useState, useEffect } from 'react';
import { WorkExperience } from '../../lib/types';
import { getWorkExperience, addWorkExperience, updateWorkExperience, deleteWorkExperience } from '../../lib/api/work_experience';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { Checkbox } from '../ui/checkbox';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface WorkExperienceSectionProps {
    userId: string;
    initialData?: WorkExperience[];
}

export default function WorkExperienceSection({ userId, initialData = [] }: WorkExperienceSectionProps) {
    const [experienceList, setExperienceList] = useState<WorkExperience[]>(initialData);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<WorkExperience>>({
        companyName: '',
        jobTitle: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    });

    useEffect(() => {
        fetchExperience();
    }, [userId]);

    useEffect(() => {
        if (initialData.length > 0) {
            setExperienceList(prev => {
                const newItems = initialData.filter(newItem =>
                    !prev.some(existing => existing.companyName === newItem.companyName && existing.jobTitle === newItem.jobTitle)
                );
                return [...prev, ...newItems];
            });
        }
    }, [initialData]);

    async function fetchExperience() {
        setLoading(true);
        try {
            const data = await getWorkExperience(userId);
            setExperienceList(prev => {
                const tempItems = prev.filter(item => item.id.startsWith('temp-'));
                return [...data, ...tempItems];
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            companyName: '',
            jobTitle: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (exp: WorkExperience) => {
        setEditingId(exp.id);
        setFormData({
            companyName: exp.companyName,
            jobTitle: exp.jobTitle || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            isCurrent: exp.isCurrent || false,
            description: exp.description || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.companyName || !formData.jobTitle) return alert('Company Name and Job Title are required');

        try {
            if (editingId && !editingId.startsWith('temp-')) {
                await updateWorkExperience(editingId, formData);
            } else {
                await addWorkExperience(userId, formData as Omit<WorkExperience, 'id'>);
                if (editingId && editingId.startsWith('temp-')) {
                    setExperienceList(prev => prev.filter(p => p.id !== editingId));
                }
            }
            setIsModalOpen(false);
            fetchExperience();
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            if (id.startsWith('temp-')) {
                setExperienceList(prev => prev.filter(item => item.id !== id));
            } else {
                await deleteWorkExperience(id);
                fetchExperience();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                <Button variant="outline" size="sm" onClick={handleOpenAdd} icon={<Plus className="h-4 w-4" />}>
                    Add Experience
                </Button>
            </div>

            <div className="space-y-4">
                {experienceList.length === 0 && (
                    <p className="text-sm text-gray-500">No work experience added yet.</p>
                )}
                {experienceList.map((exp) => (
                    <div key={exp.id} className="relative flex flex-col gap-1 border-l-2 border-gray-200 pl-4 py-1">
                        <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                        <p className="text-sm font-medium text-gray-700">{exp.companyName}</p>
                        <p className="text-xs text-gray-500">
                            {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                            {exp.location && ` • ${exp.location}`}
                        </p>
                        {exp.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</p>}

                        <div className="absolute right-0 top-0 flex gap-2">
                            <button onClick={() => handleOpenEdit(exp)} className="text-gray-400 hover:text-brand">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(exp.id)} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Experience' : 'Add Experience'}
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <Input
                        label="Job Title"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="e.g. Associate Dentist"
                    />
                    <Input
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Happy Teeth Clinic"
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Kuala Lumpur"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            disabled={formData.isCurrent}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                    <Checkbox
                        label="I am currently working here"
                        checked={formData.isCurrent}
                        onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
                    />
                    <label className="flex w-full flex-col gap-1 text-sm">
                        <span className="font-medium text-gray-800">Description</span>
                        <textarea
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:ring-2 focus:ring-brand/20 h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
