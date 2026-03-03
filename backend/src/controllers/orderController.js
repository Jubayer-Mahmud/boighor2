import Order from '../models/Order.js';

// POST /api/orders — place order (no login required)
export const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerAltPhone, customerEmail, customerAddress, products, totalPrice } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({ message: 'Please provide customerName, customerPhone, and customerAddress' });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!totalPrice) {
      return res.status(400).json({ message: 'totalPrice is required' });
    }

    const order = await Order.create({
      user: req.user ? req.user.id : null,
      customerName,
      customerPhone,
      customerAltPhone: customerAltPhone || '',
      customerEmail: customerEmail || '',
      customerAddress,
      products,
      totalPrice,
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/my — get orders for logged-in user (with pagination)
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('_id status totalPrice createdAt customerAddress products'),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) { next(error); }
};

// GET /api/orders/my/:id — get a single order (user must own it)
export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order retrieved successfully', order });
  } catch (error) { next(error); }
};

// PATCH /api/orders/my/:id/cancel — cancel own order
export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order with status "${order.status}"` });
    }

    order.status = 'Cancelled';
    await order.save();
    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) { next(error); }
};

// GET /api/orders/user — legacy route
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Orders retrieved successfully', orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — get single order
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order retrieved successfully', order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — get all orders (admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status — update order status (admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Please provide status' });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    next(error);
  }
};
