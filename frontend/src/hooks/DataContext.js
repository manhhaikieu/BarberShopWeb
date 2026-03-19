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

    // Auto-fetch khi đăng nhập, clear khi đăng xuất
    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([fetchServices(), fetchProducts(), fetchBarbers(), fetchBookings(), fetchChairs()])
                .finally(() => setLoading(false));
        } else {
            setServices([]);
            setProducts([]);
            setBarbers([]);
            setBookings([]);
            setChairs([]);
        }
    }, [user, fetchServices, fetchProducts, fetchBarbers, fetchBookings, fetchChairs]);

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

    return (
        <DataContext.Provider value={{
            services, fetchServices,
            products, addProduct, updateProduct, deleteProduct, fetchProducts,
            barbers, addBarber, updateBarber, deleteBarber, fetchBarbers,
            bookings, addBooking, fetchBookings,
            chairs, fetchChairs,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
