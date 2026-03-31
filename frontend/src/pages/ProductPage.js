import React, { useState, useRef } from 'react';
import { useData } from '../hooks/DataContext';
import { uploadAPI } from '../api/apiService';
import '../styles/pages/AdminPages.css';

const ProductPage = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await uploadAPI.uploadProductImage(file);
            setCurrentProduct(prev => ({ ...prev, imageUrl: `http://localhost:5000${data.imageUrl}` }));
        } catch (err) {
            setError('Upload ảnh thất bại: ' + (err.message || ''));
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct({ ...product });
        setIsModalOpen(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(id);
            } catch (err) {
                alert(err.message || 'Xóa thất bại');
            }
        }
    };

    const handleAddNew = () => {
        setCurrentProduct({ name: '', category: '', price: 0, stockQuantity: 0, description: '' });
        setIsModalOpen(true);
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (currentProduct.id) {
                await updateProduct(currentProduct.id, currentProduct);
            } else {
                await addProduct(currentProduct);
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Quản Lý Sản Phẩm</h2>
                <button className="btn-add" onClick={handleAddNew}>+ Thêm Sản Phẩm</button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name}
                                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                                ) : (
                                    <div style={{ width: 56, height: 56, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 22 }}>📦</div>
                                )}
                            </td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{Number(product.price).toLocaleString()} đ</td>
                            <td>{product.stockQuantity}</td>
                            <td>
                                <button className="btn-edit" onClick={() => handleEdit(product)}>Sửa</button>
                                <button className="btn-delete" onClick={() => handleDelete(product.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{currentProduct.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Tên</label>
                                <input
                                    value={currentProduct.name}
                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Danh mục</label>
                                <input
                                    value={currentProduct.category}
                                    onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Giá</label>
                                <input
                                    type="number"
                                    value={currentProduct.price}
                                    onChange={e => setCurrentProduct({ ...currentProduct, price: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tồn kho</label>
                                <input
                                    type="number"
                                    value={currentProduct.stockQuantity}
                                    onChange={e => setCurrentProduct({ ...currentProduct, stockQuantity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hình ảnh sản phẩm</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    {currentProduct.imageUrl && (
                                        <img
                                            src={currentProduct.imageUrl}
                                            alt="preview"
                                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                                        />
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />
                                        <button
                                            type="button"
                                            className="btn-edit"
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? 'Đang tải...' : currentProduct.imageUrl ? '🔄 Đổi ảnh' : '📷 Chọn ảnh'}
                                        </button>
                                        {currentProduct.imageUrl && (
                                            <button
                                                type="button"
                                                className="btn-delete"
                                                style={{ marginLeft: 8 }}
                                                onClick={() => setCurrentProduct(prev => ({ ...prev, imageUrl: '' }))}
                                            >
                                                Xóa ảnh
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <input
                                    value={currentProduct.description || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
