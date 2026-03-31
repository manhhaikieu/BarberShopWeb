import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/DataContext';
import { useAuth } from '../hooks/AuthContext';
import { productOrderAPI } from '../api/apiService';
import './HomePage.css';

import service1 from '../assets/images/service_1.jpg';
import goidau from '../assets/images/goidau.jpg';
import sapvuottoc from '../assets/images/sapvuottoc.png';
import barbershop from '../assets/images/barbershop.jpg';
import tho1 from '../assets/images/tho1.jpg';
import tho2 from '../assets/images/tho2.png';

const HomePage = () => {
    const { products, barbers } = useData();
    const teamImages = [tho1, tho2, tho1, tho2, tho1];
    const featuredProducts = products.slice(0, 8);
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    
    // Khởi tạo mặc định nếu có user thì dùng fullName và phone của user
    const defaultOrderData = { 
        customerName: user ? (user.fullName || user.username) : '', 
        customerPhone: user ? (user.phone || '') : '', 
        address: '', 
        quantity: 1 
    };
    
    const [orderData, setOrderData] = useState(defaultOrderData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await productOrderAPI.create({
                productId: selectedProduct.id,
                ...orderData
            });
            alert('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
            setSelectedProduct(null);
            setShowCheckout(false);
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi đặt hàng!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setShowCheckout(false);
        setOrderData(defaultOrderData);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setShowCheckout(false);
    };

    return (
        <div className="home-wrapper">
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>BOOK<br />LỊCH HẸN!</h1>
                    <Link to="/booking" className="btn-hero">ĐẶT LỊCH</Link>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section className="section-container about-section">
                <div className="about-text">
                    <h2>BARBERSHOP<br />CHUYÊN NGHIỆP</h2>
                    <p>
                        HKT Barber Shop là 1 chuỗi những cửa hàng cắt tóc cho nam giới tại Hà Nội & TP Hồ Chí Minh.
                        Được thành lập từ năm 2019, với đội ngũ chuyên nghiệp và nhiệt tình, cam kết sẽ mang lại
                        những kiểu tóc hài lòng nhất cho các đấng mày râu.
                    </p>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-number">200.000+</span>
                            <span className="stat-label">Dịch vụ tuyệt vời!</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10.000+</span>
                            <span className="stat-label">Khách hàng đánh giá hài lòng</span>
                        </div>
                    </div>
                </div>
                <div className="about-image">
                    <img src={barbershop} alt="About HKT Barber Shop" className="img-placeholder-lg" style={{ objectFit: 'cover' }} />
                </div>
            </section>

            {/* SERVICES / PRODUCTS TEASER */}
            <section className="dark-section">
                <div className="section-container">
                    <div className="section-header center">
                        <span className="sub-title">HKT BARBER SHOP - FROM HEART TO HAIR!</span>
                        <h2>DỊCH VỤ - SẢN PHẨM</h2>
                        <p className="intro-text">
                            Với HKT Barber Shop bạn sẽ được trải nghiệm những dịch vụ tốt nhất trong một không gian chuyên nghiệp, thân thiện & gần gũi!
                        </p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="card-img" style={{ backgroundImage: `url(${service1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="card-content">
                                <h3>CẮT - LÀM HÓA CHẤT</h3>
                                <p>HKT cung cấp đa dạng dịch vụ cắt: Cắt Xả, Senior Cắt, Master Cắt và làm hóa chất: Uốn, Ép, Nhuộm,...</p>
                            </div>
                        </div>
                        <div className="service-card">
                            <div className="card-img" style={{ backgroundImage: `url(${goidau})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="card-content">
                                <h3>GỘI ĐẦU - RELAX</h3>
                                <p>Trải nghiệm một không gian yên tĩnh và nhẹ nhàng giúp bạn có những phút giây thư giãn và thoải mái.</p>
                            </div>
                        </div>
                        <div className="service-card">
                            <div className="card-img" style={{ backgroundImage: `url(${sapvuottoc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="card-content">
                                <h3>SẢN PHẨM</h3>
                                <p>HKT cung cấp những sản phẩm chăm sóc & tạo kiểu tóc chính hãng, chất lượng đáp ứng đa dạng cho các kiểu tóc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            <section className="section-container">
                <div className="section-header center">
                    <h2>ĐỘI NGŨ BARBER</h2>
                    <p>Là những người thợ có Tâm & được đào tạo bài bản.</p>
                </div>
                <div className="team-grid">
                    {barbers && barbers.length > 0 ? barbers.map((barber) => (
                        <div key={barber.id} className="team-member">
                            <div className="member-img" style={{ backgroundImage: `url(${barber.avatar || tho1})`, backgroundSize: 'cover', backgroundPosition: 'center', flex: 1 }}></div>
                            <div style={{ textAlign: 'center', padding: '15px 10px', fontWeight: 'bold', fontSize: '1.2rem', color: '#1a1a2e', backgroundColor: '#fff', borderTop: '2px solid #d4af37' }}>
                                {barber.name}
                            </div>
                        </div>
                    )) : teamImages.map((img, index) => (
                        <div key={index} className="team-member">
                            <div className="member-img" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', flex: 1 }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SẢN PHẨM NỔI BẬT */}
            <section className="section-container">
                <div className="section-header center">
                    <h2>Sản phẩm nổi bật</h2>
                    <p>Khám phá những sản phẩm mới nhất & đang thịnh hành.</p>
                </div>
                {featuredProducts.length === 0 ? (
                    <div className="gallery-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="gallery-item placeholder"></div>
                        ))}
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {featuredProducts.map(product => (
                            <div key={product.id} className="product-card" onClick={() => handleOpenModal(product)}>
                                <div className="product-card-img">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} />
                                    ) : (
                                        <div className="product-card-no-img">📦</div>
                                    )}
                                </div>
                                <div className="product-card-info">
                                    <div className="product-card-name">{product.name}</div>
                                    <div className="product-card-price">{Number(product.price).toLocaleString('vi-VN')}đ</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal Chi tiết Sản Phẩm */}
            {selectedProduct && (
                <div className="product-modal-overlay" onClick={handleCloseModal}>
                    <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="product-modal-close" onClick={handleCloseModal}>×</button>
                        <div className="product-modal-body">
                            <div className="product-modal-img">
                                {selectedProduct.imageUrl ? (
                                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                                ) : (
                                    <div className="product-modal-no-img">📦</div>
                                )}
                            </div>
                            <div className="product-modal-info">
                                <h3>{selectedProduct.name}</h3>
                                <div className="product-modal-price">{Number(selectedProduct.price).toLocaleString('vi-VN')}đ</div>
                                <div className="product-modal-category">Danh mục: {selectedProduct.category || 'Khác'}</div>
                                {!showCheckout ? (
                                    <>
                                        <p className="product-modal-desc">{selectedProduct.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                                        <button className="btn-buy-now" onClick={() => setShowCheckout(true)}>
                                            MUA NGAY
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleOrderSubmit} className="checkout-form">
                                        <div className="form-group">
                                            <input required placeholder="Họ và tên" value={orderData.customerName} onChange={e => setOrderData({...orderData, customerName: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <input required type="tel" placeholder="Số điện thoại" value={orderData.customerPhone} onChange={e => setOrderData({...orderData, customerPhone: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <textarea required placeholder="Địa chỉ nhận hàng" value={orderData.address} onChange={e => setOrderData({...orderData, address: e.target.value})}></textarea>
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ margin: 0 }}>Số lượng:</label>
                                            <input required type="number" min="1" max={selectedProduct.stockQuantity || 100} value={orderData.quantity} onChange={e => setOrderData({...orderData, quantity: parseInt(e.target.value)})} style={{ width: '80px' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button type="button" className="btn-cancel" onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '12px', background: '#e0e0e0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Quay lại</button>
                                            <button type="submit" className="btn-buy-now" disabled={isSubmitting} style={{ flex: 2, padding: '12px' }}>
                                                {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;