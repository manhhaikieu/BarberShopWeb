require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Chair, Barber, Service, Product } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const chairs = await Chair.bulkCreate([
      { name: 'Ghế 1' },
      { name: 'Ghế 2' },
      { name: 'Ghế 3' },
    ]);
    console.log('✅ Chairs seeded');

    await Barber.bulkCreate([
      { name: 'Nguyễn Văn An', experienceYears: 5, chairId: chairs[0].id, phone: '0901234567' },
      { name: 'Trần Minh Khoa', experienceYears: 3, chairId: chairs[1].id, phone: '0912345678' },
      { name: 'Lê Quang Huy', experienceYears: 7, chairId: chairs[2].id, phone: '0923456789' },
    ]);
    console.log('✅ Barbers seeded');

    await Service.bulkCreate([
      { name: 'Cắt tóc thường', price: 50000, duration: 30, description: 'Cắt tóc cơ bản' },
      { name: 'Cắt tóc + Gội đầu', price: 80000, duration: 45, description: 'Cắt tóc và gội đầu' },
      { name: 'Uốn tóc', price: 200000, duration: 90, description: 'Uốn tóc các kiểu' },
      { name: 'Nhuộm tóc', price: 300000, duration: 120, description: 'Nhuộm tóc nhiều màu' },
      { name: 'Cạo râu', price: 30000, duration: 15, description: 'Cạo râu bằng dao' },
      { name: 'Gội đầu massage', price: 60000, duration: 30, description: 'Gội đầu kết hợp massage' },
    ]);
    console.log('✅ Services seeded');

    await Product.bulkCreate([
      { name: 'Sáp vuốt tóc American Crew', price: 120000, stockQuantity: 50, category: 'sáp' },
      { name: 'Sáp vuốt tóc Gatsby', price: 85000, stockQuantity: 40, category: 'sáp' },
      { name: 'Gôm xịt tóc Got2b', price: 95000, stockQuantity: 30, category: 'gôm' },
      { name: "Gôm xịt tóc L'Oreal", price: 110000, stockQuantity: 25, category: 'gôm' },
      { name: 'Dầu gội Redken', price: 250000, stockQuantity: 20, category: 'dầu gội' },
      { name: 'Dầu gội Head & Shoulders', price: 75000, stockQuantity: 60, category: 'dầu gội' },
    ]);
    console.log('✅ Products seeded');

    const adminPass = await bcrypt.hash('admin123', 12);
    const staffPass = await bcrypt.hash('staff123', 12);
    const customerPass = await bcrypt.hash('customer123', 12);

    await User.bulkCreate([
      { username: 'admin', email: 'admin@barbershop.com', password: adminPass, role: 'admin', fullName: 'Quản Trị Viên', phone: '0900000001' },
      { username: 'staff1', email: 'staff1@barbershop.com', password: staffPass, role: 'staff', fullName: 'Nhân Viên 1', phone: '0900000002' },
      { username: 'customer1', email: 'customer1@gmail.com', password: customerPass, role: 'customer', fullName: 'Khách Hàng Mẫu', phone: '0900000003' },
    ]);
    console.log('✅ Users seeded');

    console.log('\n🎉 Seed dữ liệu hoàn tất!');
    console.log('Admin:    admin@barbershop.com / admin123');
    console.log('Staff:    staff1@barbershop.com / staff123');
    console.log('Customer: customer1@gmail.com / customer123');
  } catch (err) {
    console.error('❌ Lỗi khi seed:', err);
  } finally {
    await sequelize.close();
  }
};

seed();
