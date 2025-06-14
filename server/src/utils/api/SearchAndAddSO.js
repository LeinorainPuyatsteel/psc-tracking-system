async function searchAndAddSO() {
  if (!soNumber.value) return alert("Please enter a Sales Order number.");

  try {
    const response = await axios.get('api/mock_so.json')
    const mockSOList = response.data
    const mockSO = mockSOList.find(so => so.id === parseInt(soNumber.value))

    if (!mockSO) {
      alert(`Sales Order #${soNumber.value} not found.`)
      return
    }

    await createOrder(mockSO);
    await fetchOrders();
    alert("Sales Order added successfully!");
  } catch (err) {
    if (err.response?.data?.error === "Duplicate entry detected") {
      alert(`❌ Cannot add: Sales Order #${soNumber.value} already exists.`);
    } else {
      console.error("Create failed:", err);
      alert("Something went wrong while adding the order.");
    }
  }
}