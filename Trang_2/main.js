// Sinh dữ liệu ngẫu nhiên
function generateData(numEntries) {
    const data = [];
    for (let i = 1; i <= numEntries; i++) {
        const randomHour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const randomDate = new Date();
        randomDate.setHours(randomHour, randomMinute, randomSecond, 0);

        data.push({
            id: i,
            temp: `${Math.floor(Math.random() * 10) + 20}°C`,
            humidity: `${Math.floor(Math.random() * 50) + 50}%`,
            light: `${Math.floor(Math.random() * 500) + 100} lux`,
            time: randomDate.toISOString().slice(0, 19) // Định dạng datetime-local
        });
    }
    return data;
}

const originalData = generateData(102); // Sinh 100 bản ghi dữ liệu
const rowsPerPage = 10;
let currentPage = 1;
let filteredData = originalData; // Khởi tạo filteredData với dữ liệu gốc

// Hiển thị bảng dữ liệu
function displayTable(data, page) {
    const tableBody = document.getElementById('tableBody');
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.temp}</td>
            <td>${row.humidity}</td>
            <td>${row.light}</td>
            <td>${row.time.replace('T', ' ')}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Thiết lập phân trang
function setupPagination(data) {
    const pagination = document.getElementById('pageNumbers');
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const maxPageButtons = 5; // Số lượng nút trang hiển thị tối đa

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

// Cập nhật nút phân trang
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

// Chuyển đến trang tiếp theo
function goToNextPage() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTable(filteredData, currentPage);
        setupPagination(filteredData);
    }
}

// Khởi tạo bảng và phân trang khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);

    document.getElementById('prevBtn').addEventListener('click', goToPreviousPage);
    document.getElementById('nextBtn').addEventListener('click', goToNextPage);
});


// Hàm tìm dữ liệu ngày tháng
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

// Hàm sắp xếp
function sortData(data, key, ascending = true) {
    return data.slice().sort((a, b) => {
        const valueA = parseFloat(a[key].replace(/[^\d.-]/g, '')); // xóa các kí tự không liên quan
        const valueB = parseFloat(b[key].replace(/[^\d.-]/g, ''));

        if (valueA === valueB) return 0;

        return (ascending ? valueA - valueB : valueB - valueA);
    });
}

function handleSort(value) {
    let key, ascending;

    switch (value) {
        case 'tempAsc':
            key = 'temp';
            ascending = true;
            break;
        case 'tempDesc':
            key = 'temp';
            ascending = false;
            break;
        case 'humidityAsc':
            key = 'humidity';
            ascending = true;
            break;
        case 'humidityDesc':
            key = 'humidity';
            ascending = false;
            break;
        case 'lightAsc':
            key = 'light';
            ascending = true;
            break;
        case 'lightDesc':
            key = 'light';
            ascending = false;
            break;
        case 'macdinh':
            filteredData = originalData.slice(); // Khôi phục dữ liệu gốc
            currentPage = 1;
            displayTable(filteredData, currentPage);
            setupPagination(filteredData);
        default:
            return;
    }

    filteredData = sortData(filteredData, key, ascending);
    currentPage = 1;
    displayTable(filteredData, currentPage);
    setupPagination(filteredData);
}



// Xử lí sự kiện tìm và sắp xếp
document.getElementById('search-filterBtn').addEventListener('click', function() {
    const startDate = document.getElementById('startTime').value;
    const endDate = document.getElementById('endTime').value;
    const sortOption = document.getElementById('sortOptions').value;

    // Kiểm tra nếu cả ngày bắt đầu và ngày kết thúc đều trống
    if (!startDate && !endDate) {
        // Khôi phục dữ liệu gốc
        filteredData = originalData.slice();
        currentPage = 1;
        displayTable(filteredData, currentPage);
        setupPagination(filteredData);
        if (sortOption) {
            handleSort(sortOption);
        }
    } 
    // Nếu chỉ có tùy chọn sắp xếp mà không có ngày tìm kiếm
    else if (!startDate && !endDate && sortOption) {
        handleSort(sortOption);
    } 
    // Nếu chỉ có ngày tìm kiếm
    else if (startDate && endDate && !sortOption) {
        searchDate(startDate, endDate);
    } 
    // Nếu có cả ngày tìm kiếm và tùy chọn sắp xếp
    else if (startDate && endDate && sortOption) {
        if(sortOption !== 'macdinh'){
            searchDate(startDate, endDate);
            handleSort(sortOption);
        } else {
            searchDate(startDate, endDate);
        }
    }
    else if (!startDate || !endDate){
        alert('Hãy chọn đầy đủ ngày bắt đầu và kết thúc');
    }
});

