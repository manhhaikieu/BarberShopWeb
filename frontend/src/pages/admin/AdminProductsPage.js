import React, { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { useData } from '../../hooks/DataContext';
import { uploadAPI } from '../../api/apiService';
import './AdminLayout.css';

const CATEGORIES = ['Pomade', 'Dầu gội', 'Sáp', 'Serum', 'Dưỡng da', 'Phụ kiện', 'Khác'];

const AdminProductsPage = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const fileInputRef = useRef(null);

    const openAdd = () => {
        setCurrent({ name: '', category: '', price: 0, stockQuantity: 0, description: '', imageUrl: '' });
        setIsModalOpen(true);
        setError('');
    };

    const openEdit = (product) => {
        setCurrent({ ...product });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
        try {
            await deleteProduct(id);
        } catch (err) {
            alert(err.message || 'Xóa thất bại');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await uploadAPI.uploadProductImage(file);
            setCurrent(prev => ({ ...prev, imageUrl: `http://localhost:5000${data.imageUrl}` }));
        } catch (err) {
            setError('Upload ảnh thất bại: ' + (err.message || ''));
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: current.name,
                category: current.category,
                price: parseFloat(current.price),
                stockQuantity: parseInt(current.stockQuantity),
                description: current.description,
                imageUrl: current.imageUrl || null,
            };
            if (current.id) {
                await updateProduct(current.id, payload);
            } else {
                await addProduct(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const filtered = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCategory || p.category === filterCategory;
        return matchSearch && matchCat;
    });

    const lowStock = products.filter(p => p.stockQuantity <= 5).length;

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <div>
                    <h1>Quản lý Sản phẩm</h1>
                    <p>
                        Tổng {products.length} sản phẩm
                        {lowStock > 0 && <span style={{ color: '#e74c3c', marginLeft: 8 }}>⚠️ {lowStock} sản phẩm sắp hết hàng</span>}
                    </p>
                </div>
                <button className="btn-primary" onClick={openAdd}>+ Thêm Sản phẩm</button>
            </div>

            <div className="admin-card">
                <div className="filter-bar">
                    <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="">Tất cả danh mục</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="admin-table-wrap">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <p>Chưa có sản phẩm nào</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Tồn kho</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            {product.imageUrl
                                                ? <img src={product.imageUrl} alt={product.name} className="product-img-thumb" />
                                                : <div className="no-image">📦</div>}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{product.name}</div>
                                            {product.description && (
                                                <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 2 }}>
                                                    {product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-confirmed">{product.category || '—'}</span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#d4af37' }}>{formatCurrency(product.price)}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: product.stockQuantity <= 5 ? '#e74c3c' : product.stockQuantity <= 20 ? '#856404' : '#27ae60'
                                            }}>
                                                {product.stockQuantity}
                                                {product.stockQuantity <= 5 && ' ⚠️'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon-edit" onClick={() => openEdit(product)}>Sửa</button>
                                            <button className="btn-icon-delete" onClick={() => handleDelete(product.id, product.name)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box modal-lg">
                        <h2 className="modal-title">{current?.id ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h2>
                        {error && <div className="alert-error">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={current.name}
                                    onChange={e => setCurrent({ ...current, name: e.target.value })}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select
                                        value={current.category}
                                        onChange={e => setCurrent({ ...current, category: e.target.value })}
                                    >
                                        <option value="">— Chọn danh mục —</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Giá (VNĐ) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={current.price}
                                        onChange={e => setCurrent({ ...current, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tồn kho</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={current.stockQuantity}
                                        onChange={e => setCurrent({ ...current, stockQuantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ảnh sản phẩm</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        style={{ padding: '6px 0' }}
                                    />
                                    {uploading && <small style={{ color: '#888' }}>Đang upload...</small>}
                                </div>
                            </div>
                            {current.imageUrl && (
                                <div className="form-group">
                                    <img src={current.imageUrl} alt="preview" className="img-upload-preview" />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={current.description}
                                    onChange={e => setCurrent({ ...current, description: e.target.value })}
                                    placeholder="Nhập mô tả sản phẩm..."
                                    rows={3}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={saving || uploading}>
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProductsPage;
