// Biểu đồ 2
const labels1 = [];
const data1 = {
    labels: labels1,
    datasets: [
        {
            label: 'Tốc độ gió (m/s)',
            data: [],
            borderColor: 'purple',
            yAxisID: 'trucY_windSpeed',
            fill: false,
            tension: 0.2
        }
    ]
};

// Cấu hình biểu đồ 2
const config1 = {
    type: 'line',
    data: data1,
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
            'trucY_windSpeed': {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Tốc độ gió (km/h)'
                }
            }
        }
    }
};

const lineChart1 = new Chart(document.getElementById('lineChart1'), config1);

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

let currentWindSpeed = '--';
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

    const windSpeedDiv = document.getElementById('info-windSpeed');
    const windSpeedElement = document.getElementById('windSpeed');
    const windSpeedIcon = getWindIcon(currentWindSpeed !== '--' ? currentWindSpeed : null);
    windSpeedElement.innerHTML = currentWindSpeed;
    windSpeedDiv.innerHTML = `${windSpeedElement.outerHTML}${windSpeedIcon ? `<img src="${windSpeedIcon}" alt="Light Icon" style="width: 20px; height: 30px; margin-left: 10px;">` : ''}`;

}

// Hàm lấy icon windSpeed
function getWindIcon(speed) {
    if (speed === null) return null;
    if (speed < 21) {
        return 'images/Speed1.jpg';
    }
    else if (speed >= 21 && speed <= 50) {
        return 'images/Speed2.jpg';
    }
    else if (speed > 50 && speed <= 100) {
        return 'images/Speed3.jpg';
    }
}

// Nhận phản hồi từ backend
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.topic === 'esp/dht/sensor') {
        fetchDataSensor();
    }


    else if (message.topic === 'esp/led/nhapnhay') {
        if (message.nhapnhay === 1) {
            denCB.classList.add('glowingCB');
            // console.log("Đèn cảnh báo nhấp nháy");
        }
        else if (message.nhapnhay === 0) {
            denCB.classList.remove('glowingCB');
            // console.log('Đèn cảnh báo tắt');
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
        if (data.data[0].windSpeed !== null) currentWindSpeed = data.data[0].windSpeed;

        // Hiển thị dữ liệu hiện tại
        updateDisplay();

        // Xóa dữ liệu cũ trên biểu đồ
        lineChart1.data.labels = [];
        lineChart1.data.datasets.forEach(dataset => dataset.data = []);

        // Sắp xếp dữ liệu theo ID từ be đến lớn
        data.data.sort((a, b) => a.id - b.id);

        // Cập nhật biểu đồ với dữ liệu mới từ API
        data.data.forEach((entry) => {
            const timeString = getTimeString(entry.time);

            // Cập nhật dữ liệu vào lineChart1
            lineChart1.data.labels.push(timeString);
            lineChart1.data.datasets[0].data.push(entry.windSpeed);
        });


        // Cập nhật biểu đồ hiển thị
        lineChart1.update();

    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

fetchDataSensor();