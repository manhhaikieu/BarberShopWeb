
export const CLAIMS = {
    MANAGE_PRODUCTS: 'manage:products',
    MANAGE_STAFF: 'manage:staff',
    VIEW_DASHBOARD: 'view:dashboard',
    CREATE_BOOKING: 'booking:create',
};

export const ROLES = {
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER',
};

export const USERS = [
    {
        id: 1,
        username: 'admin',
        password: '123',
        role: ROLES.ADMIN,
        name: 'Administrator',
        claims: [CLAIMS.MANAGE_PRODUCTS, CLAIMS.MANAGE_STAFF, CLAIMS.VIEW_DASHBOARD, CLAIMS.CREATE_BOOKING],
    },
    {
        id: 2,
        username: 'staff',
        password: '123',
        role: ROLES.STAFF,
        name: 'Staff Member',
        claims: [CLAIMS.VIEW_DASHBOARD, CLAIMS.CREATE_BOOKING],
    },
    {
        id: 3,
        username: 'user',
        password: '123',
        role: ROLES.CUSTOMER,
        name: 'Customer 1',
        claims: [CLAIMS.CREATE_BOOKING],
    },
];

export const SERVICES = [
    { id: 1, name: 'Cắt tóc nam', duration: 30, price: 100000 },
    { id: 2, name: 'Cắt tóc nữ', duration: 45, price: 150000 },
    { id: 3, name: 'Gội đầu', duration: 20, price: 50000 },
    { id: 4, name: 'Uốn tóc', duration: 60, price: 300000 },
    { id: 5, name: 'Nhuộm tóc', duration: 90, price: 400000 },
    { id: 6, name: 'Cạo mặt', duration: 15, price: 30000 },
];

export const PRODUCTS = [
    { id: 1, name: 'Sáp Vuốt Tóc Volcanic Clay', price: 250000, stock: 20, category: 'Wax' },
    { id: 2, name: 'Gôm Xịt Tóc Butterfly', price: 120000, stock: 50, category: 'Spray' },
    { id: 3, name: 'Dầu Gội Kevin Murphy', price: 600000, stock: 10, category: 'Shampoo' },
];

export const STAFF = [
    { id: 1, name: 'Nguyễn Văn A', position: 'Barber Master', experience: '5 năm' },
    { id: 2, name: 'Trần Thị B', position: 'Stylist', experience: '3 năm' },
    { id: 3, name: 'Lê Văn C', position: 'Junior Barber', experience: '1 năm' },
];

export const SEATS = [
    { id: 1, name: 'Ghế 1' },
    { id: 2, name: 'Ghế 2' },
    { id: 3, name: 'Ghế 3' },
    { id: 4, name: 'Ghế 4' },
];
