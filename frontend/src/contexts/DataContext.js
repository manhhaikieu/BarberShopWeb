import React, { createContext, useContext, useState } from 'react';
import { SERVICES, PRODUCTS as INITIAL_PRODUCTS, STAFF as INITIAL_STAFF } from '../data/mockData';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [services] = useState(SERVICES); // Services usually don't change often in this scope
    const [bookings, setBookings] = useState([]);

    // Product Actions
    const addProduct = (product) => {
        setProducts([...products, { ...product, id: Date.now() }]);
    };

    const updateProduct = (id, updatedProduct) => {
        setProducts(products.map(p => p.id === id ? { ...updatedProduct, id } : p));
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    // Staff Actions
    const addStaff = (newStaff) => {
        setStaff([...staff, { ...newStaff, id: Date.now() }]);
    };

    const updateStaff = (id, updatedStaff) => {
        setStaff(staff.map(s => s.id === id ? { ...updatedStaff, id } : s));
    };

    const deleteStaff = (id) => {
        setStaff(staff.filter(s => s.id !== id));
    };

    // Booking Actions
    const addBooking = (booking) => {
        setBookings([...bookings, { ...booking, id: Date.now() }]);
    };

    return (
        <DataContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct,
            staff, addStaff, updateStaff, deleteStaff,
            services,
            bookings, addBooking
        }}>
            {children}
        </DataContext.Provider>
    );
};
