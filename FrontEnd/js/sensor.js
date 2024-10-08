// Biến lưu trữ queryParams hiện tại
let currentQueryParams = {};
// Lấy phần tử dropdown page size
const pageSizeDropdown = document.getElementById('pageSize');

// Hàm để lấy dữ liệu cảm biến từ máy chủ với các tham số tìm kiếm và phân trang
async function fetchSensorData(page = 1, limit = parseInt(pageSizeDropdown.value), queryParams = currentQueryParams) {
    try {
        // Lưu trang hiện tại và giới hạn phân trang vào biến global để sử dụng lại khi cần thiết
        currentPage = page;
        currentLimit = limit;

        let queryString = `?page=${page}&limit=${limit}`;

        if (queryParams.temperature) {
            queryString += `&temperature=${queryParams.temperature}`;
        }
        if (queryParams.humidity) {
            queryString += `&humidity=${queryParams.humidity}`;
        }
        if (queryParams.light) {
            queryString += `&light=${queryParams.light}`;
        }

        const response = await fetch(`http://localhost:3000/api/sensors${queryString}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật bảng dữ liệu với dữ liệu nhận được
        updateDataTable(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

// Gọi hàm để lấy dữ liệu từ database khi khởi động trang
fetchSensorData();

// Hàm để định dạng timestamp thành chuỗi giờ phút giây
function formatTime(time) {
    const date = new Date(time);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Sử dụng định dạng 24 giờ
    };
    return date.toLocaleString('vi-VN', options);
}

// Hàm để cập nhật bảng dữ liệu
function updateDataTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Kiểm tra nếu không có dữ liệu trả về
    if (data.data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center;">Không tìm thấy dữ liệu</td>
        `;
        tableBody.appendChild(row);

        // Ẩn các phần tử phân trang khi không có dữ liệu
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
        <td>${formatTime(sensor.time)}</td>
    `;
        tableBody.appendChild(row);
    });

    // Cập nhật thông tin phân trang
    updatePagination(data);
}

// Hàm để cập nhật phân trang
function updatePagination(data) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    // Thêm nút "Trước"
    const prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = data.page === 1; // Vô hiệu hóa nút "Trước" nếu đang ở trang đầu
    prevBtn.onclick = () => fetchSensorData(data.page - 1, currentLimit, currentQueryParams); // Chuyển tới trang trước

    // Thêm nút "Sau"
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = data.page === data.totalPages; // Vô hiệu hóa nút "Sau" nếu đang ở trang cuối
    nextBtn.onclick = () => fetchSensorData(data.page + 1, currentLimit, currentQueryParams); // Chuyển tới trang sau

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
    const searchValue = document.getElementById('searchInput').value;
    const selectOption = document.getElementById('selectOptions').value;

    // Tạo các tham số tìm kiếm
    currentQueryParams = {};

    if (selectOption === 'temperature') {
        currentQueryParams.temperature = searchValue;
    } else if (selectOption === 'humidity') {
        currentQueryParams.humidity = searchValue;
    } else if (selectOption === 'light') {
        currentQueryParams.light = searchValue;
    }

    fetchSensorData(1, currentLimit, currentQueryParams);
});

// Thêm sự kiện lắng nghe cho dropdown page size
pageSizeDropdown.addEventListener('change', () => {
    // Lấy giá trị mới từ dropdown
    const newPageSize = parseInt(pageSizeDropdown.value);
    // Gọi lại hàm fetchSensorData với trang đầu tiên và số lượng mới
    fetchSensorData(1, newPageSize, currentQueryParams);
});
