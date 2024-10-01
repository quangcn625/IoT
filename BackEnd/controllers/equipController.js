const dbConnection = require('../config/database');

exports.getAllEquipData = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy tham số tìm kiếm
    const activity_time = req.query.activity_time; // Định dạng: "YYYY-MM-DD HH:mm:ss"

    // Mảng chứa điều kiện truy vấn
    const conditions = []; 
    const params = [];

    // Thêm điều kiện tìm kiếm nếu có
    if (activity_time) {
        // Thêm điều kiện tìm kiếm trực tiếp theo activity_time
        conditions.push('activity_time = ?'); // So sánh theo thời gian chính xác
        params.push(activity_time);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Truy vấn tổng số bản ghi
    const countQuery = `SELECT COUNT(*) AS total FROM device_activity ${whereClause}`;

    dbConnection.query(countQuery, params, (err, countResults) => {
        if (err) {
            console.error('Lỗi truy vấn đếm số lượng:', err);
            return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ MySQL' });
        }

        const totalActivitys = countResults[0].total;
        const totalPages = Math.ceil(totalActivitys / limit);

        const dataQuery = `SELECT * FROM device_activity ${whereClause} LIMIT ? OFFSET ?`;

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
                totalActivitys: totalActivitys,
                data: dataResults
            });
        });
    });
};
