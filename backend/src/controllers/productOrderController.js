const { ProductOrder, Product } = require('../models');

// Tạo đơn hàng sản phẩm mới
exports.createProductOrder = async (req, res) => {
  try {
    const { productId, customerName, customerPhone, address, quantity } = req.body;
    
    // Validate request
    if (!productId || !customerName || !customerPhone || !address || !quantity) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ' });
    }

    const totalPrice = product.price * quantity;
    const userId = req.user ? req.user.id : null; 

    const order = await ProductOrder.create({
      productId,
      userId,
      customerName,
      customerPhone,
      address,
      quantity,
      totalPrice,
      status: 'Pending'
    });

    // Note: Deducting stock can be managed automatically or when confirmed by admin
    // For now we just create the order.
    
    res.status(201).json({ message: 'Đặt hàng thành công!', order });
  } catch (err) {
    console.error('Error creating product order:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách đơn hàng (admin only)
exports.getAllProductOrders = async (req, res) => {
    try {
        const orders = await ProductOrder.findAll({
            include: [{ model: Product, as: 'product' }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Cập nhật trạng thái đơn hàng
exports.updateProductOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await ProductOrder.findByPk(id);
        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Cập nhật trạng thái thành công', order });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy danh sách đơn hàng của một người dùng cụ thể
exports.getMyProductOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await ProductOrder.findAll({
            where: { userId },
            include: [{ model: Product, as: 'product' }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
