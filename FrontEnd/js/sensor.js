// Biến lưu trữ queryParams hiện tại
let currentQueryParams = {};
let sortField = ''; // Trường sắp xếp
let sortOrder = 'asc'; // Thứ tự sắp xếp

const pageSizeDropdown = document.getElementById('pageSize');

// Hàm để sắp xếp dữ liệu
function sortData(field, order) {
    sortField = field;
    sortOrder = order;
    fetchSensorData(1, currentLimit, currentQueryParams);
}

// Hàm để lấy dữ liệu cảm biến từ máy chủ với các tham số tìm kiếm và phân trang
async function fetchSensorData(page = 1, limit = parseInt(pageSizeDropdown.value), queryParams = currentQueryParams) {
    try {
        currentPage = page;
        currentLimit = limit;

        let queryString = `?page=${page}&limit=${limit}`;

        // Thêm các tham số tìm kiếm
        if (queryParams.temperature) {
            queryString += `&temperature=${queryParams.temperature}`;
        }
        if (queryParams.humidity) {
            queryString += `&humidity=${queryParams.humidity}`;
        }
        if (queryParams.light) {
            queryString += `&light=${queryParams.light}`;
        }
        if (queryParams.time) {
            queryString += `&time=${queryParams.time}`;
        }

        // Thêm các tham số sắp xếp
        if (sortField) {
            queryString += `&sortField=${sortField}&sortOrder=${sortOrder}`;
        }

        const response = await fetch(`http://localhost:3000/api/sensors${queryString}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật bảng dữ liệu với dữ liệu nhận được
        renderDataTable(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

fetchSensorData();

function formatTime(time) {
    const date = new Date(time);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('vi-VN', options);
}

// Hàm để cập nhật bảng dữ liệu
function renderDataTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (data.data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center;">Không tìm thấy dữ liệu</td>
        `;
        tableBody.appendChild(row);

        document.getElementById('pagination').style.display = 'none';
        return;
    } else {
        document.getElementById('pagination').style.display = 'flex';
    }

    // Thêm dữ liệu vào bảng
    data.data.forEach((sensor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${(data.page - 1) * data.limit + index + 1}</td>
        <td>${sensor.temperature}</td>
        <td>${sensor.humidity}</td>
        <td>${sensor.light}</td>
        <td>${sensor.windSpeed}</td>
        <td>${formatTime(sensor.time)}</td>
    `;
        tableBody.appendChild(row);
    });

    renderPagination(data);
}

// Hàm để cập nhật phân trang
function renderPagination(data) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    // Thêm nút "Trước"
    const prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = data.page === 1; // Vô hiệu hóa nút "Trước" nếu đang ở trang đầu
    prevBtn.onclick = () => fetchSensorData(data.page - 1, currentLimit, currentQueryParams);

    // Thêm nút "Sau"
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = data.page === data.totalPages; // Vô hiệu hóa nút "Sau" nếu đang ở trang cuối
    nextBtn.onclick = () => fetchSensorData(data.page + 1, currentLimit, currentQueryParams);

    const totalPages = data.totalPages;

    // Luôn hiển thị trang đầu (1) và trang cuối (totalPages)
    const firstButton = document.createElement('button');
    firstButton.textContent = 1;
    firstButton.className = data.page === 1 ? 'active' : ''; // Đánh dấu nút trang đầu nếu đang ở trang 1
    firstButton.addEventListener('click', () => fetchSensorData(1, currentLimit, currentQueryParams));
    pageNumbersContainer.appendChild(firstButton);

    // Xác định các trang cần hiển thị
    let startPage, endPage;

    if (totalPages <= 5) {
        startPage = 2;
        endPage = totalPages - 1;
    } else {
        startPage = Math.max(2, data.page - 1);
        endPage = Math.min(totalPages - 1, data.page + 1);

        if (data.page < 3) {
            endPage = 4;
        } else if (data.page > totalPages - 2) {
            startPage = totalPages - 3;
        }

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i >= 2 && i <= totalPages - 1) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === data.page ? 'active' : '';
            button.addEventListener('click', () => fetchSensorData(i, currentLimit, currentQueryParams));
            pageNumbersContainer.appendChild(button);
        }
    }

    if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        pageNumbersContainer.appendChild(ellipsis);
    }

    if (totalPages > 1) {
        const lastButton = document.createElement('button');
        lastButton.textContent = totalPages;
        lastButton.className = data.page === totalPages ? 'active' : '';
        lastButton.addEventListener('click', () => fetchSensorData(totalPages, currentLimit, currentQueryParams));
        pageNumbersContainer.appendChild(lastButton);
    }
}

// Xử lí tìm kiếm theo temperature, humidity, light
const searchFilterBtn = document.getElementById('search-filterBtn');

searchFilterBtn.addEventListener('click', () => {
    const searchValue = document.getElementById('searchInput').value.trim();
    const selectOption = document.getElementById('selectOptions').value;

    // Tạo các tham số tìm kiếm
    currentQueryParams = {};

    if (selectOption === 'macdinh') {
        sortField = '';
        sortOrder = 'asc';
    }
    else if (selectOption === 'temperature') {
        currentQueryParams.temperature = searchValue;
    }
    else if (selectOption === 'humidity') {
        currentQueryParams.humidity = searchValue;
    }
    else if (selectOption === 'light') {
        currentQueryParams.light = searchValue;
    }
    else if (selectOption === 'time') {
        const parts = searchValue.split(' '); // Tách thời gian và ngày
        if (parts.length === 1) {
            currentQueryParams.time = searchValue;
        }
        else if (parts.length === 2) {
            let Time = "";
            let Date = "";
            for (let i = 0; i < parts[0].length; i++) {
                if (parts[0][i] === ':') {
                    Time = parts[0];
                    Date = parts[1];
                    break;
                }
                else if (parts[0][i] === '/') {
                    Time = parts[1];
                    Date = parts[0];
                    break;
                }
                else continue;
            }

            currentQueryParams.time = Time + " " + Date;

            // Kiểm tra định dạng activity_time
            if (!isValidActivityTime(currentQueryParams.time)) {
                alert('Định dạng không hợp lệ. Vui lòng nhập lại!!!');
                return; // Dừng thực thi nếu định dạng không hợp lệ
            }
        }
    }

    fetchSensorData(1, currentLimit, currentQueryParams);
});

// Hàm kiểm tra định dạng activity_time
function isValidActivityTime(time) {
    const timeRegex = /^(?:(?:[01]\d|2[0-3]):[0-5]\d(?:\:[0-5]\d)?\s(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}|(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4})$/;

    return timeRegex.test(time);
}

// Thêm sự kiện lắng nghe cho dropdown page size
pageSizeDropdown.addEventListener('change', () => {
    const newPageSize = parseInt(pageSizeDropdown.value);
    fetchSensorData(1, newPageSize, currentQueryParams);
});
