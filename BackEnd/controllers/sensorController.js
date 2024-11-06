const dbConnection = require('../config/database');


// sắp xếp
exports.getAllSensorData = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy các tham số tìm kiếm
    const temperature = req.query.temperature;
    const humidity = req.query.humidity;
    const light = req.query.light;
    const timestamp = req.query.time;
    const sortField = req.query.sortField || ''; // Thêm tham số trường sắp xếp
    const sortOrder = req.query.sortOrder || 'asc'; // Thêm tham số thứ tự sắp xếp

    // Mảng chứa điều kiện truy vấn
    const conditions = [];
    const params = [];

    // Thêm điều kiện tìm kiếm nếu có
    if (temperature) {
        conditions.push('ROUND(temperature, 1) = ?');
        params.push(parseFloat(temperature));
    }
    if (humidity) {
        conditions.push('humidity = ?');
        params.push(parseFloat(humidity));
    }
    if (light) {
        conditions.push('light = ?');
        params.push(parseFloat(light));
    }

    if (timestamp) {
        const parts = timestamp.split(' ');

        if (parts.length === 1) {
            const formattedDate = parts[0].split('/').reverse().join('-');
            conditions.push('time >= ? AND time <= ?');
            params.push(`${formattedDate} 00:00:00`, `${formattedDate} 23:59:59`);
        } else if (parts.length === 2) {
            const [time, date] = parts;
            const formattedDate = date.split('/').reverse().join('-');

            if (time.length < 6) {
                const [hour, minute] = time.split(':');
                conditions.push('time >= ? AND time <= ?');
                params.push(`${formattedDate} ${hour}:${minute}:01`, `${formattedDate} ${hour}:${minute}:59`);
            } else {
                const formattedTimestamp = `${formattedDate} ${time}`;
                conditions.push('time = ?');
                params.push(formattedTimestamp);
            }
        }
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Xử lý điều kiện sắp xếp
    let orderByClause = '';
    if (sortField) {
        orderByClause = `ORDER BY ${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    }

    // Truy vấn tổng số bản ghi với các điều kiện
    const countQuery = `SELECT COUNT(*) AS total FROM sensor1 ${whereClause}`;

    dbConnection.query(countQuery, params, (err, countResults) => {
        if (err) {
            console.error('Error counting records:', err);
            return res.status(500).json({ message: 'Error retrieving data from MySQL' });
        }

        const totalSensors = countResults[0].total;
        const totalPages = Math.ceil(totalSensors / limit);

        // Truy vấn dữ liệu với phân trang, các điều kiện và sắp xếp
        const dataQuery = `SELECT * FROM sensor1 ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`;

        // Thêm limit và offset vào tham số
        dbConnection.query(dataQuery, [...params, limit, offset], (err, dataResults) => {
            if (err) {
                console.error('Error querying data:', err);
                return res.status(500).json({ message: 'Error retrieving data from MySQL' });
            }

            res.json({
                page,
                limit,
                totalPages,
                totalSensors,
                data: dataResults
            });
        });
    });
};

