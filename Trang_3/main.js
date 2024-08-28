// Sinh dữ liệu ngẫu nhiên
function generateData(numEntries) {
    const data = [];
    for (let i = 1; i <= numEntries; i++) {
        const equipments = ["Đèn", "Quạt", "Điều hòa"];
        const randomEquipment = equipments[Math.floor(Math.random() * equipments.length)];
        const activities = ["On", "Off"];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];

        const randomDate = new Date();
        randomDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

        data.push({
            id: i,
            equipment: randomEquipment,
            activity: randomActivity,
            time: randomDate.toISOString().slice(0, 19) // Định dạng datetime-local
        });
    }
    return data;
}

const originalData = generateData(103);
let filteredData = originalData;
const rowsPerPage = 10;
let currentPage = 1;

// Bảng hiển thị dữ liệu
function displayTable(data, page) {
    const tableBody = document.getElementById('dataBody');
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.equipment}</td>
            <td>${row.activity}</td>
            <td>${row.time.replace('T', ' ')}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Thiết lập phân trang
function setupPagination(data) {
    const pagination = document.getElementById('pageNumbers');
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const maxPageButtons = 5;

    pagination.innerHTML = '';
    
    const createPageButton = (pageNum, isEllipsis = false) => {
        const button = document.createElement('button');
        button.innerText = isEllipsis ? '...' : pageNum;
        button.disabled = isEllipsis;
        button.onclick = () => {
            if (!isEllipsis) {
                currentPage = pageNum;
                displayTable(data, currentPage);
                setupPagination(data);
            }
        };
        pagination.appendChild(button);
    };

    if (totalPages <= maxPageButtons) {
        for (let i = 1; i <= totalPages; i++) {
            createPageButton(i);
        }
    } else {
        if (currentPage <= Math.floor(maxPageButtons / 2)) {
            for (let i = 1; i <= maxPageButtons - 1; i++) {
                createPageButton(i);
            }
            createPageButton(totalPages, true);
        } else if (currentPage > totalPages - Math.floor(maxPageButtons / 2)) {
            createPageButton(1, true);
            for (let i = totalPages - (maxPageButtons - 2); i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            createPageButton(1, true);
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                createPageButton(i);
            }
            createPageButton(totalPages, true);
        }
    }
    updatePagination();
}

// Cập nhật trang hiện tại
function updatePagination() {
    const buttons = document.querySelectorAll('#pageNumbers button');
    buttons.forEach(button => {
        button.classList.toggle('active', parseInt(button.innerText) === currentPage);
    });

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === Math.ceil(filteredData.length / rowsPerPage);
}

// Chuyển đến trang trước
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable(filteredData, currentPage);
        setupPagination(filteredData);
    }
}

// Chuyển đến trang sau
function goToNextPage() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTable(filteredData, currentPage);
        setupPagination(filteredData);
    }
}

// Khởi tạo lại bảng sau khi được tải lại
document.addEventListener('DOMContentLoaded', () => {
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);

    document.getElementById('prevBtn').addEventListener('click', goToPreviousPage);
    document.getElementById('nextBtn').addEventListener('click', goToNextPage);
});

// Hàm tìm kiếm theo ngày
function searchByDate(startDate, endDate) {
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    startTime.setHours(0, 0, 0, 0);
    endTime.setHours(23, 59, 59, 999);

    return originalData.filter(row => {
        const rowDate = new Date(row.time);
        return rowDate >= startTime && rowDate <= endTime;
    });
}

// Hàm tìm kiếm theo tên thiết bị
function searchByEquipment(equipment) {
    return originalData.filter(row => row.equipment === equipment);
}



// Hàm tìm kiếm theo ngày và tên thiết bị
function searchByDateAndEquipment(startDate, endDate, equipment) {
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    startTime.setHours(0, 0, 0, 0);
    endTime.setHours(23, 59, 59, 999);

    return originalData.filter(row => {
        const rowDate = new Date(row.time);
        return rowDate >= startTime && rowDate <= endTime && row.equipment === equipment;
    });
}

// Xử lý sự kiện tìm kiếm
document.getElementById('search-filterBtn').addEventListener('click', function() {
    const startDate = document.getElementById('startTime').value;
    const endDate = document.getElementById('endTime').value;
    const equipOption = document.getElementById('equipOptions').value;

    if (startDate && endDate && equipOption !== 'macdinh') {
        // Nếu có cả startDate và endDate, và chọn thiết bị
        filteredData = searchByDateAndEquipment(startDate, endDate, equipOption);
    } else if (startDate && endDate) {
        // Nếu có cả startDate và endDate, nhưng không chọn thiết bị
        filteredData = searchByDate(startDate, endDate);
    } else if (!startDate || !endDate) {
        // Nếu không có startDate hoặc endDate
        alert('Hãy chọn đầy đủ ngày bắt đầu và kết thúc');
        return;
    } else if (equipOption !== 'macdinh') {
        // Nếu có chọn thiết bị nhưng không có startDate và endDate
        filteredData = searchByEquipment(equipOption);
    }

    // Hiển thị bảng và thiết lập phân trang với dữ liệu đã lọc
    currentPage = 1;
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);
});

