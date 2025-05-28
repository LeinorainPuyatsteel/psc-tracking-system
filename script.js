const statuses = [
  "Sales Order Being Prepared",
  "Fully Prepared, Transferred to Loading Area",
  "Loading is Ongoing",
  "Fully Loaded and Ready for Dispatch",
  "Fully Loaded and Waiting for Dispatch",
  "Truck is Being Weighed",
  "Ready for Dispatch with no Discrepancy",
];

const ordersData = [
  { id: 1001, customer: "Alpha Corp", status: statuses[0] },
  { id: 1002, customer: "Beta Inc", status: statuses[1] },
  { id: 1003, customer: "Gamma Ltd", status: statuses[2] },
  { id: 1004, customer: "Delta Co", status: statuses[3] },
  { id: 1005, customer: "Epsilon LLC", status: statuses[4] },
  { id: 1006, customer: "Zeta Traders", status: statuses[5] },
  { id: 1007, customer: "Eta Services", status: statuses[6] },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

function renderMobileTabs() {
  const tabList = document.getElementById("orderTabs");
  const tabContent = document.getElementById("tabContentMobile");
  statuses.forEach((status, index) => {
    const tabId = slugify(status);
    tabList.innerHTML += `
          <li class="nav-item" role="presentation">
            <button class="nav-link ${
              index === 0 ? "active" : ""
            }" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button">${status}</button>
          </li>
        `;
    const cards =
      ordersData
        .filter((order) => order.status === status)
        .map(
          (order) => `
            <div class="card mb-2">
              <div class="card-body">
                Sales Order #${order.id} - ${order.customer}<br>
                <span class="badge bg-secondary">${order.status}</span>
              </div>
            </div>
          `
        )
        .join("") || `<div class="text-muted small p-2">No orders</div>`;
    tabContent.innerHTML += `
          <div class="tab-pane fade ${
            index === 0 ? "show active" : ""
          }" id="${tabId}">
            ${cards}
          </div>
        `;
  });
}

function renderDesktopKanban() {
  const board = document.getElementById("kanbanBoard");
  statuses.forEach((status) => {
    const colId = slugify(status) + "Col";
    const cards =
      ordersData
        .filter((order) => order.status === status)
        .map(
          (order) => `
                <div class="card mb-2 draggable-card" data-id="${order.id}">
                <div class="card-body">Sales Order #${order.id} - ${order.customer}</div>
                </div>
            `
        )
        .join("") || `<div class="text-muted small p-2">No orders</div>`;

    const columnHTML = `
            <div class="kanban-column">
                <h6>${status}</h6>
                <div id="${colId}" class="sortable-area">${cards}</div>
            </div>
            `;

    board.insertAdjacentHTML("beforeend", columnHTML);

    new Sortable(document.getElementById(colId), {
      group: "orders",
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onEnd: function (evt) {
        const orderId = evt.item.getAttribute("data-id");
        const newStatus = evt.to.parentNode.querySelector("h6").textContent;
        const order = ordersData.find((o) => o.id == orderId);
        if (order) order.status = newStatus;
      },
    });
  });
}

renderMobileTabs();
renderDesktopKanban();
