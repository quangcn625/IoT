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

    if (activity_time) {
        const parts = activity_time.split(' ');

        if (parts.length === 1) {
            const formattedDate = parts[0].split('/').reverse().join('-'); // Định dạng ngày
            // Thêm điều kiện cho giây từ 1 đến 59
            conditions.push('activity_time >= ? AND activity_time <= ?');
            params.push(`${formattedDate} 00:00:00`, `${formattedDate} 23:59:59`);
        }
        else if (parts.length === 2) {
            const time = parts[0];
            const date = parts[1];
            if (time.length === 5) {
                const [hour, minute] = time.split(':'); // Tách giờ và phút
                const formattedDate = date.split('/').reverse().join('-'); // Định dạng ngày
                // Thêm điều kiện cho giây từ 1 đến 59
                conditions.push('activity_time >= ? AND activity_time <= ?');
                params.push(`${formattedDate} ${hour}:${minute}:01`, `${formattedDate} ${hour}:${minute}:59`);
            }
            else if (time.length === 8) {
                const formattedTimestamp = `${date.split('/').reverse().join('-')} ${time}`;
                conditions.push('activity_time = ?'); // Thay đổi tên cột ở đây
                params.push(formattedTimestamp);
            }
        }
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
