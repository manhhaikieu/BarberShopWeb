import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { serviceAPI, productAPI, barberAPI, bookingAPI, chairAPI } from '../api/apiService';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [chairs, setChairs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchServices = useCallback(async () => {
        try {
            const data = await serviceAPI.getAll();
            setServices(data.services || []);
        } catch (err) { console.error('Fetch services:', err); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const data = await productAPI.getAll();
            setProducts(data.products || []);
        } catch (err) { console.error('Fetch products:', err); }
    }, []);

    const fetchBarbers = useCallback(async () => {
        try {
            const data = await barberAPI.getAll();
            setBarbers(data.barbers || []);
        } catch (err) { console.error('Fetch barbers:', err); }
    }, []);

    const fetchBookings = useCallback(async () => {
        try {
            const data = await bookingAPI.getAll();
            setBookings(data.bookings || []);
        } catch (err) { console.error('Fetch bookings:', err); }
    }, []);

    const fetchChairs = useCallback(async () => {
        try {
            const data = await chairAPI.getAll();
            setChairs(data.chairs || []);
        } catch (err) { console.error('Fetch chairs:', err); }
    }, []);

    // Auto-fetch data
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchServices(), fetchProducts(), fetchBarbers(), fetchChairs()])
            .finally(() => setLoading(false));
    }, [fetchServices, fetchProducts, fetchBarbers, fetchChairs]);

    // Lấy dữ liệu cá nhân khi đăng nhập
    useEffect(() => {
        if (user) {
            fetchBookings();
        } else {
            setBookings([]);
        }
    }, [user, fetchBookings]);

    // Product CRUD
    const addProduct = async (productData) => {
        const data = await productAPI.create(productData);
        setProducts(prev => [...prev, data.product]);
        return data.product;
    };

    const updateProduct = async (id, productData) => {
        const data = await productAPI.update(id, productData);
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
        return data.product;
    };

    const deleteProduct = async (id) => {
        await productAPI.delete(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // Barber CRUD
    const addBarber = async (barberData) => {
        const data = await barberAPI.create(barberData);
        setBarbers(prev => [...prev, data.barber]);
        return data.barber;
    };

    const updateBarber = async (id, barberData) => {
        const data = await barberAPI.update(id, barberData);
        setBarbers(prev => prev.map(b => b.id === id ? data.barber : b));
        return data.barber;
    };

    const deleteBarber = async (id) => {
        await barberAPI.delete(id);
        setBarbers(prev => prev.filter(b => b.id !== id));
    };

    // Booking
    const addBooking = async (bookingData) => {
        const data = await bookingAPI.create(bookingData);
        setBookings(prev => [...prev, data.booking]);
        return data.booking;
    };

    const updateBookingStatus = async (id, status) => {
        const data = await bookingAPI.updateStatus(id, status);
        setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
        return data.booking;
    };

    const cancelBooking = async (id) => {
        const data = await bookingAPI.cancel(id);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        return data;
    };

    // Service CRUD
    const addService = async (serviceData) => {
        const data = await serviceAPI.create(serviceData);
        setServices(prev => [...prev, data.service]);
        return data.service;
    };

    const updateService = async (id, serviceData) => {
        const data = await serviceAPI.update(id, serviceData);
        setServices(prev => prev.map(s => s.id === id ? data.service : s));
        return data.service;
    };

    const deleteService = async (id) => {
        await serviceAPI.delete(id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    // Chair CRUD
    const addChair = async (chairData) => {
        const data = await chairAPI.create(chairData);
        setChairs(prev => [...prev, data.chair]);
        return data.chair;
    };

    const updateChair = async (id, chairData) => {
        const data = await chairAPI.update(id, chairData);
        setChairs(prev => prev.map(c => c.id === id ? data.chair : c));
        return data.chair;
    };

    const deleteChair = async (id) => {
        await chairAPI.delete(id);
        setChairs(prev => prev.filter(c => c.id !== id));
    };

    return (
        <DataContext.Provider value={{
            services, fetchServices, addService, updateService, deleteService,
            products, addProduct, updateProduct, deleteProduct, fetchProducts,
            barbers, addBarber, updateBarber, deleteBarber, fetchBarbers,
            bookings, addBooking, updateBookingStatus, cancelBooking, fetchBookings,
            chairs, addChair, updateChair, deleteChair, fetchChairs,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
