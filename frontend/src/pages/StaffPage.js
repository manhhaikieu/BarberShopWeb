import React, { useState } from 'react';
import { useData } from '../hooks/DataContext';
import './AdminPages.css';

const StaffPage = () => {
    const { staff, addStaff, updateStaff, deleteStaff } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

    const handleEdit = (member) => {
        setCurrentStaff(member);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            deleteStaff(id);
        }
    };

    const handleAddNew = () => {
        setCurrentStaff({ name: '', position: '', experience: '' });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (currentStaff.id) {
            updateStaff(currentStaff.id, currentStaff);
        } else {
            addStaff(currentStaff);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Staff Management</h2>
                <button className="btn-add" onClick={handleAddNew}>+ Add Staff</button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Experience</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map(member => (
                        <tr key={member.id}>
                            <td>{member.name}</td>
                            <td>{member.position}</td>
                            <td>{member.experience}</td>
                            <td>
                                <button className="btn-edit" onClick={() => handleEdit(member)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(member.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentStaff.id ? 'Edit Staff' : 'Add Staff'}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    value={currentStaff.name}
                                    onChange={e => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <select
                                    value={currentStaff.position}
                                    onChange={e => setCurrentStaff({ ...currentStaff, position: e.target.value })}
                                    required
                                >
                                    <option value="">Select Position</option>
                                    <option value="Barber Master">Barber Master</option>
                                    <option value="Stylist">Stylist</option>
                                    <option value="Junior Barber">Junior Barber</option>
                                    <option value="Trainee">Trainee</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Experience</label>
                                <input
                                    value={currentStaff.experience}
                                    onChange={e => setCurrentStaff({ ...currentStaff, experience: e.target.value })}
                                    placeholder="e.g. 3 years"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;
