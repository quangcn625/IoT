const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqttClient = require('./config/mqtt');
const dbConnection = require('./config/database');
const cors = require('cors');
const sensorCTR = require('./controllers/sensorController');
const equipCTR = require('./controllers/equipController');
const homeCTR = require('./controllers/homeController');


// Tạo ứng dụng Express và HTTP server
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Phục vụ các tập tin tĩnh từ thư mục "public"
app.use(express.static('public'));

// Su dung cac api de lay du lieu
app.get('/api/sensors', sensorCTR.getAllSensorData);
app.get('/api/equips', equipCTR.getAllEquipData);
app.get('/api/canhbao', homeCTR.getCanhbao);
app.get('/api/home', homeCTR.getDataSensor);

// Tạo WebSocket server
const wss = new WebSocket.Server({ server });

// Lấy múi giờ Việt Nam
const getVietnamTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 7);

    // Định dạng thời gian thành 'YYYY-MM-DD HH:MM:SS'
    const vietnamTime = now.toISOString().slice(0, 19).replace('T', ' ');
    return vietnamTime;
};

// Đăng ký và lắng nghe MQTT topic cho dữ liệu cảm biến
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker.');
    mqttClient.subscribe('esp/dht/sensor', (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        }
    });
    mqttClient.subscribe('esp/led/status', (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        }
    });
    mqttClient.subscribe('esp/led/nhapnhay', (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        }
    })
    mqttClient.subscribe('esp/led/solancanhbao', (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        }
    })
});


// Nhận dữ liệu cảm biến và gửi đến frontend
mqttClient.on('message', (topic, message) => {
    if (topic === 'esp/dht/sensor') {
        try {
            const sensorData = JSON.parse(message.toString());
            const currentTime = getVietnamTime();
            // const windSpeed = randomWindSpeed();

            // Truy vấn SQL để chèn dữ liệu vào bảng sensor
            const sql = 'INSERT INTO sensor1 (temperature, humidity, light, windSpeed, time) VALUES (?, ?, ?, ?, ?)';
            const values = [sensorData.temperature, sensorData.humidity, sensorData.light, sensorData.windSpeed, currentTime];

            dbConnection.execute(sql, values, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            topic: 'esp/dht/sensor',
                        }));
                    }
                });
            });
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    }
    else if (topic === 'esp/led/status') {
        try {
            const parsedData = JSON.parse(message.toString());

            const response = {
                topic: 'esp/led/status',
                action: 'StatusUpdate',
                state: parsedData
            };

            const currentTime = getVietnamTime();
            let device_name = parsedData.name;
            let status = null;
            let check = false;

            if (device_name === 'Quat') {
                device_name = "Quạt";
                check = parsedData.led1;
                if (check) {
                    status = 'On';
                }
                else {
                    status = 'Off';
                }
            }

            else if (device_name === 'DieuHoa') {
                device_name = "Điều hòa";
                check = parsedData.led2;
                if (check) {
                    status = 'On';
                }
                else {
                    status = 'Off';
                }
            }
            else if (device_name === 'Den') {
                device_name = "Đèn";
                check = parsedData.led3;
                if (check) {
                    status = 'On';
                }
                else {
                    status = 'Off';
                }
            }

            const sql = 'INSERT INTO device_activity (device_name, status, activity_time) VALUES (?, ?, ?)';
            const values = [device_name, status, currentTime];

            dbConnection.execute(sql, values, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(response));
                    }
                });

                // console.log('Data device_activity inserted and emitted successfully.');
            });


        } catch (error) {
            console.error('Failed to parse message as JSON:', error);
        }
    }
    else if (topic === 'esp/led/nhapnhay') {
        try {
            const parsedData = JSON.parse(message.toString());

            const currentTime = getVietnamTime();
            let device_name = parsedData.name;
            let status = null;
            let check = false;

            if (device_name === 'Den') {
                device_name = "Đèn cảnh báo";
                check = parsedData.led4;
                if (check === 1) {
                    status = 'On';
                }
                else {
                    status = 'Off';
                }
            }
            const sql = 'INSERT INTO device_activity (device_name, status, activity_time) VALUES (?, ?, ?)';
            const values = [device_name, status, currentTime];

            dbConnection.execute(sql, values, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            topic: 'esp/led/nhapnhay',
                            nhapnhay: parsedData.led4
                        }));
                    }
                });

            });

        } catch (error) {
            console.error('Failed to parse message as JSON:', error);
        }
    }
    else if (topic === 'esp/led/solancanhbao') {
        try {
            const parsedData = JSON.parse(message.toString());
            const currentTime = getVietnamTime();

            const sql1 = 'INSERT INTO solancanhbao (solan, time) VALUES (?, ?)';
            const values1 = [parsedData.canhbao, currentTime];

            dbConnection.execute(sql1, values1, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }

                // Phát lại dữ liệu đến client
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            topic: 'esp/led/solancanhbao',
                            //count: parsedData.canhbao
                        }));
                    }
                });

            });

        } catch (error) {
            console.error('Failed to parse message as JSON:', error);
        }
    }
});

// Xử lý yêu cầu từ frontend để điều khiển quạt, điều hòa, và LED
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        let mqttMessage = '';

        if (data.action === 'toggleFan') {
            mqttMessage = data.state ? 'on1' : 'off1';
        } else if (data.action === 'toggleAC') {
            mqttMessage = data.state ? 'on2' : 'off2';
        } else if (data.action === 'toggleLight') {
            mqttMessage = data.state ? 'on3' : 'off3';
        }

        if (mqttMessage) {
            mqttClient.publish('esp/led/control', mqttMessage);
            //console.log(`Command sent: ${mqttMessage}`);
        }
    });
});

// Bắt đầu server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
