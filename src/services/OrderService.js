const Order = require("../models/order");
const DetailOrder = require("../models/detailOrder");
const { v4: uuidv4 } = require("uuid");

async function createOrder(data) {
  const { products, ...orderData } = data;

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Danh sách sản phẩm không hợp lệ");
  }

  let total = 0;

  const normalizedProducts = products.map((item) => {
    const id_product = item.id_product || item._id || item.productId;
    const nameProduct = item.name_product || item.nameProduct || item.name;
    const priceProduct = Number(item.price_product || item.priceProduct || item.price);
    const count = Number(item.count || item.quantity || item.qty);

    if (!id_product || !nameProduct || !priceProduct) {
      throw new Error("Thiếu thông tin sản phẩm (id, tên hoặc giá)");
    }

    if (priceProduct > 0 && count > 0) total += priceProduct * count;

    return {
      id_product,
      nameProduct,
      priceProduct,
      count,
      size: item.size || "M",
      brand: item.brand || "",
      category: item.category || "",
      image: item.image || "",
      discountAtPurchase: Number(item.discountAtPurchase || 0),
    };
  });

  if (!Number.isFinite(total)) total = 0;

  const orderInfo = {
    user: orderData.user || orderData.id_user,
    payment: orderData.payment || "COD",
    total,
    status: orderData.status || "pending",
    paid: orderData.paid || false,
    shippingFee: Number(orderData.shippingFee || 0),
    note: orderData.note || null,
    coupon: orderData.coupon || null,
    address: orderData.address || "",
  };

  if (!orderInfo.user) throw new Error("Thiếu thông tin user trong đơn hàng");

  const order = await Order.create(orderInfo);

  const detailOrders = await Promise.all(
    normalizedProducts.map((item) =>
      DetailOrder.create({
        _id: uuidv4(),
        id_order: String(order._id),
        id_product: String(item.id_product),
        nameProduct: item.nameProduct,
        brand: item.brand,
        category: item.category,
        image: item.image,
        priceProduct: Number(item.priceProduct),
        count: Number(item.count),
        size: item.size,
        discountAtPurchase: Number(item.discountAtPurchase),
      })
    )
  );

  return { order, detailOrders };
}

async function getAllOrders() {
  return await Order.find()
    .populate("user", "fullname email")
    .populate("coupon", "code promotion")
    .sort({ createdAt: -1 });
}

async function getOrderById(id) {
  // Lấy thông tin đơn hàng chính
  const order = await Order.findById(id)
    .populate("user", "fullname email")
    .populate("coupon", "code promotion")
    .lean();

  if (!order) return null;

  // 🔍 Lấy danh sách chi tiết sản phẩm theo id_order
  const detailOrders = await DetailOrder.find({ id_order: String(id) })
    .populate("id_product", "name_product price_product image")
    .lean();

  // Gộp lại
  order.detailOrders = detailOrders || [];

  return order;
}

async function updateOrder(id, updates) {
  return await Order.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteOrder(id) {
  return await Order.findByIdAndDelete(id);
}

async function getOrdersByUser(userId) {
  return await Order.find({ user: userId })
    .populate("coupon", "code promotion")
    .sort({ createdAt: -1 });
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUser,
};
