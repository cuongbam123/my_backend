const DetailOrder = require("../models/detailOrder");

async function createDetailOrder(data) {
  return await DetailOrder.create(data);
}

async function getAllDetailOrders() {
  return await DetailOrder.find()
    .populate("id_order", "order_code status total_price")
    .populate("id_product", "name brand image");
}

async function getDetailOrderById(id) {
  return await DetailOrder.findById(id)
    .populate("id_order", "order_code status total_price")
    .populate("id_product", "name brand image");
}

async function getDetailOrdersByOrderId(orderId) {
  return await DetailOrder.find({ id_order: orderId })
    .populate("id_product", "name brand image price")
    .lean();
}

async function updateDetailOrder(id, data) {
  return await DetailOrder.findByIdAndUpdate(id, data, { new: true });
}

async function deleteDetailOrder(id) {
  return await DetailOrder.findByIdAndDelete(id);
}

module.exports = {
  createDetailOrder,
  getAllDetailOrders,
  getDetailOrderById,
  getDetailOrdersByOrderId,
  updateDetailOrder,
  deleteDetailOrder,
};
