// Dữ liệu ban đầu
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

// Cấu hình biểu đồ
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

// Tạo biểu đồ
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

// Hàm lưu trữ dữ liệu vào localStorage
function savedSensor() {
    const data = {
        temperature: currentTemperature,
        humidity: currentHumidity,
        light: currentLight,
        labels: lineChart.data.labels,
        temperatureData: lineChart.data.datasets[0].data,
        humidityData: lineChart.data.datasets[1].data,
        lightData: lineChart.data.datasets[2].data,
    };
    localStorage.setItem('sensorData', JSON.stringify(data));
}

// Hàm lấy dữ liệu từ localStorage
function restoredSensor() {
    const data = localStorage.getItem('sensorData');
    if (data) {
        const parsedData = JSON.parse(data);
        currentTemperature = parsedData.temperature;
        currentHumidity = parsedData.humidity;
        currentLight = parsedData.light;
        
        // Cập nhật dữ liệu vào biểu đồ
        lineChart.data.labels = parsedData.labels;
        lineChart.data.datasets[0].data = parsedData.temperatureData;
        lineChart.data.datasets[1].data = parsedData.humidityData;
        lineChart.data.datasets[2].data = parsedData.lightData;
        
        // Cập nhật biểu đồ
        lineChart.update();
        
        // Cập nhật hiển thị dữ liệu hiện tại
        updateDisplay();
    }
}


let currentTemperature = '--';
let currentHumidity = '--';
let currentLight = '--';
let currentTime = null;

// Lấy mỗi giờ, phút giây
function getTimeString(dateTimeString) {
    const [date, time] = dateTimeString.split(" ");
    return time;
}

socket.addEventListener('message', function (event) {
    const newData = JSON.parse(event.data);

    if (newData.temperature !== undefined) {
        currentTemperature = newData.temperature;
    }
    if (newData.humidity !== undefined) {
        currentHumidity = newData.humidity;
    }
    if (newData.light !== undefined) {
        currentLight = newData.light;
    }

    // Hiển thị dữ liệu hiện tại
    updateDisplay();

    if (currentTemperature !== '--' && currentHumidity !== '--' && currentLight !== '--') {
        currentTime = newData.time;
        if (currentTime !== undefined) {
            lineChart.data.labels.push(getTimeString(currentTime));

            lineChart.data.datasets[0].data.push(currentTemperature);
            lineChart.data.datasets[1].data.push(currentHumidity);
            lineChart.data.datasets[2].data.push(currentLight);

            if (lineChart.data.labels.length > 10) {
                lineChart.data.labels.shift();
                lineChart.data.datasets.forEach((dataset) => {
                    dataset.data.shift();
                });
            }

            // Lưu trữ dữ liệu vào localStorage sau khi nhận dữ liệu mới
            savedSensor();

            lineChart.update();
        }
    }
});

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
const loadingFan = document.createElement('div');
loadingFan.classList.add('loading');
fanToggleBtn.appendChild(loadingFan);

let isFanOn = false; // Trạng thái quạt mặc định
let isWaitingForFan = false; // Biến kiểm soát khi đang chờ phản hồi từ server

// Khôi phục trạng thái đèn từ localStorage
function restoreFanStatus() {
    const savedFanStatus = localStorage.getItem('Quat');
    if (savedFanStatus !== null) {
        isFanOn = JSON.parse(savedFanStatus);
    }
    updateFanStatus(isFanOn);
}

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

function showFanLoadingSpinner() {
    fanToggleBtn.textContent = '';
    loadingFan.style.display = 'inline-block'; // Hiển thị loading
    fanToggleBtn.style.pointerEvents = 'none'; // Vô hiệu hóa click khi đang loading
    fanToggleBtn.classList.add('loading-state');
}

function hidenFanLoadingSpinner() {
    loadingFan.style.display = 'none'; // Ẩn loading
    fanToggleBtn.style.pointerEvents = 'auto'; // Khôi phục click
    fanToggleBtn.classList.remove('loading-state');
}


function sendFanStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showFanLoadingSpinner(); 
        isWaitingForFan = true;

        // Gửi trạng thái quạt
        socket.send(JSON.stringify({ action: 'toggleFan', state }));
        console.log("Đã gửi trạng thái quạt:", state);

        // Khi nhận phản hồi từ server, cập nhật giao diện và trạng thái đèn
        hidenFanLoadingSpinner();
        updateFanStatus(state); // Cập nhật giao diện đèn và lưu trạng thái
        isWaitingForFan = false; // Cho phép nhấn nút lại
    }
    else {
        alert('Không thể điều khiển được quạt khi kết nối bị gián đoạn hoặc không có kết nối!');
    }
}

fanToggleBtn.addEventListener('click', () => {
    if (isWaitingForFan) { // Kiểm tra nếu đang chờ phản hồi từ server
        console.warn('Đang chờ phản hồi từ server. Vui lòng đợi...');
        return;
    }
    const newFanState = !isFanOn;
    sendFanStatus(newFanState);
});


// Điều hòa
const acToggleBtn = document.getElementById('acToggleBtn');
const wind = document.getElementById('wind');
const loadingAc = document.createElement('div'); 
loadingAc.classList.add('loading');
acToggleBtn.appendChild(loadingAc);

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
    loadingAc.style.display = 'inline-block'; // Hiển thị loading
    acToggleBtn.style.pointerEvents = 'none'; // Vô hiệu hóa click khi đang loading
    acToggleBtn.classList.add('loading-state');
}

function hidenAcLoadingSpinner() {
    loadingAc.style.display = 'none'; // Ẩn loading
    acToggleBtn.style.pointerEvents = 'auto'; // Khôi phục click
    acToggleBtn.classList.remove('loading-state');
}

function sendACStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showAcLoadingSpinner(); 
        isWaitingForAc = true;

        // Gửi trạng thái qua WebSocket
        socket.send(JSON.stringify({ action: 'toggleAC', state }));
        console.log("Đã gửi trạng thái điều hòa: ", state);

        // Khi nhận phản hồi từ server, cập nhật giao diện và trạng thái đèn
        hidenAcLoadingSpinner();
        updateACStatus(state);
        isWaitingForAc = false;
    }
    else {
        alert('Không thể điều khiển được điều hòa khi kết nối bị gián đoạn hoặc không có kết nối!');
    }
}

acToggleBtn.addEventListener('click', () => {
    if (isWaitingForAc) { 
        console.warn('Đang chờ phản hồi từ server. Vui lòng đợi...');
        return;
    }
    const newACState = !isACOn; 
    sendACStatus(newACState);
});


// Đèn
const lightToggleBtn = document.getElementById('lightToggleBtn');
const den = document.getElementById('den');
const loadingLight = document.createElement('div'); 
loadingLight.classList.add('loading');
lightToggleBtn.appendChild(loadingLight);

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
    loadingLight.style.display = 'inline-block'; // Hiển thị loading
    lightToggleBtn.style.pointerEvents = 'none'; // Vô hiệu hóa click khi đang loading
    lightToggleBtn.classList.add('loading-state');
}

function hidenLightLoadingSpinner() {
    loadingLight.style.display = 'none'; // Ẩn loading
    lightToggleBtn.style.pointerEvents = 'auto'; // Khôi phục click
    lightToggleBtn.classList.remove('loading-state');
}

function sendLightStatus(state) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        showLightLoadingSpinner(); 
        isWaitingForLight = true;

        // Gửi trạng thái qua WebSocket
        socket.send(JSON.stringify({ action: 'toggleLight', state }));
        console.log("Đã gửi trạng thái đèn: ", state);

        // Khi nhận phản hồi từ server, cập nhật giao diện và trạng thái đèn
        hidenLightLoadingSpinner();
        updateLightStatus(state); // Cập nhật giao diện đèn và lưu trạng thái
        isWaitingForLight = false; // Cho phép nhấn nút lại
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
});


// Nhận phản hồi từ backend
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.topic === 'esp/led/status') {
        const name = message.state.name;
        if (name === 'Quat') {
            isFanOn = message.state.led1;
            console.log("ESP phản hồi trạng thái của quạt là: ", isFanOn);
            updateFanStatus(isFanOn);
            isWaitingForFan = false; 
            hidenFanLoadingSpinner();
        }
        else if (name === 'DieuHoa') {
            isACOn = message.state.led2;
            console.log("ESP phản hồi trạng thái của điều hòa là: ", isACOn);
            updateACStatus(isACOn);
            isWaitingForAc = false; 
            hidenAcLoadingSpinner();
        }
        else if (name === 'Den'){
            isLightOn = message.state.led3;
            console.log("ESP phản hồi trạng thái của đèn là: ", isLightOn);
            updateLightStatus(isLightOn);
            isWaitingForLight = false; 
            hidenLightLoadingSpinner();
        }
    }
});


// Khôi phục dữ liệu của sensor, biểu đồ, trạng thái quạt, điều hòa, đèn khi trang được tải
restoredSensor();
restoreFanStatus();
restoreACStatus();
restoreLightStatus();


