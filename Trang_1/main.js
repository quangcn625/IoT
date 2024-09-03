// Dữ liệu ban đầu
const trucX = [];
const data = {
    labels: trucX,
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
        },
    ]
};

// Cấu hình biểu đồ
const config = {
    type: 'line',
    data: data,
    options: {
        reponsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 10
                },
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian',
                    align: 'start',
                }
            },
            'trucY_temp': {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)'
                },
            },
            'trucY_humidity': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Độ ẩm (%)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            'trucY_light': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Cường độ sáng (lux)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        }
    }
};

// Tạo biểu đồ
const lineChart = new Chart(document.getElementById('lineChart'), config);

// Hàm giả lập lấy dữ liệu mới
function getNewData() {
    const newTemp = Math.floor(Math.random() * 41);
    const newHumidity = Math.floor(Math.random() * 101);
    const newLight = Math.floor(Math.random() * 1001);

    return {
        temp: newTemp,
        humidity: newHumidity,
        light: newLight
    };
}

// Hàm giả lập lấy dữ liệu mới
function getNewData() {
    const newTemp = Math.floor(Math.random() * 41);
    const newHumidity = Math.floor(Math.random() * 101);
    const newLight = Math.floor(Math.random() * 1001);

    return {
        temp: newTemp,
        humidity: newHumidity,
        light: newLight
    };
}

// Hàm lấy icon của nhiệt độ
function getTempIcon(temp) {
    if (temp < 20) {
        return '../images/cold.jpg';
    }
    else if (temp >= 20 && temp < 30) {
        return '../images/normal.jpg';
    }
    return '../images/hot.jpg';
}

// Hàm lấy icon của độ ẩm
function getHumidityIcon(humidity) {
    if (humidity < 30) {
        return '../images/low-humidity.jpg';
    }
    else if (humidity >= 30 && humidity <= 60) {
        return '../images/medium-humidity.jpg';
    }
    return '../images/high-humidity.jpg';
}

// Hàm lấy icon của cường độ ánh sáng
function getLightIcon(light) {
    if (light < 100) {
        return '../images/low-light.jpg';
    }
    else if (light >= 100 && light <= 500) {
        return '../images/medium-light.jpg';
    }
    return '../images/high-light.jpg';
}

// Hàm cập nhật bảng dữ liệu và biểu đồ
function updateTableChart() {
    const newData = getNewData();
    const currentTime = new Date().toLocaleTimeString();
    const tempIcon = getTempIcon(newData.temp);
    const humidityIcon = getHumidityIcon(newData.humidity);
    const lightIcon = getLightIcon(newData.light);

    // Cập nhật giá trị và hình ảnh cho nhiệt độ
    const tempDiv = document.getElementById('info-temp');
    const tempElement = document.getElementById('temperature');
    tempElement.innerHTML = `${newData.temp}`;
    const imgTemp = document.getElementById('img-temp');
    tempDiv.appendChild(tempElement);
    imgTemp.innerHTML = `<img src="${tempIcon}" alt="Temperature Icon" style="width: 20px; height: 30px; margin-left: 10px;">`;
    tempDiv.appendChild(imgTemp);

    // Cập nhật giá trị và hình ảnh cho độ ẩm
    const humidDiv = document.getElementById('info-humid');
    const humidityElement = document.getElementById('humidity');
    humidityElement.innerHTML = `${newData.humidity}`;
    const imgHumid = document.getElementById('img-humid');
    humidDiv.appendChild(humidityElement);
    imgHumid.innerHTML = `<img src="${humidityIcon}" alt="Humidity Icon" style="width: 20px; height: 30px; margin-left: 10px;">`;
    humidDiv.appendChild(imgHumid);

    // Cập nhật giá trị và hình ảnh cho cường độ ánh sáng
    const lightDiv = document.getElementById('info-light');
    const lightElement = document.getElementById('light');
    lightElement.innerHTML = `${newData.light}`;
    lightDiv.appendChild(lightElement);
    const imgLight = document.getElementById('img-light');
    imgLight.innerHTML = `<img src="${lightIcon}" alt="Light Icon" style="width: 20px; height: 30px; margin-left: 10px;">`;
    lightDiv.appendChild(imgLight);

    // Thêm thời gian mới vào trục x
    lineChart.data.labels.push(currentTime);

    // Thêm dữ liệu mới vào từng dataset
    lineChart.data.datasets[0].data.push(newData.temp);
    lineChart.data.datasets[1].data.push(newData.humidity);
    lineChart.data.datasets[2].data.push(newData.light);

    // Giới hạn số lượng điểm trên biểu đồ
    if (lineChart.data.labels.length > 5) {
        lineChart.data.labels.shift(); // Xóa thời gian cũ
        lineChart.data.datasets.forEach((dataset) => {
            dataset.data.shift(); // Xóa dữ liệu cũ
        });
    }

    // Cập nhật biểu đồ
    lineChart.update();
}

setInterval(updateTableChart, 5000);


// Quạt
const fan = document.getElementById('fan');
const fanToggleBtn = document.getElementById('fanToggleBtn');
let isFanOn = false;

fanToggleBtn.addEventListener('click', () => {
    if (isFanOn) {
        // Nếu quạt đang bật, tắt quạt và thay đổi nút
        fan.classList.remove('spinning');
        fanToggleBtn.textContent = 'On';
        fanToggleBtn.classList.remove('off'); // Đổi màu nút về màu "On"
    } else {
        // Nếu quạt đang tắt, bật quạt và thay đổi nút
        fan.classList.add('spinning');
        fanToggleBtn.textContent = 'Off';
        fanToggleBtn.classList.add('off'); // Đổi màu nút sang màu "Off"
    }
    // Cập nhật trạng thái quạt
    isFanOn = !isFanOn;
});

// Điều hòa
document.getElementById('acToggleBtn').addEventListener('click', function () {
    var wind = document.getElementById('wind');
    var button = document.getElementById('acToggleBtn');

    if (wind.classList.contains('active')) {
        wind.classList.remove('active');
        wind.style.animation = 'none'; //Dừng chuyển động
        wind.style.opacity = '0'; // Biến mất gió
        button.textContent = 'On';
        button.classList.remove('off');
    } else {
        wind.classList.add('active');
        wind.style.animation = ''; // Bắt đầu chuyển động
        wind.style.opacity = '1'; // Hiển thị gió
        button.textContent = 'Off';
        button.classList.add('off');
    }
});

// Đèn
const den = document.getElementById('den');
const lightToggleBtn = document.getElementById('lightToggleBtn');

// Đặt trạng thái ban đầu của đèn là bật nhưng không sáng
den.classList.add('on'); // Đèn bắt đầu ở trạng thái bật nhưng không sáng
lightToggleBtn.classList.add('on'); // Nút bắt đầu ở trạng thái bật

lightToggleBtn.addEventListener('click', function() {
    if (lightToggleBtn.classList.contains('on')) {
        // Khi nút là "On" và được nhấn, đèn sẽ sáng và nút chuyển thành "Off"
        den.classList.add('glowing');
        lightToggleBtn.classList.remove('on');
        lightToggleBtn.classList.add('off');
        lightToggleBtn.textContent = 'Off';
    } else {
        // Khi nút là "Off" và được nhấn, đèn sẽ tắt và nút chuyển thành "On"
        den.classList.remove('glowing');
        lightToggleBtn.classList.remove('off');
        lightToggleBtn.classList.add('on');
        lightToggleBtn.textContent = 'On';
    }
});





