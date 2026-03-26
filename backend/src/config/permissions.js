// Danh sách tất cả permissions trong hệ thống
const PERMISSIONS = {
  MANAGE_BOOKING: 'ManageBooking',
  MANAGE_PRODUCT: 'ManageProduct',
  MANAGE_BARBER: 'ManageBarber',
  VIEW_BOOKING: 'ViewBooking',
  CREATE_BOOKING: 'CreateBooking',
};

// Phân quyền theo role (tương tự Claim-based authorization của ASP.NET Core)
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.MANAGE_BOOKING,
    PERMISSIONS.MANAGE_PRODUCT,
    PERMISSIONS.MANAGE_BARBER,
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.CREATE_BOOKING,
  ],
  staff: [
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.MANAGE_BOOKING,
    PERMISSIONS.MANAGE_PRODUCT,
    PERMISSIONS.MANAGE_BARBER,
  ],
  customer: [
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.CREATE_BOOKING,
  ],
};

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };
