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
            time: randomDate.toISOString().slice(0, 19).replace('T', ' ') // Định dạng datetime-local
        });
    }
    return data;
}

const originalData = generateData(103);
let filteredData = originalData.slice(); // Clone dữ liệu gốc
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
            <td>${row.time}</td>
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

    // Luôn hiển thị trang đầu tiên
    createPageButton(1);

    if (totalPages <= maxPageButtons + 1) {
        // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng 6
        for (let i = 2; i <= totalPages - 1; i++) {
            createPageButton(i);
        }
    } else {
        if (currentPage <= 3) {
            // Nếu đang ở trang 1, 2, hoặc 3 thì hiển thị trang 2, 3, 4 mà không cần dấu chấm
            for (let i = 2; i <= 4; i++) {
                createPageButton(i);
            }
            if (4 < totalPages - 1) {
                createPageButton('...', true);
            }
        } else if (currentPage > 3 && currentPage <= totalPages - 3) {
            // Hiển thị dấu chấm nếu có khoảng cách giữa trang 1 và các trang hiện tại
            createPageButton('...', true);
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                createPageButton(i);
            }
            if (currentPage + 1 < totalPages - 1) {
                createPageButton('...', true);
            }
        } else {
            // Nếu đang ở những trang cuối cùng, hiển thị các trang gần cuối
            createPageButton('...', true);
            for (let i = totalPages - 3; i <= totalPages - 1; i++) {
                createPageButton(i);
            }
        }
    }

    // Luôn hiển thị trang cuối cùng
    if (totalPages > 1) {
        createPageButton(totalPages);
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
function searchDate(date1, date2) {
    const startTime = new Date(date1);
    const endTime = new Date(date2);

    // Xóa giờ phút giây
    startTime.setHours(0, 0, 0, 0);
    endTime.setHours(23, 59, 59, 999);

    // Lọc dữ liệu theo ngày
    filteredData = originalData.filter(row => {
        const rowDate = new Date(row.time); 
        rowDate.setHours(0, 0, 0, 0);

        return rowDate >= startTime && rowDate <= endTime;
    });

    currentPage = 1;
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);
}


function filterDeviceName(data, key, deviceName) {
    return data.filter(item => item[key].toLowerCase() === deviceName.toLowerCase());
}

function handleFilter(value) {
    let key, deviceName;

    switch (value) {
        case 'quat':
            key = 'equipment';
            deviceName = 'Quạt'; // Thay 'TênThiếtBị1' bằng tên thiết bị cụ thể
            break;
        case 'dieuhoa':
            key = 'equipment';
            deviceName = 'Điều hòa'; // Thay 'TênThiếtBị2' bằng tên thiết bị cụ thể
            break;
        case 'den':
            key = 'equipment';
            deviceName = 'Đèn'; // Thay 'TênThiếtBị3' bằng tên thiết bị cụ thể
            break;
        case 'macdinh':
            filteredData = originalData.slice(); // Khôi phục dữ liệu gốc
            currentPage = 1;
            displayTable(filteredData, currentPage);
            setupPagination(filteredData);
            return; // Thoát khỏi hàm sau khi khôi phục dữ liệu gốc
        default:
            return;
    }

    filteredData = filterDeviceName(filteredData, key, deviceName);
    currentPage = 1;
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);
}

// Xử lý sự kiện tìm kiếm
document.getElementById('search-filterBtn').addEventListener('click', function() {
    const startDate = document.getElementById('startTime').value;
    const endDate = document.getElementById('endTime').value;
    const equipOption = document.getElementById('equipOptions').value;

    // Kiểm tra nếu cả ngày bắt đầu và ngày kết thúc đều trống
    if (!startDate && !endDate) {
        // Khôi phục dữ liệu gốc
        filteredData = originalData.slice();
        currentPage = 1;
        displayTable(filteredData, currentPage);
        setupPagination(filteredData);
        if (equipOption) {
            handleFilter(equipOption);
        }
    }
    // Nếu chỉ có tùy chọn thiết bị mà không có ngày tìm kiếm
    else if (!startDate && !endDate && equipOption) {
        handleFilter(equipOption);
    } 
    // Nếu chỉ có ngày tìm kiếm
    else if (startDate && endDate && !equipOption) {
        searchDate(startDate, endDate);
    } 
    // Nếu có cả ngày tìm kiếm và tùy chọn sắp xếp
    else if (startDate && endDate && equipOption) {
        if(equipOption !== 'macdinh'){
            searchDate(startDate, endDate);
            handleFilter(equipOption);
        } else {
            searchDate(startDate, endDate);
        }
    }
    else if (!startDate || !endDate){
        alert('Hãy chọn đầy đủ ngày bắt đầu và kết thúc');
    }
});


