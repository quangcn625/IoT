// Biểu đồ 1
const labels = [];
const data = {
    labels: labels,
    datasets: [
        {
            label: 'Nhiệt độ (°C)',
            data: [],
            borderColor: 'red',
            yAxisID: 'trucY_temp',
            fill: false,
            tension: 0.2
        },
        {
            label: 'Độ ẩm (%)',
            data: [],
            borderColor: 'green',
            yAxisID: 'trucY_humidity',
            fill: false,
            tension: 0.2
        },
        {
            label: 'Cường độ sáng (lux)',
            data: [],
            borderColor: 'blue',
            yAxisID: 'trucY_light',
            fill: false,
            tension: 0.2
        }
    ]
};

// Cấu hình biểu đồ 1
const config = {
    type: 'line',
    data: data,
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 10
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian',
                    align: 'start'
                }
            },
            'trucY_temp': {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)'
                }
            },
            'trucY_humidity': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Độ ẩm (%)'
                },
                grid: {
                    drawOnChartArea: false
                }
            },
            'trucY_light': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Cường độ sáng (lux)'
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    }
};

// Tạo biểu đồ 1
const lineChart = new Chart(document.getElementById('lineChart'), config);

// Kết nối WebSocket
const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', function () {
    console.log('WebSocket connection established');
});

socket.addEventListener('close', function () {
    console.log('WebSocket connection closed');
});

socket.addEventListener('error', function (error) {
    console.error('WebSocket error:', error);
});


// Cac bien nhan du lieu sensor
let currentTemperature = '--';
let currentHumidity = '--';
let currentLight = '--';
let currentTime = null;

// Lấy mỗi giờ, phút giây
function getTimeString(dateTimeString) {
    const dateObj = new Date(dateTimeString);
    dateObj.setHours(dateObj.getHours() + 7);

    // Định dạng thời gian thành 'HH:MM:SS'
    const vietnamTime = dateObj.toISOString().slice(11, 19); // Lấy phần giờ, phút, giây
    return vietnamTime;
}

// Hàm cập nhật hiển thị
function updateDisplay() {

    const tempDiv = document.getElementById('info-temp');
    const tempElement = document.getElementById('temperature');
    const tempIcon = getTempIcon(currentTemperature !== '--' ? currentTemperature : null);
    tempElement.innerHTML = currentTemperature;
    tempDiv.innerHTML = `${tempElement.outerHTML}${tempIcon ? `<img src="${tempIcon}" alt="Temperature Icon" style="width: 20px; height: 30px; margin-left: 10px;">` : ''}`;

    const humidDiv = document.getElementById('info-humid');
    const humidityElement = document.getElementById('humidity');
    const humidityIcon = getHumidityIcon(currentHumidity !== '--' ? currentHumidity : null);
    humidityElement.innerHTML = currentHumidity;
    humidDiv.innerHTML = `${humidityElement.outerHTML}${humidityIcon ? `<img src="${humidityIcon}" alt="Humidity Icon" style="width: 20px; height: 30px; margin-left: 10px;">` : ''}`;

    const lightDiv = document.getElementById('info-light');
    const lightElement = document.getElementById('light');
    const lightIcon = getLightIcon(currentLight !== '--' ? currentLight : null);
    lightElement.innerHTML = currentLight;
    lightDiv.innerHTML = `${lightElement.outerHTML}${lightIcon ? `<img src="${lightIcon}" alt="Light Icon" style="width: 20px; height: 30px; margin-left: 10px;">` : ''}`;

}

// Hàm lấy icon của nhiệt độ
function getTempIcon(temp) {
    if (temp === null) return null;
    if (temp < 20) {
        return 'images/cold.jpg';
    } else if (temp >= 20 && temp < 30) {
        return 'images/normal.jpg';
    }
    return 'images/hot.jpg';
}

// Hàm lấy icon của độ ẩm
function getHumidityIcon(humidity) {
    if (humidity === null) return null;
    if (humidity < 30) {
        return 'images/low-humidity.jpg';
    } else if (humidity >= 30 && humidity <= 60) {
        return 'images/medium-humidity.jpg';
    }
    return 'images/high-humidity.jpg';
}

// Hàm lấy icon của cường độ ánh sáng
function getLightIcon(light) {
    if (light === null) return null;
    if (light < 100) {
        return 'images/low-light.jpg';
    } else if (light >= 100 && light <= 500) {
        return 'images/medium-light.jpg';
    }
    return 'images/high-light.jpg';
}

// Quạt
const fanToggleBtn = document.getElementById('fanToggleBtn');
const fan = document.getElementById('fan');

const loadingFanState = document.createElement('div');
loadingFanState.classList.add('loadingFan');

// Biến kiểm soát trạng thái quạt và trạng thái chờ
let isFanOn = false;
let isWaitingForFan = false;

// Khôi phục trạng thái quạt khi tải lại trang
function restoreFanStatus() {
    const savedFanStatus = localStorage.getItem('Quat');
    if (savedFanStatus !== null) {
        isFanOn = JSON.parse(savedFanStatus);
    }
    updateFanStatus(isFanOn);
};

// Hàm cập nhật trạng thái quạt
function updateFanStatus(state) {
    isFanOn = state;
    if (state) {
        fan.classList.add('spinning');
        fanToggleBtn.textContent = 'Off';
        fanToggleBtn.classList.add('off');
    } else {
        fan.classList.remove('spinning');
        fanToggleBtn.textContent = 'On';
        fanToggleBtn.classList.remove('off');
    }
    localStorage.setItem('Quat', JSON.stringify(isFanOn));
}

// Hàm hiển thị loading spinner
function showFanLoadingSpinner() {
    fanToggleBtn.textContent = '';
    loadingFanState.style.display = 'block';
    fanToggleBtn.style.pointerEvents = 'none';
}

// Hàm ẩn loading spinner
function hideFanLoadingSpinner() {
    loadingFanState.style.display = 'none';
    fanToggleBtn.style.pointerEvents = 'auto';
}

// Giả lập quá trình phản hồi sau 2 giây
function sendFanStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showFanLoadingSpinner();
        isWaitingForFan = true;

        // Gửi trạng thái quạt
        socket.send(JSON.stringify({ action: 'toggleFan', state }));
        console.log("Đã gửi trạng thái quạt:", state);

    }
    else {
        alert('Không thể điều khiển được quạt khi kết nối bị gián đoạn hoặc không có kết nối!');
    }
}

// Sự kiện click của button
fanToggleBtn.addEventListener('click', () => {
    if (isWaitingForFan) {
        console.warn('Đang chờ phản hồi. Vui lòng đợi...');
        return;
    }
    const newFanState = !isFanOn;
    sendFanStatus(newFanState);
    fanToggleBtn.appendChild(loadingFanState);
});


// Điều hòa
const acToggleBtn = document.getElementById('acToggleBtn');
const wind = document.getElementById('wind');

const loadingACState = document.createElement('div');
loadingACState.classList.add('loadingAC');


let isACOn = false; // Trạng thái cục bộ của điều hòa
let isWaitingForAc = false; // Biến kiểm soát khi đang chờ phản hồi từ server

// Khôi phục trạng thái đèn từ localStorage
function restoreACStatus() {
    const savedACStatus = localStorage.getItem('DieuHoa');
    if (savedACStatus !== null) {
        isACOn = JSON.parse(savedACStatus); // Chuyển đổi chuỗi thành boolean
    }
    updateACStatus(isACOn);
}

function updateACStatus(state) {
    isACOn = state; // cập nhập trạng thái cục bộ
    if (state) {
        wind.classList.add('active');
        wind.style.opacity = '1';
        acToggleBtn.textContent = 'Off';
        acToggleBtn.classList.add('off');
    }
    else {
        wind.classList.remove('active');
        wind.style.opacity = '0';
        acToggleBtn.textContent = 'On';
        acToggleBtn.classList.remove('off');
    }
    // Lưu trạng thái đèn vào localStorage
    localStorage.setItem('DieuHoa', JSON.stringify(isACOn));
}

function showAcLoadingSpinner() {
    acToggleBtn.textContent = '';
    loadingACState.style.display = 'block';
    acToggleBtn.style.pointerEvents = 'none';
}

function hideAcLoadingSpinner() {
    loadingACState.style.display = 'none';
    acToggleBtn.style.pointerEvents = 'auto';
}

function sendACStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showAcLoadingSpinner();
        isWaitingForAc = true;

        // Gửi trạng thái qua WebSocket
        socket.send(JSON.stringify({ action: 'toggleAC', state }));
        console.log("Đã gửi trạng thái điều hòa: ", state);

    }
    else {
        alert('Không thể điều khiển được điều hòa khi kết nối bị gián đoạn hoặc không có kết nối!');
    }
}

// Sự kiện click của button
acToggleBtn.addEventListener('click', () => {
    if (isWaitingForAc) {
        console.warn('Đang chờ phản hồi từ server. Vui lòng đợi...');
        return;
    }
    const newACState = !isACOn;
    sendACStatus(newACState);
    acToggleBtn.appendChild(loadingACState);
});


// Đèn
const lightToggleBtn = document.getElementById('lightToggleBtn');
const den = document.getElementById('den');

const loadingLightState = document.createElement('div');
loadingLightState.classList.add('loadingLight');

let isLightOn = false; // Trạng thái cục bộ của đèn
let isWaitingForLight = false; // Biến kiểm soát khi đang chờ phản hồi từ server

// Khôi phục trạng thái đèn từ localStorage
function restoreLightStatus() {
    const savedLightStatus = localStorage.getItem('Den');
    if (savedLightStatus !== null) {
        isLightOn = JSON.parse(savedLightStatus);
    }
    updateLightStatus(isLightOn);
}

function updateLightStatus(state) {
    isLightOn = state; // Cập nhật trạng thái cục bộ
    if (state) {
        den.classList.add('glowing');
        lightToggleBtn.textContent = 'Off';
        lightToggleBtn.classList.remove('on');
        lightToggleBtn.classList.add('off');
    }
    else {
        den.classList.remove('glowing');
        lightToggleBtn.textContent = 'On';
        lightToggleBtn.classList.remove('off');
        lightToggleBtn.classList.add('on');
    }
    localStorage.setItem('Den', JSON.stringify(isLightOn));
}

function showLightLoadingSpinner() {
    lightToggleBtn.textContent = '';
    loadingLightState.style.display = 'block';
    lightToggleBtn.style.pointerEvents = 'none';
}

function hideLightLoadingSpinner() {
    loadingLightState.style.display = 'none';
    lightToggleBtn.style.pointerEvents = 'auto';
}

function sendLightStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showLightLoadingSpinner();
        isWaitingForLight = true;

        // Gửi trạng thái qua WebSocket
        socket.send(JSON.stringify({ action: 'toggleLight', state }));
        console.log("Đã gửi trạng thái đèn: ", state);

    }
    else {
        alert('Không thể điều khiển được đèn khi kết nối bị gián đoạn hoặc không có kết nối!');
    }
}

// Xử lý sự kiện nhấn nút
lightToggleBtn.addEventListener('click', () => {
    if (isWaitingForLight) {
        console.warn('Đang chờ phản hồi từ server. Vui lòng đợi...');
        return;
    }
    const newLightState = !isLightOn;
    sendLightStatus(newLightState);
    lightToggleBtn.appendChild(loadingLightState);
});

// Nhấp nháy đèn
const denCB = document.getElementById('denCB');

// Nhận phản hồi từ backend
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.topic === 'esp/dht/sensor') {
        fetchDataSensor();
    }

    else if (message.topic === 'esp/led/status') {
        const name = message.state.name;
        if (name === 'Quat') {
            isFanOn = message.state.led1;
            //console.log("ESP phản hồi trạng thái của quạt là: ", isFanOn);
            updateFanStatus(isFanOn);
            isWaitingForFan = false;
            hideFanLoadingSpinner();
        }
        else if (name === 'DieuHoa') {
            isACOn = message.state.led2;
            //console.log("ESP phản hồi trạng thái của điều hòa là: ", isACOn);
            updateACStatus(isACOn);
            isWaitingForAc = false;
            hideAcLoadingSpinner();
        }
        else if (name === 'Den') {
            isLightOn = message.state.led3;
            //console.log("ESP phản hồi trạng thái của đèn là: ", isLightOn);
            updateLightStatus(isLightOn);
            isWaitingForLight = false;
            hideLightLoadingSpinner();
        }
    }

});


// Lay du lieu tu sensor1
async function fetchDataSensor() {
    try {
        const response = await fetch(`http://localhost:3000/api/home`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật các giá trị hiện tại
        if (data.data[0].temperature !== null) currentTemperature = data.data[0].temperature;
        if (data.data[0].humidity !== null) currentHumidity = data.data[0].humidity;
        if (data.data[0].light !== null) currentLight = data.data[0].light;

        // Hiển thị dữ liệu hiện tại
        updateDisplay();

        // Xóa dữ liệu cũ trên biểu đồ
        lineChart.data.labels = [];
        lineChart.data.datasets.forEach(dataset => dataset.data = []);

        // Sắp xếp dữ liệu theo ID từ be đến lớn
        data.data.sort((a, b) => a.id - b.id);

        // Cập nhật biểu đồ với dữ liệu mới từ API
        data.data.forEach((entry) => {
            const timeString = getTimeString(entry.time);

            lineChart.data.labels.push(timeString);
            lineChart.data.datasets[0].data.push(entry.temperature);
            lineChart.data.datasets[1].data.push(entry.humidity);
            lineChart.data.datasets[2].data.push(entry.light);
        });


        // Cập nhật biểu đồ hiển thị
        lineChart.update();
        // lineChart1.update();

    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}



fetchDataSensor();

// Khôi phục trạng thái quạt, điều hòa, đèn khi trang được tải
restoreFanStatus();
restoreACStatus();
restoreLightStatus();
