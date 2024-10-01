
const dbConnection = require('../config/database');

exports.getAllSensorData = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy các tham số tìm kiếm
    const temperature = req.query.temperature;
    const humidity = req.query.humidity;
    const light = req.query.light;

    // Mảng chứa điều kiện truy vấn
    const conditions = []; 
    const params = [];

    // Thêm điều kiện tìm kiếm nếu có
    if (temperature) {
        conditions.push('ROUND(temperature, 1) = ?'); // So sánh giá trị với độ chính xác 1 chữ số thập phân
        params.push(parseFloat(temperature));
    }
    else if (humidity) {
        conditions.push('humidity = ?');
        params.push(parseFloat(humidity));
    }
    else if (light) {
        conditions.push('light = ?');
        params.push(parseFloat(light));
    }

    // const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''; (Nếu có nhiều hơn 1 phần tử)
    const whereClause = conditions.length === 1 ? 'WHERE ' + conditions[0] : '';

    // Truy vấn tổng số bản ghi với các điều kiện
    const countQuery = `SELECT COUNT(*) AS total FROM sensor ${whereClause}`;

    dbConnection.query(countQuery, params, (err, countResults) => {
        if (err) {
            console.error('Lỗi truy vấn đếm số lượng:', err);
            return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ MySQL' });
        }

        const totalSensors = countResults[0].total;
        const totalPages = Math.ceil(totalSensors / limit);

        // Truy vấn dữ liệu với phân trang và các điều kiện
        const dataQuery = `SELECT * FROM sensor ${whereClause} LIMIT ? OFFSET ?`;

        // Thêm limit và offset vào tham số
        params.push(limit, offset);

        dbConnection.query(dataQuery, params, (err, dataResults) => {
            if (err) {
                console.error('Lỗi truy vấn dữ liệu:', err);
                return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ MySQL' });
            }

            res.json({
                page: page,
                limit: limit,
                totalPages: totalPages,
                totalSensors: totalSensors,
                data: dataResults
            });
        });
    });
};

